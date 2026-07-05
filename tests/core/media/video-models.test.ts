import { describe, expect, it, vi } from "vitest";
import {
  VIDEO_MODELS,
  createCompositeProvider,
  createFalProvider,
  estimateGenerationCostUsd,
  videoModelCostUsd,
  type MediaGenerationProvider,
} from "@/core/media";

/**
 * Video Engine — 4K film + morph-as-film (ADR-039). Kling 3.0 native-4K
 * (text-to-video) and Kling O1 dual-keyframe (start→end frame) through the
 * swappable provider seam. fal.ai queue REST, cost logged per render.
 */

describe("the video-model registry", () => {
  it("offers standard, native-4K, and the keyframe morph", () => {
    expect(Object.keys(VIDEO_MODELS).sort()).toEqual(["hero-4k", "morph", "standard"]);
    expect(VIDEO_MODELS["hero-4k"].backend).toBe("fal");
    expect(VIDEO_MODELS["hero-4k"].kind).toBe("text-to-video");
    expect(VIDEO_MODELS["hero-4k"].falEndpoint).toContain("v3/4k");
    expect(VIDEO_MODELS.morph.backend).toBe("fal");
    expect(VIDEO_MODELS.morph.kind).toBe("first-last-frame");
    expect(VIDEO_MODELS.morph.falEndpoint).toContain("o1");
    expect(VIDEO_MODELS.standard.backend).toBe("replicate");
  });

  it("prices per render — 4K by the second, standard flat", () => {
    // Kling v3 4K: $0.42/s → 5s = $2.10, 10s = $4.20.
    expect(videoModelCostUsd("hero-4k", 5)).toBeCloseTo(2.1, 2);
    expect(videoModelCostUsd("hero-4k", 10)).toBeCloseTo(4.2, 2);
    // Kling O1 keyframes: $0.112/s → 5s = $0.56.
    expect(videoModelCostUsd("morph", 5)).toBeCloseTo(0.56, 2);
    // Standard stays the flat ADR-036 rate whatever the (short) duration.
    expect(videoModelCostUsd("standard", 5)).toBeCloseTo(0.28, 2);
    // 4K costs far more than standard — the quality-ceiling test is not cheap.
    expect(videoModelCostUsd("hero-4k", 5)).toBeGreaterThan(videoModelCostUsd("standard", 5));
  });

  it("estimateGenerationCostUsd honours the chosen video model", () => {
    expect(estimateGenerationCostUsd("video", { videoModel: "hero-4k", durationSeconds: 5 })).toBeCloseTo(2.1, 2);
    expect(estimateGenerationCostUsd("video")).toBeCloseTo(0.28, 2); // default standard
    expect(estimateGenerationCostUsd("image")).toBeGreaterThan(0);
  });
});

