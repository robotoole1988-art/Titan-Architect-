import { describe, expect, it } from "vitest";
import {
  buildRenovation,
  buildRenovationField,
  renovationLight,
  renovationParams,
  renovationState,
} from "@/features/website-renderer";

/**
 * The Renovation morph (ADR-040): a tired house particle-reassembles into a
 * renovated one. Two forms per particle — oldHome and newHome — over the same
 * five-beat Morph Law. Pure and deterministic; one story, every renderer.
 */

const params = renovationParams({ intensity: "dramatic" });
const particles = buildRenovation(params);

function dist(a: readonly number[], b: readonly number[]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

describe("the renovation field — the whole house, two forms", () => {
  it("covers roof, walls and chimney by the region mix", () => {
    const roof = particles.filter((p) => p.region === "roof").length;
    const wall = particles.filter((p) => p.region === "wall").length;
    const chimney = particles.filter((p) => p.region === "chimney").length;
    expect(roof + wall + chimney).toBe(particles.length);
    // Roof is the largest region; the chimney is the smallest.
    expect(roof).toBeGreaterThan(wall);
    expect(wall).toBeGreaterThan(chimney);
    expect(chimney).toBeGreaterThan(0);
  });

  it("gives every particle a distinct old and new home — a renovation MOVES things", () => {
    let moved = 0;
    for (const p of particles) {
      if (dist(p.oldHome, p.newHome) > 0.05) moved += 1;
    }
    // The majority of the house visibly changes between old and new.
    expect(moved).toBeGreaterThan(particles.length * 0.5);
  });

  it("the chimney BUILDS ITSELF — old is collapsed low, new is the stack up top", () => {
    const chimney = particles.filter((p) => p.region === "chimney");
    const meanOldY = chimney.reduce((s, p) => s + p.oldHome[1], 0) / chimney.length;
    const meanNewY = chimney.reduce((s, p) => s + p.newHome[1], 0) / chimney.length;
    expect(meanNewY).toBeGreaterThan(meanOldY + 0.4); // rises into place
  });

  it("old roof tiles have SLIPPED — they sit lower than their seated positions", () => {
    const roof = particles.filter((p) => p.region === "roof");
    const slipped = roof.filter((p) => p.oldHome[1] < p.newHome[1] - 0.02).length;
    expect(slipped).toBeGreaterThan(roof.length * 0.6);
  });

  it("the flat GPU field mirrors the object field (single source of truth)", () => {
    const field = buildRenovationField(particles.length, params);
    expect(field.count).toBe(particles.length);
    expect(field.roof + field.wall + field.chimney).toBe(field.count);
    expect(field.oldHome).toHaveLength(field.count * 3);
    expect(field.newHome).toHaveLength(field.count * 3);
    for (const i of [0, 250, particles.length - 1]) {
      expect(field.oldHome[i * 3]).toBeCloseTo(particles[i].oldHome[0], 6);
      expect(field.newHome[i * 3 + 1]).toBeCloseTo(particles[i].newHome[1], 6);
      expect(field.phase[i]).toBeCloseTo(particles[i].phase, 6);
    }
  });

  it("is deterministic — no randomness, ever", () => {
    expect(JSON.stringify(buildRenovation(params))).toBe(JSON.stringify(particles));
  });
});

describe("the five beats, old → new", () => {
  const posAt = (i: number, t: number) => renovationState(particles[i], t, params).position;

  it("REST: every particle sits on its OLD (tired) home", () => {
    for (const i of [0, 300, particles.length - 1]) {
      expect(dist(posAt(i, 0), particles[i].oldHome)).toBeLessThan(1e-9);
    }
  });

  it("DISSOLVE: the house lifts into the cloud — particles leave their old homes", () => {
    const t = (params.beats.dissolve.start + params.beats.dissolve.end) / 2;
    const airborne = particles.filter((p, i) => dist(posAt(i, t), p.oldHome) > 0.5);
    expect(airborne.length).toBeGreaterThan(particles.length * 0.5);
  });

  it("LOCK-IN: t=1 seats every particle on its NEW (renovated) home, square", () => {
    for (let i = 0; i < particles.length; i += 100) {
      const state = renovationState(particles[i], 1, params);
      expect(dist(state.position, particles[i].newHome)).toBeLessThan(1e-6);
      expect(state.scale).toBeCloseTo(1, 5);
    }
  });

  it("PURPOSE: earlier waves (eaves/walls) seat before the ridge and chimney", () => {
    const t = (params.beats.purpose.start + params.beats.purpose.end) / 2;
    const early = particles.filter((p) => p.waveDelay < 0.3);
    const late = particles.filter((p) => p.waveDelay > 0.8);
    const meanAway = (subset: typeof particles) =>
      subset.reduce(
        (s, p) => s + dist(renovationState(p, t, params).position, p.newHome),
        0,
      ) / subset.length;
    expect(meanAway(early)).toBeLessThan(meanAway(late));
  });
});

describe("the condition ramp", () => {
  it("brightens from weathered to fresh across the reassembly", () => {
    expect(renovationLight(0.05, params).fresh).toBeLessThan(0.05);
    expect(renovationLight(1, params).fresh).toBeGreaterThan(0.9);
    // Monotonic: it never gets more tired as it rebuilds.
    let last = -1;
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const f = renovationLight(Math.min(t, 1), params).fresh;
      expect(f).toBeGreaterThanOrEqual(last - 1e-9);
      last = f;
    }
  });
});
