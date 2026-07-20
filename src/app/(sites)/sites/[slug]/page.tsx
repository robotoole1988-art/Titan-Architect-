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

/** Thin route: the live site's HOMEPAGE by slug (ADR-027/028). */

/**
 * Canonical base from ENV, not request headers — `headers()` opts the
 * route out of static rendering and silently defeated `revalidate` (found
 * in production, ADR-054): every hit rendered dynamically. Slug-served
 * pages canonicalise on the app origin by design.
 */
function siteBase(slug: string): string {
  const origin =
    process.env.TITAN_APP_ORIGIN ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:4100");
  return `${origin}/sites/${slug}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolvePublishedSite({ slug });
  if (!resolved) return { robots: { index: false } };
  return publishedSiteMetadata(resolved, siteBase(slug));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolvePublishedSite({ slug });
  if (!resolved) publishedSiteNotFound();
  return <PublishedSitePage resolved={resolved} baseUrl={siteBase(slug)} />;
}
