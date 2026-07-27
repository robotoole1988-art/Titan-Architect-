import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import { buildWebsiteBlueprint, type WebsiteBlueprint } from "@/core/website-blueprint";
import { renderPage, type ResolvedMediaAsset } from "@/features/website-renderer";
import { CinematicImage } from "@/features/website-renderer/primitives/cinematic-image";

/**
 * THE BOX LAW (ADR-055).
 *
 * `next/image fill` positions the <img> absolutely, so a CinematicImage
 * wrapper never derives height from its image. A wrapper that lays out at
 * zero height never intersects the viewport, so the lazy loader never fires
 * and the visitor sees the placeholder gradient for ever.
 *
 * This shipped: `relative overflow-hidden` was concatenated with a caller's
 * `absolute inset-0`, Tailwind emits `.relative` after `.absolute`, and 10
 * of the 11 photographs on the live Kerbside site measured 755x0 in
 * production. This suite is the law that stops it coming back.
 */

const DEMOS: ReadonlyArray<{ name: string; blueprint: WebsiteBlueprint }> = [
  {
    name: "Kerbside Kings (project)",
    blueprint: buildWebsiteBlueprint({
      strategy: generateExperienceStrategy({
        businessName: "Kerbside Kings",
        trade: "Driveways & Paving",
        location: "Manchester",
      }),
      coverageAreas: ["Sale"],
    }),
  },
  {
    name: "Summit Roofing Rescue (emergency)",
    blueprint: buildWebsiteBlueprint({
      strategy: generateExperienceStrategy({
        businessName: "Summit Roofing Rescue",
        trade: "Emergency Roofing & Drainage",
        location: "Leeds",
      }),
      coverageAreas: ["Headingley"],
    }),
  },
];

/** Every slot suffix the primitives actually read (ADR-033 resolution). */
const SUFFIXES = [
  "",
  ".2",
  ".3",
  ".before",
  ".after",
  ".pair-before",
  ".pair-after",
  ".frame-1",
  ".frame-2",
  ".frame-3",
  ".frame-4",
  ".frame-5",
];

/** Approve an asset for every slot on every page, so every frame renders. */
function fullMedia(blueprint: WebsiteBlueprint): Record<string, ResolvedMediaAsset> {
  const media: Record<string, ResolvedMediaAsset> = {};
  for (const page of blueprint.pages.pages) {
    for (const section of page.sections) {
      const base = section.media?.[0]?.generationRef ?? `media/${section.id}`;
      for (const suffix of SUFFIXES) {
        media[`${base}${suffix}`] = {
          url: `/generated-media/box/${section.id}${suffix}.webp`,
          modality: "image",
          width: 1600,
          height: 1000,
        };
      }
    }
  }
  return media;
}

interface Box {
  fit: string;
  classes: string[];
  style: string;
  tag: string;
}

function boxes(html: string): Box[] {
  const found: Box[] = [];
  const re = /<div data-wr-box="(inset|sized|ratio)"([^>]*)>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const [tag, fit, rest] = match;
    found.push({
      fit,
      classes: (rest.match(/class="([^"]*)"/)?.[1] ?? "").split(/\s+/).filter(Boolean),
      style: rest.match(/style="([^"]*)"/)?.[1] ?? "",
      tag,
    });
  }
  return found;
}

/** A box is legal only if SOMETHING gives it height. */
function assertHasABox(box: Box): void {
  const { fit, classes, style, tag } = box;
  // The production failure, in one assertion: two competing position
  // utilities on one element, resolved by stylesheet order, not by intent.
  expect(
    classes.includes("absolute") && classes.includes("relative"),
    `competing position utilities on a media box: ${tag}`,
  ).toBe(false);

  if (fit === "inset") {
    expect(classes, tag).toContain("absolute");
    expect(classes, tag).toContain("inset-0");
  } else if (fit === "ratio") {
    expect(classes, tag).toContain("relative");
    expect(style, `fit="ratio" must carry an aspect-ratio: ${tag}`).toContain(
      "aspect-ratio",
    );
  } else {
    expect(classes, tag).toContain("relative");
    // h-56, sm:h-72, h-full, min-h-… — anything that resolves to a height.
    expect(
      classes.some((token) => /(^|:)(min-)?h-/.test(token)),
      `fit="sized" must carry a height utility: ${tag}`,
    ).toBe(true);
  }
}

describe("the box law — a CinematicImage can never lay out at zero height", () => {
  const asset: ResolvedMediaAsset = {
    url: "/generated-media/box/unit.webp",
    modality: "image",
    width: 1600,
    height: 1000,
  };

  it("fit=\"inset\" fills its positioned ancestor and never says relative", () => {
    const [box] = boxes(
      renderToStaticMarkup(<CinematicImage asset={asset} alt="inset" fit="inset" />),
    );
    expect(box).toBeDefined();
    assertHasABox(box);
  });

  it("fit=\"sized\" is relative and takes the caller's height", () => {
    const [box] = boxes(
      renderToStaticMarkup(
        <CinematicImage asset={asset} alt="sized" fit="sized" className="h-56 w-full sm:h-72" />,
      ),
    );
    expect(box).toBeDefined();
    assertHasABox(box);
  });

  it("fit=\"ratio\" builds its own box from the asset's intrinsic dimensions", () => {
    const [box] = boxes(
      renderToStaticMarkup(
        <CinematicImage asset={asset} alt="ratio" fit="ratio" className="w-full" />,
      ),
    );
    expect(box).toBeDefined();
    expect(box.style).toContain("1600 / 1000");
    assertHasABox(box);
  });

  it("fit=\"ratio\" falls back to a real ratio when the asset has no dimensions", () => {
    const [box] = boxes(
      renderToStaticMarkup(
        <CinematicImage
          asset={{ url: "/generated-media/box/bare.webp", modality: "image" }}
          alt="ratio"
          fit="ratio"
          className="w-full"
        />,
      ),
    );
    expect(box.style).toMatch(/aspect-ratio:\s*4 \/ 3/);
  });
});

describe("the box law holds across every page of both live archetypes", () => {
  for (const demo of DEMOS) {
    for (const mode of ["public", "preview"] as const) {
      for (const page of demo.blueprint.pages.pages) {
        it(`${demo.name} · ${mode} · page "${page.id}"`, () => {
          const html = renderToStaticMarkup(
            renderPage(demo.blueprint, {
              mode,
              pageId: page.id,
              media: fullMedia(demo.blueprint),
            }),
          );
          for (const box of boxes(html)) assertHasABox(box);
        });
      }
    }
  }

  it("actually renders media boxes — the suite is not vacuous", () => {
    const html = renderToStaticMarkup(
      renderPage(DEMOS[0].blueprint, {
        mode: "public",
        media: fullMedia(DEMOS[0].blueprint),
      }),
    );
    // The Kerbside homepage carried 11 photographs in production.
    expect(boxes(html).length).toBeGreaterThanOrEqual(5);
  });

  it("every OPTIMISED photograph sits inside a declared box", () => {
    const html = renderToStaticMarkup(
      renderPage(DEMOS[0].blueprint, {
        mode: "public",
        media: fullMedia(DEMOS[0].blueprint),
      }),
    );
    // Only next/image output is a CinematicImage; the heroes also ship two
    // hand-authored <img> grain textures that carry their own dimensions.
    const optimised = (html.match(/<img[^>]*>/g) ?? []).filter((img) =>
      img.includes("/_next/image"),
    );
    expect(optimised.length).toBe(boxes(html).length);
  });
});
