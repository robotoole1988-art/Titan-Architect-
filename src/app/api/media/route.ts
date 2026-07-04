import { streamMedia } from "@/features/website-renderer";

/**
 * Same-origin media streaming proxy (ADR-037). Thin route: the feature owns
 * the Range normalisation + SSRF allowlist. Node runtime (streams a body),
 * never statically evaluated.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return streamMedia(request);
}
