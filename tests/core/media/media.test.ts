import { describe, expect, it, vi } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import { buildWebsiteBlueprint } from "@/core/website-blueprint";
import {
  buildMediaPrompt,
  buildPairPrompts,
  createReplicateProvider,
  deriveMediaPlan,
  estimateGenerationCostUsd,
} from "@/core/media";

/** The media pipeline core (ADR-033). */

describe("buildMediaPrompt — UK authenticity is LAW, not discipline", () => {
  const prompt = buildMediaPrompt(
    "A cinematic reveal of a stunning finished driveway",
    { trade: "Driveways & Paving", location: "Manchester" },
  );

  it("carries the brief and the locale", () => {
    expect(prompt).toContain("finished driveway");
    expect(prompt).toContain("Manchester");
  });

  it("ALWAYS appends the authenticity clauses", () => {
    expect(prompt).toMatch(/UK housing stock/i);
    expect(prompt).toMatch(/weather-true|british light/i);
    expect(prompt).toMatch(/photorealistic/i);
  });

  it("ALWAYS forbids faces, text and logos", () => {
    expect(prompt).toMatch(/no people|no faces|without people/i);
    expect(prompt).toMatch(/no text|no signage|no logos/i);
  });
});

describe("buildPairPrompts — before/after coherence", () => {
  const pair = buildPairPrompts(
    "Before/after of a driveway transformation",
    { trade: "Driveways & Paving", location: "Sale" },
  );

  it("shares one property and one camera angle across both prompts", () => {
    expect(pair.before).toMatch(/same property/i);
    expect(pair.after).toMatch(/same property/i);
    expect(pair.before).toMatch(/same camera angle/i);
    expect(pair.after).toMatch(/same camera angle/i);
    // One seed → the provider renders a coherent pair.
    expect(pair.seed).toBeTypeOf("number");
  });

  it("differs only in state: worn vs finished", () => {
    expect(pair.before).toMatch(/worn|tired|cracked|weathered|before/i);
    expect(pair.after).toMatch(/newly|finished|pristine|completed|after/i);
  });
});

describe("the Replicate adapter (image, seam ready for video)", () => {
  it("posts the prompt and returns the asset + cost", async () => {
    const transport = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: "pred-1", status: "succeeded", output: "https://replicate.delivery/x.webp" }),
    });
    const provider = createReplicateProvider({ token: "r8_test", transport });
    const result = await provider.generate({
      modality: "image",
      prompt: "test prompt",
      width: 1344,
      height: 768,
    });
    expect(result.url).toBe("https://replicate.delivery/x.webp");
    expect(result.costUsd).toBeGreaterThan(0);
    expect(result.provider).toBe("replicate");
    const [url, init] = transport.mock.calls[0];
    expect(url).toContain("api.replicate.com");
    expect(init.headers.Authorization).toContain("r8_test");
    expect(JSON.parse(init.body).input.prompt).toBe("test prompt");
  });

  it("rejects unsupported modalities loudly (video adapter is the NEXT milestone)", async () => {
    const provider = createReplicateProvider({ token: "r8_test", transport: vi.fn() });
    await expect(
      provider.generate({ modality: "video", prompt: "x", durationSeconds: 4 }),
    ).rejects.toThrow(/video/i);
  });

  it("knows its per-image cost for telemetry", () => {
    expect(estimateGenerationCostUsd("image")).toBeGreaterThan(0);
  });
});

