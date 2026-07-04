"use client";

/* eslint-disable react-hooks/immutability --
   three.js is an IMPERATIVE scene graph: mutating scene.fog/background and
   light properties inside useFrame is the react-three-fiber contract (the
   alternative — React state per frame — would re-render 60×/second). */

/**
 * The Storm Vortex — full-3D tier (ADR-035, Morph Lab).
 *
 * One InstancedMesh carries the whole swarm (1,500–3,000 particles); every
 * frame writes instance matrices from the PURE choreography core. The
 * stylised premium-material house sits beneath; storm light clears to calm
 * as the roof locks home. Camera drifts; drag orbits.
 *
 * This module is heavy (three.js) and is loaded ONLY via the lab's dynamic
 * import — never through the feature index, never on public pages.
 */

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  particleState,
  stormLightAt,
  type VortexParams,
  type VortexParticle,
} from "./choreography";

export type ParticleGeometryVariant = "cubes" | "tiles";

export interface StormVortexSceneProps {
  particles: VortexParticle[];
  params: VortexParams;
  geometry: ParticleGeometryVariant;
  /** 0..1 — emissive glow against the storm-dark scene (C4D reference). */
  glow: number;
  /** Live timeline position 0..1 — a ref so frames never re-render React. */
  tRef: MutableRefObject<number>;
  /** Drag-to-orbit + slow cinematic drift. */
  orbit?: boolean;
  onStats?: (fps: number, frameMs: number) => void;
}

const STORM_SKY = new THREE.Color("#0a1120");
const CALM_SKY = new THREE.Color("#243349");
const STORM_KEY = new THREE.Color("#8aa8cc");
const CALM_KEY = new THREE.Color("#ffd9a0");

/** A gable-roof wedge (under-roof), authored as explicit triangles. */
function gableGeometry(width: number, depth: number, rise: number): THREE.BufferGeometry {
  const w = width / 2;
  const d = depth / 2;
  // prettier-ignore
  const positions = new Float32Array([
    // front slope
    -w, 0, d,  w, 0, d,  w, rise, 0,
    -w, 0, d,  w, rise, 0,  -w, rise, 0,
    // back slope
    w, 0, -d,  -w, 0, -d,  -w, rise, 0,
    w, 0, -d,  -w, rise, 0,  w, rise, 0,
    // gable ends
    -w, 0, -d,  -w, 0, d,  -w, rise, 0,
    w, 0, d,  w, 0, -d,  w, rise, 0,
    // underside
    -w, 0, d,  -w, 0, -d,  w, 0, -d,
    -w, 0, d,  w, 0, -d,  w, 0, d,
  ]);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function House() {
  const gable = useMemo(() => gableGeometry(5.4, 2.9, 1.32), []);
  useEffect(() => () => gable.dispose(), [gable]);
  return (
    <group>
      {/* walls */}
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[5.4, 2.3, 2.9]} />
        <meshStandardMaterial color="#6e5443" roughness={0.85} />
      </mesh>
      {/* the under-roof wedge the tiles seat onto */}
      <mesh geometry={gable} position={[0, 2.3, 0]}>
        <meshStandardMaterial color="#1c2531" roughness={0.9} />
      </mesh>
      {/* door */}
      <mesh position={[0, 0.62, 1.47]}>
        <boxGeometry args={[0.62, 1.24, 0.06]} />
        <meshStandardMaterial color="#2c231c" roughness={0.6} />
      </mesh>
      {/* windows — warm life inside the storm */}
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, 1.35, 1.47]}>
          <boxGeometry args={[0.78, 0.66, 0.05]} />
          <meshStandardMaterial
            color="#ffb45e"
            emissive="#ff9d3d"
            emissiveIntensity={1.4}
            roughness={0.3}
          />
        </mesh>
      ))}
      {/* chimney */}
      <mesh position={[1.7, 3.35, 0]}>
        <boxGeometry args={[0.42, 1.1, 0.42]} />
        <meshStandardMaterial color="#57433a" roughness={0.9} />
      </mesh>
      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[16, 48]} />
        <meshStandardMaterial color="#0e1520" roughness={1} />
      </mesh>
    </group>
  );
}

