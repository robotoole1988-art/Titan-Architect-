import { describe, expect, it } from "vitest";
import {
  classifyGpuTier,
  preferWebGpu,
  resolveParticleMaterial,
} from "@/features/website-renderer";

/**
 * The WebGL 3D FOUNDATION that outlived the real-time particle morph
 * (ADR-041 retired the morph; ADR-035/ADR-038 superseded). Two reusable,
 * renderer-agnostic pieces remain and stay under test: device-capability
 * tiering and the trade-keyed PBR material registry. Pure — no GPU needed.
 */

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

describe("device tiering (WebGPU detection retained for future 3D)", () => {
  it("routes capable desktops to full 3D", () => {
    expect(
      classifyGpuTier({ webgl2: true, deviceMemoryGb: 16, cores: 10, isMobile: false, reducedMotion: false }),
    ).toBe("full-3d");
  });

  it("routes constrained devices to the 2D fallback", () => {
    expect(
      classifyGpuTier({ webgl2: true, deviceMemoryGb: 2, cores: 4, isMobile: true, reducedMotion: false }),
    ).toBe("fallback-2d");
  });

  it("no WebGL2 → designed still; reduced motion ALWAYS wins", () => {
    expect(
      classifyGpuTier({ webgl2: false, deviceMemoryGb: 16, cores: 10, isMobile: false, reducedMotion: false }),
    ).toBe("still");
    expect(
      classifyGpuTier({ webgl2: true, deviceMemoryGb: 16, cores: 10, isMobile: false, reducedMotion: true }),
    ).toBe("still");
  });

  it("WebGPU is preferred only on the full-3D tier WITH an adapter present", () => {
    expect(preferWebGpu("full-3d", true)).toBe(true);
    expect(preferWebGpu("full-3d", false)).toBe(false);
    expect(preferWebGpu("fallback-2d", true)).toBe(false);
    expect(preferWebGpu("still", true)).toBe(false);
  });
});

describe("the trade-keyed PBR material registry", () => {
  it("slate is dark, metallic, with a near-black emissive (no blue confetti)", () => {
    const slate = resolveParticleMaterial("roofing");
    expect(slate.key).toBe("slate");
    expect(slate.metalness).toBeGreaterThan(0.4);
    // Base albedo is dark — this is what the eye reads.
    const albedo = hexToRgb(slate.color);
    expect(Math.max(albedo.r, albedo.g, albedo.b)).toBeLessThan(110);
    // The emissive is a whisper of heat, never a bright blue cast.
    const glow = hexToRgb(slate.emissive);
    expect(Math.max(glow.r, glow.g, glow.b)).toBeLessThan(80);
  });

  it("keys the material off the trade (slate is the default)", () => {
    expect(resolveParticleMaterial("Roofing & guttering").key).toBe("slate");
    expect(resolveParticleMaterial("Resin driveways").key).toBe("resin");
    expect(resolveParticleMaterial("Patios & paving").key).toBe("stone");
    // Unclassified trades fall back to slate.
    expect(resolveParticleMaterial().key).toBe("slate");
    expect(resolveParticleMaterial("something new").key).toBe("slate");
  });
});
