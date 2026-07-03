/**
 * Public enquiry intake (ADR-027) — called by the /api/enquiries route.
 * Anti-spam basics live here: per-IP sliding-window rate limit + the
 * honeypot handled inside the core workflow (silently dropped).
 *
 * NOTIFICATION SEAM: when an email/SMS provider is chosen, notify AFTER
 * processEnquiry succeeds, right here — one call site.
 */

import { processEnquiry, resolveBusinessSpine } from "@/core/business";
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
    await processEnquiry(spine, {
      slug: String(input.slug ?? ""),
      name: String(input.name ?? ""),
      contact: String(input.contact ?? ""),
      message: String(input.message ?? ""),
      sourcePage: String(input.sourcePage ?? "/"),
      honeypot: String(input.website ?? ""),
    });
    return { ok: true };
  } catch {
    // Never leak internals to the public internet.
    return { ok: false, reason: "invalid" };
  }
}