describe("the fal.ai adapter (ADR-039) — queue submit → poll → result", () => {
  function mockFal(output: unknown) {
    const calls: Array<{ method: string; url: string; body?: string; headers: Record<string, string> }> = [];
    const transport = vi.fn(
      async (url: string, init: { method: string; headers: Record<string, string>; body: string }) => {
        calls.push({ method: init.method, url, headers: init.headers, body: init.body });
        if (init.method === "POST") {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              request_id: "req-1",
              status_url: "https://queue.fal.run/x/requests/req-1/status",
              response_url: "https://queue.fal.run/x/requests/req-1",
            }),
          };
        }
        const gets = calls.filter((c) => c.method === "GET").length;
        if (url.endsWith("/status")) {
          return {
            ok: true,
            status: 200,
            json: async () => (gets < 2 ? { status: "IN_PROGRESS" } : { status: "COMPLETED" }),
          };
        }
        return { ok: true, status: 200, json: async () => output };
      },
    );
    return { transport, calls };
  }

  it("commissions a native-4K hero film (text-to-video, duration as a string)", async () => {
    const { transport, calls } = mockFal({ video: { url: "https://fal.media/hero-4k.mp4" } });
    const provider = createFalProvider({ key: "fal_test", transport, sleep: async () => {} });
    const result = await provider.generate({
      modality: "video",
      videoModel: "hero-4k",
      prompt: "a slow aerial drift over rain-soaked UK rooftops",
      durationSeconds: 5,
    });
    expect(result.url).toBe("https://fal.media/hero-4k.mp4");
    expect(result.format).toBe("mp4");
    expect(result.provider).toBe("fal");
    expect(result.model).toContain("v3/4k");
    expect(result.costUsd).toBeCloseTo(2.1, 2);

    const post = calls.find((c) => c.method === "POST")!;
    expect(post.url).toContain("queue.fal.run");
    expect(post.url).toContain("kling-video/v3/4k/text-to-video");
    expect(post.headers.Authorization).toBe("Key fal_test");
    const input = JSON.parse(post.body!);
    expect(input.prompt).toContain("rooftops");
    expect(input.duration).toBe("5"); // fal wants an enum string, not a number
    expect(String(input.negative_prompt)).toMatch(/people|face|text/i);
    // Polled the queue to completion before fetching the result.
    expect(calls.some((c) => c.method === "GET" && c.url.endsWith("/status"))).toBe(true);
  });

  it("commissions an O1 morph film from a start→end keyframe pair", async () => {
    const { transport, calls } = mockFal({ video: { url: "https://fal.media/morph.mp4" } });
    const provider = createFalProvider({ key: "fal_test", transport, sleep: async () => {} });
    const result = await provider.generate({
      modality: "video",
      videoModel: "morph",
      prompt: "the storm @Image1 becomes the finished slate roof @Image2",
      startImageUrl: "https://cdn/storm.webp",
      endImageUrl: "https://cdn/roof.webp",
      durationSeconds: 5,
    });
    expect(result.url).toBe("https://fal.media/morph.mp4");
    expect(result.model).toContain("o1");
    expect(result.costUsd).toBeCloseTo(0.56, 2);

    const input = JSON.parse(calls.find((c) => c.method === "POST")!.body!);
    expect(input.start_image_url).toBe("https://cdn/storm.webp");
    expect(input.end_image_url).toBe("https://cdn/roof.webp");
    expect(input.prompt).toContain("@Image1");
  });

  it("a morph film REQUIRES a start frame", async () => {
    const { transport } = mockFal({ video: { url: "x" } });
    const provider = createFalProvider({ key: "fal_test", transport, sleep: async () => {} });
    await expect(
      provider.generate({ modality: "video", videoModel: "morph", prompt: "x", durationSeconds: 5 }),
    ).rejects.toThrow(/start.*frame|start_image/i);
  });

  it("throws on a failed queue job — never silent", async () => {
    const transport = vi.fn(async (url: string, init: { method: string }) => {
      if (init.method === "POST") {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            request_id: "r",
            status_url: "https://queue.fal.run/x/requests/r/status",
            response_url: "https://queue.fal.run/x/requests/r",
          }),
        };
      }
      return { ok: true, status: 200, json: async () => ({ status: "COMPLETED", error: "content flagged" }) };
    });
    // Result endpoint returns an error payload (no video) → throw.
    const provider = createFalProvider({
      key: "fal_test",
      transport: async (url, init) => {
        if (init.method === "GET" && !url.endsWith("/status")) {
          return { ok: true, status: 200, json: async () => ({ detail: "content flagged" }) };
        }
        return transport(url, init);
      },
      sleep: async () => {},
    });
    await expect(
      provider.generate({ modality: "video", videoModel: "hero-4k", prompt: "x", durationSeconds: 5 }),
    ).rejects.toThrow(/fail|error|no output|content flagged/i);
  });
});

describe("the composite provider — one seam, routed by modality + model", () => {
  function stub(name: string): { provider: MediaGenerationProvider; fn: ReturnType<typeof vi.fn> } {
    const fn = vi.fn(async () => ({
      url: `https://${name}/out.mp4`,
      format: "mp4",
      costUsd: 1,
      provider: name,
      model: name,
    }));
    return { provider: { name, generate: fn }, fn };
  }

  it("routes images + standard video to replicate, 4K + morph to fal", async () => {
    const replicate = stub("replicate");
    const fal = stub("fal");
    const composite = createCompositeProvider({ replicate: replicate.provider, fal: fal.provider });

    await composite.generate({ modality: "image", prompt: "p" });
    await composite.generate({ modality: "video", prompt: "p", durationSeconds: 5 }); // standard default
    await composite.generate({ modality: "video", videoModel: "hero-4k", prompt: "p", durationSeconds: 5 });
    await composite.generate({
      modality: "video",
      videoModel: "morph",
      prompt: "p",
      startImageUrl: "s",
      durationSeconds: 5,
    });

    expect(replicate.fn).toHaveBeenCalledTimes(2); // image + standard
    expect(fal.fn).toHaveBeenCalledTimes(2); // 4K + morph
  });

  it("asks for the missing key when the required backend is absent", async () => {
    const replicate = stub("replicate");
    const composite = createCompositeProvider({ replicate: replicate.provider, fal: null });
    await expect(
      composite.generate({ modality: "video", videoModel: "hero-4k", prompt: "p", durationSeconds: 5 }),
    ).rejects.toThrow(/FAL_KEY/i);
  });
});
