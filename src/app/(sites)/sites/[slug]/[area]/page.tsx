import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  PublishedSitePage,
  publishedSiteMetadata,
  publishedSiteNotFound,
  resolvePublishedSite,
} from "@/features/website-renderer";

/** Thin route: an AREA landing page by slug (ADR-028). */

async function siteBase(slug: string): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}/sites/${slug}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; area: string }>;
}): Promise<Metadata> {
  const { slug, area } = await params;
  const resolved = await resolvePublishedSite({ slug, pagePath: area });
  if (!resolved) return { robots: { index: false } };
  return publishedSiteMetadata(resolved, `${await siteBase(slug)}/${area}`);
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; area: string }>;
}) {
  const { slug, area } = await params;
  const resolved = await resolvePublishedSite({ slug, pagePath: area });
  if (!resolved) publishedSiteNotFound();
  return <PublishedSitePage resolved={resolved} baseUrl={await siteBase(slug)} />;
}
