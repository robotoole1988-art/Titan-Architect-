/**
 * First-party metric intake (ADR-030) — called by the /api/metrics route.
 * Resolves the live publication, stores a DAILY AGGREGATE increment. The
 * beacon must never error a visitor's page: invalid input returns rejected.
 */

import {
  resolveBusinessSpine,
  type MetricEventKind,
} from "@/core/business";
import { createRateLimiter } from "@/lib/rate-limit";

const KINDS = new Set<string>(["view", "form_start", "form_submit"]);
// Generous: beacons are tiny, but nobody needs 240/min from one address.
const limiter = createRateLimiter({ windowMs: 60_000, max: 240 });

export type RecordSiteMetricResult = "recorded" | "rejected" | "rate_limited";

export async function recordSiteMetric(input: {
  slug?: string;
  path?: string;
  kind?: string;
  clientKey: string;
}): Promise<RecordSiteMetricResult> {
  if (!limiter.allow(input.clientKey || "unknown")) return "rate_limited";
  if (!input.slug || !input.kind || !KINDS.has(input.kind)) return "rejected";
  try {
    const spine = await resolveBusinessSpine();
    const publication = await spine.publications.currentBySlug(input.slug);
    if (!publication) return "rejected";
    await spine.metrics.record(
      publication.businessId,
      String(input.path ?? "/").slice(0, 300) || "/",
      input.kind as MetricEventKind,
      new Date().toISOString().slice(0, 10),
    );
    return "recorded";
  } catch {
    return "rejected";
  }
}
