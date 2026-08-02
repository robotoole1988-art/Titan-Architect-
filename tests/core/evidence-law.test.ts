import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { resolveBusinessSpine } from "@/core/business";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import {
  deriveMediaPlan,
  generateMissingMedia,
  isEvidentiarySlot,
  projectFrameCount,
  sourcingForSlot,
} from "@/core/media";
import type { SectionBlueprint, WebsiteBlueprint } from "@/core/website-blueprint";
import { buildWebsiteBlueprint } from "@/core/website-blueprint";
import type { ResolvedMediaAsset } from "@/features/website-renderer";
import { renderPage, resolvePublishedSite } from "@/features/website-renderer";

/**
 * TITAN NEVER PRESENTS A GENERATED IMAGE AS EVIDENCE OF WORK THE BUSINESS
 * DID (ADR-060).
 *
 * Note the shape of that sentence. The rule is not "no AI imagery" — the ASA
 * is explicitly technology-neutral, and generated imagery does most of the
 * visual work on every TITAN site. The rule is about the CLAIM the page makes
 * around the image, because that is the only thing the law cares about:
 * DMCC Act 2024 s.226 makes a misleading PRESENTATION actionable in its own
 * right, however the pixels were produced.
 *
 * So the same image is lawful in one frame and unlawful in the next:
 *
 *   "The finish you're buying"  + alt "the driveway finish — detail 1"
 *      → an illustration of the trade. True of any competent installer.
 *
 *   "Our recent work"           + alt "a completed job — photograph 1"
 *      → a claim about THIS business, which needs a real photograph.
 *
 * Before this change every site shipped the second sentence with a generated
 * image under it, briefed as "a different completed job each frame". This
 * suite pins the two voices apart, and pins the three choke points that stop
 * generation from ever reaching an evidentiary slot.
 */

const TRADES = [
  "Driveways & Paving",
  "Solar PV",
  "Emergency Roofing & Drainage",
  "Dentists (Private)",
  "Landscaping & Garden Design",
] as const;

/** Language that asserts the business did the work in the picture. */
const PROVENANCE_CLAIMS = [
  "Our recent work",
  "The work speaks first",
  "completed job",
  "Completed project",
  "Compare before and after",
  // Internal vocabulary that also reads as a provenance word to a visitor.
  "Portfolio Showcase",
  "Transformation Arc",
];

function blueprintFor(trade: string): WebsiteBlueprint {
  return buildWebsiteBlueprint({
    strategy: generateExperienceStrategy({
      businessName: "Probe Ltd",
      trade,
      location: "Leeds",
    }),
  });
}

/** The slot prefix a section's media hangs off (the renderer's own rule). */
function baseRefOf(section: SectionBlueprint): string {
  return section.media?.[0]?.generationRef ?? `media/${section.id}`;
}

function sectionsOf(blueprint: WebsiteBlueprint, identifier: string) {
  return blueprint.pages.pages.flatMap((page) =>
    page.sections.filter((section) => section.identifier === identifier),
  );
}

const PHOTO: ResolvedMediaAsset = {
  url: "https://cdn.example.com/photo.webp",
  modality: "image",
  width: 1152,
  height: 864,
};

/** Every GENERATED slot filled — a real site after its media run. */
function generatedMediaFor(
  blueprint: WebsiteBlueprint,
): Record<string, ResolvedMediaAsset> {
  const media: Record<string, ResolvedMediaAsset> = {};
  for (const item of deriveMediaPlan(blueprint)) {
    if (item.sourcing === "generated" && item.modality === "image") {
      media[item.slotRef] = PHOTO;
    }
  }
  return media;
}

