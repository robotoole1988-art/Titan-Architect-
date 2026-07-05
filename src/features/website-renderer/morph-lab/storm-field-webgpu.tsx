"use client";

/* eslint-disable react-hooks/immutability --
   three.js is an IMPERATIVE scene graph: node graphs, storage buffers and
   scene/light/material mutation inside useFrame are the react-three-fiber
   contract. React state per frame would re-render 60×/second. */

/**
 * The Storm Vortex — WebGPU/TSL COMPUTE tier (ADR-038), Pillar A of the
 * Experience-Engineering constitution.
 *
 * v2 drove every particle on the CPU (a per-frame `setMatrixAt` loop) which
 * capped the swarm at a few thousand tiles. Here the five-beat Morph Law runs
 * as a TSL compute shader on the GPU — particleState() ported 1:1 — so the
 * roof can dissolve into 50k+ slate tiles and still hold frame. The compute
 * pass writes position/rotation/scale storage buffers each frame; a
 * MeshStandardNodeMaterial reads them in its vertex node. The material is
 * REAL slate (registry-keyed per trade) — the founder's "blue confetti" is
 * gone. The sky is a seam-free equirect background node (equirectUV of the
 * view direction), killing the textured-sphere seam of v2.
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
  equirectUV,
  float,
  instanceIndex,
  instancedArray,
  mix,
  normalGeometry,
  positionGeometry,
  rotate,
  sin,
  smoothstep,
  texture,
  uniform,
  vec3,
  vec4,
} from "three/tsl";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  stormLightAt,
  type StormField,
  type VortexParams,
} from "./choreography";
import type { ParticleMaterialSpec } from "./particle-materials";
import type { ParticleGeometryVariant } from "./storm-vortex-scene";
import { BareGround, Garden, House } from "./world";

export interface DomeUrls {
  storm?: string;
  calm?: string;
}

export interface StormFieldWebGpuProps {
  field: StormField;
  params: VortexParams;
  geometry: ParticleGeometryVariant;
  /** The trade material — slate by default (ADR-038). */
  material: ParticleMaterialSpec;
  /** 0..1 — internal dissolve heat, NOT a base colour cast. */
  glow: number;
  tRef: MutableRefObject<number>;
  domes?: DomeUrls;
  environment?: boolean;
  orbit?: boolean;
  onStats?: (fps: number, frameMs: number) => void;
}

const STORM_SKY = new THREE.Color("#0a1120");
const CALM_SKY = new THREE.Color("#243349");
const STORM_SUN = new THREE.Color("#8aa8cc");
const CALM_SUN = new THREE.Color("#ffc98a");
const CALM_FOG = new THREE.Color("#7a6c58");

function clamp01(x: number): number {
  return Math.min(Math.max(x, 0), 1);
}

/** Load an equirect dome as a plain 2D texture — RepeatWrapping on S so the
 *  ±π horizon meets seamlessly under equirectUV (no textured-sphere seam). */
function useEquirectTexture(url?: string): THREE.Texture | null {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!url) return;
    let disposed = false;
    new THREE.TextureLoader().load(url, (loaded) => {
      if (disposed) {
        loaded.dispose();
        return;
      }
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.wrapS = THREE.RepeatWrapping;
      loaded.wrapT = THREE.ClampToEdgeWrapping;
      loaded.needsUpdate = true;
      setTex(loaded);
    });
    return () => {
      disposed = true;
      setTex((current) => {
        current?.dispose();
        return null;
      });
    };
  }, [url]);
  return tex;
}

/**
 * Build the compute pipeline ONCE per field/params/material: input storage
 * seeded from the flat arrays, output storage the material reads, uniforms
 * the frame loop drives, and the TSL Fn that IS particleState on the GPU.
 */
