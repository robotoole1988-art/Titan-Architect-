import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import {
  SECTION_PRIMITIVE_REGISTRY,
  buildWebsiteBlueprint,
  validateBlueprint,
  type PageBlueprint,
  type WebsiteBlueprint,
} from "@/core/website-blueprint";

/**
 * ADR-045: every published site carries a Privacy Policy and a Terms & Legal
 * Notice, built as crafted registry-keyed blueprint pages populated from the
 * business's REAL details. They are honest (no fabricated registration), live
 * in the footer (never the header nav), and are indexable. This suite is the
 * structural enforcement of those invariants.
 */

const emergency = buildWebsiteBlueprint({
  strategy: generateExperienceStrategy({
    businessName: "Summit Roofing Rescue",
    trade: "Emergency Roofing & Drainage",
    location: "Leeds",
  }),
  coverageAreas: ["Headingley", "Horsforth"],
});
const project = buildWebsiteBlueprint({
  strategy: generateExperienceStrategy({
    businessName: "Kerbside Kings",
    trade: "Driveways & Paving",
    location: "Manchester",
  }),
});

const DEMOS = [
  { name: "Summit Roofing Rescue (emergency, area pages)", blueprint: emergency },
  { name: "Kerbside Kings (project, homepage-only)", blueprint: project },
];

function legalPages(blueprint: WebsiteBlueprint): ReadonlyArray<PageBlueprint> {
  return blueprint.pages.pages.filter((page) => page.type === "legal");
}
function pageById(blueprint: WebsiteBlueprint, id: string): PageBlueprint {
  return blueprint.pages.pages.find((page) => page.id === id)!;
}
function slotText(page: PageBlueprint): string {
  return page.sections.flatMap((s) => s.contentRequirements ?? []).join("\n");
}

describe("legal pages (ADR-045)", () => {
  for (const demo of DEMOS) {
    describe(demo.name, () => {
      it("emits exactly two legal pages: Privacy + Terms, in the collection", () => {
        const legal = legalPages(demo.blueprint);
        expect(legal.map((page) => page.suggestedUrl)).toEqual(["/privacy", "/terms"]);
        expect(legal.map((page) => page.id)).toEqual(["legal.privacy", "legal.terms"]);
      });

      it("keys each legal page to its crafted primitive", () => {
        const privacy = pageById(demo.blueprint, "legal.privacy");
        const terms = pageById(demo.blueprint, "legal.terms");
        expect(privacy.sections.map((s) => s.identifier)).toEqual(["legal.privacy-policy"]);
        expect(terms.sections.map((s) => s.identifier)).toEqual(["legal.legal-notice"]);
        expect(privacy.name).toBe("Privacy Policy");
        expect(terms.name).toBe("Terms & Legal Notice");
        expect(privacy.extensions?.legal).toBe("privacy");
        expect(terms.extensions?.legal).toBe("terms");
      });

      it("is indexable: carries an SEO block with no keyword targeting", () => {
        for (const page of legalPages(demo.blueprint)) {
          expect(page.seo, `${page.id} has no seo`).toBeDefined();
          expect(page.seo!.titleDirection).toContain(page.name);
          // Honest, not a doorway: legal pages target no keywords.
          expect(page.seo!.targetKeywords).toEqual([]);
        }
      });

      it("lives in the footer, NEVER the header navigation", () => {
        const navTargets = demo.blueprint.navigation.items
          .map((item) => item.toPageId)
          .filter((id): id is string => Boolean(id));
        expect(navTargets).not.toContain("legal.privacy");
        expect(navTargets).not.toContain("legal.terms");
        // The header nav is content pages only (home + any area pages).
        for (const target of navTargets) {
          expect(pageById(demo.blueprint, target).type).not.toBe("legal");
        }
      });

      it("populates every declared content slot (validator is clean)", () => {
        const result = validateBlueprint(demo.blueprint, SECTION_PRIMITIVE_REGISTRY);
        expect(result.errors).toEqual([]);
        expect(result.valid).toBe(true);
      });

      it("states the cookieless truth in the privacy policy", () => {
        const privacy = slotText(pageById(demo.blueprint, "legal.privacy"));
        expect(privacy).toMatch(/sets no tracking cookies/i);
        expect(privacy).toMatch(/no third-party trackers/i);
        // First-party measurement described honestly — anonymous, never per person.
        expect(privacy).toMatch(/anonymous daily totals only — never per person/i);
      });

      it("names England & Wales as the governing law in the terms", () => {
        expect(slotText(pageById(demo.blueprint, "legal.terms"))).toMatch(
          /law of England & Wales/i,
        );
      });

      it("populates the pages from the business's REAL name — no fabrication", () => {
        const name = demo.blueprint.identity.businessName;
        expect(name).toBeTruthy();
        for (const page of legalPages(demo.blueprint)) {
          expect(slotText(page)).toContain(name!);
        }
        // No invented company registration number is ever emitted.
        expect(legalPages(demo.blueprint).map(slotText).join("\n")).not.toMatch(
          /company (registration|number)|registered in England/i,
        );
      });
    });
  }

  it("is deterministic — same request, identical legal pages", () => {
    const a = buildWebsiteBlueprint({
      strategy: generateExperienceStrategy({
        businessName: "Kerbside Kings",
        trade: "Driveways & Paving",
        location: "Manchester",
      }),
    });
    expect(JSON.stringify(legalPages(a))).toBe(JSON.stringify(legalPages(project)));
  });
});
