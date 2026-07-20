import type { Metadata } from "next";
import {
  PublishedSitePage,
  publishedSiteMetadata,
  publishedSiteNotFound,
  resolvePublishedSite,
} from "@/features/website-renderer";

// Publications are immutable snapshots (ADR-027) — cache and revalidate;
// a republish is picked up within a minute.
// force-static: uncached spine reads otherwise mark the route dynamic and
// silently defeat revalidate (found in production, ADR-054).
export const dynamic = "force-static";
export const revalidate = 60;

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
