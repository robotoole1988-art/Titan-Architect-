import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import { buildWebsiteBlueprint } from "@/core/website-blueprint";
import { PRIMITIVE_COMPONENT_MAP } from "@/features/website-renderer";

// "Drainage" keeps this in the emergency archetype (ADR-020 keywords) while
// the business stays a storm-trade demo.
const emergencyBlueprint = buildWebsiteBlueprint({
  strategy: generateExperienceStrategy({
    businessName: "Summit Roofing Rescue",
    trade: "Emergency Roofing & Drainage",
    location: "Leeds",
  }),
});

describe("PRIMITIVE_COMPONENT_MAP", () => {
  it("covers every primitive the emergency sequence uses", () => {
    const identifiers = emergencyBlueprint.pages.pages[0].sections.map(
      (section) => section.identifier,
    );
    expect(identifiers.length).toBeGreaterThan(0);
    for (const identifier of identifiers) {
      expect(
        PRIMITIVE_COMPONENT_MAP[identifier],
        `no renderer component for "${identifier}"`,
      ).toBeDefined();
    }
  });

  it("covers the scroll-driven transformation arc", () => {
    expect(PRIMITIVE_COMPONENT_MAP["story.transformation-arc"]).toBeDefined();
  });

  it("has no mappings outside the primitive registry namespace shape", () => {
    for (const id of Object.keys(PRIMITIVE_COMPONENT_MAP)) {
      expect(id).toMatch(/^[a-z]+\.[a-z][a-z-]*$/);
    }
  });
});
