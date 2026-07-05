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

  it("knows its per-image cost for telemetry", () => {
    expect(estimateGenerationCostUsd("image")).toBeGreaterThan(0);
  });
});

describe("the Replicate VIDEO adapter (ADR-036) — create + poll", () => {
  it("creates a video prediction and polls it to completion", async () => {
    const calls: Array<{ method: string; url: string; body?: string }> = [];
    const transport = vi.fn(async (url: string, init: { method: string; body?: string }) => {
      calls.push({ method: init.method, url, body: init.body });
      if (init.method === "POST") {
        return {
          ok: true,
          status: 201,
          json: async () => ({
            id: "vid-1",
            status: "processing",
            urls: { get: "https://api.replicate.com/v1/predictions/vid-1" },
          }),
        };
      }
      // GET poll: processing twice, then succeeded.
      const polls = calls.filter((c) => c.method === "GET").length;
      return {
        ok: true,
        status: 200,
        json: async () =>
          polls < 2
            ? { status: "processing" }
            : { status: "succeeded", output: "https://replicate.delivery/clip.mp4" },
      };
    });
    const provider = createReplicateProvider({
      token: "r8_test",
      transport,
      sleep: async () => {}, // no real waiting in tests
    });
    const result = await provider.generate({
      modality: "video",
      prompt: "a slow cinematic drone drift over UK rooftops",
      durationSeconds: 5,
    });
    expect(result.url).toBe("https://replicate.delivery/clip.mp4");
    expect(result.format).toBe("mp4");
    expect(result.costUsd).toBeGreaterThan(0);
    expect(result.provider).toBe("replicate");

    const post = calls.find((c) => c.method === "POST")!;
    expect(post.url).toContain("kling"); // the chosen video model, not Flux
    const body = JSON.parse(post.body!);
    expect(body.input.prompt).toContain("drone drift");
    expect(body.input.duration).toBe(5);
    // The no-people / no-text law rides the negative prompt too.
    expect(String(body.input.negative_prompt)).toMatch(/people|face|text/i);
    expect(calls.filter((c) => c.method === "GET").length).toBeGreaterThanOrEqual(2);
  });

  it("throws on a failed prediction — never silent", async () => {
    const transport = vi.fn(async (_url: string, init: { method: string }) =>
      init.method === "POST"
        ? {
            ok: true,
            status: 201,
            json: async () => ({
              id: "v",
              status: "processing",
              urls: { get: "https://api.replicate.com/v1/predictions/v" },
            }),
          }
        : { ok: true, status: 200, json: async () => ({ status: "failed", error: "content flagged" }) },
    );
    const provider = createReplicateProvider({ token: "r8_test", transport, sleep: async () => {} });
    await expect(
      provider.generate({ modality: "video", prompt: "x", durationSeconds: 5 }),
    ).rejects.toThrow(/fail|content flagged/i);
  });

  it("video costs more than image (per-modality telemetry)", () => {
    expect(estimateGenerationCostUsd("video")).toBeGreaterThan(
      estimateGenerationCostUsd("image"),
    );
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

describe("commissionFilm — hero ambience through the founder gate (ADR-036)", () => {
  it("generates a take born in review, poster = the approved hero photo", async () => {
    const { commissionFilm } = await import("@/core/media");
    const { createMemoryBusinessSpine } = await import("@/core/business");
    const spine = createMemoryBusinessSpine();
    const business = await spine.businesses.create({
      name: "Summit Roofing Rescue",
      trade: "Emergency Roofing & Drainage",
      location: "Leeds",
    });
    const heroSlot = "media/home.01.hero.rapid-response";
    // An approved hero photo already exists — it becomes the film's poster.
    const hero = await spine.media.create({
      businessId: business.id,
      slotRef: heroSlot,
      brief: "hero",
      modality: "image",
      url: "https://cdn/hero.webp",
      lqip: "data:image/webp;base64,AAAA",
      provenance: {
        provider: "replicate",
        model: "flux",
        prompt: "p",
        costUsd: 0.04,
        generatedAt: new Date().toISOString(),
      },
    });
    await spine.media.setStatus(hero.id, "approved");

    const provider = {
      name: "replicate",
      generate: vi.fn().mockResolvedValue({
        url: "https://replicate.delivery/storm.mp4",
        format: "mp4",
        costUsd: 0.25,
        provider: "replicate",
        model: "kwaivgi/kling-v2.1",
      }),
    };
    const saved: Array<{ slotRef: string; format: string }> = [];
    const storage = {
      async save(_b: string, slotRef: string, _bytes: Uint8Array, format: string) {
        saved.push({ slotRef, format });
        return { url: `https://stored/${slotRef}.${format}` };
      },
    };
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => new Response(new Uint8Array([1, 2, 3])));
    try {
      const take1 = await commissionFilm(spine, provider, storage, business, {
        heroSlotRef: heroSlot,
        brief: "a slow aerial drift over rain-soaked UK rooftops under a storm sky",
      });
      expect(take1.slotRef).toBe(`${heroSlot}.film`);
      // Provider got a film prompt carrying the authenticity law.
      const req = provider.generate.mock.calls[0][0];
      expect(req.modality).toBe("video");
      expect(req.durationSeconds).toBe(5);
      expect(req.prompt).toMatch(/UK housing stock/i);
      expect(req.prompt).toMatch(/aerial drift|rooftops/i);

      const filmRecords = (await spine.media.listForBusiness(business.id)).filter(
        (r) => r.slotRef === `${heroSlot}.film`,
      );
      expect(filmRecords).toHaveLength(1);
      const film = filmRecords[0];
      expect(film.status).toBe("review"); // NEVER self-approved
      expect(film.modality).toBe("video");
      expect(film.durationSeconds).toBe(5);
      expect(film.posterUrl).toBe("https://cdn/hero.webp"); // the approved hero
      expect(film.lqip).toBe("data:image/webp;base64,AAAA"); // reuses poster lqip

      // A SECOND take (different direction) lands at its own object.
      await commissionFilm(spine, provider, storage, business, {
        heroSlotRef: heroSlot,
        brief: "storm clouds breaking, warm light sweeping across slate",
      });
      expect(saved.map((s) => s.slotRef)).toEqual([
        `${heroSlot}.film`,
        `${heroSlot}.film.take-2`,
      ]);
      expect(saved.every((s) => s.format === "mp4")).toBe(true);
      // Two takes, both in review — the founder picks one.
      const both = (await spine.media.listForBusiness(business.id)).filter(
        (r) => r.slotRef === `${heroSlot}.film`,
      );
      expect(both).toHaveLength(2);
      expect(both.every((r) => r.status === "review")).toBe(true);
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
    // Every item carries a brief and dimensions:
    for (const item of plan) {
      expect(item.brief.length, item.slotRef).toBeGreaterThan(10);
      expect(item.modality === "image" || item.modality === "video").toBe(true);
      expect(item.width).toBeGreaterThan(0);
    }
  });

  it("pairs share a seed for provider coherence", () => {
    const before = plan.find((item) => item.slotRef.endsWith(".before"));
    const after = plan.find((item) => item.slotRef.endsWith(".after"));
    expect(before?.pairSeed).toBeDefined();
    expect(before?.pairSeed).toBe(after?.pairSeed);
  });

  it("adds ONE homepage-hero FILM slot mapping the strategy's media direction (ADR-036)", () => {
    const films = plan.filter((item) => item.modality === "video");
    expect(films).toHaveLength(1); // one ambience clip per site — hero only
    const film = films[0];
    expect(film.slotRef).toMatch(/\.film$/);
    expect(film.slotRef).toMatch(/home/); // homepage, not an area page
    expect(film.durationSeconds).toBeGreaterThanOrEqual(5);
    expect(film.durationSeconds).toBeLessThanOrEqual(10);
    // The authenticity law still applies to film prompts.
    expect(film.prompt).toMatch(/UK housing stock/i);
    expect(film.prompt).toMatch(/no people|no faces/i);
    // It reads as a cinematic film brief, not a still.
    expect(film.prompt).toMatch(/cinematic|film|footage|drone|aerial|slow|drift|tracking/i);
  });
});
