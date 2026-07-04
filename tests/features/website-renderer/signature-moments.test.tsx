import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
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
 *
 * MORPH RETREAT (ADR-032 addendum): v1 vector morphs are retired from
 * public output. They render ONLY in preview mode behind the reference
 * flag; the engine, catalogue, and builder stamping remain intact for the
 * Tier-3 WebGL milestone.
 */

const FLAG = "NEXT_PUBLIC_PREVIEW_SIGNATURE_MOMENTS";
afterEach(() => {
  delete process.env[FLAG];
});

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

describe("rendered pages — the morph retreat", () => {
  it("PUBLIC pages NEVER render a moment layer, even with the flag set", () => {
    process.env[FLAG] = "1";
    for (const trade of ["Driveways & Paving", "Emergency Roofing & Drainage"]) {
      const html = renderToStaticMarkup(
        renderPage(blueprintFor(trade), { mode: "public" }),
      );
      expect(html, trade).not.toContain("data-signature-moment");
    }
  });

  it("preview WITHOUT the flag renders no moment layer either", () => {
    const html = renderToStaticMarkup(
      renderPage(blueprintFor("Emergency Roofing & Drainage")),
    );
    expect(html).not.toContain("data-signature-moment");
  });

  it("preview WITH the reference flag keeps the moments renderable", () => {
    process.env[FLAG] = "1";
    const blueprint = blueprintFor("Emergency Roofing & Drainage", ["Sale"]);
    const home = renderToStaticMarkup(renderPage(blueprint));
    expect(home).toContain('data-signature-moment="storm-cloud-new-roof"');
    // ONE per site: area-page heroes still carry none.
    const area = renderToStaticMarkup(
      renderPage(blueprint, { pageId: blueprint.pages.pages[1].id }),
    );
    expect(area).not.toContain("data-signature-moment");
    expect(
      renderToStaticMarkup(renderPage(blueprintFor("Driveways & Paving"))),
    ).toContain('data-signature-moment="gravel-to-resin"');
  });

  it("emits no invalid kebab-case DOM attributes (the dev-overlay regression)", () => {
    process.env[FLAG] = "1";
    // React rejects SVG attributes like transform-origin in JSX — they must
    // be camelCase style props. This once shipped and lit the dev overlay.
    for (const trade of ["Driveways & Paving", "Emergency Roofing & Drainage"]) {
      const html = renderToStaticMarkup(renderPage(blueprintFor(trade)));
      expect(html, trade).not.toContain("transform-origin=");
    }
  });

  it("moment layers (behind the flag) are decorative: aria-hidden, never interactive", () => {
    process.env[FLAG] = "1";
    const blueprint = blueprintFor("Emergency Roofing & Drainage");
    const html = renderToStaticMarkup(renderPage(blueprint));
    const layer = html.match(/<div[^>]*data-signature-moment[^>]*>/)?.[0];
    expect(layer).toBeDefined();
    expect(layer).toContain('aria-hidden="true"');
  });
});
