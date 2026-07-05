"use client";

/**
 * The Morph Lab (ADR-035) — internal only, preview surface.
 *
 * The founder decides presentation EXPERIENTIALLY: every Storm Vortex
 * variant is switchable live — presentation, drive, intensity, hover
 * duration, particle geometry, glow, device tier — with an honest FPS +
 * frame-time readout. Nothing here ever renders on a public site; the
 * three.js chunk loads only through this page's dynamic import.
 */

import dynamic from "next/dynamic";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  buildStormField,
  buildStormVortex,
  vortexParams,
  type VortexIntensity,
} from "./choreography";
import { StormVortexFallback2d } from "./fallback-2d";
import type { ParticleGeometryVariant } from "./storm-vortex-scene";
import { resolveParticleMaterial } from "./particle-materials";
import { generateLabDomes } from "./api";
import type { DomeTimeOfDay, LabEnvironment } from "./environment";
import {
  detectDeviceTier,
  detectWebGpu,
  preferWebGpu,
  type DeviceTier,
} from "../webgl/device-tier";

const sceneLoading = () => (
  <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.2em] text-slate-400">
    Loading the storm…
  </div>
);

const StormVortexScene = dynamic(
  () => import("./storm-vortex-scene").then((module) => module.StormVortexScene),
  { ssr: false, loading: sceneLoading },
);

const StormFieldWebGPU = dynamic(
  () => import("./storm-field-webgpu").then((module) => module.StormFieldWebGPU),
  { ssr: false, loading: sceneLoading },
);

/** Intensity → WebGPU particle budget. The compute path holds 50k+. */
const WEBGPU_BUDGET: Record<VortexIntensity, number> = {
  calm: 50_000,
  dramatic: 80_000,
  maximum: 130_000,
};

type Presentation = "fullscreen" | "hero-stage";
type Drive = "scroll" | "autoplay";

const AUTOPLAY_SECONDS = 14;

function ControlGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
        {label}
      </legend>
      <div className="flex flex-wrap gap-1">{children}</div>
    </fieldset>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
        active
          ? "border-amber-400/60 bg-amber-400/15 text-amber-200"
          : "border-slate-600/60 text-slate-300 hover:border-slate-400"
      }`}
    >
      {children}
    </button>
  );
}

export function MorphLabPage({
  environment,
  canGenerate = false,
}: {
  /** Founder-gated dome assets (ADR-035 v2); absent domes → fallback sky. */
  environment?: LabEnvironment;
  canGenerate?: boolean;
}) {
  const [presentation, setPresentation] = useState<Presentation>("fullscreen");
  const [drive, setDrive] = useState<Drive>("scroll");
  const [intensity, setIntensity] = useState<VortexIntensity>("dramatic");
  const [hoverDuration, setHoverDuration] = useState(0.16);
  const [geometry, setGeometry] = useState<ParticleGeometryVariant>("cubes");
  const [glow, setGlow] = useState(0.35);
  const [tier, setTier] = useState<DeviceTier>("full-3d");
  const [detectedTier, setDetectedTier] = useState<DeviceTier | null>(null);
  const [webgpuAdapter, setWebgpuAdapter] = useState<boolean | null>(null);
  const [forceWebgl, setForceWebgl] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(true);
  const [autoplaying, setAutoplaying] = useState(false);
  const [environmentOn, setEnvironmentOn] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState<DomeTimeOfDay>("golden-hour");

  const stormDome = environment?.domes.find((dome) => dome.kind === "storm");
  const calmDome =
    environment?.domes.find((dome) => dome.timeOfDay === timeOfDay) ??
    environment?.domes.find((dome) => dome.kind === "calm");
  const domes =
    stormDome || calmDome
      ? { storm: stormDome?.url, calm: calmDome?.url }
      : undefined;
  const domesInReview =
    environment?.domes.filter((dome) => dome.status === "review").length ?? 0;

  const params = useMemo(
    () => vortexParams({ intensity, hoverDuration }),
    [intensity, hoverDuration],
  );
  const particles = useMemo(() => buildStormVortex(params), [params]);
  // The dense GPU field — only built when the compute path is live.
  const field = useMemo(
    () => buildStormField(WEBGPU_BUDGET[intensity], params),
    [intensity, params],
  );
  // The lab morph is the roof: real Welsh slate (ADR-038).
  const slate = useMemo(() => resolveParticleMaterial("roofing"), []);

  // WebGPU is a strict upgrade of the full-3D tier, and only when the founder
  // hasn't pinned WebGL for an A/B against v2.
  const webgpuActive =
    !forceWebgl && preferWebGpu(tier, webgpuAdapter === true);
  const computeLabel = webgpuActive
    ? `WebGPU · ${(field.count / 1000).toFixed(0)}k compute`
    : tier === "full-3d"
      ? `WebGL · ${(particles.length / 1000).toFixed(1)}k CPU`
      : tier === "fallback-2d"
        ? "2D canvas tier"
        : "designed still";

  const tRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const fpsRef = useRef<HTMLSpanElement>(null);
  const beatRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDetectedTier(detectDeviceTier()));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Probe for a real WebGPU adapter once; null = probing, false = fall back.
  useEffect(() => {
    let live = true;
    detectWebGpu().then((ok) => {
      if (live) setWebgpuAdapter(ok);
    });
    return () => {
      live = false;
    };
  }, []);

  // Drive: scroll-linked — the visitor controls the storm.
  useEffect(() => {
    if (autoplaying) return;
    const onScroll = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      tRef.current = span > 0 ? Math.min(Math.max(-rect.top / span, 0), 1) : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [autoplaying, presentation]);

  // Drive: cinematic autoplay, then scroll takes over.
  useEffect(() => {
    if (drive !== "autoplay") return;
    let frame = 0;
    let startedAt: number | null = null;
    const tick = (now: number) => {
      if (startedAt === null) {
        startedAt = now;
        setAutoplaying(true);
      }
      const progress = Math.min((now - startedAt) / (AUTOPLAY_SECONDS * 1000), 1);
      tRef.current = progress;
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setAutoplaying(false); // hand control to scroll
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      setAutoplaying(false);
    };
  }, [drive, intensity, hoverDuration]);

  // The beat readout (direct DOM — never re-render per frame).
  useEffect(() => {
    let frame = 0;
    const loop = () => {
      if (beatRef.current) {
        const t = tRef.current;
        const beat =
          t <= params.beats.rest.end ? "REST"
          : t <= params.beats.dissolve.end ? "DISSOLVE"
          : t <= params.beats.hover.end ? "HOVER"
          : t <= params.beats.purpose.end ? "PURPOSE"
          : "LOCK-IN";
        beatRef.current.textContent = `${beat} · t=${t.toFixed(2)}`;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [params]);

  const stage = (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-700/50 bg-[#0a1120]">
      {tier === "full-3d" ? (
        webgpuActive ? (
          <StormFieldWebGPU
            field={field}
            params={params}
            geometry={geometry}
            material={slate}
            glow={glow}
            tRef={tRef}
            domes={domes}
            environment={environmentOn}
            orbit
            onStats={(fps, frameMs) => {
              if (fpsRef.current) fpsRef.current.textContent = `${fps} fps · ${frameMs} ms`;
            }}
          />
        ) : (
          <StormVortexScene
            particles={particles}
            params={params}
            geometry={geometry}
            glow={glow}
            tRef={tRef}
            domes={domes}
            environment={environmentOn}
            orbit
            onStats={(fps, frameMs) => {
              if (fpsRef.current) fpsRef.current.textContent = `${fps} fps · ${frameMs} ms`;
            }}
          />
        )
      ) : (
        <StormVortexFallback2d
          particles={particles}
          params={params}
          tRef={tRef}
          still={tier === "still"}
        />
      )}
      {/* live readouts */}
      <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1 font-mono text-[11px] text-slate-300">
        <span ref={fpsRef} data-fps-readout>
          {tier === "full-3d" ? "— fps" : tier === "fallback-2d" ? "2D canvas tier" : "designed still"}
        </span>
        <span data-compute-readout className="text-slate-400">
          {computeLabel}
        </span>
        <span ref={beatRef} data-beat-readout />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4" data-morph-lab>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
            Morph Lab · internal · ADR-035
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">The Storm Vortex</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            Rest → Dissolve → Hover → Purpose → Lock-in. Drag the scene to
            orbit. Nothing here renders on public sites.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          {detectedTier && (
            <span>
              this device: {detectedTier}
              {webgpuAdapter === true
                ? " · WebGPU"
                : webgpuAdapter === false
                  ? " · WebGL"
                  : ""}
            </span>
          )}
          <button
            type="button"
            onClick={() => setControlsOpen((open) => !open)}
            className="rounded-full border border-slate-600 px-3 py-1 text-slate-200"
          >
            {controlsOpen ? "Hide controls" : "Controls"}
          </button>
        </div>
      </header>

      {controlsOpen && (
        <div className="flex flex-wrap gap-x-8 gap-y-4 rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4">
          <ControlGroup label="Presentation">
            <Chip active={presentation === "fullscreen"} onClick={() => setPresentation("fullscreen")}>
              Full-screen opening
            </Chip>
            <Chip active={presentation === "hero-stage"} onClick={() => setPresentation("hero-stage")}>
              Hero stage + copy
            </Chip>
          </ControlGroup>
          <ControlGroup label="Drive">
            <Chip active={drive === "scroll" && !autoplaying} onClick={() => setDrive("scroll")}>
              Scroll-linked
            </Chip>
            <Chip
              active={autoplaying}
              onClick={() => {
                setDrive("scroll");
                // re-arm even when autoplay was already the mode
                requestAnimationFrame(() => setDrive("autoplay"));
              }}
            >
              {autoplaying ? "Playing…" : "Autoplay, then scroll"}
            </Chip>
          </ControlGroup>
          <ControlGroup label="Intensity">
            {(["calm", "dramatic", "maximum"] as const).map((level) => (
              <Chip key={level} active={intensity === level} onClick={() => setIntensity(level)}>
                {level}
              </Chip>
            ))}
          </ControlGroup>
          <ControlGroup label="Particles">
            <Chip active={geometry === "cubes"} onClick={() => setGeometry("cubes")}>
              Micro-cubes (Transformium)
            </Chip>
            <Chip active={geometry === "tiles"} onClick={() => setGeometry("tiles")}>
              Slate tiles (trade material)
            </Chip>
          </ControlGroup>
          <ControlGroup label={`Hover duration · ${(hoverDuration * 100).toFixed(0)}%`}>
            <input
              type="range"
              min={0.04}
              max={0.4}
              step={0.02}
              value={hoverDuration}
              onChange={(event) => setHoverDuration(Number(event.target.value))}
              className="w-40 accent-amber-400"
              aria-label="Hover duration"
            />
          </ControlGroup>
          <ControlGroup label={`Glow · ${(glow * 100).toFixed(0)}%`}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={glow}
              onChange={(event) => setGlow(Number(event.target.value))}
              className="w-40 accent-amber-400"
              aria-label="Glow intensity"
            />
          </ControlGroup>
          <ControlGroup label="Tier preview">
            {(["full-3d", "fallback-2d", "still"] as const).map((level) => (
              <Chip key={level} active={tier === level} onClick={() => setTier(level)}>
                {level}
              </Chip>
            ))}
          </ControlGroup>
          <ControlGroup label="Compute (ADR-038)">
            <Chip
              active={!forceWebgl && webgpuAdapter === true}
              onClick={() => setForceWebgl(false)}
            >
              {webgpuAdapter === false
                ? "WebGPU · unavailable"
                : webgpuAdapter === null
                  ? "WebGPU · probing…"
                  : "WebGPU 50k+ (auto)"}
            </Chip>
            <Chip active={forceWebgl || webgpuAdapter === false} onClick={() => setForceWebgl(true)}>
              WebGL v2 (A/B)
            </Chip>
          </ControlGroup>
          <ControlGroup label="Environment (v2)">
            <Chip active={environmentOn} onClick={() => setEnvironmentOn(true)}>
              World on
            </Chip>
            <Chip active={!environmentOn} onClick={() => setEnvironmentOn(false)}>
              World off (delta)
            </Chip>
          </ControlGroup>
          <ControlGroup label="Time of day">
            {(["golden-hour", "dusk", "overcast"] as const).map((slot) => {
              const available = environment?.domes.some(
                (dome) => dome.timeOfDay === slot,
              );
              return (
                <Chip
                  key={slot}
                  active={timeOfDay === slot && Boolean(available)}
                  onClick={() => available && setTimeOfDay(slot)}
                >
                  {slot}
                  {available ? "" : " · no dome yet"}
                </Chip>
              );
            })}
          </ControlGroup>
          <ControlGroup label="Domes (founder gate)">
            {environment && environment.missingSlotRefs.length > 0 && canGenerate && (
              <form action={generateLabDomes}>
                <button
                  type="submit"
                  className="rounded-full border border-sky-400/50 bg-sky-400/10 px-2.5 py-1 text-[11px] text-sky-200 hover:border-sky-300"
                >
                  Generate {environment.missingSlotRefs.length} dome
                  {environment.missingSlotRefs.length > 1 ? "s" : ""} (~$
                  {(environment.missingSlotRefs.length * 0.04).toFixed(2)})
                </button>
              </form>
            )}
            {domesInReview > 0 && environment && (
              <Link
                href={`/crm/${environment.businessId}/media`}
                className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[11px] text-amber-200"
              >
                {domesInReview} in review — open the gate ↗
              </Link>
            )}
            {environment && environment.domes.length === 0 && !canGenerate && (
              <span className="text-[11px] text-slate-500">
                No domes yet — set REPLICATE_API_TOKEN to generate
              </span>
            )}
          </ControlGroup>
        </div>
      )}

      {/* THE STAGE — the tall scroll span drives the storm; sticky viewport. */}
      <div ref={stageRef} className="relative" style={{ height: "420vh" }}>
        <div className="sticky top-16 h-[calc(100svh-8rem)] min-h-[24rem]">
          {presentation === "fullscreen" ? (
            stage
          ) : (
            <div className="grid h-full gap-4 lg:grid-cols-[5fr_7fr]">
              <div className="flex flex-col justify-center gap-5 rounded-2xl border border-slate-700/50 bg-[#0c1322] p-8">
                <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-sky-300/70">
                  Hero-stage mock · roofing
                </p>
                <h2 className="text-balance text-4xl font-semibold leading-tight text-slate-100">
                  The storm doesn&apos;t win.
                </h2>
                <p className="max-w-md text-sm leading-relaxed text-slate-400">
                  Watch the roof take itself back — every tile finds its
                  course. This column mocks the public hero copy so the
                  founder can judge the morph BESIDE a headline.
                </p>
                <span className="inline-flex w-fit rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900">
                  Call now — mock CTA
                </span>
              </div>
              {stage}
            </div>
          )}
        </div>
      </div>

      <p className="pb-8 text-[11px] text-slate-500">
        The scroll span drives the five beats in scroll-linked mode. The lab
        is exempt from public Lighthouse gates; the FPS readout above sets
        the future public budget (ADR-035).
      </p>
    </div>
  );
}
