import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import { buildWebsiteBlueprint } from "@/core/website-blueprint";
import { renderPage } from "@/features/website-renderer";

/**
 * Area-page radar centring (bug fix): the rendered radar centres and labels
 * the PAGE'S area — the base appears only as the secondary "based in" point.
 */

const blueprint = buildWebsiteBlueprint({
  strategy: generateExperienceStrategy({
    businessName: "Liberty Contractors",
    trade: "Roofing",
    location: "Oxford",
  }),
  coverageAreas: ["Oxfordshire", "Berkshire", "Greater London", "Surrey"],
});

const areaPages = blueprint.pages.pages.filter((page) => page.type === "landing");

describe("area radar centring in rendered markup", () => {
  it("labels every area page's radar with the page's area + a 'based in' secondary", () => {
    for (const page of areaPages) {
      const area = String(page.extensions?.area);
      const html = renderToStaticMarkup(
        renderPage(blueprint, { mode: "public", onUnmapped: "skip", pageId: page.id }),
      );
      expect(html, page.name).toContain(`>${area}</span>`);
      expect(html, page.name).toContain(`based in Oxford`);
      // The heading grounds the visitor in their area too.
      expect(html, page.name).toContain(`${area} and surrounding areas`);
    }
  });

  it("the homepage radar still centres the base, with no 'based in' echo", () => {
    // Liberty's project-archetype homepage has no radar; the emergency
    // archetype's does — it must keep centring the base, unchanged.
    const emergency = buildWebsiteBlueprint({
      strategy: generateExperienceStrategy({
        businessName: "Summit Roofing Rescue",
        trade: "Emergency Roofing & Drainage",
        location: "Leeds",
      }),
      coverageAreas: ["Headingley"],
    });
    const home = emergency.pages.pages[0];
    const html = renderToStaticMarkup(
      renderPage(emergency, { mode: "public", onUnmapped: "skip", pageId: home.id }),
    );
    expect(html).toContain(">Leeds</span>");
    expect(html).not.toContain("based in Leeds");
  });
});
