import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import {
  SECTION_PRIMITIVE_REGISTRY,
  buildWebsiteBlueprint,
} from "@/core/website-blueprint";
import {
  PRIMITIVE_COMPONENT_MAP,
  renderPage,
  resolvePrimitiveComponent,
} from "@/features/website-renderer";

/**
 * Renderer v1 guarantee: EVERY primitive + variant in the registry resolves to
 * a component — crafted where built, the clearly-labelled premium placeholder
 * where not — so every archetype previews a coherent page. A registry addition
 * without a mapping fails HERE, not in the founder's preview.
 */

// Non-emergency archetypes exercise the unbuilt primitives.
const drivewaysBlueprint = buildWebsiteBlueprint({
  strategy: generateExperienceStrategy({
    businessName: "Kerbside Kings",
    trade: "Driveways & Paving",
    location: "Manchester",
  }),
});
const dentalBlueprint = buildWebsiteBlueprint({
  strategy: generateExperienceStrategy({
    businessName: "Bright Smiles",
    trade: "Dental Practice",
    location: "Sheffield",
  }),
});

describe("registry coverage", () => {
  for (const primitive of Object.values(SECTION_PRIMITIVE_REGISTRY)) {
    for (const variant of primitive.variants) {
      it(`resolves "${primitive.id}" (variant "${variant}")`, () => {
        expect(resolvePrimitiveComponent(primitive.id)).toBeTypeOf("function");
      });
    }
  }

  it("falls back to the primitive's own component for an unknown variant", () => {
    // The map is keyed by primitive; the variant rides in as a prop, so an
    // unknown variant lands on the same (default) component.
    expect(resolvePrimitiveComponent("hero.rapid-response")).toBe(
      PRIMITIVE_COMPONENT_MAP["hero.rapid-response"],
    );
  });

  it("returns null only for identifiers outside the registry", () => {
    expect(resolvePrimitiveComponent("hero.not-a-real-primitive")).toBeNull();
  });

  for (const [label, blueprint] of [
    ["project (driveways)", drivewaysBlueprint],
    ["care (dental)", dentalBlueprint],
  ] as const) {
    it(`renders every section of a ${label} homepage`, () => {
      const html = renderToStaticMarkup(renderPage(blueprint));
      for (const section of blueprint.pages.pages[0].sections) {
        expect(
          html,
          `section "${section.identifier}" did not render`,
        ).toContain(`data-primitive="${section.identifier}"`);
      }
      expect(html).toContain("<footer");
    });
  }

  it("labels unbuilt primitives honestly — never passes one off as crafted", () => {
    const html = renderToStaticMarkup(renderPage(drivewaysBlueprint));
    // hero.cinematic-reveal has no crafted component yet.
    expect(html).toContain('data-placeholder="hero.cinematic-reveal"');
    expect(html.toLowerCase()).toContain("crafted component in production");
    // Its registry name appears as the structural eyebrow.
    expect(html).toContain(
      SECTION_PRIMITIVE_REGISTRY["hero.cinematic-reveal"].name,
    );
  });
});
