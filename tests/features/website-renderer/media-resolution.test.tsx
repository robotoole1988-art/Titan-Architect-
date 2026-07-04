import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import { buildWebsiteBlueprint } from "@/core/website-blueprint";
import { renderPage, type ResolvedMediaAsset } from "@/features/website-renderer";

/**
 * Media resolution (ADR-033): approved assets render as real imagery;
 * slots WITHOUT an approved asset keep the honest annotated frame.
 */

const blueprint = buildWebsiteBlueprint({
  strategy: generateExperienceStrategy({
    businessName: "Kerbside Kings",
    trade: "Driveways & Paving",
    location: "Manchester",
  }),
});

const heroSection = blueprint.pages.pages[0].sections[0];
const heroRef = heroSection.media?.[0]?.generationRef ?? `media/${heroSection.id}`;
const arcSection = blueprint.pages.pages[0].sections.find(
  (section) => section.identifier === "story.transformation-arc",
)!;
const arcRef = arcSection.media?.[0]?.generationRef ?? `media/${arcSection.id}`;

const MEDIA: Record<string, ResolvedMediaAsset> = {
  [heroRef]: {
    url: "/generated-media/demo/hero.webp",
    modality: "image",
    width: 1344,
    height: 768,
  },
  [`${arcRef}.before`]: { url: "/generated-media/demo/before.webp", modality: "image" },
  [`${arcRef}.after`]: { url: "/generated-media/demo/after.webp", modality: "image" },
};

describe("media resolution", () => {
  it("renders the hero backdrop photo when an approved asset exists", () => {
    const html = renderToStaticMarkup(renderPage(blueprint, { media: MEDIA }));
    // next/image encodes the source into its optimiser URL.
    expect(html).toContain(encodeURIComponent("/generated-media/demo/hero.webp"));
  });

  it("renders the before/after pair as real imagery", () => {
    const html = renderToStaticMarkup(renderPage(blueprint, { media: MEDIA }));
    expect(html).toContain(encodeURIComponent("/generated-media/demo/before.webp"));
    expect(html).toContain(encodeURIComponent("/generated-media/demo/after.webp"));
  });

  it("keeps the honest annotated frames when no asset is approved", () => {
    const html = renderToStaticMarkup(renderPage(blueprint));
    expect(html).not.toContain("/generated-media/");
    expect(html.toLowerCase()).toContain("media slot");
  });

  it("images beyond the hero are lazy; every image has alt text", () => {
    const html = renderToStaticMarkup(renderPage(blueprint, { media: MEDIA }));
    const images = html.match(/<img[^>]*>/g) ?? [];
    expect(images.length).toBeGreaterThan(1);
    for (const img of images) {
      expect(img, img).toContain("alt=");
    }
    // The pair frames load lazily (the hero backdrop may be eager).
    const beforeImg = images.find((img) =>
      img.includes(encodeURIComponent("/generated-media/demo/before.webp")),
    );
    expect(beforeImg).toContain('loading="lazy"');
  });
});

describe("hero ambience film (ADR-036) — LCP is untouchable", () => {
  const WITH_FILM: Record<string, ResolvedMediaAsset> = {
    ...MEDIA,
    [`${heroRef}.film`]: {
      url: "/generated-media/demo/hero.mp4",
      modality: "video",
      posterUrl: "/generated-media/demo/hero.webp",
      durationSeconds: 5,
    },
  };

  it("ships NO <video> in SSR markup — the poster is the LCP, the clip is client-only", () => {
    const html = renderToStaticMarkup(renderPage(blueprint, { media: WITH_FILM, mode: "public" }));
    // The still hero photo is present (the LCP)…
    expect(html).toContain(encodeURIComponent("/generated-media/demo/hero.webp"));
    // …but the clip never reaches the server markup (AmbientFilm is
    // client-only; it mounts after idle).
    expect(html).not.toContain("<video");
    expect(html).not.toContain("/generated-media/demo/hero.mp4");
  });

  it("no film layer at all when the film asset is absent", () => {
    const html = renderToStaticMarkup(renderPage(blueprint, { media: MEDIA, mode: "public" }));
    expect(html).not.toContain("<video");
  });
});
