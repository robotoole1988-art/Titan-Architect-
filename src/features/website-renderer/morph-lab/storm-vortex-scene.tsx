"use client";

/* eslint-disable react-hooks/immutability --
   three.js is an IMPERATIVE scene graph: mutating scene/fog/light/material
   properties inside useFrame is the react-three-fiber contract (React state
   per frame would re-render 60×/second). */

/**
 * The Storm Vortex — full-3D tier, REAL WORLD PASS (ADR-035 v2).
 *
 * Cinematic realism, not uncanny photorealism: environment domes generated
 * by OUR media engine wrap the scene as sky AND image-based light; a sun
 * matched to the dome casts real shadows; ACES tone mapping, subtle bloom
 * and vignette, atmospheric fog; PBR brick/lawn/slate; a garden dressed
 * for cinematography. The storm dome cross-fades to the calm dome as the
 * roof locks home — the light tells the story with the particles.
 *
 * Heavy (three.js) — loaded ONLY via the lab's dynamic import.
 */

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import {
  particleState,
  stormLightAt,
  type VortexParams,
  type VortexParticle,
} from "./choreography";
import {
  makeBrickTexture,
  makeFlagstoneTexture,
  makeLawnTexture,
} from "./procedural-textures";

export type ParticleGeometryVariant = "cubes" | "tiles";

export interface DomeUrls {
  storm?: string;
  calm?: string;
}

export interface StormVortexSceneProps {
  particles: VortexParticle[];
  params: VortexParams;
  geometry: ParticleGeometryVariant;
  /** 0..1 — emissive glow against the storm-dark scene (C4D reference). */
  glow: number;
  /** Live timeline position 0..1 — a ref so frames never re-render React. */
  tRef: MutableRefObject<number>;
  /** Environment domes (founder-gated media). Absent → graded fallback sky. */
  domes?: DomeUrls;
  /** The real-world pass on/off — for judging the delta. */
  environment?: boolean;
  orbit?: boolean;
  onStats?: (fps: number, frameMs: number) => void;
}

const STORM_SKY = new THREE.Color("#0a1120");
const CALM_SKY = new THREE.Color("#243349");
const STORM_SUN = new THREE.Color("#8aa8cc");
const CALM_SUN = new THREE.Color("#ffc98a");

function useDomeTexture(url?: string): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!url) return;
    let disposed = false;
    const loader = new THREE.TextureLoader();
    loader.load(url, (loaded) => {
      if (disposed) {
        loaded.dispose();
        return;
      }
      loaded.mapping = THREE.EquirectangularReflectionMapping;
      loaded.colorSpace = THREE.SRGBColorSpace;
      setTexture(loaded);
    });
    return () => {
      disposed = true;
      setTexture((current) => {
        current?.dispose();
        return null;
      });
    };
  }, [url]);
  return texture;
}

/**
 * Two dome spheres: the calm world underneath, the storm fading over it —
 * the storm literally clears as the roof completes. The calm dome also
 * lights the scene (IBL), its warmth ramping in with the lock-in beat.
 */
