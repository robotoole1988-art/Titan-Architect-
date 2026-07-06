/**
 * The Renovation morph (ADR-040) — a tired house particle-reassembles into a
 * renovated one.
 *
 * PURE and deterministic: index maths only, no randomness, no three.js. Reuses
 * the five-beat Morph Law and the beat timing from choreography.ts; the new
 * idea is TWO forms per particle — `oldHome` (its place in the weathered house)
 * and `newHome` (its place in the renovated house) — with the `scatter` cloud
 * as the shared dissolve middle. The whole house is covered: roof tiles, walls,
 * chimney. The same functions drive the WebGPU compute scene AND the 2D/CPU
 * fallback — renderers differ, the story never does.
 *
 * Beats (old → new): Rest (old house) → Dissolve (lift to cloud) → Hover
 * (the cloud holds) → Purpose → Lock-in (renovated house + new chimney seats).
 */

import type { MorphBeat, ParticleState, VortexParams } from "./choreography";
import { vortexParams } from "./choreography";

export type { MorphBeat, ParticleState, VortexParams };
export { vortexParams };

export type RenovationRegion = "roof" | "wall" | "chimney";

/** Deterministic pseudo-random in [0,1) from an integer — index maths. */
function hash(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}
function easeInCubic(x: number): number {
  return x * x * x;
}
function easeOutQuint(x: number): number {
  return 1 - Math.pow(1 - x, 5);
}
function smoothstep(a: number, b: number, x: number): number {
  const s = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return s * s * (3 - 2 * s);
}
function lerp3(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  s: number,
): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
}

/** The house form (house units) — a UK gable house with a chimney. */
const HOUSE = {
  halfWidth: 2.7, // x extent of the walls
  halfDepth: 1.45, // z extent (front/back)
  wallTop: 2.3, // eaves height
  apexY: 3.7, // ridge height
  eavesZ: 1.45,
  pitch: Math.atan2(1.4, 1.45),
  chimney: { x: 1.55, z: -0.35, baseY: 3.05, topY: 4.45, half: 0.26 },
} as const;

export interface RenovationParticle {
  index: number;
  region: RenovationRegion;
  /** Position in the tired house. */
  oldHome: readonly [number, number, number];
  /** Position in the renovated house. */
  newHome: readonly [number, number, number];
  /** The dissolve cloud position. */
  scatter: readonly [number, number, number];
  /** Loose shell off the NEW form, for the hover beat. */
  hoverOffset: readonly [number, number, number];
  /** Weathered orientation (slipped tiles). */
  oldRotation: readonly [number, number, number];
  /** Seated orientation. */
  newRotation: readonly [number, number, number];
  /** 0..1 — earlier/lower seats first (the lock-in cascade). */
  waveDelay: number;
  phase: number;
  sizeJitter: number;
}

export interface RenovationParams extends VortexParams {
  /** Particle split across regions (fractions summing to ~1). */
  regionMix: { roof: number; wall: number; chimney: number };
}

export function renovationParams(options: {
  intensity: "calm" | "dramatic" | "maximum";
  hoverDuration?: number;
}): RenovationParams {
  return {
    ...vortexParams(options),
    regionMix: { roof: 0.5, wall: 0.38, chimney: 0.12 },
  };
}

/** Decide a particle's region from its index and the region split. */
function regionFor(index: number, count: number, mix: RenovationParams["regionMix"]): RenovationRegion {
  const roofEnd = Math.floor(count * mix.roof);
  const wallEnd = roofEnd + Math.floor(count * mix.wall);
  if (index < roofEnd) return "roof";
  if (index < wallEnd) return "wall";
  return "chimney";
}

