/**
 * Notifications — the channel seam (ADR-030).
 *
 * ONE interface every delivery mechanism implements. v1 ships the Resend
 * email adapter (server-side env key, injectable transport, never in CI) and
 * the console dev fallback. SMS implements the same seam later. Failures are
 * REPORTED, never thrown up into the enquiry path, and never silent.
 */

import type { Business, Enquiry } from "@/core/business";

export interface NotificationMessage {
  to: ReadonlyArray<string>;
  subject: string;
  /** Plain-text body lines; adapters format for their medium. */
  lines: ReadonlyArray<string>;
  /** One-tap deep link into TITAN. */
  actionUrl?: string;
}

export interface NotificationResult {
  delivered: boolean;
  channel: string;
  /** Provider id on success; the failure reason otherwise. */
  detail?: string;
}

export interface NotificationChannel {
  send(message: NotificationMessage): Promise<NotificationResult>;
}

/** Build the new-enquiry notification (ADR-030): who, contact, message, source, link. */
export function buildEnquiryNotification(
  business: Business,
  enquiry: Enquiry,
  options: { founderEmail?: string; appOrigin: string },
): NotificationMessage {
  const recipients = [
    business.ownerEmail ?? business.contact?.email,
    options.founderEmail,
  ].filter((value): value is string => Boolean(value));
  return {
    to: [...new Set(recipients)],
    subject: `New enquiry — ${enquiry.name} → ${business.name}`,
    lines: [
      `${enquiry.name} just enquired on the ${business.name} site.`,
      `Contact: ${enquiry.contact}`,
      ...(enquiry.message ? [`Message: ${enquiry.message}`] : []),
      `From page: ${enquiry.sourcePage}`,
      `Received: ${enquiry.createdAt}`,
      "Speed-to-lead starts now — mark it contacted when you've called back.",
    ],
    actionUrl: `${options.appOrigin.replace(/\/+$/, "")}/crm/accounts?enquiry=${enquiry.id}`,
  };
}

type Transport = (
  url: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body: string;
  },
) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

/**
 * Resend email adapter. Server-side only (runtime guard — the ADR-026
 * lesson: `server-only` breaks client builds via traced dynamic imports).
 */
export function createResendChannel(config: {
  apiKey: string;
  from: string;
  transport?: Transport;
}): NotificationChannel {
  const transport: Transport = config.transport ?? fetch;
  return {
    async send(message) {
      if (typeof window !== "undefined") {
        throw new Error("The Resend channel is server-side only.");
      }
      const response = await transport("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: config.from,
          to: [...message.to],
          subject: message.subject,
          text: [
            ...message.lines,
            ...(message.actionUrl ? ["", `Open in TITAN: ${message.actionUrl}`] : []),
          ].join("\n"),
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        return {
          delivered: false,
          channel: "resend",
          detail: `HTTP ${response.status}: ${JSON.stringify(body)}`,
        };
      }
      const body = (await response.json()) as { id?: string };
      return { delivered: true, channel: "resend", detail: body.id };
    },
  };
}

/** Dev fallback: the full message to the server console. No key, no network. */
export function createConsoleChannel(): NotificationChannel {
  return {
    async send(message) {
      console.info(
        [
          "┌─ TITAN notification (dev channel — set RESEND_API_KEY for email)",
          `│ to: ${message.to.join(", ")}`,
          `│ subject: ${message.subject}`,
          ...message.lines.map((line) => `│ ${line}`),
          ...(message.actionUrl ? [`│ open: ${message.actionUrl}`] : []),
          "└─",
        ].join("\n"),
      );
      return { delivered: true, channel: "console" };
    },
  };
}

/** Env-driven channel selection: Resend when configured, console otherwise. */
export function resolveNotificationChannel(): NotificationChannel {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (apiKey && from) return createResendChannel({ apiKey, from });
  return createConsoleChannel();
}

/** Send without ever throwing: delivery failure is logged, never silent. */
export async function sendSafely(
  channel: NotificationChannel,
  message: NotificationMessage,
): Promise<NotificationResult> {
  try {
    const result = await channel.send(message);
    if (!result.delivered) {
      console.error(
        `[notifications] delivery FAILED via ${result.channel}: ${result.detail} (subject: ${message.subject})`,
      );
    }
    return result;
  } catch (error) {
    console.error(
      `[notifications] delivery THREW: ${error instanceof Error ? error.message : String(error)} (subject: ${message.subject})`,
    );
    return { delivered: false, channel: "unknown", detail: String(error) };
  }
}
