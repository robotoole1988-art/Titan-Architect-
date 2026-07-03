"use client";

/**
 * First-party measurement beacon (ADR-030): fires ONE page-view event per
 * page load on PUBLISHED sites. sendBeacon (keepalive fetch fallback), no
 * cookies, no identifiers — the server stores daily aggregates only.
 */

import { useEffect } from "react";

/**
 * The SITE-relative path for metric buckets: slug serving prefixes
 * /sites/<slug>; hostname serving doesn't. One bucket per page either way.
 */
export function siteRelativePath(slug: string, pathname: string): string {
  const prefix = `/sites/${slug}`;
  const path = pathname.startsWith(prefix)
    ? pathname.slice(prefix.length)
    : pathname;
  return path || "/";
}

export function sendSiteMetric(
  slug: string,
  path: string,
  kind: "view" | "form_start" | "form_submit",
): void {
  try {
    const body = JSON.stringify({ slug, path, kind });
    if (navigator.sendBeacon?.("/api/metrics", body)) return;
    void fetch("/api/metrics", { method: "POST", body, keepalive: true });
  } catch {
    // Measurement must never affect the visitor.
  }
}

export function SiteMetricsBeacon({ slug, path }: { slug: string; path: string }) {
  useEffect(() => {
    sendSiteMetric(slug, path, "view");
  }, [slug, path]);
  return null;
}