function useMorphCompute(
  field: StormField,
  params: VortexParams,
  spec: ParticleMaterialSpec,
) {
  return useMemo(() => {
    const count = field.count;
    const courses = field.courses;
    const columns = field.columns;
    const perSide = courses * columns;
    // ROOF (house units) — mirrors choreography.ts.
    const EAVES_Y = 2.3;
    const APEX_Y = 3.7;
    const EAVES_Z = 1.5;
    const WIDTH = 5.8;
    const PITCH = Math.atan2(1.4, 1.5);

    // The GPU derives every per-particle value from instanceIndex — NO input
    // storage buffers to upload. Only two outputs the material reads. This is
    // the canonical compute-particles pattern and stays well under the device
    // storage-buffer limit. The per-particle maths mirrors tileFields() in
    // choreography.ts (GPU sin precision aside, visually identical).
    const posOut = instancedArray(count, "vec3");
    const rotScaleOut = instancedArray(count, "vec4"); // xyz=euler w=scale

    // Frame-driven uniforms.
    const uT = uniform(0);
    const uTurb = uniform(params.turbulence);
    const uHoverR = uniform(params.hoverRadius);
    const uRestEnd = uniform(params.beats.rest.end);
    const uDisStart = uniform(params.beats.dissolve.start);
    const uDisEnd = uniform(params.beats.dissolve.end);
    const uHovStart = uniform(params.beats.hover.start);
    const uHovEnd = uniform(params.beats.hover.end);
    const uPurStart = uniform(params.beats.purpose.start);
    const uGlow = uniform(0);
    const uCalm = uniform(0);
    const uEmissive = uniform(new THREE.Color(spec.emissive));

    // Deterministic index hash — sin-based, mirrors choreography.ts hash().
    const hash = (seed: Parameters<typeof float>[0]) =>
      sin(float(seed).mul(12.9898).add(78.233)).mul(43758.5453).fract();

    const computeNode = Fn(() => {
      const i = instanceIndex;
      const fi = float(i).toVar();
      const t = uT;

      // Decompose the flat index into side / course / column (the roof grid).
      const side = fi.div(perSide).floor().toVar();
      const rem = fi.sub(side.mul(perSide)).toVar();
      const course = rem.div(columns).floor().toVar();
      const column = rem.sub(course.mul(columns)).toVar();
      const sideSign = float(1).sub(side.mul(2)); // +1 side 0, −1 side 1

      // Home: the tile's seated position on the gable.
      const fracv = course.div(courses - 1).toVar();
      const homeY = float(EAVES_Y).add(fracv.mul(APEX_Y - EAVES_Y));
      const homeZ = float(1).sub(fracv).mul(EAVES_Z).add(0.06);
      const homeX = float(-WIDTH / 2).add(column.div(columns - 1).mul(WIDTH));
      const home = vec3(homeX, homeY, homeZ.mul(sideSign)).toVar();

      // Scatter: the storm spiral above the house (golden-angle spread).
      const a = fi.mul(2.399963);
      const radius = float(4.2).add(hash(fi).mul(4.6)).mul(float(0.8).add(uTurb.mul(0.35)));
      const height = float(1.2).add(hash(fi.add(1)).mul(float(4.8).add(uTurb.mul(1.6))));
      const scatter = vec3(cos(a).mul(radius), height, sin(a).mul(radius)).toVar();

      // Hover ghost: a loose shell just off the true form.
      const ghostMag = uHoverR.mul(float(0.6).add(hash(fi.add(2)).mul(0.8)));
      const ga = hash(fi.add(3)).mul(Math.PI * 2);
      const gb = hash(fi.add(4)).mul(Math.PI).sub(Math.PI / 2);
      const cgb = cos(gb);
      const hoverOff = vec3(
        cos(ga).mul(cgb).mul(ghostMag),
        sin(gb).mul(ghostMag).add(0.15),
        sin(ga).mul(cgb).mul(ghostMag).mul(sideSign),
      ).toVar();

      const wave = course.div(courses - 1).mul(0.82).add(hash(fi.add(5)).mul(0.08)).toVar();
      const ph = hash(fi.add(6)).mul(Math.PI * 2).toVar();
      const jitter = float(0.85).add(hash(fi.add(7)).mul(0.3));
      // restRotation.x = side 0 ? −pitch : +pitch.
      const restRot = vec3(sideSign.mul(-PITCH), 0, 0).toVar();

      const ghost = home.add(hoverOff);
      // The hover breathing basis — a unit drift vector scaled per beat.
      const breatheUnit = vec3(
        sin(t.mul(21).add(ph)),
        sin(t.mul(17).add(ph.mul(2))).mul(0.7),
        cos(t.mul(19).add(ph)),
      );

      const position = home.toVar();
      const rotation = restRot.toVar();
      const scale = float(1).toVar();

      If(t.lessThanEqual(uRestEnd), () => {
        // REST — the roof sits home; defaults hold.
      })
        .ElseIf(t.lessThanEqual(uDisEnd), () => {
          // DISSOLVE — easeInCubic out into the vortex, tumbling. (Cube by
          // multiplication — WGSL pow() needs matching float types.)
          const d0 = t.sub(uDisStart).div(uDisEnd.sub(uDisStart)).clamp(0, 1).toVar();
          const d = d0.mul(d0).mul(d0);
          position.assign(mix(home, scatter, d));
          const tumble = d.mul(uTurb).mul(6);
          rotation.assign(
            vec3(
              restRot.x.add(tumble.mul(sin(ph))),
              tumble.mul(cos(ph.mul(1.3))),
              tumble.mul(sin(ph.mul(0.7))),
            ),
          );
        })
        .ElseIf(t.lessThanEqual(uHovEnd), () => {
          // HOVER — gather into a loose ghost of the form, then breathe.
          const h = t.sub(uHovStart).div(uHovEnd.sub(uHovStart)).clamp(0, 1);
          const gather = smoothstep(0, 0.45, h);
          const base = mix(scatter, ghost, gather);
          position.assign(base.add(breatheUnit.mul(gather.mul(0.12))));
          const tumble = float(1).sub(gather.mul(0.8)).mul(uTurb).mul(6);
          rotation.assign(
            vec3(
              restRot.x.add(tumble.mul(sin(ph)).mul(0.4)),
              tumble.mul(cos(ph.mul(1.3))).mul(0.4),
              tumble.mul(sin(ph.mul(0.7))).mul(0.4),
            ),
          );
        })
        .Else(() => {
          // PURPOSE → LOCK-IN — one seating window per wave, easeOutQuint,
          // a whisper of overshoot that settles square.
          const seatSpan = float(1).sub(uPurStart);
          const seatStart = uPurStart.add(wave.mul(seatSpan).mul(0.72));
          const seatLength = seatSpan.mul(0.26);
          const p = t.sub(seatStart).div(seatLength).clamp(0, 1).toVar();
          // easeOutQuint = 1 - (1-p)^5, by multiplication (no pow()).
          const q = float(1).sub(p).toVar();
          const e = float(1).sub(q.mul(q).mul(q).mul(q).mul(q)).toVar();
          const base = mix(ghost, home, e);
          position.assign(base.add(breatheUnit.mul(float(1).sub(e).mul(0.12))));
          const om = float(1).sub(e);
          rotation.assign(
            vec3(
              restRot.x.add(om.mul(sin(ph)).mul(1.4)),
              om.mul(cos(ph.mul(1.3))).mul(1.4),
              om.mul(sin(ph.mul(0.7))).mul(1.4),
            ),
          );
          // click: 1 at p≥1 (sin(π)=0), a small bump just before.
          scale.assign(float(1).add(sin(p.mul(1.15).min(float(1)).mul(PI)).mul(0.06)));
        });

      posOut.element(i).assign(position);
      rotScaleOut.element(i).assign(vec4(rotation, scale.mul(jitter)));
    })().compute(count);

    // The material: real PBR slate, positioned/oriented by the compute output.
    const mat = new THREE.MeshStandardNodeMaterial();
    mat.color = new THREE.Color(spec.color);
    mat.metalness = spec.metalness;
    mat.roughness = spec.roughness;
    mat.envMapIntensity = spec.envMapIntensity;
    const p = posOut.element(instanceIndex);
    const rs = rotScaleOut.element(instanceIndex);
    const r = rs.xyz;
    const s = rs.w;
    mat.positionNode = rotate(positionGeometry.mul(s), r).add(p);
    mat.normalNode = rotate(normalGeometry, r);
    mat.emissiveNode = uEmissive.mul(uGlow);

    return {
      count,
      computeNode,
      material: mat,
      uniforms: { uT, uGlow, uCalm },
    };
  }, [field, params, spec]);
}