/** The per-particle field maths — one source of truth for both builders. */
function renovationTile(index: number, region: RenovationRegion): Omit<RenovationParticle, "index" | "region"> {
  const h = (k: number) => hash(index + k);
  // Dissolve cloud: a loose golden-angle spread around and above the house.
  const a = index * 2.399963;
  const radius = 3.4 + h(0) * 3.8;
  const scatter: [number, number, number] = [
    Math.cos(a) * radius,
    2.4 + h(1) * 3.6,
    Math.sin(a) * radius,
  ];
  const phase = h(6) * Math.PI * 2;
  const sizeJitter = 0.85 + h(7) * 0.3;

  let oldHome: [number, number, number];
  let newHome: [number, number, number];
  let oldRotation: [number, number, number] = [0, 0, 0];
  let newRotation: [number, number, number] = [0, 0, 0];
  let waveDelay: number;

  if (region === "roof") {
    // Seated tile on one of the two gable slopes.
    const side = h(2) < 0.5 ? 1 : -1;
    const frac = h(3); // 0 = eaves, 1 = ridge
    const y = HOUSE.wallTop + frac * (HOUSE.apexY - HOUSE.wallTop);
    const z = (1 - frac) * HOUSE.eavesZ + 0.05;
    const x = (h(4) - 0.5) * (HOUSE.halfWidth * 2);
    newHome = [x, y, z * side];
    newRotation = [side === 1 ? -HOUSE.pitch : HOUSE.pitch, 0, 0];
    // Old: slipped downhill, rotated, and ~14% are missing (dropped to gaps).
    const missing = h(8) < 0.14;
    const slip = missing ? 0.5 + h(9) * 0.9 : h(9) * 0.28;
    oldHome = [
      x + (h(10) - 0.5) * 0.12,
      y - slip * (HOUSE.apexY - HOUSE.wallTop),
      (z + (missing ? 0.35 * h(11) : 0)) * side,
    ];
    const tilt = (h(12) - 0.5) * (missing ? 1.4 : 0.5);
    oldRotation = [newRotation[0] + tilt, tilt * 0.6, tilt * 0.4];
    // Eaves (low) seat before the ridge.
    waveDelay = frac * 0.72 + h(5) * 0.06;
  } else if (region === "wall") {
    // A point on one of the four wall faces; barely moves — the tired reads in
    // the material, not the geometry.
    const face = Math.floor(h(2) * 4); // 0 front,1 back,2 left,3 right
    const yy = h(3) * HOUSE.wallTop;
    let x: number;
    let z: number;
    if (face === 0) {
      x = (h(4) - 0.5) * HOUSE.halfWidth * 2;
      z = HOUSE.halfDepth;
    } else if (face === 1) {
      x = (h(4) - 0.5) * HOUSE.halfWidth * 2;
      z = -HOUSE.halfDepth;
    } else if (face === 2) {
      x = -HOUSE.halfWidth;
      z = (h(4) - 0.5) * HOUSE.halfDepth * 2;
    } else {
      x = HOUSE.halfWidth;
      z = (h(4) - 0.5) * HOUSE.halfDepth * 2;
    }
    newHome = [x, yy, z];
    oldHome = [x + (h(10) - 0.5) * 0.05, yy + (h(11) - 0.5) * 0.05, z];
    waveDelay = 0.15 + h(5) * 0.2; // walls settle early
  } else {
    // Chimney: NEW is a clean stack on the roof; OLD is collapsed rubble low
    // around its base — so the chimney BUILDS ITSELF at lock-in.
    const c = HOUSE.chimney;
    const nx = c.x + (h(3) - 0.5) * c.half * 2;
    const nz = c.z + (h(4) - 0.5) * c.half * 2;
    const ny = c.baseY + h(2) * (c.topY - c.baseY);
    newHome = [nx, ny, nz];
    // Rubble: scattered low near the base, off to one side (broken).
    const ra = h(9) * Math.PI * 2;
    const rr = 0.3 + h(10) * 1.1;
    oldHome = [c.x + Math.cos(ra) * rr, HOUSE.wallTop - 0.2 + h(11) * 0.5, c.z + Math.sin(ra) * rr];
    const t = (h(12) - 0.5) * 1.2;
    oldRotation = [t, t * 0.7, t * 0.5];
    // Ridge/chimney click home LAST — the finishing flourish.
    waveDelay = 0.85 + h(5) * 0.12;
  }

  // Hover ghost: a loose shell just off the NEW form.
  const ga = h(13) * Math.PI * 2;
  const gb = h(14) * Math.PI - Math.PI / 2;
  const gm = 0.55 * (0.6 + h(15) * 0.8);
  const cgb = Math.cos(gb);
  const hoverOffset: [number, number, number] = [
    Math.cos(ga) * cgb * gm,
    Math.sin(gb) * gm + 0.15,
    Math.sin(ga) * cgb * gm,
  ];

  return {
    oldHome,
    newHome,
    scatter,
    hoverOffset,
    oldRotation,
    newRotation,
    waveDelay,
    phase,
    sizeJitter,
  };
}

export function buildRenovation(params: RenovationParams): RenovationParticle[] {
  const count = renovationCount(params);
  const particles: RenovationParticle[] = [];
  for (let index = 0; index < count; index++) {
    const region = regionFor(index, count, params.regionMix);
    particles.push({ index, region, ...renovationTile(index, region) });
  }
  return particles;
}

/** Target count → the field's actual count (a clean, deterministic number). */
function renovationCount(params: RenovationParams): number {
  return params.courses * params.columns * 2;
}

export interface RenovationField {
  count: number;
  roof: number;
  wall: number;
  chimney: number;
  oldHome: Float32Array;
  newHome: Float32Array;
  scatter: Float32Array;
  hoverOffset: Float32Array;
  oldRotation: Float32Array;
  newRotation: Float32Array;
  waveDelay: Float32Array;
  phase: Float32Array;
  sizeJitter: Float32Array;
}

