"use client";

/* eslint-disable react-hooks/immutability --
   three.js is an IMPERATIVE scene graph: node graphs, storage buffers and
   scene/light/material mutation inside useFrame are the react-three-fiber
   contract. React state per frame would re-render 60×/second. */

/**
 * The Renovation morph — WebGPU/TSL COMPUTE scene (ADR-040).
 *
 * The engine of the Storm Vortex (ADR-038), re-pointed to TWO forms: a tired
 * house (weathered brick, slipped/missing slate, a broken chimney) dissolves
 * into a particle cloud and reassembles as a renovated home — pristine roof,
 * a clean NEW chimney, brightened brick. `oldHome` + `newHome` upload as
 * storage buffers; the TSL compute runs the five beats old→new; the material
 * brightens a per-region palette (slate roof / brick walls) as the house
 * reassembles. WebGL/2D fall back on the pure CPU `renovationState`.
 *
 * Heavy (three/webgpu ≈ 2MB) — loaded ONLY through the lab's dynamic import.
 */

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three/webgpu";
import {
  Fn,
  If,
  PI,
  cos,
  float,
  instanceIndex,
  instancedArray,
  mix,
  normalGeometry,
  positionGeometry,
  rotate,
  select,
  sin,
  smoothstep,
  uniform,
  vec3,
  vec4,
} from "three/tsl";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { renovationLight, type RenovationField, type RenovationParams } from "./renovation";

export interface RenovationSceneProps {
  field: RenovationField;
  params: RenovationParams;
  /** Live timeline 0..1 — a ref so frames never re-render React. */
  tRef: MutableRefObject<number>;
  orbit?: boolean;
  onStats?: (fps: number, frameMs: number) => void;
}

// Weathered → fresh palettes (linear-ish sRGB hexes; the material lerps them).
const ROOF_OLD = new THREE.Color("#343a35"); // dark, moss-tinted slate
const ROOF_NEW = new THREE.Color("#414c59"); // clean blue-grey slate
const BRICK_OLD = new THREE.Color("#4b4038"); // grimy, darkened brick
const BRICK_NEW = new THREE.Color("#9a6047"); // warm, clean brick
const SKY_OLD = new THREE.Color("#8a8f96"); // overcast
const SKY_NEW = new THREE.Color("#bcd0e4"); // bright day

function clamp01(x: number): number {
  return Math.min(Math.max(x, 0), 1);
}