describe("which slots are evidence, and which merely illustrate", () => {
  it("classifies the evidentiary families — and nothing that only illustrates", () => {
    for (const slot of [
      "media/home.02.story.transformation-arc.before",
      "media/home.02.story.transformation-arc.after",
      "media/home.03.proof.portfolio-showcase.pair-before",
      "media/home.03.proof.portfolio-showcase.pair-after",
      "media/home.03.proof.portfolio-showcase.frame-1",
      "media/home.05.gallery.immersive-grid.frame-12",
    ]) {
      expect(sourcingForSlot(slot), slot).toBe("customer-photo");
      expect(isEvidentiarySlot(slot), slot).toBe(true);
    }
    for (const slot of [
      // Atmosphere, setting and texture.
      "media/home.01.hero.cinematic-reveal",
      "media/home.01.hero.cinematic-reveal.film",
      "media/home.05.process.journey-map.support",
      "surfaces/block-paving-driveways",
      // The ILLUSTRATIVE counterparts — same sections, no claim.
      "media/home.03.proof.portfolio-showcase.showcase-1",
      "media/home.02.story.transformation-arc.atmosphere",
      // Near-misses that must not be swept up.
      "surfaces/before-and-after-cleaning",
      "media/home.03.proof.portfolio-showcase.frames",
    ]) {
      expect(sourcingForSlot(slot), slot).toBe("generated");
      expect(isEvidentiarySlot(slot), slot).toBe(false);
    }
  });
});

