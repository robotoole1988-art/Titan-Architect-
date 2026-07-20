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

/**
 * Thin route: the live site's HOMEPAGE by HOSTNAME (custom domains / slug
 * subdomains). Requests land here via the middleware rewrite (ADR-027).
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hostname: string }>;
}): Promise<Metadata> {
  const { hostname } = await params;
  const resolved = await resolvePublishedSite({ hostname });
  if (!resolved) return { robots: { index: false } };
  return publishedSiteMetadata(resolved, `https://${hostname}/`);
}

export default async function Page({
  params,
}: {
  params: Promise<{ hostname: string }>;
}) {
  const { hostname } = await params;
  const resolved = await resolvePublishedSite({ hostname });
  if (!resolved) publishedSiteNotFound();
  return (
    <PublishedSitePage resolved={resolved} baseUrl={`https://${hostname}`} />
  );
}