function useRenovationCompute(field: RenovationField, params: RenovationParams) {
  return useMemo(() => {
    const count = field.count;

    // Pack the three per-particle scalars (wave/phase/jitter) into one buffer.
    const scalars = new Float32Array(count * 3);
    for (let k = 0; k < count; k++) {
      scalars[k * 3] = field.waveDelay[k];
      scalars[k * 3 + 1] = field.phase[k];
      scalars[k * 3 + 2] = field.sizeJitter[k];
    }
    // Inputs: the two forms + scalars (3 storage buffers). Scatter/hover are
    // derived from the index on the GPU — everything stays well under 8.
    const oldBuf = instancedArray(field.oldHome, "vec3");
    const newBuf = instancedArray(field.newHome, "vec3");
    const scalarBuf = instancedArray(scalars, "vec3");
    const posOut = instancedArray(count, "vec3");
    const rotScaleOut = instancedArray(count, "vec4");

    const uT = uniform(0);
    const uTurb = uniform(params.turbulence);
    const uRestEnd = uniform(params.beats.rest.end);
    const uDisStart = uniform(params.beats.dissolve.start);
    const uDisEnd = uniform(params.beats.dissolve.end);
    const uHovStart = uniform(params.beats.hover.start);
    const uHovEnd = uniform(params.beats.hover.end);
    const uPurStart = uniform(params.beats.purpose.start);
    const uFresh = uniform(0);
    // Region thresholds (index-range split) drive the material palette.
    const roofEnd = Math.floor(count * params.regionMix.roof);
    const uRoofEnd = uniform(roofEnd);
    const uRoofOld = uniform(ROOF_OLD);
    const uRoofNew = uniform(ROOF_NEW);
    const uBrickOld = uniform(BRICK_OLD);
    const uBrickNew = uniform(BRICK_NEW);

    const hash = (seed: Parameters<typeof float>[0]) =>
      sin(float(seed).mul(12.9898).add(78.233)).mul(43758.5453).fract();

    const computeNode = Fn(() => {
      const i = instanceIndex;
      const fi = float(i).toVar();
      const t = uT;
      const oldH = oldBuf.element(i);
      const newH = newBuf.element(i);
      const packed = scalarBuf.element(i);
      const wave = packed.x;
      const ph = packed.y;
      const jitter = packed.z;

      // Dissolve cloud — a golden-angle spread around and above the house.
      const a = fi.mul(2.399963);
      const radius = float(3.4).add(hash(fi).mul(3.8));
      const cloudY = float(2.4).add(hash(fi.add(1)).mul(3.6));
      const scatter = vec3(cos(a).mul(radius), cloudY, sin(a).mul(radius)).toVar();

      // Hover ghost — a loose shell just off the NEW form.
      const gm = float(0.55).mul(float(0.6).add(hash(fi.add(2)).mul(0.8)));
      const ga = hash(fi.add(3)).mul(Math.PI * 2);
      const gb = hash(fi.add(4)).mul(Math.PI).sub(Math.PI / 2);
      const cgb = cos(gb);
      const hoverOff = vec3(
        cos(ga).mul(cgb).mul(gm),
        sin(gb).mul(gm).add(0.15),
        sin(ga).mul(cgb).mul(gm),
      );
      const ghost = newH.add(hoverOff);

      const breatheUnit = vec3(
        sin(t.mul(21).add(ph)),
        sin(t.mul(17).add(ph.mul(2))).mul(0.7),
        cos(t.mul(19).add(ph)),
      );

      const position = oldH.toVar();
      const rotation = vec3(0, 0, 0).toVar();
      const scale = float(1).toVar();

      If(t.lessThanEqual(uRestEnd), () => {
        // REST — the tired house sits on its old homes.
      })
        .ElseIf(t.lessThanEqual(uDisEnd), () => {
          const d0 = t.sub(uDisStart).div(uDisEnd.sub(uDisStart)).clamp(0, 1).toVar();
          const d = d0.mul(d0).mul(d0);
          position.assign(mix(oldH, scatter, d));
          const tumble = d.mul(uTurb).mul(6);
          rotation.assign(
            vec3(
              tumble.mul(sin(ph)),
              tumble.mul(cos(ph.mul(1.3))),
              tumble.mul(sin(ph.mul(0.7))),
            ),
          );
        })
        .ElseIf(t.lessThanEqual(uHovEnd), () => {
          const h = t.sub(uHovStart).div(uHovEnd.sub(uHovStart)).clamp(0, 1);
          const gather = smoothstep(0, 0.45, h);
          const base = mix(scatter, ghost, gather);
          position.assign(base.add(breatheUnit.mul(gather.mul(0.12))));
          const tumble = float(1).sub(gather.mul(0.8)).mul(uTurb).mul(6);
          rotation.assign(
            vec3(
              tumble.mul(sin(ph)).mul(0.4),
              tumble.mul(cos(ph.mul(1.3))).mul(0.4),
              tumble.mul(sin(ph.mul(0.7))).mul(0.4),
            ),
          );
        })
        .Else(() => {
          const seatSpan = float(1).sub(uPurStart);
          const seatStart = uPurStart.add(wave.mul(seatSpan).mul(0.72));
          const seatLength = seatSpan.mul(0.26);
          const p = t.sub(seatStart).div(seatLength).clamp(0, 1).toVar();
          const q = float(1).sub(p).toVar();
          const e = float(1).sub(q.mul(q).mul(q).mul(q).mul(q)).toVar();
          const base = mix(ghost, newH, e);
          position.assign(base.add(breatheUnit.mul(float(1).sub(e).mul(0.12))));
          const om = float(1).sub(e);
          rotation.assign(
            vec3(
              om.mul(sin(ph)).mul(1.4),
              om.mul(cos(ph.mul(1.3))).mul(1.4),
              om.mul(sin(ph.mul(0.7))).mul(1.4),
            ),
          );
          scale.assign(float(1).add(sin(p.mul(1.15).min(float(1)).mul(PI)).mul(0.06)));
        });

      posOut.element(i).assign(position);
      rotScaleOut.element(i).assign(vec4(rotation, scale.mul(jitter)));
    })().compute(count);

    // Material: per-region weathered→fresh palette, positioned by the compute.
    const mat = new THREE.MeshStandardNodeMaterial();
    mat.metalness = 0.15;
    mat.roughness = 0.72;
    const p = posOut.element(instanceIndex);
    const rs = rotScaleOut.element(instanceIndex);
    mat.positionNode = rotate(positionGeometry.mul(rs.w), rs.xyz).add(p);
    mat.normalNode = rotate(normalGeometry, rs.xyz);
    const fiM = float(instanceIndex);
    const isRoof = fiM.lessThan(uRoofEnd);
    const oldCol = select(isRoof, uRoofOld, uBrickOld);
    const newCol = select(isRoof, uRoofNew, uBrickNew);
    const tint = float(0.85).add(hash(fiM.add(20)).mul(0.3));
    mat.colorNode = mix(oldCol, newCol, uFresh).mul(tint);

    return { count, computeNode, material: mat, uniforms: { uT, uFresh } };
  }, [field, params]);
}