/** The flat, GPU-uploadable field (mirrors buildStormField). */
export function buildRenovationField(target: number, params: RenovationParams): RenovationField {
  const count = Math.max(target, 8);
  const v3 = () => new Float32Array(count * 3);
  const field: RenovationField = {
    count,
    roof: 0,
    wall: 0,
    chimney: 0,
    oldHome: v3(),
    newHome: v3(),
    scatter: v3(),
    hoverOffset: v3(),
    oldRotation: v3(),
    newRotation: v3(),
    waveDelay: new Float32Array(count),
    phase: new Float32Array(count),
    sizeJitter: new Float32Array(count),
  };
  for (let i = 0; i < count; i++) {
    const region = regionFor(i, count, params.regionMix);
    if (region === "roof") field.roof++;
    else if (region === "wall") field.wall++;
    else field.chimney++;
    const t = renovationTile(i, region);
    const v = i * 3;
    const put = (arr: Float32Array, p: readonly [number, number, number]) => {
      arr[v] = p[0];
      arr[v + 1] = p[1];
      arr[v + 2] = p[2];
    };
    put(field.oldHome, t.oldHome);
    put(field.newHome, t.newHome);
    put(field.scatter, t.scatter);
    put(field.hoverOffset, t.hoverOffset);
    put(field.oldRotation, t.oldRotation);
    put(field.newRotation, t.newRotation);
    field.waveDelay[i] = t.waveDelay;
    field.phase[i] = t.phase;
    field.sizeJitter[i] = t.sizeJitter;
  }
  return field;
}

/** Five-beat state, old → new (mirrors particleState, two forms). */
export function renovationState(
  particle: RenovationParticle,
  t: number,
  params: RenovationParams,
): ParticleState {
  const { beats } = params;
  const oldHome = particle.oldHome as [number, number, number];
  const newHome = particle.newHome as [number, number, number];
  const oldRot = particle.oldRotation as [number, number, number];
  const newRot = particle.newRotation as [number, number, number];

  if (t <= beats.rest.end) {
    return { position: oldHome, rotation: oldRot, scale: 1 };
  }

  const ghost: [number, number, number] = [
    newHome[0] + particle.hoverOffset[0],
    newHome[1] + particle.hoverOffset[1],
    newHome[2] + particle.hoverOffset[2],
  ];
  const breathe = (amp: number): [number, number, number] => [
    Math.sin(t * 21 + particle.phase) * amp,
    Math.sin(t * 17 + particle.phase * 2) * amp * 0.7,
    Math.cos(t * 19 + particle.phase) * amp,
  ];

  if (t <= beats.dissolve.end) {
    const d = easeInCubic((t - beats.dissolve.start) / (beats.dissolve.end - beats.dissolve.start));
    const position = lerp3(oldHome, particle.scatter, d);
    const tumble = d * params.turbulence * 6;
    return {
      position,
      rotation: [
        oldRot[0] + tumble * Math.sin(particle.phase),
        tumble * Math.cos(particle.phase * 1.3),
        tumble * Math.sin(particle.phase * 0.7),
      ],
      scale: 1,
    };
  }

  if (t <= beats.hover.end) {
    const hh = (t - beats.hover.start) / (beats.hover.end - beats.hover.start);
    const gather = smoothstep(0, 0.45, hh);
    const base = lerp3(particle.scatter as [number, number, number], ghost, gather);
    const drift = breathe(0.12 * gather);
    const tumble = (1 - gather * 0.8) * params.turbulence * 6;
    return {
      position: [base[0] + drift[0], base[1] + drift[1], base[2] + drift[2]],
      rotation: [
        tumble * Math.sin(particle.phase) * 0.4,
        tumble * Math.cos(particle.phase * 1.3) * 0.4,
        tumble * Math.sin(particle.phase * 0.7) * 0.4,
      ],
      scale: 1,
    };
  }

  // PURPOSE → LOCK-IN: seat onto the NEW form, cascade by waveDelay.
  const seatSpan = 1 - beats.purpose.start;
  const seatStart = beats.purpose.start + particle.waveDelay * seatSpan * 0.72;
  const seatLength = seatSpan * 0.26;
  const p = Math.min(Math.max((t - seatStart) / seatLength, 0), 1);
  const e = easeOutQuint(p);
  const base = lerp3(ghost, newHome, e);
  const drift = breathe(0.12 * (1 - e));
  const click = p >= 1 ? 1 : 1 + 0.06 * Math.sin(Math.min(p * 1.15, 1) * Math.PI);
  return {
    position: [base[0] + drift[0], base[1] + drift[1], base[2] + drift[2]],
    // Rotation eases from tumble/old toward the seated (new) orientation.
    rotation: lerp3(oldRot, newRot, e),
    scale: click,
  };
}

export interface RenovationLight {
  /** 0 = weathered/tired, 1 = fresh/renovated. */
  fresh: number;
}

/** Condition ramp — the house brightens as it reassembles. */
export function renovationLight(t: number, params: RenovationParams): RenovationLight {
  return { fresh: smoothstep(params.beats.purpose.start + 0.05, 0.97, t) };
}
