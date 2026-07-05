/**
 * The Storm Vortex choreography core (ADR-035).
 *
 * PURE and deterministic: index maths only, no randomness, no three.js.
 * The same functions drive the full-3D instanced scene AND the 2D canvas
 * fallback — device tiers differ in rendering, never in story.
 *
 * The five-beat Morph Law (the founder's canon):
 *   Rest → Dissolve → Hover → Purpose → Lock-in
 * Hover is the Transformium beat — a loose ghost of the form, breathing,
 * waiting; its duration is a design parameter. Purpose is Transformers
 * precision — target-seeking in cascading waves with mechanical
 * deceleration, nothing floaty.
 */

export type MorphBeat = "rest" | "dissolve" | "hover" | "purpose" | "lock-in";
export const BEAT_ORDER: readonly MorphBeat[] = [
  "rest",
  "dissolve",
  "hover",
  "purpose",
  "lock-in",
];

export type VortexIntensity = "calm" | "dramatic" | "maximum";

export interface BeatSpan {
  start: number;
  end: number;
}

export interface VortexParams {
  intensity: VortexIntensity;
  /** Roof courses (rows) per slope — the lock-in cascade unit. */
  courses: number;
  /** Tiles per course per slope. */
  columns: number;
  /** Hover-beat length as a fraction of the whole arc (design parameter). */
  hoverDuration: number;
  /** How far the hover ghost sits off the true form. */
  hoverRadius: number;
  /** Vortex wildness — scales scatter radius and tumble. */
  turbulence: number;
  beats: Record<MorphBeat, BeatSpan>;
}

export interface VortexParticle {
  index: number;
  side: 0 | 1;
  course: number;
  column: number;
  home: readonly [number, number, number];
  scatter: readonly [number, number, number];
  hoverOffset: readonly [number, number, number];
  restRotation: readonly [number, number, number];
  /** 0..1 — earlier courses seat first (the lock-in cascade). */
  waveDelay: number;
  /** Per-particle phase for hover breathing. */
  phase: number;
  sizeJitter: number;
}

export interface ParticleState {
  position: readonly [number, number, number];
  rotation: readonly [number, number, number];
  scale: number;
}

