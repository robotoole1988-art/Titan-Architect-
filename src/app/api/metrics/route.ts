import { resolveBusinessSpine } from "@/core/business";
import { createRateLimiter } from "@/lib/rate-limit";

/**
 * First-party measurement beacon (ADR-030). Published pages send
 * view / form_start / form_submit; TITAN stores DAILY AGGREGATES per
 * business × path — no cookies, no visitor records, no PII.
 */

const KINDS = new Set(["view", "form_start", "form_submit"]);
// Generous: beacons are tiny, but nobody needs 240/min from one address.
const limiter = createRateLimiter({ windowMs: 60_000, max: 240 });

export async function POST(request: Request): Promise<Response> {
  const clientKey =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!limiter.allow(clientKey)) return new Response(null, { status: 429 });

  try {
    // sendBeacon posts text/plain — parse the body as JSON regardless.
    const { slug, path, kind } = JSON.parse(await request.text()) as {
      slug?: string;
      path?: string;
      kind?: string;
    };
    if (!slug || !kind || !KINDS.has(kind)) {
      return new Response(null, { status: 400 });
    }
    const spine = await resolveBusinessSpine();
    const publication = await spine.publications.currentBySlug(slug);
    if (!publication) return new Response(null, { status: 400 });
    await spine.metrics.record(
      publication.businessId,
      String(path ?? "/").slice(0, 300) || "/",
      kind as "view" | "form_start" | "form_submit",
      new Date().toISOString().slice(0, 10),
    );
    return new Response(null, { status: 204 });
  } catch {
    // The beacon must never error a visitor's page.
    return new Response(null, { status: 400 });
  }
}
