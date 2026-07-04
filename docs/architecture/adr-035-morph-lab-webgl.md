# ADR-035: Morph Lab — the WebGL particle foundation and the five-beat Morph Law

- **Status:** Accepted
- **Date:** 2026-07-04
- **Deciders:** Robert O'Toole
- **Tags:** renderer, webgl, motion, lab
- **Supersedes:** — (builds on the ADR-032 addendum and
  SIGNATURE-MOMENTS.md § Tier 3)
- **Superseded by:** —

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
