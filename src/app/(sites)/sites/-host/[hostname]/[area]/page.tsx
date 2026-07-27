import type { Metadata } from "next";
import {
  PublishedSitePage,
  publishedSiteMetadata,
  publishedSiteNotFound,
  resolvePublishedSite,
} from "@/features/website-renderer";

// Publications are immutable snapshots (ADR-027), so this page is STATIC
// output: rendered once, served from the edge, no per-request work.
// force-static: uncached spine reads otherwise mark the route dynamic and
// silently defeat revalidate (found in production, ADR-054).
// The snapshot is invalidated by the three founder actions that can change
// it — media approval, publish, unpublish (revalidatePublishedSite,
// ADR-055 §5). The hour here is a backstop against a missed hook, NOT the
// mechanism: it used to be 60s, which was a poll standing in for a signal.
export const dynamic = "force-static";
export const revalidate = 3600;

/** Thin route: an AREA landing page by hostname (ADR-028). */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hostname: string; area: string }>;
}): Promise<Metadata> {
  const { hostname, area } = await params;
  const resolved = await resolvePublishedSite({ hostname, pagePath: area });
  if (!resolved) return { robots: { index: false } };
  return publishedSiteMetadata(resolved, `https://${hostname}/${area}`);
}

export default async function Page({
  params,
}: {
  params: Promise<{ hostname: string; area: string }>;
}) {
  const { hostname, area } = await params;
  const resolved = await resolvePublishedSite({ hostname, pagePath: area });
  if (!resolved) publishedSiteNotFound();
  return (
    <PublishedSitePage resolved={resolved} baseUrl={`https://${hostname}`} />
  );
}
