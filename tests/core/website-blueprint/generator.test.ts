import { describe, expect, it } from "vitest";
import {
  generateExperienceStrategy,
  type ExperienceStrategy,
} from "@/core/experience-strategy";
import {
  SECTION_PRIMITIVE_REGISTRY,
  WEBSITE_BLUEPRINT_VERSION,
  buildWebsiteBlueprint,
  createWebsiteBlueprintEngine,
  getSectionPrimitive,
  validateBlueprint,
  type WebsiteBlueprint,
} from "@/core/website-blueprint";

/** One representative business per trade archetype. */
const ARCHETYPE_FIXTURES = {
  emergency: { businessName: "Rapid Response Plumbing", trade: "Emergency Plumber", location: "Leeds" },
  project: { businessName: "Crafted Bathrooms", trade: "Bathroom Fitter", location: "York" },
  premium: { businessName: "Atelier North", trade: "Luxury Interior Design", location: "Harrogate" },
  care: { businessName: "Bright Smiles", trade: "Dental Practice", location: "Sheffield" },
  recurring: { businessName: "ClearView", trade: "Window Cleaning", location: "Hull" },
  event: { businessName: "Golden Hour Studios", trade: "Wedding Photography", location: "Leeds" },
  general: { businessName: "Northern Signs", trade: "Signwriting", location: "Bradford" },
} as const;

function strategyFor(key: keyof typeof ARCHETYPE_FIXTURES): ExperienceStrategy {
  return generateExperienceStrategy(ARCHETYPE_FIXTURES[key]);
}

function sectionIdentifiers(blueprint: WebsiteBlueprint): string[] {
  return blueprint.pages.pages[0].sections.map((section) => section.identifier);
}

