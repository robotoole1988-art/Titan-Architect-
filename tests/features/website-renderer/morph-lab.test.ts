import { describe, expect, it } from "vitest";
import {
  BEAT_ORDER,
  beatAt,
  buildStormVortex,
  classifyGpuTier,
  particleState,
  stormLightAt,
  vortexParams,
} from "@/features/website-renderer";

/**
 * Morph Lab (ADR-035): the Storm Vortex choreography core is PURE and
 * deterministic — the same maths drives the 3D instanced scene and the 2D
 * canvas fallback, so device tiers differ in rendering, never in story.
 *
 * The five-beat Morph Law: Rest → Dissolve → Hover → Purpose → Lock-in.
 */

const params = vortexParams({ intensity: "dramatic" });
const particles = buildStormVortex(params);

function positionAt(index: number, t: number) {
  return particleState(particles[index], t, params).position;
}

function distance(a: readonly number[], b: readonly number[]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

describe("the five-beat Morph Law", () => {
  it("beats run Rest → Dissolve → Hover → Purpose → Lock-in, covering t 0..1", () => {
    expect(BEAT_ORDER).toEqual(["rest", "dissolve", "hover", "purpose", "lock-in"]);
    expect(beatAt(0, params)).toBe("rest");
    expect(beatAt(1, params)).toBe("lock-in");
    // Monotonic: walking t forward never revisits an earlier beat.
    let last = -1;
    for (let t = 0; t <= 1.0001; t += 0.01) {
      const index = BEAT_ORDER.indexOf(beatAt(Math.min(t, 1), params));
      expect(index).toBeGreaterThanOrEqual(last);
      last = index;
    }
  });

  it("hover duration is a design parameter — the lab can stretch the Transformium beat", () => {
    const patient = vortexParams({ intensity: "dramatic", hoverDuration: 0.3 });
    const brisk = vortexParams({ intensity: "dramatic", hoverDuration: 0.08 });
    const hoverSpan = (p: typeof params) => {
      let span = 0;
      for (let t = 0; t <= 1; t += 0.005) if (beatAt(t, p) === "hover") span += 0.005;
      return span;
    };
    expect(hoverSpan(patient)).toBeGreaterThan(hoverSpan(brisk) + 0.15);
  });
});

describe("intensity → particle budget (1,500–3,000)", () => {
  it.each([
    ["calm", 1500, 2000],
    ["dramatic", 2000, 2600],
    ["maximum", 2600, 3000],
  ] as const)("%s stays within its band", (intensity, min, max) => {
    const count = buildStormVortex(vortexParams({ intensity })).length;
    expect(count).toBeGreaterThanOrEqual(min);
    expect(count).toBeLessThanOrEqual(max);
  });
});

describe("the choreography", () => {
  it("is deterministic — no randomness, ever", () => {
    const again = buildStormVortex(vortexParams({ intensity: "dramatic" }));
    expect(JSON.stringify(again)).toBe(JSON.stringify(particles));
    expect(positionAt(123, 0.5)).toEqual(positionAt(123, 0.5));
  });

  it("REST: every particle sits exactly on its roof-tile home", () => {
    for (const index of [0, 100, particles.length - 1]) {
      expect(distance(positionAt(index, 0), particles[index].home)).toBeLessThan(1e-9);
    }
  });

  it("DISSOLVE: the roof breaks apart — particles leave home into the vortex", () => {
    // Mid-dissolve, most of the swarm is airborne.
    const t = (params.beats.dissolve.start + params.beats.dissolve.end) / 2;
    const airborne = particles.filter(
      (particle, index) => distance(positionAt(index, t), particle.home) > 0.5,
    );
    expect(airborne.length).toBeGreaterThan(particles.length * 0.5);
  });

  it("HOVER: a loose ghost of the form — near home but not seated, breathing", () => {
    const t = (params.beats.hover.start + params.beats.hover.end) / 2;
    let ghosted = 0;
    for (let index = 0; index < particles.length; index += 25) {
      const away = distance(positionAt(index, t), particles[index].home);
      if (away > 0.3 && away < params.hoverRadius * 3) ghosted += 1;
    }
    expect(ghosted).toBeGreaterThan((particles.length / 25) * 0.7);
    // Breathing: the ghost drifts between two nearby instants.
    const drift = distance(positionAt(40, t), positionAt(40, t + 0.01));
    expect(drift).toBeGreaterThan(0);
    expect(drift).toBeLessThan(1);
  });

  it("PURPOSE: cascading waves — earlier courses seat before later ones", () => {
    const t = (params.beats.purpose.start + params.beats.purpose.end) / 2;
    const first = particles.filter((p) => p.course === 0);
    const last = particles.filter((p) => p.course === params.courses - 1);
    const meanAway = (subset: typeof particles) =>
      subset.reduce(
        (sum, particle) =>
          sum + distance(particleState(particle, t, params).position, particle.home),
        0,
      ) / subset.length;
    expect(meanAway(first)).toBeLessThan(meanAway(last));
  });

  it("LOCK-IN: t=1 seats every particle exactly home, full scale, square", () => {
    for (let index = 0; index < particles.length; index += 100) {
      const state = particleState(particles[index], 1, params);
      expect(distance(state.position, particles[index].home)).toBeLessThan(1e-6);
      expect(state.scale).toBeCloseTo(1, 5);
      expect(state.rotation[0]).toBeCloseTo(particles[index].restRotation[0], 5);
    }
  });

  it("storm light clears to calm across the arc", () => {
    const storm = stormLightAt(0.05, params);
    const calm = stormLightAt(1, params);
    expect(storm.calm).toBeLessThan(0.1);
    expect(calm.calm).toBeGreaterThan(0.9);
    // The lightning flash punctuates the dissolve, then is gone.
    const flashes = [0.05, 0.2, 0.9].map((t) => stormLightAt(t, params).lightning);
    expect(Math.max(...flashes)).toBe(flashes[1]);
    expect(flashes[2]).toBeLessThan(0.05);
  });
});

describe("device tiering (built now, public later)", () => {
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
});
