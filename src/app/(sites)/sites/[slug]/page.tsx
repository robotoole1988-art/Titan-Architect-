import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  PublishedSitePage,
  publishedSiteMetadata,
  publishedSiteNotFound,
  resolvePublishedSite,
} from "@/features/website-renderer";

// Publications are immutable snapshots (ADR-027) — cache and revalidate;
// a republish is picked up within a minute.
export const revalidate = 60;

/** Thin route: the live site's HOMEPAGE by slug (ADR-027/028). */

async function siteBase(slug: string): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}/sites/${slug}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolvePublishedSite({ slug });
  if (!resolved) return { robots: { index: false } };
  return publishedSiteMetadata(resolved, await siteBase(slug));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolvePublishedSite({ slug });
  if (!resolved) publishedSiteNotFound();
  return <PublishedSitePage resolved={resolved} baseUrl={await siteBase(slug)} />;
}
