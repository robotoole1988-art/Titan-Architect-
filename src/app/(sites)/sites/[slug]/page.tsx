import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  PublishedSitePage,
  publishedSiteMetadata,
  publishedSiteNotFound,
  resolvePublishedSite,
} from "@/features/website-renderer";

/** Thin route: the live site by slug (ADR-027). */

async function canonicalFor(slug: string): Promise<string> {
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
  return publishedSiteMetadata(resolved, await canonicalFor(slug));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolvePublishedSite({ slug });
  if (!resolved) publishedSiteNotFound();
  return <PublishedSitePage resolved={resolved} />;
}
