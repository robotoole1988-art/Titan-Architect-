"use client";

/**
 * The particle Brain (ADR-057) — ported from the approved v5 prototype
 * (docs/experience/prototypes/titan-opening-v5.html).
 *
 * Canvas 2D, requestAnimationFrame, DPR-aware (capped at 2). The Brain
 * breathes, slowly rotates, and morphs between four particle shapes;
 * inbound motes stream toward it labelled ONLY with subsystems that really
 * exist (Honesty Law — no "Google"/"Meta" streams until those integrations
 * do). Pauses when the tab is hidden; prefers-reduced-motion renders one
 * static frame and never starts the loop. Budget: well under 4ms/frame on a
 * mid-range laptop — dots are fillRect, not arc.
 */

import { useEffect, useRef } from "react";

const PARTICLES = 700;
const STREAM_SOURCES = [
  "Website",
  "Enquiries",
  "Builds",
  "Reviews",
  "Measurement",
  "CRM",
];

type Vec3 = [number, number, number];

function fib(i: number, n: number): Vec3 {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (i / (n - 1)) * 2;
  const r = Math.sqrt(1 - y * y);
  const t = golden * i;
  return [Math.cos(t) * r, y, Math.sin(t) * r];
}

const SHAPES: Array<(i: number) => Vec3> = [
  (i) => fib(i, PARTICLES),
  (i) => {
    // neural clusters
    const c = i % 14;
    const cc = fib((c * 61) % PARTICLES, PARTICLES);
    const j = fib(i, PARTICLES);
    return [cc[0] * 0.75 + j[0] * 0.3, cc[1] * 0.75 + j[1] * 0.3, cc[2] * 0.75 + j[2] * 0.3];
  },
  (i) => {
    // two-lobed brain
    let [x, y, z] = fib(i, PARTICLES);
    const s = x < 0 ? -1 : 1;
    x = x * 0.72 + s * 0.34;
    y *= 0.82;
    z *= 1.05;
    const w = Math.sin(y * 9 + z * 7) * 0.05;
    return [x + w, y + Math.sin(x * 8) * 0.05, z + w];
  },
  (i) => {
    // energy coil
    const a = (i / PARTICLES) * Math.PI * 14;
    const r2 = 0.55 + 0.4 * Math.sin(i * 0.7);
    return [Math.cos(a) * r2, (i / PARTICLES - 0.5) * 1.5 * Math.sin(a * 0.33), Math.sin(a) * r2];
  },
];

interface Particle {
  x: number; y: number; z: number;
  tx: number; ty: number; tz: number;
  ph: number;
}

interface Mote {
  sx: number; sy: number; t: number; sp: number;
  label: string | null; c: number;
}

