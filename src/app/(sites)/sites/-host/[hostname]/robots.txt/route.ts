import { resolvePublishedSite } from "@/features/website-renderer";

/** robots.txt on custom hosts (middleware-rewritten, ADR-027). */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ hostname: string }> },
) {
  const { hostname } = await params;
  const resolved = await resolvePublishedSite({ hostname });
  const body = resolved
    ? `User-agent: *\nAllow: /\n\nSitemap: https://${hostname}/sitemap.xml\n`
    : "User-agent: *\nDisallow: /\n";
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
