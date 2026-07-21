import { describe, expect, it } from "vitest";
import {
  ARCHETYPE_ALTERNATES,
  classifyArchetype,
  generateExperienceStrategy,
  type TradeArchetype,
} from "@/core/experience-strategy";
import { buildWebsiteBlueprint } from "@/core/website-blueprint";

/**
 * ADR-055 taste-by-comparison seam: an archetype override renders a trade
 * AS IF it were another archetype — deterministically, without touching the
 * trade's own classification, and with curated alternates per archetype.
 */

const LIBERTY = {
  businessName: "Liberty Contractors",
  trade: "Roofing",
  location: "Oxford",
};

describe("archetype override", () => {
  it("absent → the trade classifies itself exactly as before", () => {
    const strategy = generateExperienceStrategy(LIBERTY);
    const blueprint = buildWebsiteBlueprint({ strategy });
    expect(classifyArchetype("roofing")).toBe("project");
    expect(blueprint.designSystem?.themeRef).toBe("titan-project");
  });

  it("override changes theme + sequence coherently, and is deterministic", () => {
    const strategy = generateExperienceStrategy({
      ...LIBERTY,
      archetypeOverride: "premium",
    });
    const blueprint = buildWebsiteBlueprint({
      strategy,
      archetypeOverride: "premium",
    });
    expect(blueprint.designSystem?.themeRef).toBe("titan-premium");
    const again = buildWebsiteBlueprint({
      strategy: generateExperienceStrategy({ ...LIBERTY, archetypeOverride: "premium" }),
      archetypeOverride: "premium",
    });
    expect(
      JSON.stringify(blueprint.pages.pages[0].sections.map((s) => s.identifier)),
    ).toBe(
      JSON.stringify(again.pages.pages[0].sections.map((s) => s.identifier)),
    );
    // A different structure from the primary — this IS the comparison.
    const primary = buildWebsiteBlueprint({ strategy: generateExperienceStrategy(LIBERTY) });
    expect(blueprint.pages.pages[0].sections.map((s) => s.identifier)).not.toEqual(
      primary.pages.pages[0].sections.map((s) => s.identifier),
    );
  });

  it("area pages of a variant speak the same archetype (no mixed voice)", () => {
    const strategy = generateExperienceStrategy({ ...LIBERTY, archetypeOverride: "premium" });
    const blueprint = buildWebsiteBlueprint({
      strategy,
      coverageAreas: ["Surrey"],
      archetypeOverride: "premium",
    });
    expect(blueprint.designSystem?.themeRef).toBe("titan-premium");
    // Every page renders under the ONE overridden design system.
    expect(blueprint.pages.pages.filter((p) => p.type === "landing")).toHaveLength(1);
  });

  it("curated alternates: max two per archetype, never the primary itself", () => {
    for (const [primary, alternates] of Object.entries(ARCHETYPE_ALTERNATES)) {
      expect(alternates.length, primary).toBeGreaterThan(0);
      expect(alternates.length, primary).toBeLessThanOrEqual(2);
      expect(alternates, primary).not.toContain(primary as TradeArchetype);
    }
  });
});