function Swarm({
  particles,
  params,
  geometry,
  glow,
  tRef,
  onStats,
}: Omit<StormVortexSceneProps, "orbit">) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const flashRef = useRef<THREE.DirectionalLight>(null);
  const { scene } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const stats = useRef({ frames: 0, elapsed: 0 });

  // Tile spacing derives from the roof grid — particles ARE the roof.
  const tile = 5.8 / params.columns;
  const shard = useMemo<[number, number, number]>(
    () =>
      geometry === "cubes"
        ? [tile * 0.72, tile * 0.72, tile * 0.72] // faceted micro-cube
        : [tile * 0.94, tile * 0.16, tile * 1.5], // slate tile
    [geometry, tile],
  );

  useEffect(() => {
    scene.fog = new THREE.Fog(STORM_SKY, 14, 34);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = Math.min(Math.max(tRef.current, 0), 1);

    for (let index = 0; index < particles.length; index++) {
      const state = particleState(particles[index], t, params);
      dummy.position.set(state.position[0], state.position[1], state.position[2]);
      dummy.rotation.set(state.rotation[0], state.rotation[1], state.rotation[2]);
      const s = state.scale * particles[index].sizeJitter;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // Storm → calm grading + the lightning beat.
    const light = stormLightAt(t, params);
    const sky = STORM_SKY.clone().lerp(CALM_SKY, light.calm);
    scene.background = sky;
    if (scene.fog instanceof THREE.Fog) scene.fog.color = sky;
    if (ambientRef.current) ambientRef.current.intensity = 0.28 + light.calm * 0.35;
    if (keyRef.current) {
      keyRef.current.color = STORM_KEY.clone().lerp(CALM_KEY, light.calm);
      keyRef.current.intensity = 1.1 + light.calm * 0.9;
    }
    if (flashRef.current) flashRef.current.intensity = light.lightning * 9;
    // The glow lives in FLIGHT (the C4D swarm aesthetic): slate at rest,
    // luminous through dissolve/hover/purpose, seated slate again at lock.
    if (materialRef.current) {
      const rise = Math.min(
        Math.max((t - params.beats.dissolve.start) / 0.08, 0),
        1,
      );
      const settle = 1 - light.calm;
      materialRef.current.emissiveIntensity = glow * 2.2 * rise * settle;
    }

    // FPS + frame-time readout — the lab's honest meter.
    stats.current.frames += 1;
    stats.current.elapsed += delta;
    if (stats.current.elapsed >= 0.5) {
      const fps = stats.current.frames / stats.current.elapsed;
      onStats?.(Math.round(fps), Math.round((1000 / fps) * 10) / 10);
      stats.current.frames = 0;
      stats.current.elapsed = 0;
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.3} color="#9db4d6" />
      <directionalLight ref={keyRef} position={[6, 9, 5]} intensity={1.2} />
      <directionalLight ref={flashRef} position={[-4, 12, -6]} intensity={0} color="#eaf3ff" />
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, particles.length]}
        frustumCulled={false}
      >
        <boxGeometry args={shard} />
        <meshStandardMaterial
          ref={materialRef}
          color="#41546c"
          roughness={0.55}
          metalness={0.3}
          emissive="#5f9bff"
          emissiveIntensity={0}
        />
      </instancedMesh>
      <House />
    </>
  );
}

export function StormVortexScene({
  particles,
  params,
  geometry,
  glow,
  tRef,
  orbit = true,
  onStats,
}: StormVortexSceneProps) {
  return (
    <Canvas
      camera={{ position: [9, 5, 11.5], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Swarm
        particles={particles}
        params={params}
        geometry={geometry}
        glow={glow}
        tRef={tRef}
        onStats={onStats}
      />
      <OrbitControls
        enabled={orbit}
        enablePan={false}
        autoRotate={orbit}
        autoRotateSpeed={0.45}
        minDistance={6}
        maxDistance={20}
        maxPolarAngle={Math.PI * 0.52}
        target={[0, 2.2, 0]}
      />
    </Canvas>
  );
}