export function BrainCanvas({ alert = false }: { alert?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.getContext("2d");
    if (!cx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, CX = 0, CY = 0, R = 0;
    let raf = 0;
    let time = 0;
    let flare = 0;
    let shapeIx = 0;
    let mx = window.innerWidth / 2;

    const tint: Vec3 = alert ? [240, 170, 100] : [130, 175, 255];

    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLES; i++) {
      const s = SHAPES[0](i);
      particles.push({ x: s[0], y: s[1], z: s[2], tx: s[0], ty: s[1], tz: s[2], ph: (i * 2654435761) % 7 });
    }

    const motes: Mote[] = [];
    let moteSeed = 1;
    function rand(): number {
      // deterministic-ish LCG so the room looks the same on every visit
      moteSeed = (moteSeed * 1664525 + 1013904223) % 4294967296;
      return moteSeed / 4294967296;
    }
    function spawnMote(initialT = 0): void {
      const edge = Math.floor(rand() * 3);
      const s = rand();
      const sx = edge === 0 ? -0.02 : edge === 1 ? 1.02 : 0.1 + s * 0.8;
      const sy = edge === 2 ? -0.02 : 0.15 + s * 0.7;
      motes.push({
        sx, sy, t: initialT,
        sp: 0.004 + rand() * 0.004,
        label: rand() < 0.2 ? STREAM_SOURCES[Math.floor(rand() * STREAM_SOURCES.length)] : null,
        c: rand() - 0.5,
      });
    }
    for (let i = 0; i < 9; i++) spawnMote(rand());

    function size(): void {
      W = canvas!.width = window.innerWidth * DPR;
      H = canvas!.height = window.innerHeight * DPR;
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      CX = W / 2;
      CY = H * 0.27;
      R = Math.min(W, H) * 0.105;
    }
    size();

    function drawFrame(): void {
      cx!.clearRect(0, 0, W, H);
      const breathe = 1 + Math.sin(time * 1.05) * 0.05;
      const rr = R * breathe * (1 + flare * 0.12);
      const rot = time * 0.22 + ((mx / window.innerWidth) - 0.5) * 0.35;

      // ambient halo
      const halo = cx!.createRadialGradient(CX, CY, 0, CX, CY, rr * 3.4);
      halo.addColorStop(0, `rgba(${tint[0]},${tint[1]},${tint[2]},${0.13 + flare * 0.12})`);
      halo.addColorStop(0.55, `rgba(${tint[0]},${tint[1]},${tint[2]},0.04)`);
      halo.addColorStop(1, "rgba(0,0,0,0)");
      cx!.fillStyle = halo;
      cx!.beginPath();
      cx!.arc(CX, CY, rr * 3.4, 0, 7);
      cx!.fill();

      // inbound data motes
      for (let i = motes.length - 1; i >= 0; i--) {
        const p = motes[i];
        p.t += p.sp;
        if (p.t >= 1) {
          motes.splice(i, 1);
          flare = Math.min(1, flare + 0.08);
          continue;
        }
        const e = 1 - (1 - p.t) * (1 - p.t);
        const sx = p.sx * W;
        const sy = p.sy * H;
        const midX = (sx + CX) / 2 + (sy - CY) * p.c * 0.4;
        const midY = (sy + CY) / 2 - (sx - CX) * p.c * 0.4;
        const x = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * midX + e * e * CX;
        const y = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * midY + e * e * CY;
        cx!.globalAlpha = Math.min(1, p.t * 4) * 0.85;
        cx!.fillStyle = "#79e6ea";
        cx!.fillRect(x - DPR, y - DPR, 2.4 * DPR, 2.4 * DPR);
        if (p.label && p.t < 0.4) {
          cx!.globalAlpha = 0.5 * (1 - p.t * 2.2);
          cx!.fillStyle = "#7d93b8";
          cx!.font = `${10 * DPR}px ui-sans-serif, system-ui, sans-serif`;
          cx!.fillText(p.label, x + 7 * DPR, y + 3 * DPR);
        }
      }

      // the Brain
      const ca = Math.cos(rot);
      const sa = Math.sin(rot);
      for (const p of particles) {
        p.x += (p.tx - p.x) * 0.028;
        p.y += (p.ty - p.y) * 0.028;
        p.z += (p.tz - p.z) * 0.028;
        const x3 = p.x * ca - p.z * sa;
        const z3 = p.x * sa + p.z * ca;
        const depth = (z3 + 1.6) / 2.6;
        const j = Math.sin(time * 2 + p.ph) * 0.008;
        const X = CX + (x3 + j) * rr * 1.35;
        const Y = CY + (p.y + j) * rr * 1.15;
        cx!.globalAlpha = (0.12 + depth * 0.55) * (1 + flare * 0.5);
        cx!.fillStyle = depth > 0.72 ? "#eef4ff" : `rgb(${tint[0]},${tint[1]},${tint[2]})`;
        const size2 = (0.6 + depth * 1.1) * DPR * 1.6;
        cx!.fillRect(X - size2 / 2, Y - size2 / 2, size2, size2);
      }

      // core
      cx!.globalAlpha = 0.45 + 0.3 * Math.sin(time * 1.8) + flare * 0.4;
      const core = cx!.createRadialGradient(CX, CY, 0, CX, CY, rr * 0.4);
      core.addColorStop(0, "rgba(255,255,255,0.85)");
      core.addColorStop(1, "rgba(255,255,255,0)");
      cx!.fillStyle = core;
      cx!.beginPath();
      cx!.arc(CX, CY, rr * 0.4, 0, 7);
      cx!.fill();
      cx!.globalAlpha = 1;
    }

    function frame(): void {
      time += 1 / 60;
      flare *= 0.965;
      if (motes.length < 14 && rand() < 0.03) spawnMote();
      drawFrame();
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => {
      size();
      if (reduced) drawFrame();
    };
    const onMouse = (event: MouseEvent) => {
      mx = event.clientX;
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        raf = requestAnimationFrame(frame);
      }
    };
    const morph = window.setInterval(() => {
      if (document.hidden || reduced) return;
      shapeIx = (shapeIx + 1) % SHAPES.length;
      const shape = SHAPES[shapeIx];
      for (let i = 0; i < PARTICLES; i++) {
        const t = shape(i);
        particles[i].tx = t[0];
        particles[i].ty = t[1];
        particles[i].tz = t[2];
      }
    }, 8500);

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouse);
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced) {
      // one calm, complete frame — the room is still, not broken
      time = 2;
      drawFrame();
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(morph);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
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
