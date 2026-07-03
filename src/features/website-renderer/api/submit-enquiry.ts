/**
 * Public enquiry intake (ADR-027/030) — called by the /api/enquiries route.
 * Anti-spam basics live here: per-IP sliding-window rate limit + the
 * honeypot handled inside the core workflow (silently dropped).
 *
 * NOTIFICATION (ADR-030): after the enquiry is stored, the owner and the
 * founder are notified through the channel seam. Delivery failure is logged
 * and NEVER breaks the enquiry — the lead is already safe in the spine.
 */

import { processEnquiry, resolveBusinessSpine } from "@/core/business";
import {
  buildEnquiryNotification,
  resolveNotificationChannel,
  sendSafely,
} from "@/core/notifications";
import { createRateLimiter } from "@/lib/rate-limit";

// Per-process limiter — adequate for v1 single-instance serving (ADR-027).
const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });

export interface SubmitEnquiryInput {
  slug: string;
  name: string;
  contact: string;
  message: string;
  sourcePage: string;
  /** Honeypot ("website") — humans leave it empty. */
  website: string;
  clientKey: string;
}

export type SubmitEnquiryResult =
  | { ok: true }
  | { ok: false; reason: "rate_limited" | "invalid" };

export async function submitEnquiry(
  input: SubmitEnquiryInput,
): Promise<SubmitEnquiryResult> {
  if (!limiter.allow(input.clientKey || "unknown")) {
    return { ok: false, reason: "rate_limited" };
  }
  try {
    const spine = await resolveBusinessSpine();
    const outcome = await processEnquiry(spine, {
      slug: String(input.slug ?? ""),
      name: String(input.name ?? ""),
      contact: String(input.contact ?? ""),
      message: String(input.message ?? ""),
      sourcePage: String(input.sourcePage ?? "/"),
      honeypot: String(input.website ?? ""),
    });

    if (outcome.enquiry && !outcome.dropped) {
      const business = await spine.businesses.get(outcome.enquiry.businessId);
      if (business) {
        await sendSafely(
          resolveNotificationChannel(),
          buildEnquiryNotification(business, outcome.enquiry, {
            founderEmail: process.env.TITAN_FOUNDER_EMAIL,
            appOrigin: process.env.TITAN_APP_ORIGIN ?? "http://localhost:4100",
          }),
        );
      }
    }
    return { ok: true };
  } catch {
    // Never leak internals to the public internet.
    return { ok: false, reason: "invalid" };
  }
}
