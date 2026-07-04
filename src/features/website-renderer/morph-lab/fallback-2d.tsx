"use client";

/**
 * The 2D fallback tier (ADR-035): the SAME choreography core rendered flat
 * on a 2D canvas — constrained devices lose depth and orbit, never the
 * story. The "still" tier renders one frame of the calm, finished state
 * and stops (no WebGL, no animation loop).
 */

import { useEffect, useRef, type MutableRefObject } from "react";
import {
  particleState,
  stormLightAt,
  type VortexParams,
  type VortexParticle,
} from "./choreography";

export interface Fallback2dProps {
  particles: VortexParticle[];
  params: VortexParams;
  tRef: MutableRefObject<number>;
  /** true → render the designed still (t=1, calm) once; no loop. */
  still?: boolean;
}

/** Simple orthographic-ish projection: x right, y up, z leans the view. */
function project(
  position: readonly [number, number, number],
  width: number,
  height: number,
) {
  const scale = Math.min(width, height) / 11;
  const x = width / 2 + (position[0] + position[2] * 0.42) * scale;
  const y = height * 0.86 - (position[1] + position[2] * 0.18) * scale;
  const depth = 1 + position[2] * 0.05;
  return { x, y, depth, scale };
}

function drawFrame(
  context: CanvasRenderingContext2D,
  particles: VortexParticle[],
  params: VortexParams,
  t: number,
) {
  const { width, height } = context.canvas;
  const light = stormLightAt(t, params);

  // Sky: storm-dark clearing to calm; lightning washes the frame.
  const sky = context.createLinearGradient(0, 0, 0, height);
  const calmMix = (a: number, b: number) => Math.round(a + (b - a) * light.calm);
  sky.addColorStop(0, `rgb(${calmMix(10, 36)}, ${calmMix(17, 51)}, ${calmMix(32, 73)})`);
  sky.addColorStop(1, `rgb(${calmMix(14, 30)}, ${calmMix(21, 42)}, ${calmMix(32, 60)})`);
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);
  if (light.lightning > 0.02) {
    context.fillStyle = `rgba(224, 238, 255, ${light.lightning * 0.35})`;
    context.fillRect(0, 0, width, height);
  }

  // The house, flat: walls, windows, door, under-roof wedge.
  const base = project([0, 0, 0], width, height);
  const s = base.scale;
  context.fillStyle = "#0e1520";
  context.fillRect(0, base.y, width, height - base.y);
  context.fillStyle = "#6e5443";
  context.fillRect(base.x - 2.7 * s, base.y - 2.3 * s, 5.4 * s, 2.3 * s);
  context.fillStyle = "#1c2531";
  context.beginPath();
  context.moveTo(base.x - 2.9 * s, base.y - 2.3 * s);
  context.lineTo(base.x, base.y - 3.62 * s);
  context.lineTo(base.x + 2.9 * s, base.y - 2.3 * s);
  context.closePath();
  context.fill();
  context.fillStyle = "#ff9d3d";
  for (const wx of [-1.6, 1.6]) {
    context.fillRect(base.x + (wx - 0.39) * s, base.y - 1.68 * s, 0.78 * s, 0.66 * s);
  }
  context.fillStyle = "#2c231c";
  context.fillRect(base.x - 0.31 * s, base.y - 1.24 * s, 0.62 * s, 1.24 * s);

  // The swarm — every particle, flat-shaded, glow proportional to storm.
  const tile = (5.8 / params.columns) * s;
  for (let index = 0; index < particles.length; index++) {
    const state = particleState(particles[index], t, params);
    const point = project(state.position, width, height);
    const size = Math.max(tile * state.scale * particles[index].sizeJitter, 1.2);
    context.save();
    context.translate(point.x, point.y);
    context.rotate(state.rotation[2] * 0.5);
    context.fillStyle = particles[index].side === 0 ? "#4a5f7a" : "#3d5068";
    context.fillRect(-size / 2, -size / 2, size, size * 0.72);
    context.restore();
  }
}

export function StormVortexFallback2d({ particles, params, tRef, still = false }: Fallback2dProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const resize = () => {
      canvas.width = canvas.clientWidth * Math.min(devicePixelRatio, 1.5);
      canvas.height = canvas.clientHeight * Math.min(devicePixelRatio, 1.5);
    };
    resize();

    if (still) {
      // The designed still: the finished roof under a calm sky. One frame.
      drawFrame(context, particles, params, 1);
      return;
    }

    let frame = 0;
    const loop = () => {
      drawFrame(context, particles, params, Math.min(Math.max(tRef.current, 0), 1));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [particles, params, tRef, still]);

  return <canvas ref={canvasRef} className="h-full w-full" data-tier={still ? "still" : "fallback-2d"} />;
}
