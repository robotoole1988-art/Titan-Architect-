import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import {
  SECTION_PRIMITIVE_REGISTRY,
  buildWebsiteBlueprint,
  validateBlueprint,
  type WebsiteBlueprint,
} from "@/core/website-blueprint";

/** Readonly is compile-time only — tests deliberately corrupt deep copies. */
type Mutable = Record<string, unknown>;

function freshBlueprint(): WebsiteBlueprint {
  const strategy = generateExperienceStrategy({
    businessName: "Rapid Response Plumbing",
    trade: "Emergency Plumber",
    location: "Leeds",
  });
  return buildWebsiteBlueprint({ strategy });
}

function firstSection(blueprint: WebsiteBlueprint): Mutable {
  return blueprint.pages.pages[0].sections[0] as unknown as Mutable;
}

describe("validateBlueprint", () => {
  it("accepts a generated blueprint", () => {
    const result = validateBlueprint(freshBlueprint(), SECTION_PRIMITIVE_REGISTRY);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it("rejects a section whose identifier is not a registered primitive", () => {
    const blueprint = structuredClone(freshBlueprint());
    firstSection(blueprint).identifier = "hero.free-generated-layout";

    const result = validateBlueprint(blueprint, SECTION_PRIMITIVE_REGISTRY);
    expect(result.valid).toBe(false);
    expect(result.errors.join("\n")).toContain("hero.free-generated-layout");
  });

  it("rejects a section with an illegal variant", () => {
    const blueprint = structuredClone(freshBlueprint());
    const section = firstSection(blueprint);
    section.extensions = { ...(section.extensions as Mutable), variant: "nope" };

    const result = validateBlueprint(blueprint, SECTION_PRIMITIVE_REGISTRY);
    expect(result.valid).toBe(false);
    expect(result.errors.join("\n")).toContain("nope");
  });

  it("rejects a section without a variant", () => {
    const blueprint = structuredClone(freshBlueprint());
    const section = firstSection(blueprint);
    section.extensions = { ...(section.extensions as Mutable), variant: undefined };

    const result = validateBlueprint(blueprint, SECTION_PRIMITIVE_REGISTRY);
    expect(result.valid).toBe(false);
  });

  it("rejects a component whose type is not a registered primitive", () => {
    const blueprint = structuredClone(freshBlueprint());
    const section = firstSection(blueprint);
    const components = section.suggestedComponents as Mutable[];
    expect(components.length).toBeGreaterThan(0);
    components[0].type = "made-up-component";

    const result = validateBlueprint(blueprint, SECTION_PRIMITIVE_REGISTRY);
    expect(result.valid).toBe(false);
    expect(result.errors.join("\n")).toContain("made-up-component");
  });

  it("rejects a section missing a required content slot", () => {
    const blueprint = structuredClone(freshBlueprint());
    const section = firstSection(blueprint);
    section.contentRequirements = [];

    const result = validateBlueprint(blueprint, SECTION_PRIMITIVE_REGISTRY);
    expect(result.valid).toBe(false);
    expect(result.errors.join("\n")).toMatch(/content slot/i);
  });

  it("rejects duplicate section ids on a page", () => {
    const blueprint = structuredClone(freshBlueprint());
    const sections = blueprint.pages.pages[0].sections as unknown as Mutable[];
    sections[1].id = sections[0].id;

    const result = validateBlueprint(blueprint, SECTION_PRIMITIVE_REGISTRY);
    expect(result.valid).toBe(false);
    expect(result.errors.join("\n")).toMatch(/duplicate/i);
  });
});
