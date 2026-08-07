"use client";

import { useEffect, useRef } from "react";

/**
 * The living sphere (ADR-064, amended by the founder 2026-08-07) — the one
 * JavaScript island on TITAN's public site.
 *
 * The zero-JS law stood until the founder judged the still hero live and
 * sanctioned exactly this: the approved lab engine, as ONE budgeted client
 * component. The honesty-law suite enforces the cap — this file alone may
 * carry "use client", and its source stays under the byte ceiling.
 *
 * Contract with the still: the server renders the SVG sphere first (H1
 * before either), this canvas mounts over it, and only when the engine is
 * actually running does the still fade — so no-JS, reduced-motion and the
 * first paint all show the designed image, never a hole.
 */

interface P { x: number; y: number; z: number; m: number; tw: number; sh: boolean }

export function SphereIsland() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
    wrap.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) { wrap.removeChild(canvas); return; }

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    const fit = (): void => {
      const r = wrap.getBoundingClientRect();
      W = canvas.width = Math.max(1, Math.round(r.width * DPR));
      H = canvas.height = Math.max(1, Math.round(r.height * DPR));
    };
    fit();

    let seed = 20260807;
    const rnd = (): number => (seed = (seed * 16807) % 2147483647) / 2147483647;

    const pts: P[] = [];
    const N = 2600;
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const t = i * 2.39996323;
      const j = 1 + (rnd() - 0.5) * 0.015;
      pts.push({ x: Math.cos(t) * r * j, y: y * j, z: Math.sin(t) * r * j, m: 0.55 + rnd() * 0.9, tw: rnd() * 6.28, sh: true });
    }
    for (let i = 0; i < 280; i++) {
      const u = rnd() * 2 - 1, th = rnd() * 6.28, rr = Math.cbrt(rnd()) * 0.68;
      const s = Math.sqrt(1 - u * u);
      pts.push({ x: Math.cos(th) * s * rr, y: u * rr, z: Math.sin(th) * s * rr, m: 0.35 + rnd() * 0.5, tw: rnd() * 6.28, sh: false });
    }
    const links: Array<[number, number]> = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      let best = -1, bd = 1e9;
      for (let k = 0; k < 18; k++) {
        const j = (i + 7 + ((k * 127) % (pts.length - 1))) % pts.length;
        const b = pts[j];
        if (a.sh !== b.sh) continue;
        const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
        if (d < bd && d > 0.0006) { bd = d; best = j; }
      }
      if (best >= 0 && bd < 0.018) links.push([i, best]);
    }
    const arcs: Array<[number, number]> = [];
    let g = 0;
    while (arcs.length < 230 && g < 8000) {
      g++;
      const i = Math.floor(rnd() * N), j = Math.floor(rnd() * N);
      if (i === j) continue;
      const a = pts[i], b = pts[j];
      const dot = a.x * b.x + a.y * b.y + a.z * b.z;
      if (dot > 0.92 || dot < 0.15) continue;
      arcs.push([i, j]);
    }
    const sprite = (hex: string): HTMLCanvasElement => {
      const s = document.createElement("canvas");
      s.width = s.height = 64;
      const q = s.getContext("2d")!;
      const gr = q.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, "rgba(255,255,255,1)");
      gr.addColorStop(0.22, `${hex}ee`);
      gr.addColorStop(0.55, `${hex}55`);
      gr.addColorStop(1, "rgba(0,0,0,0)");
      q.fillStyle = gr;
      q.fillRect(0, 0, 64, 64);
      return s;
    };
    const SA = sprite("#5b96ff"), SB = sprite("#a8dbff"), SC = sprite("#3566e8");

    const cur = { x: -1e4, y: -1e4, tx: 0, on: false };
    const onMove = (e: PointerEvent): void => {
      const r = wrap.getBoundingClientRect();
      cur.x = (e.clientX - r.left) * DPR;
      cur.y = (e.clientY - r.top) * DPR;
      cur.tx = (e.clientX / window.innerWidth - 0.5) * 0.5;
      cur.on = true;
    };
    const onGone = (): void => { cur.on = false; cur.x = -1e4; };

    let rot = 0, raf = 0;
    const frame = (now: number): void => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const CX = W * 0.5, CY = H * 0.44, S = H * 0.32;

      const amb = ctx.createRadialGradient(CX, CY, 0, CX, CY, S * 2.4);
      amb.addColorStop(0, "rgba(50,92,205,0.30)");
      amb.addColorStop(0.55, "rgba(18,34,88,0.10)");
      amb.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = amb;
      ctx.fillRect(0, 0, W, H);

      const FY = CY + S * 1.45;
      const fg = ctx.createRadialGradient(CX, FY, 0, CX, FY, S * 1.6);
      fg.addColorStop(0, "rgba(70,120,255,0.26)");
      fg.addColorStop(0.5, "rgba(40,70,170,0.09)");
      fg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.ellipse(CX, FY, S * 1.75, S * 0.32, 0, 0, 7); ctx.fill();
      for (const [rr, al, lw] of [[1.5, 0.5, 1.2], [1.18, 0.3, 0.9], [0.88, 0.2, 0.8]] as const) {
        ctx.strokeStyle = `rgba(120,165,255,${al})`;
        ctx.lineWidth = DPR * lw;
        ctx.beginPath(); ctx.ellipse(CX, FY, S * rr, S * rr * 0.185, 0, 0, 7); ctx.stroke();
      }

      const want = (cur.on ? cur.tx : 0) + now / 22000;
      rot += (want - rot) * 0.03 + 0.0016;
      const sT = Math.sin(rot), cT = Math.cos(rot);
      const R2 = (140 * DPR) ** 2;
      const pr = pts.map((p) => {
        const x = p.x * cT - p.z * sT;
        const z = p.x * sT + p.z * cT;
        const d = 1 / (1.85 - z * 0.6);
        const sx = CX + x * S * 1.28 * d, sy = CY + p.y * S * 1.12 * d;
        const dx = sx - cur.x, dy = sy - cur.y;
        return { sx, sy, d, z, m: p.m, tw: p.tw, sh: p.sh, near: Math.max(0, 1 - (dx * dx + dy * dy) / R2) };
      });

      ctx.globalCompositeOperation = "lighter";
      ctx.save();
      ctx.translate(CX, CY); ctx.rotate(-0.32);
      ctx.strokeStyle = "rgba(130,175,255,0.22)";
      ctx.lineWidth = DPR * 0.9;
      ctx.beginPath(); ctx.ellipse(0, 0, S * 1.34, S * 0.38, 0, 0, 7); ctx.stroke();
      ctx.strokeStyle = "rgba(190,220,255,0.5)";
      ctx.lineWidth = DPR * 1.4;
      ctx.beginPath(); ctx.ellipse(0, 0, S * 1.34, S * 0.38, 0, now / 3000, now / 3000 + 0.5); ctx.stroke();
      ctx.restore();

      ctx.lineWidth = DPR * 0.55;
      for (const [i, j] of arcs) {
        const a = pr[i], b = pr[j];
        const al = 0.05 + 0.16 * Math.max(0, (a.z + b.z) / 2 + 0.5) + Math.max(a.near, b.near) * 0.4;
        ctx.strokeStyle = `rgba(120,170,255,${Math.min(0.7, al).toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
      }
      ctx.lineWidth = DPR * 0.5;
      for (const [i, j] of links) {
        const a = pr[i], b = pr[j];
        const al = 0.1 + 0.22 * Math.max(0, (a.z + b.z) / 2 + 0.35) + Math.max(a.near, b.near) * 0.45;
        ctx.strokeStyle = `rgba(110,160,255,${Math.min(0.85, al).toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
      }
      const t = now / 1000;
      for (const q of pr) {
        const tw = 0.8 + 0.2 * Math.sin(t * 1.5 + q.tw);
        const sz = (2.4 + q.m * 4.2) * q.d * DPR * tw * (1 + q.near) * (q.sh ? 1 : 0.8);
        const sp = q.near > 0.15 ? SB : q.z > 0.25 ? SB : q.z < -0.25 ? SC : SA;
        ctx.globalAlpha = Math.min(1, (0.4 + q.d * 0.6) * tw + q.near * 0.4);
        ctx.drawImage(sp, q.sx - sz / 2, q.sy - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;
      const core = ctx.createRadialGradient(CX, CY, 0, CX, CY, S * 0.5);
      core.addColorStop(0, "rgba(240,248,255,0.9)");
      core.addColorStop(0.3, "rgba(150,195,255,0.4)");
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(CX, CY, S * 0.5, 0, 7); ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    };

    const onVis = (): void => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(frame);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    window.addEventListener("pointermove", onMove);
    document.addEventListener("mouseleave", onGone);
    document.addEventListener("visibilitychange", onVis);

    // The engine is live — only now does the still yield the stage.
    wrap.dataset.sphereLive = "on";
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onGone);
      document.removeEventListener("visibilitychange", onVis);
      delete wrap.dataset.sphereLive;
      wrap.removeChild(canvas);
    };
  }, []);

  return <div ref={wrapRef} data-sphere-island aria-hidden="true" className="absolute inset-0 z-[1]" />;
}