/** Deterministic pseudo-random in [0,1) from an integer — index maths. */
function hash(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const INTENSITY_GRID: Record<
  VortexIntensity,
  { courses: number; columns: number; turbulence: number }
> = {
  calm: { courses: 12, columns: 66, turbulence: 0.7 }, // 2×12×66 = 1584
  dramatic: { courses: 14, columns: 80, turbulence: 1 }, // 2×14×80 = 2240
  maximum: { courses: 16, columns: 90, turbulence: 1.35 }, // 2×16×90 = 2880
};

export function vortexParams(options: {
  intensity: VortexIntensity;
  hoverDuration?: number;
}): VortexParams {
  const grid = INTENSITY_GRID[options.intensity];
  const hoverDuration = Math.min(Math.max(options.hoverDuration ?? 0.16, 0.04), 0.4);
  const restEnd = 0.1;
  const dissolveEnd = 0.3;
  const hoverEnd = dissolveEnd + hoverDuration;
  const lockStart = Math.min(0.88, hoverEnd + 0.34);
  return {
    intensity: options.intensity,
    courses: grid.courses,
    columns: grid.columns,
    hoverDuration,
    hoverRadius: 0.7,
    turbulence: grid.turbulence,
    beats: {
      rest: { start: 0, end: restEnd },
      dissolve: { start: restEnd, end: dissolveEnd },
      hover: { start: dissolveEnd, end: hoverEnd },
      purpose: { start: hoverEnd, end: lockStart },
      "lock-in": { start: lockStart, end: 1 },
    },
  };
}

export function beatAt(t: number, params: VortexParams): MorphBeat {
  for (const beat of BEAT_ORDER) {
    if (t < params.beats[beat].end) return beat;
  }
  return "lock-in";
}

/** The roof: a gable of two slopes over the house body (house units). */
const ROOF = {
  width: 5.8, // x span
  eavesY: 2.3,
  apexY: 3.7,
  eavesZ: 1.5,
  pitch: Math.atan2(1.4, 1.5),
};

/**
 * The per-particle field maths for ONE tile of the roof grid — the single
 * source of truth shared by the CPU object array (buildStormVortex) and the
 * flat GPU storage field (buildStormField). Index maths only, deterministic.
 */
function tileFields(
  index: number,
  side: 0 | 1,
  course: number,
  courses: number,
  column: number,
  columns: number,
  turbulence: number,
  hoverRadius: number,
): Omit<VortexParticle, "index" | "side" | "course" | "column"> {
  const frac = courses === 1 ? 0 : course / (courses - 1);
  const y = ROOF.eavesY + frac * (ROOF.apexY - ROOF.eavesY);
  const z = (1 - frac) * ROOF.eavesZ + 0.06;
  const x =
    -ROOF.width / 2 + (columns === 1 ? 0.5 : column / (columns - 1)) * ROOF.width;
  const home: [number, number, number] = [x, y, side === 0 ? z : -z];

  // The vortex: a storm spiral around and above the house.
  const a = index * 2.399963; // golden angle — even angular coverage
  const radius = (4.2 + hash(index) * 4.6) * (0.8 + 0.35 * turbulence);
  const height = 1.2 + hash(index + 1) * (4.8 + 1.6 * turbulence);
  const scatter: [number, number, number] = [
    Math.cos(a) * radius,
    height,
    Math.sin(a) * radius,
  ];

  // The hover ghost: a loose shell just off the true form.
  const ghostMag = hoverRadius * (0.6 + hash(index + 2) * 0.8);
  const ga = hash(index + 3) * Math.PI * 2;
  const gb = hash(index + 4) * Math.PI - Math.PI / 2;
  const hoverOffset: [number, number, number] = [
    Math.cos(ga) * Math.cos(gb) * ghostMag,
    Math.sin(gb) * ghostMag + 0.15,
    Math.sin(ga) * Math.cos(gb) * ghostMag * (side === 0 ? 1 : -1),
  ];

  return {
    home,
    scatter,
    hoverOffset,
    restRotation: [side === 0 ? -ROOF.pitch : ROOF.pitch, 0, 0],
    // Course 0 (the eaves) seats first; tiny column stagger inside each
    // course keeps the wave organic, never a hard shutter.
    waveDelay:
      (courses === 1 ? 0 : course / (courses - 1)) * 0.82 + hash(index + 5) * 0.08,
    phase: hash(index + 6) * Math.PI * 2,
    sizeJitter: 0.85 + hash(index + 7) * 0.3,
  };
}

export function buildStormVortex(params: VortexParams): VortexParticle[] {
  const particles: VortexParticle[] = [];
  const { courses, columns, turbulence } = params;
  let index = 0;
  for (let side = 0 as 0 | 1; side <= 1; side++) {
    for (let course = 0; course < courses; course++) {
      for (let column = 0; column < columns; column++) {
        particles.push({
          index,
          side,
          course,
          column,
          ...tileFields(
            index,
            side,
            course,
            courses,
            column,
            columns,
            turbulence,
            params.hoverRadius,
          ),
        });
        index += 1;
      }
    }
  }
  return particles;
}

/**
 * The flat GPU storage field (ADR-038): the SAME roof choreography scaled to
 * 50k+ particles, packed as index-contiguous Float32Arrays ready to upload
 * to WebGPU storage buffers. `count` is derived from `target` as a clean
 * 2×courses×columns grid (columns ≫ courses — the roof is wide, not tall),
 * always ≥ target. The TSL compute pass reads these buffers and reproduces
 * particleState() on the GPU; the maths lives ONCE, in tileFields.
 */
export interface StormField {
  count: number;
  courses: number;
  columns: number;
  /** vec3 per particle, xyz interleaved. */
  home: Float32Array;
  scatter: Float32Array;
  hoverOffset: Float32Array;
  /** Euler xyz per particle. */
  restRotation: Float32Array;
  /** Scalar per particle. */
  waveDelay: Float32Array;
  phase: Float32Array;
  sizeJitter: Float32Array;
}

/** Roof width ÷ slope-course count — keeps the wide-gable proportion at any density. */
const ROOF_ASPECT = 5.6;

export function buildStormField(target: number, params: VortexParams): StormField {
  const perSide = Math.ceil(Math.max(target, 2) / 2);
  const courses = Math.max(2, Math.round(Math.sqrt(perSide / ROOF_ASPECT)));
  const columns = Math.max(2, Math.ceil(perSide / courses));
  const count = 2 * courses * columns;

  const home = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const hoverOffset = new Float32Array(count * 3);
  const restRotation = new Float32Array(count * 3);
  const waveDelay = new Float32Array(count);
  const phase = new Float32Array(count);
  const sizeJitter = new Float32Array(count);

  let index = 0;
  for (let side = 0 as 0 | 1; side <= 1; side++) {
    for (let course = 0; course < courses; course++) {
      for (let column = 0; column < columns; column++) {
        const f = tileFields(
          index,
          side,
          course,
          courses,
          column,
          columns,
          params.turbulence,
          params.hoverRadius,
        );
        const v = index * 3;
        home[v] = f.home[0];
        home[v + 1] = f.home[1];
        home[v + 2] = f.home[2];
        scatter[v] = f.scatter[0];
        scatter[v + 1] = f.scatter[1];
        scatter[v + 2] = f.scatter[2];
        hoverOffset[v] = f.hoverOffset[0];
        hoverOffset[v + 1] = f.hoverOffset[1];
        hoverOffset[v + 2] = f.hoverOffset[2];
        restRotation[v] = f.restRotation[0];
        restRotation[v + 1] = f.restRotation[1];
        restRotation[v + 2] = f.restRotation[2];
        waveDelay[index] = f.waveDelay;
        phase[index] = f.phase;
        sizeJitter[index] = f.sizeJitter;
        index += 1;
      }
    }
  }

  return {
    count,
    courses,
    columns,
    home,
    scatter,
    hoverOffset,
    restRotation,
    waveDelay,
    phase,
    sizeJitter,
  };
}

/** Mechanical deceleration — Transformers precision, nothing floaty. */
function easeOutQuint(x: number): number {
  return 1 - Math.pow(1 - x, 5);
}
function easeInCubic(x: number): number {
  return x * x * x;
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

export function particleState(
  particle: VortexParticle,
  t: number,
  params: VortexParams,
): ParticleState {
  const { beats } = params;
  const home = particle.home as [number, number, number];
  const rest = particle.restRotation as [number, number, number];

  if (t <= beats.rest.end) {
    return { position: home, rotation: rest, scale: 1 };
  }

  // Hover anchor: the ghost position this particle breathes around.
  const ghost: [number, number, number] = [
    home[0] + particle.hoverOffset[0],
    home[1] + particle.hoverOffset[1],
    home[2] + particle.hoverOffset[2],
  ];
  const breathe = (amplitude: number): [number, number, number] => [
    Math.sin(t * 21 + particle.phase) * amplitude,
    Math.sin(t * 17 + particle.phase * 2) * amplitude * 0.7,
    Math.cos(t * 19 + particle.phase) * amplitude,
  ];

  if (t <= beats.dissolve.end) {
    // DISSOLVE: the roof breaks into the vortex, tumbling.
    const d = easeInCubic(
      (t - beats.dissolve.start) / (beats.dissolve.end - beats.dissolve.start),
    );
    const position = lerp3(home, particle.scatter, d);
    const tumble = d * params.turbulence * 6;
    return {
      position,
      rotation: [
        rest[0] + tumble * Math.sin(particle.phase),
        tumble * Math.cos(particle.phase * 1.3),
        tumble * Math.sin(particle.phase * 0.7),
      ],
      scale: 1,
    };
  }

  if (t <= beats.hover.end) {
    // HOVER: the Transformium beat — gather from the vortex into a loose
    // ghost of the form, then breathe. Restraint before decisiveness.
    const h = (t - beats.hover.start) / (beats.hover.end - beats.hover.start);
    const gather = smoothstep(0, 0.45, h);
    const base = lerp3(particle.scatter as [number, number, number], ghost, gather);
    const drift = breathe(0.12 * gather);
    const tumble = (1 - gather * 0.8) * params.turbulence * 6;
    return {
      position: [base[0] + drift[0], base[1] + drift[1], base[2] + drift[2]],
      rotation: [
        rest[0] + tumble * Math.sin(particle.phase) * 0.4,
        tumble * Math.cos(particle.phase * 1.3) * 0.4,
        tumble * Math.sin(particle.phase * 0.7) * 0.4,
      ],
      scale: 1,
    };
  }

  // PURPOSE → LOCK-IN: one seating window; the wave delay spreads course
  // starts so the eaves seat mid-purpose and the ridge clicks home last.
  const seatSpan = 1 - beats.purpose.start;
  const seatStart = beats.purpose.start + particle.waveDelay * seatSpan * 0.72;
  const seatLength = seatSpan * 0.26;
  const p = Math.min(Math.max((t - seatStart) / seatLength, 0), 1);
  const e = easeOutQuint(p);
  const base = lerp3(ghost, home, e);
  const drift = breathe(0.12 * (1 - e));
  // The click: a whisper of overshoot in scale that settles square.
  const click = p >= 1 ? 1 : 1 + 0.06 * Math.sin(Math.min(p * 1.15, 1) * Math.PI);
  return {
    position: [base[0] + drift[0], base[1] + drift[1], base[2] + drift[2]],
    rotation: [
      rest[0] + (1 - e) * Math.sin(particle.phase) * 1.4,
      (1 - e) * Math.cos(particle.phase * 1.3) * 1.4,
      (1 - e) * Math.sin(particle.phase * 0.7) * 1.4,
    ],
    scale: click,
  };
}

export interface StormLight {
  /** 0 = full storm, 1 = calm, warm, after. */
  calm: number;
  /** Lightning flash 0..1 — punctuates the dissolve. */
  lightning: number;
}

export function stormLightAt(t: number, params: VortexParams): StormLight {
  const calm = smoothstep(params.beats.purpose.start + 0.1, 0.97, t);
  const flash = (centre: number, width: number, strength: number) =>
    Math.exp(-Math.pow((t - centre) / width, 2)) * strength;
  const lightning =
    flash(params.beats.dissolve.start + 0.05, 0.03, 0.9) +
    flash(params.beats.dissolve.end - 0.05, 0.02, 0.5);
  return { calm, lightning: Math.min(lightning, 1) };
}
