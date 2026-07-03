import type { Metadata } from "next";
import {
  PublishedSitePage,
  publishedSiteMetadata,
  publishedSiteNotFound,
  resolvePublishedSite,
} from "@/features/website-renderer";

/**
 * Thin route: the live site by HOSTNAME (custom domains / slug subdomains).
 * Requests land here via the middleware rewrite (ADR-027).
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
  return <PublishedSitePage resolved={resolved} />;
}