function FieldSwarm({
  field,
  params,
  geometry,
  material: spec,
  glow,
  tRef,
  domes,
  environment,
  onStats,
}: Omit<StormFieldWebGpuProps, "orbit">) {
  const { scene, gl } = useThree();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const flashRef = useRef<THREE.DirectionalLight>(null);
  const statsRef = useRef({ frames: 0, elapsed: 0 });

  const { count, computeNode, material, uniforms } = useMorphCompute(
    field,
    params,
    spec,
  );

  const hasDomes = Boolean(environment && (domes?.calm || domes?.storm));
  const calmTex = useEquirectTexture(hasDomes ? domes?.calm : undefined);
  const stormTex = useEquirectTexture(hasDomes ? domes?.storm : undefined);

  // Tile size follows the roof grid so seated tiles cover the gable.
  const boxArgs = useMemo<[number, number, number]>(() => {
    const tile = 5.8 / field.columns;
    return geometry === "cubes"
      ? [tile * 1.5, tile * 1.5, tile * 1.5]
      : [tile * 1.9, tile * 0.34, tile * 3];
  }, [geometry, field.columns]);

  // InstancedMesh matrices must be identity — the compute output fully
  // places each tile through the material's positionNode.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const identity = new THREE.Matrix4();
    for (let i = 0; i < count; i++) mesh.setMatrixAt(i, identity);
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
  }, [count]);

  // Atmosphere + seam-free sky.
  useEffect(() => {
    scene.fog = new THREE.FogExp2(STORM_SKY.getHex(), environment ? 0.011 : 0.02);
    return () => {
      scene.fog = null;
    };
  }, [scene, environment]);

  useEffect(() => {
    if (!hasDomes || !stormTex || !calmTex) {
      scene.backgroundNode = null;
      return;
    }
    // Seam-free equirect sky: the storm clears to calm as the roof seats.
    scene.backgroundNode = mix(
      texture(stormTex, equirectUV()),
      texture(calmTex, equirectUV()),
      uniforms.uCalm,
    );
    calmTex.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = calmTex;
    scene.environmentIntensity = 0.35;
    return () => {
      scene.backgroundNode = null;
      scene.environment = null;
    };
  }, [hasDomes, stormTex, calmTex, scene, uniforms]);

  useFrame((_, delta) => {
    const t = clamp01(tRef.current);
    uniforms.uT.value = t;
    // Run the morph compute pass before this frame renders.
    (gl as unknown as { compute: (node: unknown) => void }).compute(computeNode);

    const light = stormLightAt(t, params);
    uniforms.uCalm.value = light.calm;
    // Emissive is a whisper of dissolve heat, gone by the calm.
    const rise = clamp01((t - params.beats.dissolve.start) / 0.08);
    uniforms.uGlow.value = glow * 1.4 * rise * (1 - light.calm);

    if (ambientRef.current) ambientRef.current.intensity = 0.22 + light.calm * 0.3;
    if (sunRef.current) {
      sunRef.current.color.copy(STORM_SUN).lerp(CALM_SUN, light.calm);
      sunRef.current.intensity = 0.9 + light.calm * 1.9;
    }
    if (flashRef.current) flashRef.current.intensity = light.lightning * 9;

    if (hasDomes) {
      scene.environmentIntensity = 0.25 + light.calm * 0.85;
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(STORM_SKY).lerp(CALM_FOG, light.calm);
      }
    } else {
      const sky = STORM_SKY.clone().lerp(CALM_SKY, light.calm);
      scene.background = sky;
      if (scene.fog instanceof THREE.FogExp2) scene.fog.color.copy(sky);
    }

    statsRef.current.frames += 1;
    statsRef.current.elapsed += delta;
    if (statsRef.current.elapsed >= 0.5) {
      const fps = statsRef.current.frames / statsRef.current.elapsed;
      onStats?.(Math.round(fps), Math.round((1000 / fps) * 10) / 10);
      statsRef.current.frames = 0;
      statsRef.current.elapsed = 0;
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.28} color="#9db4d6" />
      <directionalLight
        ref={sunRef}
        position={[9, 7, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
      />
      <directionalLight ref={flashRef} position={[-4, 12, -6]} intensity={0} color="#eaf3ff" />
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} material={material}>
        <boxGeometry args={boxArgs} />
      </instancedMesh>
      <House />
      {environment ? <Garden /> : <BareGround />}
    </>
  );
}