function EnvironmentDomes({
  domes,
  tRef,
  params,
}: {
  domes: DomeUrls;
  tRef: MutableRefObject<number>;
  params: VortexParams;
}) {
  const calmTexture = useDomeTexture(domes.calm);
  const stormTexture = useDomeTexture(domes.storm);
  const stormMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const { scene } = useThree();

  useEffect(() => {
    if (!calmTexture) return;
    scene.environment = calmTexture;
    scene.environmentIntensity = 0.35;
    return () => {
      scene.environment = null;
    };
  }, [calmTexture, scene]);

  useFrame(() => {
    const light = stormLightAt(Math.min(Math.max(tRef.current, 0), 1), params);
    if (stormMaterialRef.current) {
      stormMaterialRef.current.opacity = 1 - light.calm;
    }
    scene.environmentIntensity = 0.25 + light.calm * 0.85;
  });

  return (
    <group>
      {calmTexture && (
        <mesh scale={[-1, 1, 1]} rotation={[0, Math.PI * 0.75, 0]}>
          <sphereGeometry args={[60, 48, 32]} />
          <meshBasicMaterial map={calmTexture} side={THREE.BackSide} />
        </mesh>
      )}
      {stormTexture && (
        <mesh scale={[-1, 1, 1]} rotation={[0, Math.PI * 0.75, 0]}>
          <sphereGeometry args={[58, 48, 32]} />
          <meshBasicMaterial
            ref={stormMaterialRef}
            map={stormTexture}
            side={THREE.BackSide}
            transparent
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

/** A gable-roof wedge (under-roof), authored as explicit triangles. */
function gableGeometry(width: number, depth: number, rise: number): THREE.BufferGeometry {
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

function House() {
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
      {/* windows — warm life inside the storm (bloom catches these) */}
      {[-1.6, 1.6].map((x) => (
        <group key={x}>
          <mesh position={[x, 1.35, 1.47]}>
            <boxGeometry args={[0.82, 0.7, 0.04]} />
            <meshStandardMaterial color="#e8e2d8" roughness={0.6} />
          </mesh>
          <mesh position={[x, 1.35, 1.49]}>
            <boxGeometry args={[0.7, 0.58, 0.03]} />
            <meshPhysicalMaterial
              color="#ffb45e"
              emissive="#ff9d3d"
              emissiveIntensity={2.4}
              roughness={0.05}
              metalness={0}
              clearcoat={1}
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
function Garden() {
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
    // x, y, z, radius
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
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.012, 4.1]}
        receiveShadow
      >
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
      {/* tree silhouettes framing the composition */}
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

function Swarm({
  particles,
  params,
  geometry,
  glow,
  tRef,
  environment,
  hasDomes,
  onStats,
}: Omit<StormVortexSceneProps, "orbit" | "domes"> & { hasDomes: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const flashRef = useRef<THREE.DirectionalLight>(null);
  const { scene } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const stats = useRef({ frames: 0, elapsed: 0 });

  const tile = 5.8 / params.columns;
  const shard = useMemo<[number, number, number]>(
    () =>
      geometry === "cubes"
        ? [tile * 0.72, tile * 0.72, tile * 0.72]
        : [tile * 0.94, tile * 0.16, tile * 1.5],
    [geometry, tile],
  );

  useEffect(() => {
    scene.fog = new THREE.FogExp2(STORM_SKY.getHex(), environment ? 0.011 : 0.02);
    return () => {
      scene.fog = null;
    };
  }, [scene, environment]);

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

    // The light tells the story: cool + dim through the storm beats, the
    // warmth returns with lock-in. With domes, the sky is the dome pair.
    const light = stormLightAt(t, params);
    if (!hasDomes) {
      const sky = STORM_SKY.clone().lerp(CALM_SKY, light.calm);
      scene.background = sky;
      if (scene.fog instanceof THREE.FogExp2) scene.fog.color = sky;
    } else if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color = STORM_SKY.clone().lerp(new THREE.Color("#7a6c58"), light.calm);
    }
    if (ambientRef.current) ambientRef.current.intensity = 0.22 + light.calm * 0.3;
    if (sunRef.current) {
      sunRef.current.color = STORM_SUN.clone().lerp(CALM_SUN, light.calm);
      sunRef.current.intensity = 0.9 + light.calm * 1.9;
    }
    if (flashRef.current) flashRef.current.intensity = light.lightning * 9;
    if (materialRef.current) {
      const rise = Math.min(Math.max((t - params.beats.dissolve.start) / 0.08, 0), 1);
      materialRef.current.emissiveIntensity = glow * 2.2 * rise * (1 - light.calm);
      // Slate sheen catches the sun as the tiles seat.
      materialRef.current.envMapIntensity = 0.3 + light.calm * 1.5;
      materialRef.current.clearcoat = 0.15 + light.calm * 0.45;
    }

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
      <ambientLight ref={ambientRef} intensity={0.28} color="#9db4d6" />
      {/* the sun — matched to the calm dome's warm low light from the right */}
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
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, particles.length]}
        frustumCulled={false}
        castShadow
      >
        <boxGeometry args={shard} />
        <meshPhysicalMaterial
          ref={materialRef}
          color="#3f4f63"
          roughness={0.5}
          metalness={0.25}
          clearcoat={0.2}
          clearcoatRoughness={0.4}
          emissive="#5f9bff"
          emissiveIntensity={0}
        />
      </instancedMesh>
      <House />
      {environment ? (
        <Garden />
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <circleGeometry args={[16, 48]} />
          <meshStandardMaterial color="#0e1520" roughness={1} />
        </mesh>
      )}
    </>
  );
}

export function StormVortexScene({
  particles,
  params,
  geometry,
  glow,
  tRef,
  domes,
  environment = true,
  orbit = true,
  onStats,
}: StormVortexSceneProps) {
  // Performance truth (ADR-035 v2): FILL RATE is the budget. The founder's
  // 30fps came from a ~9MP retina-fullscreen canvas (v1's "60fps" was
  // measured on a ~2MP preview viewport). A hard pixel budget keeps the
  // canvas ≤ ~4.5MP whatever the screen; PerformanceMonitor adapts below
  // that if the GPU still can't hold the frame.
  const PIXEL_BUDGET = 4_500_000;
  const [dpr, setDpr] = useState(() => {
    if (typeof window === "undefined") return 1.5;
    const budgetDpr = Math.sqrt(
      PIXEL_BUDGET / (window.innerWidth * window.innerHeight),
    );
    return Math.min(1.75, Math.max(1, budgetDpr));
  });
  const hasDomes = Boolean(environment && (domes?.calm || domes?.storm));

  return (
    <Canvas
      shadows
      camera={{ position: [9, 5, 11.5], fov: 42 }}
      dpr={dpr}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
    >
      <PerformanceMonitor
        onIncline={() =>
          setDpr((current) =>
            Math.min(
              current + 0.25,
              Math.max(
                1,
                Math.sqrt(PIXEL_BUDGET / (window.innerWidth * window.innerHeight)),
              ),
              1.75,
            ),
          )
        }
        onDecline={() => setDpr((current) => Math.max(current - 0.25, 0.9))}
        flipflops={3}
      >
        <Swarm
          particles={particles}
          params={params}
          geometry={geometry}
          glow={glow}
          tRef={tRef}
          environment={environment}
          hasDomes={hasDomes}
          onStats={onStats}
        />
        {hasDomes && domes && (
          <EnvironmentDomes domes={domes} tRef={tRef} params={params} />
        )}
        {environment && (
          <EffectComposer multisampling={0}>
            <Bloom intensity={0.4} luminanceThreshold={1} mipmapBlur />
            <Vignette darkness={0.55} offset={0.28} />
          </EffectComposer>
        )}
      </PerformanceMonitor>
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
