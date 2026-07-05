"use client";

/**
 * The Morph Lab world (ADR-035 / ADR-038): the house the roof seats onto and
 * the garden it stands in. Extracted so the WebGL scene AND the WebGPU
 * compute scene render the IDENTICAL world — the renderer changes, the story
 * never does. three's non-node materials are duck-typed (`.isMeshStandard…`)
 * so they render under both WebGLRenderer and WebGPURenderer unchanged.
 */

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  makeBrickTexture,
  makeFlagstoneTexture,
  makeLawnTexture,
} from "./procedural-textures";

/** A gable-roof wedge (under-roof), authored as explicit triangles. */
export function gableGeometry(
  width: number,
  depth: number,
  rise: number,
): THREE.BufferGeometry {
  const w = width / 2;
  const d = depth / 2;
  // prettier-ignore
  const positions = new Float32Array([
    -w, 0, d,  w, 0, d,  w, rise, 0,
    -w, 0, d,  w, rise, 0,  -w, rise, 0,
    w, 0, -d,  -w, 0, -d,  -w, rise, 0,
    w, 0, -d,  -w, rise, 0,  w, rise, 0,
    -w, 0, -d,  -w, 0, d,  -w, rise, 0,
    w, 0, d,  w, 0, -d,  w, rise, 0,
    -w, 0, d,  -w, 0, -d,  w, 0, -d,
    -w, 0, d,  w, 0, -d,  w, 0, d,
  ]);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export function House() {
  const gable = useMemo(() => gableGeometry(5.4, 2.9, 1.32), []);
  const brick = useMemo(() => makeBrickTexture(), []);
  useEffect(
    () => () => {
      gable.dispose();
      brick.dispose();
    },
    [gable, brick],
  );
  return (
    <group>
      {/* walls — weathered UK brick */}
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.4, 2.3, 2.9]} />
        <meshStandardMaterial map={brick} bumpMap={brick} bumpScale={0.6} roughness={0.92} />
      </mesh>
      {/* the under-roof wedge the tiles seat onto */}
      <mesh geometry={gable} position={[0, 2.3, 0]} castShadow>
        <meshStandardMaterial color="#1a222d" roughness={0.9} />
      </mesh>
      {/* door */}
      <mesh position={[0, 0.62, 1.47]}>
        <boxGeometry args={[0.62, 1.24, 0.06]} />
        <meshStandardMaterial color="#25303c" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* windows — warm life inside the storm */}
      {[-1.6, 1.6].map((x) => (
        <group key={x}>
          <mesh position={[x, 1.35, 1.47]}>
            <boxGeometry args={[0.82, 0.7, 0.04]} />
            <meshStandardMaterial color="#e8e2d8" roughness={0.6} />
          </mesh>
          <mesh position={[x, 1.35, 1.49]}>
            <boxGeometry args={[0.7, 0.58, 0.03]} />
            <meshStandardMaterial
              color="#ffb45e"
              emissive="#ff9d3d"
              emissiveIntensity={2.4}
              roughness={0.05}
              metalness={0}
            />
          </mesh>
        </group>
      ))}
      {/* chimney */}
      <mesh position={[1.7, 3.35, 0]} castShadow>
        <boxGeometry args={[0.42, 1.1, 0.42]} />
        <meshStandardMaterial color="#6a5244" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** The garden: lawn, path, hedge line, tree silhouettes — depth layers. */
export function Garden() {
  const lawn = useMemo(() => makeLawnTexture(), []);
  const flagstone = useMemo(() => makeFlagstoneTexture(), []);
  useEffect(
    () => () => {
      lawn.dispose();
      flagstone.dispose();
    },
    [lawn, flagstone],
  );
  const treeBlobs: Array<[number, number, number, number]> = [
    [-7.2, 3.4, 4.2, 1.7],
    [-6.6, 4.6, 3.7, 1.2],
    [-7.9, 2.6, 3.6, 1.1],
    [8.4, 3, -2.4, 1.5],
    [8, 4, -2.9, 1],
  ];
  return (
    <group>
      {/* lawn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[30, 48]} />
        <meshStandardMaterial map={lawn} roughness={1} />
      </mesh>
      {/* flagstone path to the door */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 4.1]} receiveShadow>
        <planeGeometry args={[1.1, 5.2]} />
        <meshStandardMaterial map={flagstone} roughness={0.85} />
      </mesh>
      {/* hedge line with a gap for the path */}
      {[-4.9, 4.9].map((x) => (
        <mesh key={x} position={[x, 0.42, 6.6]} castShadow receiveShadow>
          <boxGeometry args={[8.2, 0.84, 0.7]} />
          <meshStandardMaterial color="#2e4423" roughness={1} />
        </mesh>
      ))}
      {/* tree trunks */}
      {[-7.2, 8.2].map((x, index) => (
        <mesh key={x} position={[x, 1.2, index === 0 ? 4 : -2.6]} castShadow>
          <cylinderGeometry args={[0.14, 0.2, 2.4, 8]} />
          <meshStandardMaterial color="#2c2018" roughness={1} />
        </mesh>
      ))}
      {treeBlobs.map(([x, y, z, radius], index) => (
        <mesh key={index} position={[x, y, z]} castShadow>
          <icosahedronGeometry args={[radius, 1]} />
          <meshStandardMaterial color="#26381f" roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/** The bare stage for the "world off" delta view — a dark disc, no garden. */
export function BareGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <circleGeometry args={[16, 48]} />
      <meshStandardMaterial color="#0e1520" roughness={1} />
    </mesh>
  );
}
