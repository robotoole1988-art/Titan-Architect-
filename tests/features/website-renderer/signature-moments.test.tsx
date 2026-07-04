import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import { buildWebsiteBlueprint } from "@/core/website-blueprint";
import {
  renderPage,
  resolveSignatureMoment,
} from "@/features/website-renderer";

/**
 * Signature Moments v1 (ADR-032, the SIGNATURE-MOMENTS.md laws):
 * ONE moment per site (the homepage hero), selected by the builder from the
 * catalogue — never free-generated; unknown ids render nothing.
 */

function blueprintFor(trade: string, areas?: string[]) {
  return buildWebsiteBlueprint({
    strategy: generateExperienceStrategy({
      businessName: "Moment Test Co",
      trade,
      location: "Manchester",
    }),
    coverageAreas: areas,
  });
}

describe("builder stamps the signature moment (registry law)", () => {
  it("roofing homepage hero carries storm-cloud-new-roof", () => {
    const blueprint = blueprintFor("Emergency Roofing & Drainage", ["Sale"]);
    const home = blueprint.pages.pages[0];
    const hero = home.sections[0];
    expect(hero.extensions?.signatureMoment).toBe("storm-cloud-new-roof");
  });

  it("driveways homepage hero carries gravel-to-resin", () => {
    const blueprint = blueprintFor("Driveways & Paving");
    expect(
      blueprint.pages.pages[0].sections[0].extensions?.signatureMoment,
    ).toBe("gravel-to-resin");
  });

  it("the storm morph is gated to the storm ATMOSPHERE — project-archetype roofing gets none", () => {
    // Plain "Roofing" classifies project (Golden Hour); the storm's Act I
    // belongs to the emergency mood. Every moment tells the trade's story.
    const blueprint = blueprintFor("Roofing");
    expect(
      blueprint.pages.pages[0].sections[0].extensions?.signatureMoment,
    ).toBeUndefined();
  });

  it("trades without a crafted moment get NONE — never invented", () => {
    const blueprint = blueprintFor("Dental Practice");
    expect(
      blueprint.pages.pages[0].sections[0].extensions?.signatureMoment,
    ).toBeUndefined();
  });

  it("ONE per site: area-page heroes never carry a moment", () => {
    const blueprint = blueprintFor("Emergency Roofing & Drainage", ["Sale", "Stockport"]);
    for (const page of blueprint.pages.pages.slice(1)) {
      expect(
        page.sections[0].extensions?.signatureMoment,
        page.name,
      ).toBeUndefined();
    }
  });

  it("is deterministic", () => {
    expect(JSON.stringify(blueprintFor("Emergency Roofing & Drainage"))).toBe(
      JSON.stringify(blueprintFor("Emergency Roofing & Drainage")),
    );
  });
});

describe("the moment catalogue (renderer)", () => {
  it("resolves both v1 moments to crafted components", () => {
    expect(resolveSignatureMoment("storm-cloud-new-roof")).toBeTypeOf("function");
    expect(resolveSignatureMoment("gravel-to-resin")).toBeTypeOf("function");
  });

  it("returns null for unknown ids — nothing is free-generated", () => {
    expect(resolveSignatureMoment("hero.made-up-morph")).toBeNull();
    expect(resolveSignatureMoment(undefined)).toBeNull();
  });
});

describe("rendered pages", () => {
  it("the roofing homepage renders its moment layer; area pages do not", () => {
    const blueprint = blueprintFor("Emergency Roofing & Drainage", ["Sale"]);
    const home = renderToStaticMarkup(renderPage(blueprint));
    expect(home).toContain('data-signature-moment="storm-cloud-new-roof"');
    const area = renderToStaticMarkup(
      renderPage(blueprint, { pageId: blueprint.pages.pages[1].id }),
    );
    expect(area).not.toContain("data-signature-moment");
  });

  it("the driveways homepage renders gravel-to-resin", () => {
    const blueprint = blueprintFor("Driveways & Paving");
    const html = renderToStaticMarkup(renderPage(blueprint));
    expect(html).toContain('data-signature-moment="gravel-to-resin"');
  });

  it("moment layers are decorative: aria-hidden, never interactive", () => {
    const blueprint = blueprintFor("Emergency Roofing & Drainage");
    const html = renderToStaticMarkup(renderPage(blueprint));
    const layer = html.match(/<div[^>]*data-signature-moment[^>]*>/)?.[0];
    expect(layer).toBeDefined();
    expect(layer).toContain('aria-hidden="true"');
  });
});
