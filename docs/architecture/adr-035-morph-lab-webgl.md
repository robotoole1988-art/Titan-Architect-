# ADR-035: Morph Lab — the WebGL particle foundation and the five-beat Morph Law

- **Status:** Superseded by [ADR-041](./adr-041-retire-particle-morph.md)
- **Date:** 2026-07-04
- **Deciders:** Robert O'Toole
- **Tags:** renderer, webgl, motion, lab
- **Supersedes:** — (builds on the ADR-032 addendum and
  SIGNATURE-MOMENTS.md § Tier 3)
- **Superseded by:** [ADR-041](./adr-041-retire-particle-morph.md) — the
  real-time particle morph and the Morph Lab were retired; this ADR stays as
  historical record.

## Context

The v1 2D vector morphs were retired from public output (ADR-032 addendum).
Their successor class is Tier-3 WebGL particle morphs (SIGNATURE-MOMENTS.md
§ Tier 3): real-time particle deconstruction/reconstruction, scroll-driven,
orbitable, device-tiered. The founder's calibration references are precise:
the Transformium scene (matter dissolves into hovering micro-cube swarms
that snap into new forms), Galvatron (whole-form dissolve/reform as
particle streams), Laserbeak (everyday objects transforming), and C4D
particle-morph aesthetics (flowing swarms, emissive glow against a dark
scene). Presentation decisions (fullscreen vs hero-stage, scroll vs
autoplay, intensity, glow) are the FOUNDER'S to make experientially — so
the first build is an internal LAB with switchable variants, not a public
integration.

## Decision

### The WebGL stack

- **Three.js via @react-three/fiber** (+ drei for orbit controls) inside
  the website-renderer feature — the renderer already owns motion (framer,
  ADR-022); WebGL is the same concern at a higher tier.
- **Instanced GPU rendering**: one InstancedMesh carries every particle
  (1,500–3,000); per-frame updates write instance matrices only. No
  per-particle React nodes, ever.
- **Lazy, lab-only**: the three/r3f chunk loads ONLY on the lab route via
  dynamic import with SSR disabled. Public pages ship ZERO WebGL bytes —
  enforced by the existing public-render discipline and verified against
  built chunks.

### The five-beat Morph Law (the founder's choreography canon)

Every Tier-3 morph is choreographed to five beats:

1. **Rest** — the stylised, premium-material 3D form in its damaged/problem
   state; storm atmosphere.
2. **Dissolve** — the subject breaks into particles.
3. **Hover** — the Transformium beat: particles hold a loose ghost of the
   form, breathing with micro-drift, waiting. Restraint before
   decisiveness. Duration is a DESIGN PARAMETER (the lab exposes it).
4. **Purpose** — the swarm tightens; every particle target-seeks its final
   position in cascading waves with mechanical deceleration. Transformers
   precision — nothing floaty.
5. **Lock-in** — final elements click home course by course; the storm
   light clears to calm.

### Shared choreography core (deterministic, testable)

Particle timelines are PURE functions (`morph-lab/choreography.ts`): given
(params, index, t) they return position/rotation/scale — no randomness
(index maths, ADR-021 spirit), no three.js imports. The SAME core drives
the full-3D instanced scene AND the 2D canvas fallback, so tiers differ in
rendering, never in story.

### Device tiering (built now, used publicly later)

`classifyGpuTier` (pure, tested) + `detectDeviceTier` (browser wrapper):
WebGL2 support, memory, cores, mobile, reduced-motion → `full-3d` /
`fallback-2d` / `still`. The performance law holds via tiering: full 3D
targets 60fps on a modern laptop; the 2D canvas renders the same
choreography flat; reduced motion always gets the designed still.

### The Lab (internal only)

`/experience-studio/morph-lab` — preview surface, never public. Switchable:
presentation (fullscreen opening vs hero-stage beside headline copy), drive
(scroll-linked vs cinematic autoplay-then-scroll), intensity
(calm/dramatic/maximum → particle count and turbulence), hover duration,
particle geometry (faceted micro-cubes vs slate tiles), glow intensity,
tier preview, and a live FPS/frame-time readout. The founder and strategy
partner review IN the lab — that is the acceptance gate. The lab is exempt
from public Lighthouse gates; its measurements set the future public
budget.

## Consequences

- three/r3f/drei enter the dependency tree but only the lab route loads
  them; public bundles are verified free of them.
- The choreography core becomes the contract for every future Tier-3 morph
  (Laying Wave, Frozen Water, …) — new morphs author particles + beats,
  not engines.
- Public integration (which surface, which defaults) is a FUTURE milestone,
  decided by the founder from lab experience.

## Alternatives Considered

- **Raw WebGL/shader morphing (GPGPU)** — maximum particles, but far more
  build cost and a bespoke engine to maintain; instanced meshes hit the
  1.5–3k budget at 60fps easily. Revisit if counts grow 10×.
- **Pre-rendered video** — zero interactivity (no orbit, no scroll drive);
  violates the Tier-3 design law. Rejected.
- **Lottie/2D only** — cannot deliver the Transformium reference. Rejected
  as the primary tier; 2D remains the fallback tier.

## Addendum (2026-07-04, v2): The Real World Pass — environment, lighting, performance truth

Founder verdict on v1: choreography proven, world too toy-like. v2 targets
cinematic realism (premium archviz/animated-film), not uncanny
photorealism.

### Environment domes through OUR media engine

Four 360° equirectangular panoramas (golden hour / dusk / overcast calm
states + the storm state) are generated by the media pipeline (Flux,
1440×704) under an internal lab business — **the founder gate applies**:
domes are born in review and judged at the lab business's media page. The
lab (an internal preview surface) may show review-status domes with an
honest chip; rejected domes never render and rejection reopens the slot.
In-scene: two back-side dome spheres — the calm world beneath, the storm
fading over it — so **the storm literally clears as the roof completes**;
the calm dome doubles as image-based lighting whose intensity ramps with
the lock-in beat.

### Light like cinema

ACES filmic tone mapping; a directional sun matched to the dome (cool and
dim through the storm beats, warm and strong at lock-in) casting real
1024px shadow maps (house and swarm onto the lawn); subtle bloom
(luminance-thresholded — the windows glow properly) + vignette; FogExp2
haze for depth. PBR: procedural brick (map+bump), textured lawn with mow
lines, flagstone path, slate particles as MeshPhysicalMaterial whose
clearcoat/envMap sheen CATCHES THE SUN as the tiles seat. Garden dressed
for cinematography: hedge line, path to the door, tree silhouettes as
foreground framing. Geometry stays stylised-premium; light and materials
carry the realism.

### Performance truth (the founder's 30fps screenshot)

Honest correction: **v1's "locked 60fps" was measured on a ~2MP preview
canvas.** The founder's fullscreen retina window renders ~9MP — the scene
is FILL-BOUND, and at 9MP we reproduced the sag (50fps at 2560×1440×1.5dpr
in test; his ~2× retina ≈ 30fps). Resolution: a **hard pixel budget** —
device-pixel ratio is clamped so the canvas never exceeds ~4.5MP, with
drei's PerformanceMonitor stepping DPR down further if the GPU still sags.
Measured after the fix: **60fps / 16.7ms at 2560×1440 with the full
environment** (domes, IBL, shadows, bloom, vignette, garden, PBR) at
dramatic intensity, and 60fps at 375px. The budget number is the future
public performance contract.

### Lab controls added

Environment on/off (for judging the delta), time-of-day (golden hour /
dusk / overcast — enabled per approved/available dome), dome gate status +
generate button. All v1 controls preserved; the FPS readout stays.
