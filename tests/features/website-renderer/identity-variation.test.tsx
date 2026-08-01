import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import { buildWebsiteBlueprint } from "@/core/website-blueprint";
import {
  ACCENT_REFS,
  FORM_REFS,
  identitySeed,
} from "@/core/website-blueprint/identity-seed";
import { renderPage } from "@/features/website-renderer";
import {
  accentCountFor,
  formCount,
  resolveTheme,
} from "@/features/website-renderer/theme/theme";

/**
 * TWO CUSTOMERS IN ONE TRADE NEVER GET THE SAME SITE (ADR-063).
 *
 * Measured before this change, across the real pipeline:
 *
 *   35 trades  ->  7 distinct layouts, 7 distinct themes
 *   5 roofers  ->  1 distinct layout, 1 theme, 3 of 4 headings identical
 *                  in the same position, and one H1 with the town swapped
 *
 * Variation had a single axis — the trade. The archetype axis is correct and
 * stays; what was missing is a second axis for the business itself.
 */

const ROOFERS = [
  ["Summit Roofing", "Leeds"],
  ["Ridgeline Roofing", "Bristol"],
  ["Apex Roof Care", "Leeds"],
  ["Northgate Roofing", "Manchester"],
  ["Crown Roofing", "Leeds"],
  ["Beacon Roofing", "Sheffield"],
  ["Fairview Roofing", "Leeds"],
  ["Oakwell Roofing", "Bradford"],
] as const;

function blueprintFor(businessName: string, trade: string, location: string) {
  return buildWebsiteBlueprint({
    strategy: generateExperienceStrategy({ businessName, trade, location }),
  });
}

