import { describe, expect, it } from "vitest";
import { resolveTradePitch } from "@/core/pitch-intelligence";

describe("pitch intelligence", () => {
  it("serves rich roofing intelligence", () => {
    const pitch = resolveTradePitch("Emergency Roofing & Drainage");
    expect(pitch.matched).toBe("roofing");
    expect(pitch.talkingPoints.length).toBeGreaterThanOrEqual(4);
    expect(pitch.painPoints.length).toBeGreaterThanOrEqual(3);
    expect(pitch.objections.length).toBeGreaterThanOrEqual(3);
    expect(pitch.averageJobValues.length).toBeGreaterThanOrEqual(3);
    expect(JSON.stringify(pitch.averageJobValues)).toMatch(/roof/i);
  });

  it("serves rich driveway intelligence", () => {
    const pitch = resolveTradePitch("Driveways & Patios");
    expect(pitch.matched).toBe("driveways");
    expect(JSON.stringify(pitch.averageJobValues)).toMatch(/resin|block/i);
  });

  it("serves rich plumbing & heating intelligence", () => {
    const pitch = resolveTradePitch("Plumbing and Heating");
    expect(pitch.matched).toBe("plumbing-heating");
    expect(JSON.stringify(pitch.averageJobValues)).toMatch(/boiler/i);
  });

  it("falls back to sensible defaults for any other trade", () => {
    const pitch = resolveTradePitch("Wedding Photography");
    expect(pitch.matched).toBe("general");
    expect(pitch.talkingPoints.length).toBeGreaterThanOrEqual(3);
    expect(pitch.painPoints.length).toBeGreaterThanOrEqual(3);
    expect(pitch.objections.length).toBeGreaterThanOrEqual(3);
    expect(pitch.averageJobValues.length).toBeGreaterThanOrEqual(1);
  });

  it("is deterministic", () => {
    expect(resolveTradePitch("Roofer")).toEqual(resolveTradePitch("Roofer"));
  });
});
