import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveBusinessSpine, type Publication } from "@/core/business";
import {
  buildPageJsonLd,
  type PageBlueprint,
  type WebsiteBlueprint,
} from "@/core/website-blueprint";
import { renderPage } from "../model/render-page";
import type { RenderContact, ResolvedMediaAsset } from "../model/types";
import { rendererFontClass } from "../theme/fonts";
import { SiteMetricsBeacon } from "./site-metrics-beacon";

/**
 * The PUBLISHED site (ADR-027/028): the preview pipeline minus chrome. One
 * publication pins ONE blueprint version — now the whole page collection:
 * homepage plus area landing pages, served at /{area-slug} under the same
 * snapshot semantics. Each page carries its own SEO and JSON-LD.
 */

export interface ResolvedPublication {
  publication: Publication;
  blueprint: WebsiteBlueprint;
  /** The specific page of the collection this request resolves to. */
  page: PageBlueprint;
  businessName: string;
  /** Optional per-site GA4 hook (ADR-030); absent → no script injected. */
  ga4MeasurementId?: string;
  /** APPROVED media by slotRef (ADR-033). */
  media: Readonly<Record<string, ResolvedMediaAsset>>;
  /** Real contact details from the Business record (ADR-034). */
  contact?: RenderContact;
  /** How the site is being served — drives internal link hrefs. */
  servingMode: "slug" | "hostname";
}

interface PublishedLookup {
  /** Sub-path within the site, e.g. "sale" for the Sale area page. */
  pagePath?: string;
}

/** Resolve a live publication + page by slug OR hostname. Null → 404. */
export async function resolvePublishedSite(
  lookup: ({ slug: string } | { hostname: string }) & PublishedLookup,
): Promise<ResolvedPublication | null> {
  const spine = await resolveBusinessSpine();
  let publication: Publication | null = null;
  if ("slug" in lookup) {
    publication = await spine.publications.currentBySlug(lookup.slug);
  } else {
    const hostname = lookup.hostname.toLowerCase();
    publication = await spine.publications.currentByHostname(hostname);
    if (!publication) {
      const firstLabel = hostname.split(".")[0];
      if (firstLabel) {
        publication = await spine.publications.currentBySlug(firstLabel);
      }
    }
  }
  if (!publication) return null;

  const [artifact, business, approved] = await Promise.all([
    spine.artifacts.getVersion<WebsiteBlueprint>(
      publication.businessId,
      "blueprint",
      publication.blueprintVersion,
    ),
    spine.businesses.get(publication.businessId),
    spine.media.listApprovedForBusiness(publication.businessId),
  ]);
  if (!artifact || !business) return null;
  const media: Record<string, ResolvedMediaAsset> = {};
  for (const record of approved) {
    media[record.slotRef] = {
      url: record.url,
      modality: record.modality,
      ...(record.width !== undefined ? { width: record.width } : {}),
      ...(record.height !== undefined ? { height: record.height } : {}),
      ...(record.posterUrl !== undefined ? { posterUrl: record.posterUrl } : {}),
      ...(record.lqip !== undefined ? { lqip: record.lqip } : {}),
      ...(record.durationSeconds !== undefined
        ? { durationSeconds: record.durationSeconds }
        : {}),
    };
  }

  const pages = artifact.payload.pages.pages;
  const page = lookup.pagePath
    ? pages.find(
        (candidate) => candidate.suggestedUrl === `/${lookup.pagePath}`,
      )
    : pages[0];
  if (!page) return null;

  return {
    publication,
    blueprint: artifact.payload,
    page,
    businessName: business.name,
    media,
    ...(business.contact ? { contact: business.contact } : {}),
    ...(business.ga4MeasurementId
      ? { ga4MeasurementId: business.ga4MeasurementId }
      : {}),
    servingMode: "slug" in lookup ? "slug" : "hostname",
  };
}

/** SEO fundamentals from the RESOLVED page's own SEO aspects (ADR-028). */
export function publishedSiteMetadata(
  resolved: ResolvedPublication,
  canonicalUrl: string,
): Metadata {
  const { page, blueprint } = resolved;
  const title =
    page.seo?.titleDirection ?? blueprint.identity.businessName ?? "";
  const description = page.seo?.metaDescriptionDirection ?? "";
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: resolved.businessName,
      type: "website",
      locale: "en_GB",
    },
    robots: { index: true, follow: true },
  };
}

/**
 * Full-bleed, chrome-free render of the pinned page, with its JSON-LD.
 * `baseUrl` is the site root this request serves from (no trailing slash).
 */
export function PublishedSitePage({
  resolved,
  baseUrl,
}: {
  resolved: ResolvedPublication;
  baseUrl: string;
}) {
  const { blueprint, page, publication, servingMode } = resolved;
  const jsonLd = buildPageJsonLd(blueprint, page.id, { baseUrl });
  const pageHref =
    servingMode === "slug"
      ? (pageId: string, url: string) =>
          `/sites/${publication.slug}${url === "/" ? "" : url}`
      : undefined;

  return (
    <div className={rendererFontClass}>
      {/* Warm the media origin before the hero image request (ADR-033). */}
      {Object.values(resolved.media)[0]?.url.startsWith("http") && (
        <link
          rel="preconnect"
          href={new URL(Object.values(resolved.media)[0].url).origin}
        />
      )}
      {/* First-party view beacon (ADR-030) — published pages only. */}
      <SiteMetricsBeacon
        slug={publication.slug}
        path={page.suggestedUrl ?? "/"}
      />
      {resolved.ga4MeasurementId && (
        <>
          {/* Optional per-site GA4 hook — off unless the founder set an id. */}
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(resolved.ga4MeasurementId)}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(resolved.ga4MeasurementId)});`,
            }}
          />
        </>
      )}
      {jsonLd.map((item) => (
        <script
          key={String(item["@type"])}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      {renderPage(blueprint, {
        // Production serving must not crash on an unmapped primitive.
        onUnmapped: "skip",
        pageId: page.id,
        ...(pageHref ? { pageHref } : {}),
        serving: {
          publicationId: publication.id,
          slug: publication.slug,
        },
        media: resolved.media,
        // The customer's building — zero internal scaffolding (ADR-034).
        mode: "public",
        ...(resolved.contact ? { contact: resolved.contact } : {}),
      })}
    </div>
  );
}

export function publishedSiteNotFound(): never {
  notFound();
}
