/**
 * Trade-card artwork — the founder's five trades (and the thirty more),
 * as drawn light (ADR-064).
 *
 * The founder's direction (2026-08-07): the cards get imagery. The site's
 * laws stand: no image files, no client JS, every byte accounted for. So
 * the imagery is built the way the sphere was built — deterministic
 * geometry, computed once, rendered as inline SVG — each trade sketched
 * as a constellation: nodes, and the lines between them, catching light.
 * A roofline at dusk. A garden path. Paving in perspective. A panel
 * facing the sun. A wheel and the spanner that serves it. And for the
 * thirty trades unnamed, the network itself.
 *
 * Honesty by construction: this is drawn light in TITAN's own language —
 * unmistakably artwork. It depicts no job, no photograph, no customer's
 * work. Nothing here can be mistaken for evidence (ADR-059/DMCC), which
 * is precisely why it may decorate.
 *
 * Deterministic by construction: seeded PRNG per artwork, so every build
 * draws the same six pictures, byte for byte.
 */

export type TradeArtKind =
  | "roofing"
  | "landscaping"
  | "driveways"
  | "solar"
  | "motor"
  | "network";

export interface ArtPoint {
  x: number;
  y: number;
  /** radius in SVG units */
  r: number;
  /** opacity 0..1, quantised */
  o: number;
  /** palette group: 0 bright/near, 1 mid, 2 deep */
  g: 0 | 1 | 2;
}

export interface ArtStroke {
  /** path data */
  d: string;
  /** stroke opacity 0..1, quantised */
  o: number;
  /** stroke width in SVG units */
  w: number;
  /** bright strokes take the highlight colour */
  bright?: boolean;
}

export interface TradeArtScene {
  /** viewBox width/height — every card shares one stage */
  w: number;
  h: number;
  strokes: readonly ArtStroke[];
  points: readonly ArtPoint[];
}

const W = 200;
const H = 132;

const q = (n: number): number => Math.round(n * 100) / 100;
const qo = (n: number): number => Math.round(n * 100) / 100;

