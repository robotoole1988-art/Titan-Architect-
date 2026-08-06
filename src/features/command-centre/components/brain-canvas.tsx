"use client";

/**
 * The Brain (ADR-057) — the anatomical engine, ported from the room
 * prototype the founder approved on 2026-08-06 ("that brain looks
 * amazing").
 *
 * Canvas 2D: a side-profile cortex polygon filled with ~7.5k pre-rendered
 * glow sprites that cluster along cortical fold ridges, a cerebellum and
 * brainstem, precomputed synapse links, additive compositing, a white-hot
 * core, cursor-follow rotation and cursor-proximity flare. Layout is
 * deterministic (seeded PRNG) so the room looks the same on every visit;
 * the mass is re-centred on its true centre of mass so the cerebellum
 * cannot drag it off-axis (the founder caught exactly that, 2026-08-06).
 *
 * Pauses when the tab hides; prefers-reduced-motion renders one calm
 * static frame and never starts the loop. The alert palette warms the
 * sprites when any department bands red.
 */

import { useEffect, useRef } from "react";

interface BrainPoint {
  x: number;
  y: number;
  z: number;
  /** brightness mass */
  m: number;
  /** twinkle phase */
  tw: number;
  /** cortical ridge weight 0..1 — ridges glow brighter than valleys */
  ridge: number;
}

interface Projected {
  sx: number;
  sy: number;
  d: number;
  m: number;
  tw: number;
  z: number;
  ridge: number;
  near: number;
}

type Poly = ReadonlyArray<readonly [number, number]>;

/** Side-profile cortex silhouette (facing left), unit-ish coordinates. */
const CORTEX: Poly = [
  [-0.78, -0.06], [-0.76, -0.26], [-0.62, -0.44], [-0.4, -0.56], [-0.12, -0.62],
  [0.16, -0.6], [0.42, -0.52], [0.62, -0.36], [0.72, -0.16], [0.72, 0.02],
  [0.62, 0.14], [0.44, 0.2], [0.2, 0.26], [-0.06, 0.3], [-0.32, 0.3],
  [-0.56, 0.26], [-0.72, 0.14],
];

/** The cerebellum, tucked under the occipital curve. */
const CEREB: Poly = [
  [0.3, 0.26], [0.44, 0.2], [0.58, 0.22], [0.66, 0.32], [0.62, 0.44],
  [0.5, 0.5], [0.36, 0.48], [0.28, 0.38],
];

function inPoly(x: number, y: number, poly: Poly): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Depth of the mass at (x, y): fat in the middle, thin at the edges. */
function depthAt(x: number, y: number): number {
  const e = 1 - ((x + 0.03) / 0.78) ** 2 - ((y + 0.16) / 0.5) ** 2;
  return Math.max(0.06, 0.52 * Math.sqrt(Math.max(0, e)));
}

/** Cortical fold field — points cluster into wavy ridge cords. */
function fold(x: number, y: number, z: number): number {
  return Math.sin(x * 16 + Math.sin(y * 7) * 2.2 + z * 5) * Math.cos(y * 13 + x * 5);
}

