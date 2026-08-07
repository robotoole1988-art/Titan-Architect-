/**
 * The OS sphere — TITAN's public hero, as deterministic geometry (ADR-064).
 *
 * The founder approved the networked-globe hero on 2026-08-06. The company
 * site ships no client component and no image by law
 * (tests/features/company-site/honesty-law.test.tsx), so the sphere is not
 * a canvas and not a PNG: it is computed here, once, as pure data, and
 * rendered as inline SVG by a server component. Same silhouette as the
 * approved prototype — a fibonacci shell, long network chords across the
 * face, short surface links, a hot core — at a point count sized for
 * markup, not for a render loop.
 *
 * Deterministic by construction (seeded PRNG, fixed pose): every build of
 * the page draws the same sphere, byte for byte. Motion is the renderer's
 * concern and is CSS-only.
 */

export interface SpherePoint {
  x: number;
  y: number;
  /** radius in SVG units */
  r: number;
  /** opacity 0..1, quantised */
  o: number;
  /** palette group: 0 bright/near, 1 mid blue, 2 deep */
  g: 0 | 1 | 2;
}

export interface SphereScene {
  /** viewBox width/height */
  w: number;
  h: number;
  cx: number;
  cy: number;
  /** sphere scale in SVG units */
  s: number;
  daisY: number;
  /** points behind the sphere's equator plane, drawn first */
  back: readonly SpherePoint[];
  /** points on the viewer's side */
  front: readonly SpherePoint[];
  /** short surface links, split into two shimmer groups (path d) */
  linksA: string;
  linksB: string;
  /** long chords across the face — "everything connected" */
  chords: string;
}

/** Deterministic scene: same seed, same sphere, every build. */
export function buildSphereScene(): SphereScene {
  let seed = 20260807;
  const rnd = (): number => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const W = 780;
  const H = 700;
  const CX = 390;
  const CY = 300;
  const S = 205;
  const DAIS_Y = 580;

  // ---- unit-sphere cloud -----------------------------------------------
  interface Raw {
    x: number;
    y: number;
    z: number;
    m: number;
    shell: boolean;
  }
  const raw: Raw[] = [];
  const SHELL = 520;
  for (let i = 0; i < SHELL; i++) {
    const y = 1 - (i / (SHELL - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const t = i * 2.39996323;
    const jit = 1 + (rnd() - 0.5) * 0.02;
    raw.push({
      x: Math.cos(t) * r * jit,
      y: y * jit,
      z: Math.sin(t) * r * jit,
      m: 0.55 + rnd() * 0.9,
      shell: true,
    });
  }
  for (let i = 0; i < 70; i++) {
    const u = rnd() * 2 - 1;
    const th = rnd() * 6.28;
    const rr = Math.cbrt(rnd()) * 0.66;
    const sq = Math.sqrt(1 - u * u);
    raw.push({
      x: Math.cos(th) * sq * rr,
      y: u * rr,
      z: Math.sin(th) * sq * rr,
      m: 0.35 + rnd() * 0.5,
      shell: false,
    });
  }

  // ---- fixed pose projection -------------------------------------------
  const ROT = -0.5;
  const sinT = Math.sin(ROT);
  const cosT = Math.cos(ROT);
  const px = (n: number): number => Math.round(n * 10) / 10;

  interface Projected extends SpherePoint {
    z: number;
  }
  const projected: Projected[] = raw.map((p) => {
    const x = p.x * cosT - p.z * sinT;
    const z = p.x * sinT + p.z * cosT;
    const d = 1 / (1.85 - z * 0.6);
    const sx = px(CX + x * S * 1.9 * d);
    const sy = px(CY + p.y * S * 1.75 * d);
    const r = px((1.6 + p.m * 2.6) * d * (p.shell ? 1 : 0.75));
    const o = Math.round(Math.min(1, 0.32 + d * 0.55) * 100) / 100;
    const g: 0 | 1 | 2 = z > 0.25 ? 0 : z < -0.25 ? 2 : 1;
    return { x: sx, y: sy, r, o, g, z };
  });

  const back = projected.filter((p) => p.z < 0).map(strip);
  const front = projected.filter((p) => p.z >= 0).map(strip);

  // ---- short surface links ---------------------------------------------
  const shellPts = projected.slice(0, SHELL);
  const seen = new Set<string>();
  const segsA: string[] = [];
  const segsB: string[] = [];
  for (let i = 0; i < SHELL; i++) {
    const a = raw[i];
    let best = -1;
    let bd = 1e9;
    for (let k = 0; k < 16; k++) {
      const j = (i + 7 + ((k * 127) % (SHELL - 1))) % SHELL;
      const b = raw[j];
      const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
      if (d < bd && d > 0.004) {
        bd = d;
        best = j;
      }
    }
    if (best >= 0 && bd < 0.06) {
      const key = i < best ? `${i}-${best}` : `${best}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const p = shellPts[i];
      const q = shellPts[best];
      (segsA.length <= segsB.length ? segsA : segsB).push(
        `M${p.x} ${p.y}L${q.x} ${q.y}`,
      );
    }
  }

  // ---- long chords across the globe ------------------------------------
  const chordSegs: string[] = [];
  let guard = 0;
  while (chordSegs.length < 120 && guard < 6000) {
    guard++;
    const i = Math.floor(rnd() * SHELL);
    const j = Math.floor(rnd() * SHELL);
    if (i === j) continue;
    const a = raw[i];
    const b = raw[j];
    const dot = a.x * b.x + a.y * b.y + a.z * b.z;
    if (dot > 0.9 || dot < 0.2) continue; // 26°–78° apart
    const p = shellPts[i];
    const q = shellPts[j];
    chordSegs.push(`M${p.x} ${p.y}L${q.x} ${q.y}`);
  }

  return {
    w: W,
    h: H,
    cx: CX,
    cy: CY,
    s: S,
    daisY: DAIS_Y,
    back,
    front,
    linksA: segsA.join(""),
    linksB: segsB.join(""),
    chords: chordSegs.join(""),
  };
}

function strip(p: SpherePoint & { z: number }): SpherePoint {
  return { x: p.x, y: p.y, r: p.r, o: p.o, g: p.g };
}
