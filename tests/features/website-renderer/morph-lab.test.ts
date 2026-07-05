import { describe, expect, it } from "vitest";
import {
  BEAT_ORDER,
  beatAt,
  buildStormField,
  buildStormVortex,
  classifyGpuTier,
  particleState,
  preferWebGpu,
  resolveParticleMaterial,
  stormLightAt,
  vortexParams,
} from "@/features/website-renderer";

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

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

describe("lab environment domes — through the founder gate (ADR-035 v2)", () => {
  it("specifies four domes: one storm + three calm times of day", async () => {
    const { DOME_SPECS } = await import("@/features/website-renderer");
    expect(DOME_SPECS).toHaveLength(4);
    expect(DOME_SPECS.filter((spec) => spec.kind === "storm")).toHaveLength(1);
    expect(
      DOME_SPECS.filter((spec) => spec.kind === "calm").map((s) => s.timeOfDay),
    ).toEqual(["golden-hour", "dusk", "overcast"]);
    for (const spec of DOME_SPECS) {
      expect(spec.slotRef).toMatch(/^lab\/dome-/);
      expect(spec.brief).toMatch(/equirectangular/i);
      expect(spec.brief).toMatch(/no people, no text/i);
    }
  });

  it("ensureLabBusiness is idempotent — one internal record, ever", async () => {
    const { ensureLabBusiness } = await import("@/features/website-renderer");
    const { createMemoryBusinessSpine } = await import("@/core/business");
    const spine = createMemoryBusinessSpine();
    const first = await ensureLabBusiness(spine);
    const second = await ensureLabBusiness(spine);
    expect(second.id).toBe(first.id);
    expect((await spine.businesses.list())).toHaveLength(1);
  });

  it("review domes show (honest chip); rejected NEVER; retakes supersede", async () => {
    const { resolveLabEnvironment, ensureLabBusiness, DOME_SPECS } = await import(
      "@/features/website-renderer"
    );
    const { createMemoryBusinessSpine } = await import("@/core/business");
    const spine = createMemoryBusinessSpine();
    const lab = await ensureLabBusiness(spine);
    const make = (slotRef: string, url: string) =>
      spine.media.create({
        businessId: lab.id,
        slotRef,
        brief: "dome",
        modality: "image",
        url,
        provenance: {
          provider: "replicate",
          model: "test",
          prompt: "p",
          costUsd: 0.04,
          generatedAt: new Date().toISOString(),
        },
      });
    const storm = await make("lab/dome-storm", "https://x/storm-1.webp");
    await spine.media.setStatus(storm.id, "rejected");
    const stormRetake = await make("lab/dome-storm", "https://x/storm-2.webp");
    const golden = await make("lab/dome-golden-hour", "https://x/gold.webp");
    await spine.media.setStatus(golden.id, "approved");

    const environment = await resolveLabEnvironment(spine);
    const stormDome = environment.domes.find((dome) => dome.kind === "storm");
    expect(stormDome?.url).toBe("https://x/storm-2.webp"); // retake wins
    expect(stormDome?.status).toBe("review");
    const goldenDome = environment.domes.find((d) => d.timeOfDay === "golden-hour");
    expect(goldenDome?.status).toBe("approved");
    expect(environment.domes).toHaveLength(2);
    expect(environment.missingSlotRefs.sort()).toEqual([
      "lab/dome-dusk",
      "lab/dome-overcast",
    ]);
    void stormRetake;
    void DOME_SPECS;
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

  it("WebGPU is preferred only on the full-3D tier WITH an adapter present", () => {
    // The compute path is a full-3D upgrade: never on constrained/still
    // tiers, never without a WebGPU adapter (graceful fall back to WebGL).
    expect(preferWebGpu("full-3d", true)).toBe(true);
    expect(preferWebGpu("full-3d", false)).toBe(false);
    expect(preferWebGpu("fallback-2d", true)).toBe(false);
    expect(preferWebGpu("still", true)).toBe(false);
  });
});

describe("the WebGPU compute field (ADR-038) — 50k+ flat, GPU-uploadable", () => {
  const params = vortexParams({ intensity: "maximum" });

  it("packs at LEAST the requested count as a clean 2×courses×columns grid", () => {
    const field = buildStormField(50_000, params);
    expect(field.count).toBeGreaterThanOrEqual(50_000);
    expect(field.count).toBe(2 * field.courses * field.columns);
    // The roof is wide, not tall — many more columns than courses.
    expect(field.columns).toBeGreaterThan(field.courses);
  });

  it("emits flat Float32Arrays sized to the GPU storage buffers", () => {
    const field = buildStormField(50_000, params);
    const n = field.count;
    expect(field.home).toBeInstanceOf(Float32Array);
    expect(field.home).toHaveLength(n * 3);
    expect(field.scatter).toHaveLength(n * 3);
    expect(field.hoverOffset).toHaveLength(n * 3);
    expect(field.restRotation).toHaveLength(n * 3);
    expect(field.waveDelay).toHaveLength(n);
    expect(field.phase).toHaveLength(n);
    expect(field.sizeJitter).toHaveLength(n);
  });

  it("is deterministic — no randomness, ever (index maths only)", () => {
    const a = buildStormField(50_000, params);
    const b = buildStormField(50_000, params);
    expect(Array.from(a.home)).toEqual(Array.from(b.home));
    expect(Array.from(a.waveDelay)).toEqual(Array.from(b.waveDelay));
  });

  it("every home sits on the roof gable; scatter flings out beyond it", () => {
    const field = buildStormField(50_000, params);
    let scatteredFarther = 0;
    for (let i = 0; i < field.count; i += 137) {
      const hx = field.home[i * 3];
      const hy = field.home[i * 3 + 1];
      const hz = field.home[i * 3 + 2];
      // Roof bounds (ROOF: width 5.8, eaves y 2.3 → apex 3.7, |z| ≤ 1.56).
      expect(Math.abs(hx)).toBeLessThanOrEqual(2.9 + 1e-4);
      expect(hy).toBeGreaterThanOrEqual(2.3 - 1e-4);
      expect(hy).toBeLessThanOrEqual(3.7 + 1e-4);
      expect(Math.abs(hz)).toBeLessThanOrEqual(1.6);
      const homeR = Math.hypot(hx, hy, hz);
      const sx = field.scatter[i * 3];
      const sz = field.scatter[i * 3 + 2];
      if (Math.hypot(sx, sz) > homeR) scatteredFarther += 1;
    }
    expect(scatteredFarther).toBeGreaterThan(0);
  });

  it("preserves the lock-in cascade: eaves (low) seat before the ridge (high)", () => {
    const field = buildStormField(50_000, params);
    // Sample low-course vs high-course particles by their home height.
    let lowSum = 0;
    let lowN = 0;
    let highSum = 0;
    let highN = 0;
    for (let i = 0; i < field.count; i += 53) {
      const y = field.home[i * 3 + 1];
      if (y < 2.6) {
        lowSum += field.waveDelay[i];
        lowN += 1;
      } else if (y > 3.4) {
        highSum += field.waveDelay[i];
        highN += 1;
      }
    }
    expect(lowSum / lowN).toBeLessThan(highSum / highN);
    // waveDelay is a normalised seat offset in [0, 1).
    for (let i = 0; i < field.count; i += 311) {
      expect(field.waveDelay[i]).toBeGreaterThanOrEqual(0);
      expect(field.waveDelay[i]).toBeLessThan(1);
    }
  });

  it("no more blue confetti: slate is dark, metallic, with a near-black emissive", () => {
    const slate = resolveParticleMaterial("roofing");
    expect(slate.key).toBe("slate");
    // Metallic stone, not glowing plastic.
    expect(slate.metalness).toBeGreaterThan(0.4);
    // Base albedo is dark — this is what the eye reads.
    const albedo = hexToRgb(slate.color);
    expect(Math.max(albedo.r, albedo.g, albedo.b)).toBeLessThan(110);
    // The emissive is a whisper of heat, never a bright blue cast.
    const glow = hexToRgb(slate.emissive);
    expect(Math.max(glow.r, glow.g, glow.b)).toBeLessThan(80);
  });

  it("dresses the morph in its trade material (registry-keyed)", () => {
    expect(resolveParticleMaterial("Roofing & guttering").key).toBe("slate");
    expect(resolveParticleMaterial("Resin driveways").key).toBe("resin");
    expect(resolveParticleMaterial("Patios & paving").key).toBe("stone");
    // Unclassified trades fall back to slate — the canonical Tier-3 moment.
    expect(resolveParticleMaterial().key).toBe("slate");
    expect(resolveParticleMaterial("something new").key).toBe("slate");
  });

  it("shares its per-particle maths with buildStormVortex (single source of truth)", () => {
    // A field sized to a known grid must reproduce the object-array homes
    // exactly — the flat GPU path and the CPU path tell ONE story.
    const grid = vortexParams({ intensity: "calm" }); // 12 courses × 66 columns
    const objects = buildStormVortex(grid);
    const field = buildStormField(objects.length, grid);
    expect(field.count).toBe(objects.length);
    expect(field.courses).toBe(grid.courses);
    expect(field.columns).toBe(grid.columns);
    for (const i of [0, 500, objects.length - 1]) {
      expect(field.home[i * 3]).toBeCloseTo(objects[i].home[0], 6);
      expect(field.home[i * 3 + 1]).toBeCloseTo(objects[i].home[1], 6);
      expect(field.home[i * 3 + 2]).toBeCloseTo(objects[i].home[2], 6);
      expect(field.scatter[i * 3]).toBeCloseTo(objects[i].scatter[0], 6);
      expect(field.phase[i]).toBeCloseTo(objects[i].phase, 6);
    }
  });
});