/** Deterministic layout: same seed, same brain, every visit. */
function buildPoints(): BrainPoint[] {
  let seed = 20260806;
  const rnd = (): number => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const points: BrainPoint[] = [];
  const scatter = (count: number, poly: Poly, bright: number): void => {
    let placed = 0;
    let guard = 0;
    while (placed < count && guard < count * 40) {
      guard++;
      const x = (rnd() * 2 - 1) * 0.85;
      const y = (rnd() * 2 - 1) * 0.75;
      if (!inPoly(x, y, poly)) continue;
      const depth = depthAt(x, y);
      const z = (rnd() < 0.5 ? -1 : 1) * depth * Math.pow(rnd(), 0.3);
      const ridge = Math.abs(fold(x, y, z));
      if (ridge < 0.3 && rnd() < 0.72) continue; // valleys stay sparse
      points.push({
        x,
        y,
        z,
        m: (0.7 + rnd() * 1.0) * bright,
        tw: rnd() * Math.PI * 2,
        ridge,
      });
      placed++;
    }
  };

  scatter(6200, CORTEX, 1);
  scatter(1100, CEREB, 0.9);
  // brainstem cord
  for (let i = 0; i < 180; i++) {
    const t = rnd();
    points.push({
      x: 0.16 - t * 0.1 + (rnd() - 0.5) * 0.05,
      y: 0.3 + t * 0.28 + (rnd() - 0.5) * 0.03,
      z: (rnd() - 0.5) * 0.1,
      m: 0.6 + rnd() * 0.6,
      tw: rnd() * 6.28,
      ridge: 0.4,
    });
  }

  // Self-centre: HORIZONTAL by bounding-box midpoint — what the eye reads
  // as centred. Centroid centring left the silhouette hanging left of the
  // room's axis (the founder caught it twice): the cerebellum side is
  // denser, so the centre of mass sits right of the shape's middle.
  // VERTICAL stays centre-of-mass — the thin brainstem would skew a y-bbox.
  let minX = Infinity;
  let maxX = -Infinity;
  let my = 0;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    my += p.y;
  }
  const mx = (minX + maxX) / 2;
  my /= points.length;
  for (const p of points) {
    p.x -= mx;
    p.y -= my;
  }
  return points;
}

/** Nearest-neighbour synapse links over a deterministic probe pattern. */
function buildLinks(points: readonly BrainPoint[]): Array<[number, number]> {
  const links: Array<[number, number]> = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    let best = -1;
    let bd = 1e9;
    for (let k = 0; k < 20; k++) {
      const j = (i + 11 + ((k * 131) % (points.length - 1))) % points.length;
      const b = points[j];
      const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
      if (d < bd && d > 0.0008) {
        bd = d;
        best = j;
      }
    }
    if (best >= 0 && bd < 0.02) links.push([i, best]);
  }
  return links;
}

function makeSprite(hex: string): HTMLCanvasElement {
  const sprite = document.createElement("canvas");
  sprite.width = 64;
  sprite.height = 64;
  const g = sprite.getContext("2d")!;
  const gradient = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.22, `${hex}ee`);
  gradient.addColorStop(0.55, `${hex}55`);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gradient;
  g.fillRect(0, 0, 64, 64);
  return sprite;
}