describe("generateMissingMedia — rejection reopens the slot", () => {
  it("regenerates a slot whose only record is rejected; live slots stay skipped", async () => {
    const { generateMissingMedia } = await import("@/core/media");
    const { createMemoryBusinessSpine } = await import("@/core/business");
    const spine = createMemoryBusinessSpine();
    const business = await spine.businesses.create({
      name: "Kerbside Kings",
      trade: "Driveways & Paving",
      location: "Manchester",
    });
    const blueprint = buildWebsiteBlueprint({
      strategy: generateExperienceStrategy({
        businessName: business.name,
        trade: business.trade,
        location: business.location,
      }),
    });
    const plan = deriveMediaPlan(blueprint);
    const heroSlot = plan.find((item) => item.slotRef.includes("hero"))!.slotRef;
    // Cover EVERY slot; then reject only the hero.
    for (const item of plan) {
      const record = await spine.media.create({
        businessId: business.id,
        slotRef: item.slotRef,
        brief: item.brief,
        modality: "image",
        url: `https://example.com/${item.slotRef}.webp`,
        provenance: {
          provider: "replicate",
          model: "test",
          prompt: item.prompt,
          costUsd: 0.04,
          generatedAt: new Date().toISOString(),
        },
      });
      await spine.media.setStatus(
        record.id,
        item.slotRef === heroSlot ? "rejected" : "approved",
      );
    }

    const generate = vi.fn().mockResolvedValue({
      url: "https://replicate.delivery/take2.webp",
      format: "webp",
      costUsd: 0.04,
      provider: "replicate",
      model: "test",
    });
    const savedPaths: string[] = [];
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(new Uint8Array([1, 2, 3])));
    try {
      const summary = await generateMissingMedia(
        spine,
        { name: "replicate", generate },
        {
          async save(_businessId, slotRef) {
            savedPaths.push(slotRef);
            return { url: `https://stored/${slotRef}` };
          },
        },
        business,
        blueprint,
      );
      expect(summary.generated).toBe(1); // ONLY the rejected hero slot
      expect(summary.skipped).toBe(plan.length - 1);
      // The retake gets its own stored object — the gate keeps history.
      expect(savedPaths).toEqual([`${heroSlot}.take-2`]);
      // Born in review — the founder gate applies to retakes too.
      const heroRecords = (await spine.media.listForBusiness(business.id)).filter(
        (record) => record.slotRef === heroSlot,
      );
      expect(heroRecords.map((r) => r.status).sort()).toEqual(["rejected", "review"]);
    } finally {
      fetchSpy.mockRestore();
    }
  });
});

describe("createLqip — instant blurred previews, never flat gradients", () => {
  it("produces a tiny base64 data URI from image bytes", async () => {
    const sharp = (await import("sharp")).default;
    const bytes = await sharp({
      create: { width: 64, height: 40, channels: 3, background: { r: 180, g: 140, b: 90 } },
    })
      .webp()
      .toBuffer();
    const { createLqip } = await import("@/core/media");
    const lqip = await createLqip(bytes);
    expect(lqip).toMatch(/^data:image\/webp;base64,/);
    // Micro-preview: small enough to inline on every record.
    expect(lqip!.length).toBeLessThan(2000);
  });

  it("returns undefined rather than throwing on garbage bytes", async () => {
    const { createLqip } = await import("@/core/media");
    await expect(createLqip(Buffer.from("not an image"))).resolves.toBeUndefined();
  });
});

describe("deriveMediaPlan — every empty frame accounted for", () => {
  const blueprint = buildWebsiteBlueprint({
    strategy: generateExperienceStrategy({
      businessName: "Kerbside Kings",
      trade: "Driveways & Paving",
      location: "Manchester",
    }),
    coverageAreas: ["Sale", "Stockport"],
  });
  const plan = deriveMediaPlan(blueprint);

  it("is deterministic and covers hero, pairs, frames, surfaces and area pages", () => {
    expect(JSON.stringify(deriveMediaPlan(blueprint))).toBe(JSON.stringify(plan));
    const refs = plan.map((item) => item.slotRef);
    expect(new Set(refs).size).toBe(refs.length); // no duplicate slots
    // Homepage hero backdrop:
    expect(refs.some((ref) => ref.includes("hero.cinematic-reveal"))).toBe(true);
    // A coherent before/after PAIR:
    expect(refs.some((ref) => ref.endsWith(".before"))).toBe(true);
    expect(refs.some((ref) => ref.endsWith(".after"))).toBe(true);
    // Portfolio frames + surface textures + area pages:
    expect(refs.some((ref) => ref.includes(".frame-"))).toBe(true);
    expect(refs.some((ref) => ref.startsWith("surfaces/"))).toBe(true);
    expect(refs.some((ref) => ref.includes("/sale") || ref.includes("area"))).toBe(true);
    // Every item carries a brief and image dimensions:
    for (const item of plan) {
      expect(item.brief.length, item.slotRef).toBeGreaterThan(10);
      expect(item.modality).toBe("image");
      expect(item.width).toBeGreaterThan(0);
    }
  });

  it("pairs share a seed for provider coherence", () => {
    const before = plan.find((item) => item.slotRef.endsWith(".before"));
    const after = plan.find((item) => item.slotRef.endsWith(".after"));
    expect(before?.pairSeed).toBeDefined();
    expect(before?.pairSeed).toBe(after?.pairSeed);
  });
});
