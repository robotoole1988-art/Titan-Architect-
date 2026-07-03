import { resolvePublishedSite } from "@/features/website-renderer";

/** sitemap.xml on custom hosts (middleware-rewritten, ADR-027). */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ hostname: string }> },
) {
  const { hostname } = await params;
  const resolved = await resolvePublishedSite({ hostname });
  if (!resolved) return new Response("Not found", { status: 404 });
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${hostname}/</loc>
    <lastmod>${resolved.publication.createdAt.slice(0, 10)}</lastmod>
  </url>
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
}
