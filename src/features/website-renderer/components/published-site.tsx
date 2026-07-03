import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveBusinessSpine, type Publication } from "@/core/business";
import type { WebsiteBlueprint } from "@/core/website-blueprint";
import { renderPage } from "../model/render-page";
import { rendererFontClass } from "../theme/fonts";

/**
 * The PUBLISHED site (ADR-027): the preview pipeline minus chrome. Serves the
 * publication's PINNED blueprint version — a regenerated blueprint changes
 * nothing here until an explicit, approval-gated republish.
 */

export interface ResolvedPublication {
  publication: Publication;
  blueprint: WebsiteBlueprint;
  businessName: string;
}

/** Resolve a live publication by slug OR hostname (domain table, then the
 * `<slug>.host` convention used for local demos). Null → 404. */
export async function resolvePublishedSite(
  lookup: { slug: string } | { hostname: string },
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

  const [artifact, business] = await Promise.all([
    spine.artifacts.getVersion<WebsiteBlueprint>(
      publication.businessId,
      "blueprint",
      publication.blueprintVersion,
    ),
    spine.businesses.get(publication.businessId),
  ]);
  if (!artifact || !business) return null;
  return {
    publication,
    blueprint: artifact.payload,
    businessName: business.name,
  };
}

/** SEO fundamentals from the blueprint's SEO aspects (ADR-027). */
export function publishedSiteMetadata(
  resolved: ResolvedPublication,
  canonicalUrl: string,
): Metadata {
  const homepage = resolved.blueprint.pages.pages[0];
  const title =
    homepage.seo?.titleDirection ?? resolved.blueprint.identity.businessName ?? "";
  const description = homepage.seo?.metaDescriptionDirection ?? "";
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

/** Full-bleed, chrome-free render of the pinned blueprint. */
export function PublishedSitePage({ resolved }: { resolved: ResolvedPublication }) {
  return (
    <div className={rendererFontClass}>
      {renderPage(resolved.blueprint, {
        // Production serving must not crash on an unmapped primitive.
        onUnmapped: "skip",
        serving: {
          publicationId: resolved.publication.id,
          slug: resolved.publication.slug,
        },
      })}
    </div>
  );
}

export function publishedSiteNotFound(): never {
  notFound();
}
