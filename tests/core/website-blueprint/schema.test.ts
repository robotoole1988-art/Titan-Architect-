import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import {
  buildPageJsonLd,
  buildWebsiteBlueprint,
} from "@/core/website-blueprint";

/**
 * JSON-LD generation (ADR-028): structured data built from blueprint +
 * business data only. Shapes follow schema.org expectations; nothing is
 * fabricated — no review/rating markup until real review data exists.
 */

const strategy = generateExperienceStrategy({
  businessName: "Kerbside Kings",
  trade: "Driveways & Paving",
  location: "Manchester",
});
const AREAS = ["Sale", "Stockport", "Altrincham"];
const blueprint = buildWebsiteBlueprint({ strategy, coverageAreas: AREAS });
const BASE = "https://kerbside-kings.example";

function ldFor(pageId: string) {
  return buildPageJsonLd(blueprint, pageId, { baseUrl: BASE });
}

function ofType(items: ReadonlyArray<Record<string, unknown>>, type: string) {
  return items.find((item) => item["@type"] === type);
}

describe("buildPageJsonLd", () => {
  it("emits LocalBusiness site-wide with areaServed from coverage areas", () => {
    for (const page of blueprint.pages.pages) {
      const local = ofType(ldFor(page.id), "LocalBusiness");
      expect(local, `${page.id} missing LocalBusiness`).toBeDefined();
      expect(local?.["@context"]).toBe("https://schema.org");
      expect(local?.name).toBe("Kerbside Kings");
      expect(local?.url).toBe(`${BASE}/`);
      expect(local?.areaServed).toEqual(["Manchester", ...AREAS]);
    }
  });

  it("emits Service on homepage and area pages", () => {
    for (const page of blueprint.pages.pages) {
      const service = ofType(ldFor(page.id), "Service");
      expect(service, `${page.id} missing Service`).toBeDefined();
      expect(service?.serviceType).toBe("Driveways & Paving");
      expect((service?.provider as Record<string, unknown>)?.name).toBe(
        "Kerbside Kings",
      );
    }
  });

  it("scopes an area page's Service to that area", () => {
    const salePage = blueprint.pages.pages.find(
      (page) => page.suggestedUrl === "/sale",
    );
    const service = ofType(ldFor(salePage!.id), "Service");
    expect(service?.areaServed).toEqual(["Sale"]);
  });

  it("emits FAQPage ONLY with complete Q&A copy — never placeholder answers (ADR-034)", () => {
    // A trade WITHOUT a researched bank (ADR-047) emits direction, not
    // answers — so no FAQPage anywhere:
    const unbanked = buildWebsiteBlueprint({
      strategy: generateExperienceStrategy({
        businessName: "Northern Signs",
        trade: "Signwriting",
        location: "Bradford",
      }),
    });
    for (const page of unbanked.pages.pages) {
      expect(
        ofType(buildPageJsonLd(unbanked, page.id, { baseUrl: BASE }), "FAQPage"),
        `${page.id} must not fabricate FAQ answers`,
      ).toBeUndefined();
    }

    // The banked blueprint (Kerbside — ADR-047) emits FAQPage from the
    // trade bank's real answers on every page carrying the FAQ section:
    const banked = ofType(ldFor("home"), "FAQPage");
    expect(banked).toBeDefined();
    expect(
      (banked?.mainEntity as ReadonlyArray<unknown>).length,
    ).toBeGreaterThanOrEqual(5);

    // Real `qa: question | answer` copy upgrades the markup:
    const doctored = structuredClone(unbanked);
    const faqSection = doctored.pages.pages[0].sections.find((section) =>
      section.identifier.startsWith("faq."),
    );
    expect(faqSection).toBeDefined();
    (faqSection as unknown as { contentRequirements: string[] }).contentRequirements = [
      ...(faqSection!.contentRequirements ?? []),
      "qa: How long does a resin driveway take? | Most installations complete in two to three days.",
    ];
    const faq = ofType(
      buildPageJsonLd(doctored, "home", { baseUrl: BASE }),
      "FAQPage",
    );
    expect(faq).toBeDefined();
    const entities = faq?.mainEntity as ReadonlyArray<Record<string, unknown>>;
    expect(entities).toHaveLength(1);
    expect(entities[0].name).toBe("How long does a resin driveway take?");
    expect(
      (entities[0].acceptedAnswer as Record<string, unknown>).text,
    ).toBe("Most installations complete in two to three days.");
  });

  it("emits BreadcrumbList on area pages only, Home → area", () => {
    expect(ofType(ldFor("home"), "BreadcrumbList")).toBeUndefined();
    const salePage = blueprint.pages.pages.find(
      (page) => page.suggestedUrl === "/sale",
    )!;
    const crumbs = ofType(ldFor(salePage.id), "BreadcrumbList");
    expect(crumbs).toBeDefined();
    const items = crumbs?.itemListElement as ReadonlyArray<
      Record<string, unknown>
    >;
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ position: 1, name: "Home", item: `${BASE}/` });
    expect(items[1]).toMatchObject({ position: 2, item: `${BASE}/sale` });
  });

  it("NEVER fabricates review or rating markup", () => {
    for (const page of blueprint.pages.pages) {
      const serialised = JSON.stringify(ldFor(page.id));
      expect(serialised).not.toContain("aggregateRating");
      expect(serialised).not.toContain('"Review"');
      expect(serialised).not.toContain("ratingValue");
    }
  });

  it("is deterministic and JSON-serialisable", () => {
    const first = JSON.stringify(ldFor("home"));
    expect(JSON.stringify(ldFor("home"))).toBe(first);
    expect(() => JSON.parse(first)).not.toThrow();
  });

  it("throws on an unknown page id", () => {
    expect(() => ldFor("page.does-not-exist")).toThrow(/page/i);
  });
});
