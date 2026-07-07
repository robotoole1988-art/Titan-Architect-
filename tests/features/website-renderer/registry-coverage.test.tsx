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
const technicalBlueprint = buildWebsiteBlueprint({
  strategy: generateExperienceStrategy({
    businessName: "Voltway Renewables",
    trade: "Solar PV",
    location: "Leeds",
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

  it("renders any page of a multi-page collection, with cross-page navigation", () => {
    const multi = buildWebsiteBlueprint({
      strategy: generateExperienceStrategy({
        businessName: "Kerbside Kings",
        trade: "Driveways & Paving",
        location: "Manchester",
      }),
      coverageAreas: ["Sale", "Stockport"],
    });
    const salePage = multi.pages.pages.find((page) => page.suggestedUrl === "/sale")!;
    const html = renderToStaticMarkup(
      renderPage(multi, { pageId: salePage.id }),
    );
    // The area page's own sections render (landing sequence, not homepage's).
    for (const section of salePage.sections) {
      expect(html).toContain(`data-primitive="${section.identifier}"`);
    }
    // Navigation links every page of the collection via suggested URLs.
    expect(html).toContain('href="/sale"');
    expect(html).toContain('href="/stockport"');
    // A custom href resolver rewrites the links (slug serving / previews).
    const rewritten = renderToStaticMarkup(
      renderPage(multi, {
        pageId: salePage.id,
        pageHref: (pageId, url) => `/sites/demo${url === "/" ? "" : url}`,
      }),
    );
    expect(rewritten).toContain('href="/sites/demo/stockport"');
    // Unknown page ids fail loudly.
    expect(() => renderPage(multi, { pageId: "page.nope" })).toThrowError(/page/i);
  });

  it("premium/project, care AND technical sequences resolve to CRAFTED components — never the placeholder (ADR-029/043/044)", () => {
    for (const blueprint of [drivewaysBlueprint, dentalBlueprint, technicalBlueprint]) {
      for (const page of blueprint.pages.pages) {
        for (const section of page.sections) {
          expect(
            resolvePrimitiveComponent(section.identifier),
            `${section.identifier} resolves to the placeholder`,
          ).toBe(PRIMITIVE_COMPONENT_MAP[section.identifier]);
        }
      }
    }
    const html = renderToStaticMarkup(renderPage(drivewaysBlueprint));
    expect(html).not.toContain("data-placeholder=");
    expect(html).toContain('data-theme="titan-project"');
  });

  it("the care (dental) homepage renders CRAFTED in the titan-care theme (ADR-043)", () => {
    const html = renderToStaticMarkup(renderPage(dentalBlueprint));
    expect(html).not.toContain("data-placeholder=");
    // The care theme is realised (not the generic default).
    expect(html).toContain('data-theme="titan-care"');
    // Its serif heading face rides the --wr-font-display override.
    expect(html).toContain("--wr-font-serif");
    // The care-only primitives are present and crafted.
    expect(html).toContain('data-primitive="story.gentle-welcome"');
    expect(html).toContain('data-primitive="trust.team-introduction"');
  });

  it("the technical (solar) homepage renders CRAFTED in the titan-technical theme (ADR-044)", () => {
    const html = renderToStaticMarkup(renderPage(technicalBlueprint));
    expect(html).not.toContain("data-placeholder=");
    // The technical theme is realised (not the generic default).
    expect(html).toContain('data-theme="titan-technical"');
    // The capability-led sequence — credential band + install process — is present.
    expect(html).toContain('data-primitive="proof.credential-band"');
    expect(html).toContain('data-primitive="process.journey-map"');
    expect(html).toContain('data-primitive="proof.portfolio-showcase"');
    // Real accreditations from the taxonomy (MCS for solar).
    expect(html).toContain("MCS certified");
  });

  it("the placeholder mechanism still holds for any future unmapped primitive", () => {
    // Every registered primitive is crafted today; prove the honest fallback
    // survives by resolving against a map with one primitive removed.
    const partial = { ...PRIMITIVE_COMPONENT_MAP };
    delete (partial as Record<string, unknown>)["faq.reassurance-accordion"];
    const resolved = resolvePrimitiveComponent("faq.reassurance-accordion", partial);
    expect(resolved).toBeTypeOf("function");
    expect(resolved).not.toBe(PRIMITIVE_COMPONENT_MAP["faq.reassurance-accordion"]);
  });
});
