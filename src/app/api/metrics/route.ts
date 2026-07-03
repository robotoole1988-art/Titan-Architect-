import { recordSiteMetric } from "@/features/website-renderer";

/**
 * Thin route (ADR-030): first-party measurement beacon. Parsing here,
 * everything else in the feature (app imports features, never core).
 */
export async function POST(request: Request): Promise<Response> {
  const clientKey =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  let payload: { slug?: string; path?: string; kind?: string } = {};
  try {
    // sendBeacon posts text/plain — parse the body as JSON regardless.
    payload = JSON.parse(await request.text());
  } catch {
    return new Response(null, { status: 400 });
  }
  const result = await recordSiteMetric({ ...payload, clientKey });
  if (result === "rate_limited") return new Response(null, { status: 429 });
  if (result === "rejected") return new Response(null, { status: 400 });
  return new Response(null, { status: 204 });
}
