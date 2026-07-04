/**
 * JSON-LD schema markup (ADR-028) — generated deterministically from the
 * blueprint, so structured data and rendered page can never disagree.
 *
 * HONESTY RULE: nothing is fabricated. LocalBusiness carries only the fields
 * the blueprint actually knows; FAQPage is emitted ONLY when the blueprint
 * carries complete Q&A copy (`qa:` requirements, ADR-034) — direction and
 * placeholder text are never sent to search engines; review/rating markup is
 * omitted entirely until real review data exists.
 */

import type { PageBlueprint } from "./page";
import type { WebsiteBlueprint } from "./website-blueprint";

export interface PageJsonLdOptions {
  /** Site origin the published page serves from, e.g. "https://example.com". */
  baseUrl: string;
}

export type JsonLdObject = Record<string, unknown>;

/**
 * FAQPage entities — ONLY from complete Q&A copy (ADR-034). The blueprint's
 * `questions-direction` slot is internal direction, not answers; publishing
 * placeholder text as an Answer would send scaffolding to search engines.
 * Real Q&A arrives as `qa:` content requirements ("qa: question | answer");
 * until then, no FAQPage is emitted at all.
 */
function faqEntities(
  requirements: ReadonlyArray<string> | undefined,
): JsonLdObject[] {
  const entities: JsonLdObject[] = [];
  for (const requirement of requirements ?? []) {
    if (!requirement.startsWith("qa:")) continue;
    const [question, answer] = requirement
      .slice("qa:".length)
      .split("|")
      .map((part) => part.trim());
    if (!question || !answer) continue;
    entities.push({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    });
  }
  return entities;
}

function pageAreaName(page: PageBlueprint): string | undefined {
  const area = page.extensions?.area;
  return typeof area === "string" ? area : undefined;
}

/**
 * Every JSON-LD object for one page of the collection: LocalBusiness
 * site-wide, Service (area-scoped on area pages), FAQPage where an FAQ
 * primitive renders, BreadcrumbList on area pages.
 */
export function buildPageJsonLd(
  blueprint: WebsiteBlueprint,
  pageId: string,
  options: PageJsonLdOptions,
): ReadonlyArray<JsonLdObject> {
  const page = blueprint.pages.pages.find((candidate) => candidate.id === pageId);
  if (!page) {
    throw new Error(`Unknown page "${pageId}" — not in this blueprint's collection.`);
  }
  const base = options.baseUrl.replace(/\/+$/, "");
  const { identity } = blueprint;
  const servedEverywhere = [
    identity.location,
    ...(identity.coverageAreas ?? []),
  ].filter((value): value is string => Boolean(value));

  const items: JsonLdObject[] = [];

  items.push({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: identity.businessName ?? "",
    url: `${base}/`,
    ...(identity.positioning ? { description: identity.positioning } : {}),
    areaServed: servedEverywhere,
  });

  const area = pageAreaName(page);
  items.push({
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: identity.trade ?? "",
    provider: { "@type": "LocalBusiness", name: identity.businessName ?? "" },
    areaServed: area ? [area] : servedEverywhere,
  });

  const faqSection = page.sections.find((section) =>
    section.identifier.startsWith("faq."),
  );
  if (faqSection) {
    const mainEntity = faqEntities(faqSection.contentRequirements);
    if (mainEntity.length > 0) {
      items.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity,
      });
    }
  }

  if (page.type === "landing") {
    items.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: page.name,
          item: `${base}${page.suggestedUrl ?? `/${pageId}`}`,
        },
      ],
    });
  }

  return items;
}
