import { resolvePublishedSite } from "@/features/website-renderer";

/** Per-site sitemap by hostname (ADR-028): every page of the collection. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ hostname: string }> },
) {
  const { hostname } = await params;
  const resolved = await resolvePublishedSite({ hostname });
  if (!resolved) return new Response("Not found", { status: 404 });
  const base = `https://${hostname}`;
  const lastmod = resolved.publication.createdAt.slice(0, 10);
  const urls = resolved.blueprint.pages.pages
    .map((page) => {
      const path = page.suggestedUrl === "/" ? "/" : (page.suggestedUrl ?? "/");
      return `  <url>\n    <loc>${base}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    })
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
}