function RenovationSwarm({
  field,
  params,
  tRef,
  onStats,
}: Omit<RenovationSceneProps, "orbit">) {
  const { scene, gl } = useThree();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const statsRef = useRef({ frames: 0, elapsed: 0 });

  const { count, computeNode, material, uniforms } = useRenovationCompute(field, params);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const identity = new THREE.Matrix4();
    for (let i = 0; i < count; i++) mesh.setMatrixAt(i, identity);
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
  }, [count]);

  useEffect(() => {
    scene.fog = new THREE.FogExp2(SKY_OLD.getHex(), 0.014);
    scene.background = SKY_OLD.clone();
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame((_, delta) => {
    const t = clamp01(tRef.current);
    uniforms.uT.value = t;
    (gl as unknown as { compute: (node: unknown) => void }).compute(computeNode);

    const fresh = renovationLight(t, params).fresh;
    uniforms.uFresh.value = fresh;
    // The world brightens as the house renovates.
    const sky = SKY_OLD.clone().lerp(SKY_NEW, fresh);
    scene.background = sky;
    if (scene.fog instanceof THREE.FogExp2) scene.fog.color.copy(sky);
    if (ambientRef.current) ambientRef.current.intensity = 0.5 + fresh * 0.35;
    if (sunRef.current) sunRef.current.intensity = 1.3 + fresh * 1.1;

    statsRef.current.frames += 1;
    statsRef.current.elapsed += delta;
    if (statsRef.current.elapsed >= 0.5) {
      const fps = statsRef.current.frames / statsRef.current.elapsed;
      onStats?.(Math.round(fps), Math.round((1000 / fps) * 10) / 10);
      statsRef.current.frames = 0;
      statsRef.current.elapsed = 0;
    }
  });

  const box = 0.5 / Math.cbrt(count / 20000); // smaller field ⇒ larger flecks

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.55} color="#cfd8e2" />
      <directionalLight
        ref={sunRef}
        position={[7, 8, 5]}
        intensity={1.5}
        color="#ffe9c8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
      />
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} material={material}>
        <boxGeometry args={[box, box, box]} />
      </instancedMesh>
      {/* Ground the house sits on. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[24, 48]} />
        <meshStandardMaterial color="#3f4636" roughness={1} />
      </mesh>
    </>
  );
}

export function RenovationSceneWebGPU({
  field,
  params,
  tRef,
  orbit = true,
  onStats,
}: RenovationSceneProps) {
  const PIXEL_BUDGET = 4_500_000;
  const [dpr] = useState(() => {
    if (typeof window === "undefined") return 1.5;
    const budgetDpr = Math.sqrt(PIXEL_BUDGET / (window.innerWidth * window.innerHeight));
    return Math.min(1.75, Math.max(1, budgetDpr));
  });

  return (
    <Canvas
      shadows
      dpr={dpr}
      camera={{ position: [7, 4.2, 9], fov: 42 }}
      gl={async (defaultProps) => {
        const renderer = new THREE.WebGPURenderer({
          ...(defaultProps as ConstructorParameters<typeof THREE.WebGPURenderer>[0]),
          antialias: true,
          powerPreference: "high-performance",
        });
        await renderer.init();
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        return renderer;
      }}
    >
      <RenovationSwarm
        field={field}
        params={params}
        tRef={tRef}
        {...(onStats ? { onStats } : {})}
      />
      <OrbitControls
        enabled={orbit}
        enablePan={false}
        autoRotate={orbit}
        autoRotateSpeed={0.4}
        minDistance={5}
        maxDistance={24}
        maxPolarAngle={Math.PI * 0.52}
        target={[0, 1.9, 0]}
      />
    </Canvas>
  );
}