describe("choke point 1 — the plan prompts illustration, never evidence", () => {
  it("evidentiary slots are planned, briefed for a human, and unprompted", () => {
    let evidentiary = 0;
    for (const trade of TRADES) {
      const plan = deriveMediaPlan(blueprintFor(trade));
      expect(plan.length, trade).toBeGreaterThan(0);
      for (const item of plan) {
        // `sourcing` is derived, never passed in — assert it agrees with the
        // law rather than with whatever the call site intended.
        expect(item.sourcing, item.slotRef).toBe(sourcingForSlot(item.slotRef));
        if (item.sourcing === "customer-photo") {
          evidentiary += 1;
          expect(
            item.prompt,
            `${item.slotRef} carries a generation prompt`,
          ).toBeUndefined();
          expect(item.brief.length, item.slotRef).toBeGreaterThan(20);
        } else {
          // The generated half must stay fully specified, or "no prompt"
          // would pass vacuously by breaking generation altogether.
          expect(item.prompt, item.slotRef).toBeTruthy();
        }
      }
    }
    expect(evidentiary, "the suite is not vacuous").toBeGreaterThan(5);
  });

  it("every evidentiary section also gets an ILLUSTRATIVE slot to dress it", () => {
    // Without this the honest fallback is an empty section, which is what
    // the first attempt at this ADR shipped and what Robert rejected: a
    // driveways homepage went from nine sections to six.
    let checked = 0;
    for (const trade of TRADES) {
      const blueprint = blueprintFor(trade);
      const refs = new Set(deriveMediaPlan(blueprint).map((item) => item.slotRef));
      for (const section of sectionsOf(blueprint, "story.transformation-arc")) {
        expect(refs.has(`${baseRefOf(section)}.atmosphere`), trade).toBe(true);
        checked += 1;
      }
      for (const identifier of ["proof.portfolio-showcase", "gallery.immersive-grid"]) {
        for (const section of sectionsOf(blueprint, identifier)) {
          const variant =
            typeof section.extensions?.variant === "string"
              ? section.extensions.variant
              : undefined;
          for (let index = 1; index <= projectFrameCount(identifier, variant); index += 1) {
            expect(
              refs.has(`${baseRefOf(section)}.showcase-${index}`),
              `${trade} · ${identifier} showcase ${index} is drawn but never planned`,
            ).toBe(true);
          }
          checked += 1;
        }
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  it("no prompt instructs a model to invent a completed job", () => {
    // The exact string that used to ship: "Finished project photograph 1 of
    // 3 — a different completed job each frame". The illustrative prompts
    // that replaced it must describe MATERIAL, not provenance.
    for (const trade of TRADES) {
      for (const item of deriveMediaPlan(blueprintFor(trade))) {
        if (item.sourcing !== "generated") continue;
        expect(item.prompt ?? "", item.slotRef).not.toMatch(
          /finished project photograph|completed job|a different completed|before and after/i,
        );
      }
    }
  });

  it("plans exactly as many frames as the layout draws — no unfillable slot", () => {
    // The plan used to declare 3 portfolio frames while the grid drew 4 and
    // the carousel 5. Two frames per site could never be filled by anyone.
    let checked = 0;
    for (const trade of TRADES) {
      const blueprint = blueprintFor(trade);
      const refs = new Set(deriveMediaPlan(blueprint).map((item) => item.slotRef));
      for (const identifier of ["proof.portfolio-showcase", "gallery.immersive-grid"]) {
        for (const section of sectionsOf(blueprint, identifier)) {
          const variant =
            typeof section.extensions?.variant === "string"
              ? section.extensions.variant
              : undefined;
          const expected = projectFrameCount(identifier, variant);
          expect(expected, `${identifier}/${variant}`).toBeGreaterThan(0);
          for (let index = 1; index <= expected; index += 1) {
            expect(
              refs.has(`${baseRefOf(section)}.frame-${index}`),
              `${trade} · ${identifier} (${variant}) frame ${index} is drawn but never planned`,
            ).toBe(true);
          }
          checked += 1;
        }
      }
    }
    expect(checked, "no portfolio or gallery section was exercised").toBeGreaterThan(0);
  });
});

describe("choke point 2 — the generator commissions illustration, refuses evidence", () => {
  it("never sends an evidentiary slot to a provider, and never pays for one", async () => {
    const spine = await resolveBusinessSpine();
    const business = await spine.businesses.create({
      name: `Evidence Law ${crypto.randomUUID().slice(0, 8)}`,
      trade: "Driveways & Paving",
      location: "Manchester",
    });
    const blueprint = blueprintFor("Driveways & Paving");
    const plan = deriveMediaPlan(blueprint);
    const awaited = plan.filter((item) => item.sourcing === "customer-photo");
    expect(awaited.length).toBeGreaterThan(0);

    const asked: string[] = [];
    const generate = vi.fn(async (request: { prompt: string }) => {
      asked.push(request.prompt);
      return {
        url: "https://replicate.delivery/asset.webp",
        format: "webp",
        costUsd: 0.04,
        provider: "replicate",
        model: "flux",
      };
    });
    const saved: string[] = [];
    // A fresh Response per call — one shared instance has its body consumed
    // by the first download and every later slot "fails".
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => new Response(new Uint8Array([1, 2, 3])));
    try {
      const summary = await generateMissingMedia(
        spine,
        { name: "replicate", generate },
        {
          async save(_businessId: string, slotRef: string) {
            saved.push(slotRef);
            return { url: `https://stored/${slotRef}` };
          },
        },
        business,
        blueprint,
      );
      expect(summary.awaitingCustomerPhotos).toBe(awaited.length);
      expect(summary.generated).toBe(plan.length - awaited.length);
      expect(summary.failed).toEqual([]);
      // The illustrative slots WERE commissioned — the section has to look
      // finished on day one, which is the whole point of this design.
      expect(saved.some((slotRef) => slotRef.includes(".showcase-"))).toBe(true);
      expect(saved.some((slotRef) => slotRef.endsWith(".atmosphere"))).toBe(true);
      // Nothing was stored under an evidentiary slot…
      for (const slotRef of saved) {
        expect(isEvidentiarySlot(slotRef), `stored evidence: ${slotRef}`).toBe(false);
      }
      // …and no record exists for one, so the gate cannot approve what was
      // never made.
      const records = await spine.media.listForBusiness(business.id);
      for (const record of records) {
        expect(isEvidentiarySlot(record.slotRef), record.slotRef).toBe(false);
      }
      for (const prompt of asked) {
        expect(prompt).not.toMatch(/finished project photograph|completed job/i);
      }
    } finally {
      fetchSpy.mockRestore();
    }
  });
});

describe("choke point 3 — the page refuses to serve what it cannot substantiate", () => {
  it("a generated asset approved in an evidentiary slot never reaches the page", async () => {
    // The belt-and-braces case: assets commissioned BEFORE this law existed
    // are still sitting approved in the database. They stop at resolution,
    // so no migration is needed and no live site keeps serving them.
    const spine = await resolveBusinessSpine();
    const business = await spine.businesses.create({
      name: `Legacy Assets ${crypto.randomUUID().slice(0, 8)}`,
      trade: "Driveways & Paving",
      location: "Manchester",
    });
    const blueprint = blueprintFor("Driveways & Paving");
    await spine.artifacts.save({
      businessId: business.id,
      kind: "blueprint",
      payload: blueprint,
    });
    const slug = `evidence-${crypto.randomUUID().slice(0, 8)}`;
    await spine.publications.publish(business.id, 1, slug);

    const portfolio = sectionsOf(blueprint, "proof.portfolio-showcase")[0];
    expect(portfolio).toBeDefined();
    const heroSlot = baseRefOf(blueprint.pages.pages[0].sections[0]);
    const frameSlot = `${baseRefOf(portfolio!)}.frame-1`;
    const showcaseSlotRef = `${baseRefOf(portfolio!)}.showcase-1`;

    for (const slotRef of [heroSlot, frameSlot, showcaseSlotRef]) {
      const record = await spine.media.create({
        businessId: business.id,
        slotRef,
        brief: "legacy generated asset",
        modality: "image",
        url: `https://cdn.example.com/${encodeURIComponent(slotRef)}.webp`,
        provenance: {
          provider: "replicate",
          model: "flux",
          prompt: "a different completed job each frame",
          costUsd: 0.04,
          generatedAt: "2026-07-01T09:00:00.000Z",
        },
      });
      await spine.media.setStatus(record.id, "approved");
    }

    const resolved = await resolvePublishedSite({ slug });
    expect(resolved).not.toBeNull();
    // Atmosphere and illustration still serve.
    expect(resolved!.media[heroSlot]).toBeDefined();
    expect(resolved!.media[showcaseSlotRef]).toBeDefined();
    // Evidence does not, despite being approved.
    expect(resolved!.media[frameSlot]).toBeUndefined();
  });

  it("the customer's OWN photograph in the same slot serves normally", async () => {
    const spine = await resolveBusinessSpine();
    const business = await spine.businesses.create({
      name: `Real Photos ${crypto.randomUUID().slice(0, 8)}`,
      trade: "Driveways & Paving",
      location: "Manchester",
    });
    const blueprint = blueprintFor("Driveways & Paving");
    await spine.artifacts.save({
      businessId: business.id,
      kind: "blueprint",
      payload: blueprint,
    });
    const slug = `evidence-real-${crypto.randomUUID().slice(0, 8)}`;
    await spine.publications.publish(business.id, 1, slug);

    const frameSlot = `${baseRefOf(sectionsOf(blueprint, "proof.portfolio-showcase")[0]!)}.frame-1`;
    const record = await spine.media.create({
      businessId: business.id,
      slotRef: frameSlot,
      brief: "The Hendersons' drive, finished",
      modality: "image",
      url: "https://cdn.example.com/real-drive.webp",
      provenance: {
        provider: "customer-upload",
        model: "original-photograph",
        prompt: "Uploaded by the founder from the business's own photos",
        costUsd: 0,
        generatedAt: "2026-07-20T09:00:00.000Z",
      },
    });
    await spine.media.setStatus(record.id, "approved");

    const resolved = await resolvePublishedSite({ slug });
    expect(resolved!.media[frameSlot]?.url).toBe("https://cdn.example.com/real-drive.webp");
  });
});

describe("the illustrative voice — full-strength imagery, no provenance claim", () => {
  it("a site with only generated imagery still renders every section", () => {
    // The failure this guards is the one that made Robert stop the first
    // version: sections silently disappearing and a new site launching thin.
    let exercised = 0;
    for (const trade of TRADES) {
      const blueprint = blueprintFor(trade);
      const media = generatedMediaFor(blueprint);
      const html = renderToStaticMarkup(
        renderPage(blueprint, { mode: "public", media }),
      );
      for (const identifier of [
        "story.transformation-arc",
        "proof.portfolio-showcase",
        "gallery.immersive-grid",
      ]) {
        if (sectionsOf(blueprint, identifier).length === 0) continue;
        exercised += 1;
        expect(
          html,
          `${trade} lost ${identifier} despite having illustrative imagery`,
        ).toContain(`data-primitive="${identifier}"`);
      }
    }
    expect(exercised, "no evidentiary section was exercised").toBeGreaterThan(0);
  });

  it("and claims nothing about who did the work", () => {
    for (const trade of TRADES) {
      const blueprint = blueprintFor(trade);
      const media = generatedMediaFor(blueprint);
      for (const page of blueprint.pages.pages) {
        const html = renderToStaticMarkup(
          renderPage(blueprint, { mode: "public", pageId: page.id, media }),
        );
        for (const claim of PROVENANCE_CLAIMS) {
          expect(
            html,
            `${trade} · ${page.id} claimed "${claim}" over generated imagery`,
          ).not.toContain(claim);
        }
      }
    }
  });

  it("names a material in its alt text, never a job", () => {
    const blueprint = blueprintFor("Driveways & Paving");
    const html = renderToStaticMarkup(
      renderPage(blueprint, { mode: "public", media: generatedMediaFor(blueprint) }),
    );
    expect(html).toContain("driveways &amp; paving finish — detail 1");
    expect(html).not.toMatch(/alt="[^"]*completed/i);
  });

  it("the arc keeps its place without faking a comparison", () => {
    const blueprint = blueprintFor("Driveways & Paving");
    const html = renderToStaticMarkup(
      renderPage(blueprint, { mode: "public", media: generatedMediaFor(blueprint) }),
    );
    expect(html).toContain('data-primitive="story.transformation-arc"');
    // The slider — the part that IS the claim — is absent.
    expect(html).not.toContain("Compare before and after");
    expect(html).not.toContain('type="range"');
  });
});

describe("the evidence voice — earned by real photographs", () => {
  it("customer photographs flip the section, and only those frames show", () => {
    const blueprint = blueprintFor("Solar PV");
    const portfolio = sectionsOf(blueprint, "proof.portfolio-showcase")[0]!;
    const baseRef = baseRefOf(portfolio);
    // Two of the four supplied — a realistic first upload.
    const html = renderToStaticMarkup(
      renderPage(blueprint, {
        mode: "public",
        media: {
          ...generatedMediaFor(blueprint),
          [`${baseRef}.frame-1`]: PHOTO,
          [`${baseRef}.frame-3`]: PHOTO,
        },
      }),
    );
    expect(html).toContain('data-primitive="proof.portfolio-showcase"');
    // The claim is now made, and now true.
    expect(html).toContain("Our recent work");
    // Exactly the two real photographs — never padded out with the
    // illustrative ones, which would put generated imagery under a
    // provenance heading. That is the whole defect, in miniature.
    expect(html.match(/A completed job — photograph \d/g) ?? []).toHaveLength(2);
    expect(html).not.toContain("finish — detail");
  });

  it("half a before/after pair is not a pair", () => {
    const blueprint = blueprintFor("Driveways & Paving");
    const arc = sectionsOf(blueprint, "story.transformation-arc")[0]!;
    const baseRef = baseRefOf(arc);
    const generated = generatedMediaFor(blueprint);

    const onlyBefore = renderToStaticMarkup(
      renderPage(blueprint, {
        mode: "public",
        media: { ...generated, [`${baseRef}.before`]: PHOTO },
      }),
    );
    expect(onlyBefore).not.toContain("Compare before and after");

    const bothHalves = renderToStaticMarkup(
      renderPage(blueprint, {
        mode: "public",
        media: {
          ...generated,
          [`${baseRef}.before`]: PHOTO,
          [`${baseRef}.after`]: PHOTO,
        },
      }),
    );
    expect(bothHalves).toContain('data-primitive="story.transformation-arc"');
    expect(bothHalves).toContain("Compare before and after");
  });
});

describe("the founder's preview keeps its scaffolding", () => {
  it("shot list, annotations and primitive names all survive (ADR-034)", () => {
    // Collapsing or relabelling in public must not delete the brief the
    // founder works from — that brief is how the photographs get collected.
    const blueprint = blueprintFor("Driveways & Paving");
    const html = renderToStaticMarkup(renderPage(blueprint, { mode: "preview" }));
    expect(html).toContain('data-primitive="story.transformation-arc"');
    expect(html).toContain('data-primitive="proof.portfolio-showcase"');
    expect(html).toContain("before · customer photo");
    expect(html).toContain("after · customer photo");
    expect(html).toContain("customer photo");
    // Preview still labels sections by primitive, for the founder.
    expect(html).toContain("Portfolio Showcase");
  });
});