describe("buildWebsiteBlueprint", () => {
  it("is deterministic: the same request produces the same blueprint", () => {
    const first = buildWebsiteBlueprint({ strategy: strategyFor("emergency") });
    const second = buildWebsiteBlueprint({ strategy: strategyFor("emergency") });
    expect(second).toEqual(first);
  });

  it("produces a homepage-only page collection", () => {
    const blueprint = buildWebsiteBlueprint({ strategy: strategyFor("project") });
    expect(blueprint.pages.pages).toHaveLength(1);
    expect(blueprint.pages.pages[0].type).toBe("home");
    expect(blueprint.pages.pages[0].suggestedUrl).toBe("/");
  });

  it("stamps the blueprint schema version", () => {
    const blueprint = buildWebsiteBlueprint({ strategy: strategyFor("general") });
    expect(blueprint.version).toBe(WEBSITE_BLUEPRINT_VERSION);
  });

  it("passes validation against the primitive registry for every archetype", () => {
    for (const key of Object.keys(ARCHETYPE_FIXTURES) as Array<keyof typeof ARCHETYPE_FIXTURES>) {
      const blueprint = buildWebsiteBlueprint({ strategy: strategyFor(key) });
      const result = validateBlueprint(blueprint, SECTION_PRIMITIVE_REGISTRY);
      expect(result.errors, `archetype: ${key}`).toEqual([]);
      expect(result.valid, `archetype: ${key}`).toBe(true);
    }
  });

  it("gives distinct archetypes structurally different primitive sequences", () => {
    const emergency = sectionIdentifiers(
      buildWebsiteBlueprint({ strategy: strategyFor("emergency") }),
    );
    const premium = sectionIdentifiers(
      buildWebsiteBlueprint({ strategy: strategyFor("premium") }),
    );
    const care = sectionIdentifiers(
      buildWebsiteBlueprint({ strategy: strategyFor("care") }),
    );

    expect(emergency).not.toEqual(premium);
    expect(emergency).not.toEqual(care);
    expect(premium).not.toEqual(care);
  });

  it("leads emergency archetypes with conversion and trust primitives", () => {
    const identifiers = sectionIdentifiers(
      buildWebsiteBlueprint({ strategy: strategyFor("emergency") }),
    );
    expect(identifiers[0]).toBe("hero.rapid-response");
    const openingThree = identifiers.slice(0, 3);
    expect(openingThree).toContain("conversion.emergency-cta");
    expect(openingThree).toContain("trust.review-wall");
  });

  it("leads premium archetypes with cinematic story and portfolio proof", () => {
    const identifiers = sectionIdentifiers(
      buildWebsiteBlueprint({ strategy: strategyFor("premium") }),
    );
    expect(identifiers[0]).toBe("hero.cinematic-reveal");
    const openingFour = identifiers.slice(0, 4);
    expect(openingFour).toContain("story.transformation-arc");
    expect(openingFour).toContain("proof.portfolio-showcase");
  });

  it("writes only registered primitive ids into identifiers and component types", () => {
    const blueprint = buildWebsiteBlueprint({ strategy: strategyFor("care") });
    for (const section of blueprint.pages.pages[0].sections) {
      expect(
        getSectionPrimitive(SECTION_PRIMITIVE_REGISTRY, section.identifier),
      ).toBeDefined();
      for (const component of section.suggestedComponents ?? []) {
        expect(
          getSectionPrimitive(SECTION_PRIMITIVE_REGISTRY, component.type),
        ).toBeDefined();
      }
    }
  });

  it("populates every required content slot from the strategy", () => {
    const blueprint = buildWebsiteBlueprint({ strategy: strategyFor("emergency") });
    for (const section of blueprint.pages.pages[0].sections) {
      const primitive = getSectionPrimitive(
        SECTION_PRIMITIVE_REGISTRY,
        section.identifier,
      );
      const requirements = section.contentRequirements ?? [];
      for (const slot of primitive?.contentSlots ?? []) {
        const entry = requirements.find((requirement) =>
          requirement.startsWith(`${slot}:`),
        );
        expect(entry, `${section.identifier} → ${slot}`).toBeDefined();
        expect(entry!.length).toBeGreaterThan(`${slot}: `.length);
      }
    }
  });

  it("populates prose direction richly, not mechanically", () => {
    const strategy = strategyFor("premium");
    const blueprint = buildWebsiteBlueprint({ strategy });
    const [hero] = blueprint.pages.pages[0].sections;

    expect(hero.purpose.length).toBeGreaterThan(40);
    const extensions = hero.extensions as Record<string, unknown>;
    expect(String(extensions.headlineDirection ?? "").length).toBeGreaterThan(10);
    expect(String(extensions.cinematicTreatment ?? "").length).toBeGreaterThan(10);
  });

  it("derives animation aspects from primitive capability and strategy intensity", () => {
    const strategy = strategyFor("emergency");
    const blueprint = buildWebsiteBlueprint({ strategy });
    for (const section of blueprint.pages.pages[0].sections) {
      const primitive = getSectionPrimitive(
        SECTION_PRIMITIVE_REGISTRY,
        section.identifier,
      )!;
      if (primitive.aspects.animation) {
        expect(section.animation, section.identifier).toBeDefined();
        expect(section.animation!.intensity).toBe(strategy.animationStrategy.intensity);
      } else {
        expect(section.animation, section.identifier).toBeUndefined();
      }
      if (!primitive.aspects.interaction) {
        expect(section.interaction ?? []).toEqual([]);
      }
      if (!primitive.aspects.media) {
        expect(section.media ?? []).toEqual([]);
      }
    }
  });

  it("emits a deterministic design-system theme reference per archetype", () => {
    const emergency = buildWebsiteBlueprint({ strategy: strategyFor("emergency") });
    const care = buildWebsiteBlueprint({ strategy: strategyFor("care") });
    expect(emergency.designSystem?.themeRef).toBe("titan-emergency");
    expect(care.designSystem?.themeRef).toBe("titan-care");
  });

  it("carries the experience arc for the viewer", () => {
    const strategy = strategyFor("project");
    const blueprint = buildWebsiteBlueprint({ strategy });
    const extensions = blueprint.extensions as Record<string, unknown>;
    expect(extensions.experienceArc).toBe(strategy.storytelling.narrativeArc);
    expect(extensions.archetype).toBe("project");
  });
});

describe("createWebsiteBlueprintEngine", () => {
  it("fulfils the WebsiteBlueprintEngine contract asynchronously", async () => {
    const engine = createWebsiteBlueprintEngine();
    const strategy = strategyFor("care");
    const blueprint = await engine.build({ strategy });
    expect(blueprint).toEqual(buildWebsiteBlueprint({ strategy }));
  });
});