export function BrainCanvas({ alert = false }: { alert?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const points = buildPoints();
    const links = buildLinks(points);

    // Palette: cold blue-white intelligence; warmed when a department reds.
    const spBase = makeSprite(alert ? "#ff9a5c" : "#5b96ff");
    const spNear = makeSprite(alert ? "#ffd2a8" : "#a8dbff");
    const spDeep = makeSprite(alert ? "#e8722f" : "#3566e8");
    const linkTint = alert ? "255,170,120" : "110,160,255";
    const ambient0 = alert ? "rgba(205,96,40,0.30)" : "rgba(52,96,210,0.34)";
    const ambient1 = alert ? "rgba(96,40,18,0.12)" : "rgba(20,38,95,0.12)";
    const coreMid = alert ? "rgba(255,205,160,0.5)" : "rgba(160,200,255,0.5)";

    let raf = 0;
    let rot = 0;
    const cursor = { x: -1e4, y: -1e4, tx: 0, active: false };

    function size(): void {
      canvas!.width = window.innerWidth * DPR;
      canvas!.height = window.innerHeight * DPR;
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
    }
    size();

    function drawFrame(now: number): void {
      const W = canvas!.width;
      const H = canvas!.height;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, W, H);

      // ambient room glow
      const amb = ctx!.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, H * 0.6);
      amb.addColorStop(0, ambient0);
      amb.addColorStop(0.55, ambient1);
      amb.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.fillStyle = amb;
      ctx!.fillRect(0, 0, W, H);

      // cursor-follow rotation, eased, with a slow idle sway
      const want = (cursor.active ? cursor.tx : 0) + Math.sin(now / 9000) * 0.06;
      rot += (want - rot) * 0.04;
      const sinT = Math.sin(rot);
      const cosT = Math.cos(rot);

      const cx = W * 0.5;
      const cy = H * 0.42;
      const S = H * 0.46;
      const R2 = (150 * DPR) ** 2;

      const pr: Projected[] = points.map((p) => {
        const x = p.x * cosT - p.z * sinT;
        const z = p.x * sinT + p.z * cosT;
        const depth = 1 / (1.55 - z * 0.5);
        const sx = cx + x * S * depth;
        const sy = cy + p.y * S * depth;
        const dxc = sx - cursor.x;
        const dyc = sy - cursor.y;
        const near = Math.max(0, 1 - (dxc * dxc + dyc * dyc) / R2);
        return { sx, sy, d: depth, m: p.m, tw: p.tw, z, ridge: p.ridge, near };
      });

      ctx!.globalCompositeOperation = "lighter";

      // synapse links — flare near the cursor
      ctx!.lineWidth = DPR * 0.55;
      for (const [i, j] of links) {
        const a = pr[i];
        const b = pr[j];
        const flare = Math.max(a.near, b.near);
        const alpha = 0.13 + 0.24 * Math.max(0, (a.z + b.z) / 2 + 0.4) + flare * 0.5;
        ctx!.strokeStyle = `rgba(${linkTint},${Math.min(0.9, alpha).toFixed(3)})`;
        ctx!.beginPath();
        ctx!.moveTo(a.sx, a.sy);
        ctx!.lineTo(b.sx, b.sy);
        ctx!.stroke();
      }

      // the mass itself
      const tsec = now / 1000;
      for (const q of pr) {
        const twinkle = 0.8 + 0.2 * Math.sin(tsec * 1.4 + q.tw);
        const ridgeBoost = 0.7 + q.ridge * 0.9;
        const sz = (3.0 + q.m * 4.8) * q.d * DPR * twinkle * (1 + q.near * 1.1);
        const sprite =
          q.near > 0.15 ? spNear : q.z > 0.2 ? spNear : q.z < -0.2 ? spDeep : spBase;
        ctx!.globalAlpha = Math.min(
          1,
          (0.55 + q.d * 0.55) * twinkle * ridgeBoost + q.near * 0.4,
        );
        ctx!.drawImage(sprite, q.sx - sz / 2, q.sy - sz / 2, sz, sz);
      }
      ctx!.globalAlpha = 1;

      // white-hot core, on the room's axis — any horizontal offset here
      // reads as the whole brain sitting off-centre
      const kx = cx;
      const ky = cy - S * 0.05;
      const core = ctx!.createRadialGradient(kx, ky, 0, kx, ky, S * 0.3);
      core.addColorStop(0, "rgba(245,250,255,0.95)");
      core.addColorStop(0.28, coreMid);
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.fillStyle = core;
      ctx!.beginPath();
      ctx!.arc(kx, ky, S * 0.3, 0, 7);
      ctx!.fill();

      ctx!.globalCompositeOperation = "source-over";
    }

    function frame(now: number): void {
      drawFrame(now);
      raf = requestAnimationFrame(frame);
    }

    const onPointerMove = (event: PointerEvent) => {
      cursor.x = event.clientX * DPR;
      cursor.y = event.clientY * DPR;
      cursor.tx = (event.clientX / window.innerWidth - 0.5) * 0.55;
      cursor.active = true;
    };
    const onPointerGone = () => {
      cursor.active = false;
      cursor.x = -1e4;
      cursor.y = -1e4;
    };
    const onResize = () => {
      size();
      if (reduced) drawFrame(0);
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        raf = requestAnimationFrame(frame);
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    document.addEventListener("mouseleave", onPointerGone);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced) {
      // one calm, complete frame — the room is still, not broken
      drawFrame(0);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerGone);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [alert]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      data-command-centre-brain
    />
  );
}