function makeRnd(seed: number): () => number {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** A polyline through the given vertices. */
function poly(pts: ReadonlyArray<readonly [number, number]>): string {
  return pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${q(x)} ${q(y)}`)
    .join("");
}

/** A quadratic curve a→b bowed toward its control point. */
function curve(
  a: readonly [number, number],
  c: readonly [number, number],
  b: readonly [number, number],
): string {
  return `M${q(a[0])} ${q(a[1])}Q${q(c[0])} ${q(c[1])} ${q(b[0])} ${q(b[1])}`;
}

/**
 * Nodes seeded along a segment — the constellation habit: geometry gets
 * its vertices lit, plus a little dust nearby so nothing reads as CAD.
 */
function seedAlong(
  rnd: () => number,
  out: ArtPoint[],
  a: readonly [number, number],
  b: readonly [number, number],
  n: number,
  g: 0 | 1 | 2,
  drift = 1.6,
): void {
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    out.push({
      x: q(a[0] + (b[0] - a[0]) * t + (rnd() - 0.5) * drift),
      y: q(a[1] + (b[1] - a[1]) * t + (rnd() - 0.5) * drift),
      r: q(0.9 + rnd() * 1.1),
      o: qo(0.45 + rnd() * 0.5),
      g,
    });
  }
}

/** A roofline at dusk — gable, slate courses, a lit ridge, weather coming. */
function roofing(): TradeArtScene {
  const rnd = makeRnd(20260807);
  const eaveL: readonly [number, number] = [26, 92];
  const apex: readonly [number, number] = [104, 34];
  const eaveR: readonly [number, number] = [178, 92];
  const strokes: ArtStroke[] = [
    // the gable itself — the ridge planes, bright: this is the picture
    { d: poly([eaveL, apex]), o: 0.85, w: 1.3, bright: true },
    { d: poly([apex, eaveR]), o: 0.85, w: 1.3, bright: true },
    // eaves
    { d: poly([[18, 96], [70, 96]]), o: 0.3, w: 0.9 },
    { d: poly([[138, 96], [186, 96]]), o: 0.3, w: 0.9 },
    // slate courses, left plane then right — parallel light
    { d: poly([[44, 92], [110, 44]]), o: 0.28, w: 0.8 },
    { d: poly([[62, 92], [118, 52]]), o: 0.22, w: 0.8 },
    { d: poly([[80, 92], [126, 60]]), o: 0.18, w: 0.8 },
    { d: poly([[98, 44], [166, 84]]), o: 0.28, w: 0.8 },
    { d: poly([[92, 54], [156, 90]]), o: 0.2, w: 0.8 },
    // the chimney, standing into the weather
    { d: poly([[132, 56], [132, 40], [144, 40], [144, 62]]), o: 0.5, w: 1 },
  ];
  const points: ArtPoint[] = [];
  seedAlong(rnd, points, eaveL, apex, 7, 0, 1.2);
  seedAlong(rnd, points, apex, eaveR, 7, 0, 1.2);
  seedAlong(rnd, points, [44, 92], [110, 44], 4, 1);
  seedAlong(rnd, points, [98, 44], [166, 84], 4, 1);
  // storm dust above the ridge — the season the trade is ready for
  for (let i = 0; i < 8; i++) {
    points.push({
      x: q(30 + rnd() * 150),
      y: q(12 + rnd() * 18),
      r: q(0.6 + rnd() * 0.7),
      o: qo(0.2 + rnd() * 0.3),
      g: 2,
    });
  }
  return { w: W, h: H, strokes, points };
}

/** A garden path to the light — borders, stepping stones, fronds. */
function landscaping(): TradeArtScene {
  const rnd = makeRnd(20260814);
  const strokes: ArtStroke[] = [
    // the path's two borders, curving away to the upper right
    { d: curve([54, 118], [96, 74], [148, 42]), o: 0.7, w: 1.2, bright: true },
    { d: curve([92, 122], [126, 84], [162, 50]), o: 0.55, w: 1 },
    // fronds, left bed — three blades of drawn grass
    { d: curve([34, 108], [30, 78], [46, 58]), o: 0.45, w: 0.9 },
    { d: curve([44, 112], [46, 82], [62, 66]), o: 0.38, w: 0.9 },
    { d: curve([26, 100], [18, 76], [28, 56]), o: 0.3, w: 0.9 },
    // fronds, right bed
    { d: curve([172, 96], [180, 72], [170, 54]), o: 0.35, w: 0.9 },
    { d: curve([160, 104], [170, 84], [184, 74]), o: 0.28, w: 0.9 },
    // the horizon the garden is planted against
    { d: poly([[10, 46], [78, 40]]), o: 0.16, w: 0.8 },
  ];
  const points: ArtPoint[] = [];
  // stepping stones down the path — brightest where the path begins
  const stones: ReadonlyArray<readonly [number, number]> = [
    [70, 112], [84, 98], [100, 84], [116, 71], [132, 60], [147, 50],
  ];
  stones.forEach(([x, y], i) => {
    points.push({ x: q(x), y: q(y), r: q(2.4 - i * 0.24), o: qo(0.85 - i * 0.09), g: 0 });
  });
  // foliage constellations over the beds
  for (let i = 0; i < 12; i++) {
    points.push({
      x: q(18 + rnd() * 52),
      y: q(56 + rnd() * 48),
      r: q(0.7 + rnd() * 1.0),
      o: qo(0.3 + rnd() * 0.4),
      g: 1,
    });
  }
  for (let i = 0; i < 7; i++) {
    points.push({
      x: q(152 + rnd() * 40),
      y: q(52 + rnd() * 44),
      r: q(0.6 + rnd() * 0.9),
      o: qo(0.25 + rnd() * 0.35),
      g: 2,
    });
  }
  return { w: W, h: H, strokes, points };
}

/** Paving in perspective — courses to a vanishing point, rain-washed. */
function driveways(): TradeArtScene {
  const rnd = makeRnd(20260821);
  const van: readonly [number, number] = [100, 34];
  const strokes: ArtStroke[] = [
    // the drive's edges, running to the vanishing point
    { d: poly([[24, 124], van]), o: 0.55, w: 1.1 },
    { d: poly([[176, 124], van]), o: 0.55, w: 1.1 },
    // block courses — nearer courses wider apart, as perspective has it
    { d: curve([38, 108], [100, 100], [162, 108]), o: 0.42, w: 0.9 },
    { d: curve([54, 88], [100, 82], [146, 88]), o: 0.34, w: 0.85 },
    { d: curve([66, 72], [100, 67], [134, 72]), o: 0.26, w: 0.8 },
    { d: curve([76, 59], [100, 55], [124, 59]), o: 0.2, w: 0.8 },
    { d: curve([84, 49], [100, 46], [116, 49]), o: 0.15, w: 0.8 },
    // the wet shine down the centre — the kerb-appeal light
    { d: curve([100, 122], [98, 84], [100, 40]), o: 0.5, w: 1.4, bright: true },
    // herringbone hints in the nearest course
    { d: poly([[62, 108], [74, 96]]), o: 0.3, w: 0.8 },
    { d: poly([[92, 110], [104, 98]]), o: 0.3, w: 0.8 },
    { d: poly([[124, 109], [136, 97]]), o: 0.3, w: 0.8 },
  ];
  const points: ArtPoint[] = [];
  // block corners lit along the two near courses
  seedAlong(rnd, points, [38, 108], [162, 108], 8, 1, 2.2);
  seedAlong(rnd, points, [54, 88], [146, 88], 6, 2, 1.8);
  // the shine, beaded with rain
  seedAlong(rnd, points, [100, 118], [100, 44], 6, 0, 2.6);
  return { w: W, h: H, strokes, points };
}

/** A panel meeting a low sun — the grid, the roof plane, the rays. */
function solar(): TradeArtScene {
  const rnd = makeRnd(20260828);
  // the panel: a parallelogram pitched like a roof plane
  const A: readonly [number, number] = [58, 102];
  const B: readonly [number, number] = [108, 52];
  const C: readonly [number, number] = [180, 66];
  const D: readonly [number, number] = [132, 118];
  const lerp = (
    p: readonly [number, number],
    r: readonly [number, number],
    t: number,
  ): readonly [number, number] => [p[0] + (r[0] - p[0]) * t, p[1] + (r[1] - p[1]) * t];
  const strokes: ArtStroke[] = [
    { d: poly([A, B, C, D, A]), o: 0.75, w: 1.2, bright: true },
    // cell grid — two lines each way
    { d: poly([lerp(A, B, 1 / 3), lerp(D, C, 1 / 3)]), o: 0.3, w: 0.8 },
    { d: poly([lerp(A, B, 2 / 3), lerp(D, C, 2 / 3)]), o: 0.3, w: 0.8 },
    { d: poly([lerp(A, D, 1 / 3), lerp(B, C, 1 / 3)]), o: 0.3, w: 0.8 },
    { d: poly([lerp(A, D, 2 / 3), lerp(B, C, 2 / 3)]), o: 0.3, w: 0.8 },
    // the sun, low and left — five rays
    { d: poly([[26, 22], [26, 10]]), o: 0.5, w: 1 },
    { d: poly([[13, 35], [3, 30]]), o: 0.42, w: 1 },
    { d: poly([[39, 35], [49, 30]]), o: 0.42, w: 1 },
    { d: poly([[16, 22], [8, 15]]), o: 0.35, w: 1 },
    { d: poly([[36, 22], [44, 15]]), o: 0.35, w: 1 },
    // the light's path from sun to panel — the whole point of the trade
    { d: poly([[34, 40], [86, 70]]), o: 0.22, w: 0.9 },
  ];
  const points: ArtPoint[] = [
    // the sun itself
    { x: 26, y: 30, r: 4.2, o: 0.95, g: 0 },
    // the glint where the light lands
    { x: q(88.5), y: q(71.5), r: 2.2, o: 0.9, g: 0 },
  ];
  seedAlong(rnd, points, A, B, 4, 1, 1.0);
  seedAlong(rnd, points, B, C, 4, 1, 1.0);
  seedAlong(rnd, points, [34, 40], [86, 70], 4, 2, 2.0);
  return { w: W, h: H, strokes, points };
}

/** A wheel and its spanner — the bay, kept full. */
function motor(): TradeArtScene {
  const rnd = makeRnd(20260904);
  const cx = 66;
  const cy = 74;
  const R = 30;
  const hub = 9;
  const strokes: ArtStroke[] = [
    // rim and hub
    {
      d: `M${cx + R} ${cy}A${R} ${R} 0 1 1 ${cx - R} ${cy}A${R} ${R} 0 1 1 ${cx + R} ${cy}`,
      o: 0.8,
      w: 1.3,
      bright: true,
    },
    {
      d: `M${cx + hub} ${cy}A${hub} ${hub} 0 1 1 ${cx - hub} ${cy}A${hub} ${hub} 0 1 1 ${cx + hub} ${cy}`,
      o: 0.45,
      w: 1,
    },
  ];
  // five spokes
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    strokes.push({
      d: poly([
        [cx + Math.cos(a) * (hub + 2), cy + Math.sin(a) * (hub + 2)],
        [cx + Math.cos(a) * (R - 3), cy + Math.sin(a) * (R - 3)],
      ]),
      o: 0.35,
      w: 0.9,
    });
  }
  // the spanner: shaft to an open jaw over the wheel's shoulder
  strokes.push({ d: poly([[118, 112], [154, 62]]), o: 0.6, w: 1.6 });
  strokes.push({
    d: `M148 54A11 11 0 1 1 166 64`,
    o: 0.6,
    w: 1.6,
  });
  const points: ArtPoint[] = [];
  // rim nodes — the wheel's constellation
  for (let i = 0; i < 10; i++) {
    const a = (i * 2 * Math.PI) / 10 + 0.3;
    points.push({
      x: q(cx + Math.cos(a) * R),
      y: q(cy + Math.sin(a) * R),
      r: q(1.0 + rnd() * 0.8),
      o: qo(0.5 + rnd() * 0.4),
      g: i % 3 === 0 ? 0 : 1,
    });
  }
  points.push({ x: cx, y: cy, r: 2.2, o: 0.9, g: 0 });
  // the jaw's working corners
  points.push({ x: 148, y: 54, r: 1.6, o: 0.8, g: 0 });
  points.push({ x: 166, y: 64, r: 1.6, o: 0.8, g: 0 });
  seedAlong(rnd, points, [118, 112], [154, 62], 3, 2, 1.4);
  return { w: W, h: H, strokes, points };
}

/** The network itself — for the thirty trades the cards don't name. */
function network(): TradeArtScene {
  const rnd = makeRnd(20260911);
  const nodes: Array<readonly [number, number]> = [];
  for (let i = 0; i < 11; i++) {
    nodes.push([16 + rnd() * 168, 22 + rnd() * 92]);
  }
  const strokes: ArtStroke[] = [];
  // chords between near neighbours — everything connected, nothing forced
  for (let i = 0; i < nodes.length; i++) {
    let best = -1;
    let bd = Infinity;
    let second = -1;
    let sd = Infinity;
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const d =
        (nodes[i][0] - nodes[j][0]) ** 2 + (nodes[i][1] - nodes[j][1]) ** 2;
      if (d < bd) {
        second = best;
        sd = bd;
        best = j;
        bd = d;
      } else if (d < sd) {
        second = j;
        sd = d;
      }
    }
    if (best > i) {
      strokes.push({ d: poly([nodes[i], nodes[best]]), o: qo(0.2 + rnd() * 0.2), w: 0.8 });
    }
    if (second > i && rnd() > 0.45) {
      strokes.push({ d: poly([nodes[i], nodes[second]]), o: qo(0.12 + rnd() * 0.14), w: 0.8 });
    }
  }
  // one long bright thread — the through-line
  strokes.push({ d: curve([12, 106], [92, 46], [188, 78]), o: 0.4, w: 1.1, bright: true });
  const points: ArtPoint[] = nodes.map(([x, y], i) => ({
    x: q(x),
    y: q(y),
    r: q(1.2 + rnd() * 1.4),
    o: qo(0.5 + rnd() * 0.45),
    g: (i % 3) as 0 | 1 | 2,
  }));
  return { w: W, h: H, strokes, points };
}

const BUILDERS: Record<TradeArtKind, () => TradeArtScene> = {
  roofing,
  landscaping,
  driveways,
  solar,
  motor,
  network,
};

/** Deterministic scene per kind: same seed, same drawing, every build. */
export function buildTradeArt(kind: TradeArtKind): TradeArtScene {
  return BUILDERS[kind]();
}

export const TRADE_ART_KINDS = Object.keys(BUILDERS) as readonly TradeArtKind[];
