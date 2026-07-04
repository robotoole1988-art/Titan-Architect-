/**
 * Procedural PBR textures (ADR-035 v2) — brick, lawn, flagstone painted on
 * canvases at runtime. Deterministic (index maths, no Math.random), zero
 * binary assets in the repo; the light does the realism, these give it
 * surfaces that behave.
 */

import * as THREE from "three";

function hash(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return [canvas, canvas.getContext("2d")!];
}

function asTexture(
  canvas: HTMLCanvasElement,
  repeat: [number, number],
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Weathered UK brick: stretcher bond, mortar lines, tonal variance. */
export function makeBrickTexture(): THREE.CanvasTexture {
  const size = 256;
  const [canvas, context] = makeCanvas(size);
  context.fillStyle = "#8a6650";
  context.fillRect(0, 0, size, size);
  const rows = 10;
  const cols = 4;
  const brickH = size / rows;
  const brickW = size / cols;
  let index = 0;
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : brickW / 2;
    for (let col = -1; col < cols; col++) {
      const tone = 0.82 + hash(index) * 0.36;
      index += 1;
      const r = Math.round(122 * tone);
      const g = Math.round(88 * tone);
      const b = Math.round(70 * tone);
      context.fillStyle = `rgb(${r}, ${g}, ${b})`;
      context.fillRect(
        col * brickW + offset + 1.5,
        row * brickH + 1.5,
        brickW - 3,
        brickH - 3,
      );
      // weathering flecks
      for (let f = 0; f < 6; f++) {
        const fx = col * brickW + offset + hash(index + f * 7) * brickW;
        const fy = row * brickH + hash(index + f * 13) * brickH;
        context.fillStyle = `rgba(40, 26, 20, ${0.05 + hash(index + f) * 0.1})`;
        context.fillRect(fx, fy, 2, 2);
      }
    }
  }
  return asTexture(canvas, [3, 1.6]);
}

/** Lawn: layered green noise with mow-line hints. */
export function makeLawnTexture(): THREE.CanvasTexture {
  const size = 256;
  const [canvas, context] = makeCanvas(size);
  context.fillStyle = "#3d5a2e";
  context.fillRect(0, 0, size, size);
  for (let i = 0; i < 4200; i++) {
    const x = hash(i * 3) * size;
    const y = hash(i * 3 + 1) * size;
    const tone = hash(i * 3 + 2);
    const g = 74 + Math.round(tone * 52);
    context.fillStyle = `rgba(${Math.round(g * 0.62)}, ${g}, ${Math.round(g * 0.44)}, 0.8)`;
    context.fillRect(x, y, 1.6, 2.6);
  }
  // faint mow stripes
  for (let band = 0; band < 4; band++) {
    context.fillStyle = band % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)";
    context.fillRect(0, band * (size / 4), size, size / 4);
  }
  return asTexture(canvas, [7, 7]);
}

/** Flagstone path: warm stone slabs with joints. */
export function makeFlagstoneTexture(): THREE.CanvasTexture {
  const size = 128;
  const [canvas, context] = makeCanvas(size);
  context.fillStyle = "#5c5750";
  context.fillRect(0, 0, size, size);
  const rows = 4;
  for (let row = 0; row < rows; row++) {
    const tone = 0.85 + hash(row * 31) * 0.3;
    context.fillStyle = `rgb(${Math.round(148 * tone)}, ${Math.round(138 * tone)}, ${Math.round(124 * tone)})`;
    context.fillRect(3, row * (size / rows) + 3, size - 6, size / rows - 6);
  }
  return asTexture(canvas, [1, 4]);
}
