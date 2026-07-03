import { resolvePublishedSite } from "@/features/website-renderer";

/** Per-site robots.txt (ADR-027): live sites are crawlable, gone sites not. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const resolved = await resolvePublishedSite({ slug });
  const host = request.headers.get("host") ?? "localhost";
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const body = resolved
    ? `User-agent: *\nAllow: /\n\nSitemap: ${proto}://${host}/sites/${slug}/sitemap.xml\n`
    : "User-agent: *\nDisallow: /\n";
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
