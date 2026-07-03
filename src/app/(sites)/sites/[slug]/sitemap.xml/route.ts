import { resolvePublishedSite } from "@/features/website-renderer";

/** Per-site sitemap (ADR-027): homepage-only in v1. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const resolved = await resolvePublishedSite({ slug });
  if (!resolved) return new Response("Not found", { status: 404 });
  const host = request.headers.get("host") ?? "localhost";
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const loc = `${proto}://${host}/sites/${slug}`;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${loc}</loc>
    <lastmod>${resolved.publication.createdAt.slice(0, 10)}</lastmod>
  </url>
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
}