/** The visual identity a visitor actually perceives. */
function visualIdentity(businessName: string, trade: string, location: string) {
  const blueprint = blueprintFor(businessName, trade, location);
  const html = renderToStaticMarkup(renderPage(blueprint, { mode: "public" }));
  return {
    themeRef: blueprint.designSystem?.themeRef,
    colourRef: blueprint.designSystem?.colourRef,
    typographyRef: blueprint.designSystem?.typographyRef,
    accent: html.match(/--wr-accent:\s*([^;"]+)/)?.[1] ?? "",
    radius: html.match(/--wr-radius:\s*([^;"]+)/)?.[1] ?? "",
    key: `${blueprint.designSystem?.colourRef}/${blueprint.designSystem?.typographyRef}`,
  };
}

describe("the identity seed is deterministic", () => {
  it("the same business always lands in the same place", () => {
    // A published site must never reshuffle itself on regeneration — the
    // customer's brand cannot change colour because someone rebuilt.
    for (const [name, location] of ROOFERS) {
      const first = visualIdentity(name, "Roofing", location);
      const second = visualIdentity(name, "Roofing", location);
      expect(second, name).toEqual(first);
    }
    expect(identitySeed("Summit Roofing", "Leeds")).toBe(
      identitySeed("summit roofing", " Leeds "),
    );
  });

  it("different businesses land in different places", () => {
    expect(identitySeed("Summit Roofing", "Leeds")).not.toBe(
      identitySeed("Apex Roof Care", "Leeds"),
    );
  });

  it("the axes do not move in lockstep", () => {
    // If colour and form were drawn from the same mixed seed, every business
    // with accent 3 would also have form 3 and the combinatorics would
    // collapse back to one dimension.
    const pairs = ROOFERS.map(([name, location]) => {
      const identity = visualIdentity(name, "Roofing", location);
      return `${identity.colourRef}|${identity.typographyRef}`;
    });
    const colourIndex = (key: string) => key.split("|")[0];
    const formIndex = (key: string) => key.split("|")[1];
    const locked = pairs.every(
      (pair) => colourIndex(pair).split("-")[1] === formIndex(pair).split("-")[1],
    );
    expect(locked, "colour and form are moving together").toBe(false);
  });
});

describe("the renderer knows every slot core can emit", () => {
  it("has at least as many accents as core will choose from, per theme", () => {
    // Core cannot import the renderer, so the two catalogues are kept in
    // sync by this test rather than a shared constant. A slot core emits but
    // the renderer lacks would silently render as the default accent —
    // invisible, and it would quietly shrink the variety space.
    for (const themeRef of [
      "titan-emergency",
      "titan-premium",
      "titan-project",
      "titan-care",
      "titan-technical",
      "titan-general",
    ]) {
      expect(accentCountFor(themeRef), themeRef).toBeGreaterThanOrEqual(
        ACCENT_REFS.length,
      );
    }
    expect(formCount()).toBeGreaterThanOrEqual(FORM_REFS.length);
  });

  it("every slot resolves to a DISTINCT accent within its theme", () => {
    for (const themeRef of ["titan-emergency", "titan-project", "titan-care", "titan-technical"]) {
      const accents = ACCENT_REFS.map(
        (colourRef) => resolveTheme(themeRef, { colourRef }).vars["--wr-accent"],
      );
      expect(new Set(accents).size, `${themeRef} repeats an accent`).toBe(
        ACCENT_REFS.length,
      );
    }
    const radii = FORM_REFS.map(
      (typographyRef) =>
        resolveTheme("titan-project", { typographyRef }).vars["--wr-radius"],
    );
    expect(new Set(radii).size).toBe(FORM_REFS.length);
  });

  it("an unknown or missing slot falls back to the original token set", () => {
    // Blueprints generated before ADR-063 have no colourRef. They must render
    // exactly as they always did.
    const base = resolveTheme("titan-project");
    expect(resolveTheme("titan-project", { colourRef: "accent-99" }).vars["--wr-accent"])
      .toBe(base.vars["--wr-accent"]);
    expect(resolveTheme("titan-project", { colourRef: "nonsense" }).vars["--wr-accent"])
      .toBe(base.vars["--wr-accent"]);
  });
});

describe("the archetype's register survives the variation", () => {
  it("a business only ever gets an accent from its own theme's palette", () => {
    // The whole point of the archetype themes is that an emergency site
    // reads urgent and a care site reads calm. Variation must not leak a
    // sage green onto a storm-dark emergency page.
    const registers: Array<[string, string]> = [
      ["Emergency Roofing & Drainage", "titan-emergency"],
      ["Dentists (Private)", "titan-care"],
      ["Solar PV", "titan-technical"],
    ];
    for (const [trade, themeRef] of registers) {
      const permitted = new Set(
        ACCENT_REFS.map(
          (colourRef) => resolveTheme(themeRef, { colourRef }).vars["--wr-accent"],
        ),
      );
      for (const [name, location] of ROOFERS) {
        const identity = visualIdentity(name, trade, location);
        expect(identity.themeRef, trade).toBe(themeRef);
        expect(
          permitted.has(identity.accent),
          `${trade} · ${name} got "${identity.accent}", outside its register`,
        ).toBe(true);
      }
    }
  });
});

describe("two customers in one trade do not get the same site", () => {
  it("eight roofers produce mostly distinct visual identities", () => {
    // Before ADR-063 this was 1 distinct identity out of 5. The seed is a
    // hash, not an allocation, so collisions are possible rather than
    // impossible — see the ADR's "Negative" section. This asserts the
    // measured improvement and fails loudly if variation regresses.
    const identities = ROOFERS.map(([name, location]) =>
      visualIdentity(name, "Roofing", location),
    );
    const distinct = new Set(identities.map((identity) => identity.key)).size;
    expect(
      distinct,
      `only ${distinct} distinct identities across ${ROOFERS.length} roofers`,
    ).toBeGreaterThanOrEqual(6);
    // And the specific defect: the first two must not be identical.
    expect(identities[0].key).not.toBe(identities[2].key);
  });

  it("the rendered pages actually differ, not just the refs", () => {
    const [first, second] = [
      renderToStaticMarkup(
        renderPage(blueprintFor("Summit Roofing", "Roofing", "Leeds"), { mode: "public" }),
      ),
      renderToStaticMarkup(
        renderPage(blueprintFor("Apex Roof Care", "Roofing", "Leeds"), { mode: "public" }),
      ),
    ];
    // Same trade, same town — the hardest case, and the one two competitors
    // would notice. Normalise away the names so the comparison is about
    // design, not content.
    const normalise = (html: string) =>
      html.replace(/Summit Roofing|Apex Roof Care/g, "BUSINESS");
    expect(normalise(first)).not.toBe(normalise(second));
  });
});
