import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import {
  buildWebsiteBlueprint,
  type PageBlueprint,
  type WebsiteBlueprint,
} from "@/core/website-blueprint";

/**
 * Experience v2 (ADR-028): homepage + a genuinely unique landing page per
 * coverage area. The anti-doorway policy is ENFORCED here — a change that
 * regresses differentiation fails CI, not Google's spam filter.
 */

const strategy = generateExperienceStrategy({
  businessName: "Kerbside Kings",
  trade: "Driveways & Paving",
  location: "Manchester",
});
const AREAS = ["Sale", "Stockport", "Altrincham"];

function build(coverageAreas?: ReadonlyArray<string>): WebsiteBlueprint {
  return buildWebsiteBlueprint({ strategy, coverageAreas });
}

function joinedSlots(page: PageBlueprint): string {
  return page.sections
    .flatMap((section) => section.contentRequirements ?? [])
    .join("\n");
}

function areaPages(blueprint: WebsiteBlueprint): ReadonlyArray<PageBlueprint> {
  return blueprint.pages.pages.filter((page) => page.type === "landing");
}

// Standing legal pages (ADR-045) always accompany a site; they are NOT area
// pages, so the doorway/count invariants are asserted over content pages only.
function contentPages(blueprint: WebsiteBlueprint): ReadonlyArray<PageBlueprint> {
  return blueprint.pages.pages.filter((page) => page.type !== "legal");
}

describe("multi-page blueprint generation", () => {
  it("stays homepage-only without coverage areas (back-compat)", () => {
    expect(contentPages(build())).toHaveLength(1);
    expect(contentPages(build([]))).toHaveLength(1);
  });

  it("emits homepage + one landing page per coverage area", () => {
    const blueprint = build(AREAS);
    expect(contentPages(blueprint)).toHaveLength(4);
    expect(blueprint.pages.pages[0].type).toBe("home");
    expect(areaPages(blueprint)).toHaveLength(3);
  });

  it("gives every area page a unique, slugged URL", () => {
    const urls = areaPages(build(AREAS)).map((page) => page.suggestedUrl);
    expect(urls).toEqual(["/sale", "/stockport", "/altrincham"]);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("is deterministic", () => {
    expect(JSON.stringify(build(AREAS))).toBe(JSON.stringify(build(AREAS)));
  });

  it("records coverage areas on the site identity", () => {
    expect(build(AREAS).identity.coverageAreas).toEqual(AREAS);
  });

  it("navigation links home and every area page", () => {
    const blueprint = build(AREAS);
    const targets = blueprint.navigation.items?.map((item) => item.toPageId);
    expect(targets).toContain("home");
    for (const page of areaPages(blueprint)) {
      expect(targets).toContain(page.id);
    }
  });
});

describe("anti-doorway differentiation (ADR-028)", () => {
  const blueprint = build(AREAS);
  const pages = areaPages(blueprint);
  const home = blueprint.pages.pages[0];

  it("area pages use their own landing sequence, not the homepage's", () => {
    const homeSequence = home.sections.map((section) => section.identifier);
    for (const page of pages) {
      const sequence = page.sections.map((section) => section.identifier);
      expect(sequence, `${page.name} copies the homepage structure`).not.toEqual(
        homeSequence,
      );
    }
  });

  it("area pages are conversion-forward: hero, trust, services, FAQ, lead capture", () => {
    for (const page of pages) {
      const families = page.sections.map((section) =>
        section.identifier.split(".")[0],
      );
      expect(families[0]).toBe("hero");
      expect(families).toContain("trust");
      expect(families).toContain("services");
      expect(families).toContain("faq");
      expect(families[families.length - 1]).toBe("conversion");
    }
  });

  it("weaves the area name into headline, FAQ, and SEO of its own page", () => {
    for (const [index, page] of pages.entries()) {
      const area = AREAS[index];
      const slots = joinedSlots(page);
      const hero = page.sections[0];
      expect(
        (hero.contentRequirements ?? []).find((slot) => slot.startsWith("headline:")),
      ).toContain(area);
      const faq = page.sections.find((section) =>
        section.identifier.startsWith("faq."),
      );
      expect(joinedSlots({ ...page, sections: faq ? [faq] : [] })).toContain(area);
      expect(page.seo?.titleDirection).toContain(area);
      expect(page.seo?.metaDescriptionDirection).toContain(area);
      expect(slots).toContain(area);
    }
  });

  it("marks an honest area-proof slot — a brief, never fabricated content", () => {
    for (const [index, page] of pages.entries()) {
      const slots = joinedSlots(page);
      expect(slots).toContain(`area-proof:`);
      expect(slots).toContain(AREAS[index]);
      expect(slots.toLowerCase()).toContain("never fabricated");
    }
  });

  it("every pair of area pages differs substantively (slot content)", () => {
    for (let a = 0; a < pages.length; a += 1) {
      for (let b = a + 1; b < pages.length; b += 1) {
        expect(
          joinedSlots(pages[a]),
          `${pages[a].name} and ${pages[b].name} are near-copies`,
        ).not.toBe(joinedSlots(pages[b]));
      }
    }
  });

  it("varies structure between area pages (variant rotation)", () => {
    const signatures = pages.map((page) =>
      page.sections
        .map((section) => `${section.identifier}#${section.extensions?.variant}`)
        .join("|"),
    );
    expect(new Set(signatures).size).toBeGreaterThan(1);
  });

  it("area page ids and section ids are namespaced per area", () => {
    for (const page of pages) {
      expect(page.id).toMatch(/^area\./);
      for (const section of page.sections) {
        expect(section.id.startsWith(page.id)).toBe(true);
      }
    }
  });
});
