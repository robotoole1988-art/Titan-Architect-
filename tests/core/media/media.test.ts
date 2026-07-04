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