export function StormFieldWebGPU({
  field,
  params,
  geometry,
  material,
  glow,
  tRef,
  domes,
  environment = true,
  orbit = true,
  onStats,
}: StormFieldWebGpuProps) {
  // Same fill-rate budget as the WebGL tier (ADR-035 v2): keep the canvas
  // ≤ ~4.5MP whatever the screen so fps is bound by compute, not pixels.
  const PIXEL_BUDGET = 4_500_000;
  const [dpr] = useState(() => {
    if (typeof window === "undefined") return 1.5;
    const budgetDpr = Math.sqrt(
      PIXEL_BUDGET / (window.innerWidth * window.innerHeight),
    );
    return Math.min(1.75, Math.max(1, budgetDpr));
  });

  return (
    <Canvas
      shadows
      dpr={dpr}
      camera={{ position: [9, 5, 11.5], fov: 42 }}
      gl={async (defaultProps) => {
        try {
          const renderer = new THREE.WebGPURenderer({
            ...(defaultProps as ConstructorParameters<typeof THREE.WebGPURenderer>[0]),
            antialias: true,
            powerPreference: "high-performance",
          });
          await renderer.init();
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.0;
          return renderer;
        } catch (error) {
          // Surface the real init failure instead of a silently-blank canvas.
          console.error("[morph-lab] WebGPURenderer init failed", error);
          throw error;
        }
      }}
    >
      <FieldSwarm
        field={field}
        params={params}
        geometry={geometry}
        material={material}
        glow={glow}
        tRef={tRef}
        {...(domes ? { domes } : {})}
        environment={environment}
        {...(onStats ? { onStats } : {})}
      />
      <OrbitControls
        enabled={orbit}
        enablePan={false}
        autoRotate={orbit}
        autoRotateSpeed={0.45}
        minDistance={6}
        maxDistance={26}
        maxPolarAngle={Math.PI * 0.52}
        target={[0, 2.2, 0]}
      />
    </Canvas>
  );
}
