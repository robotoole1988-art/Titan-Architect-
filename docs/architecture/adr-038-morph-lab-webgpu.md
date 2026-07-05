# ADR-038: Morph Lab v3 — WebGPU/TSL compute particles, material truth, seam-free domes

- **Status:** Accepted
- **Date:** 2026-07-05
- **Deciders:** Robert O'Toole
- **Tags:** experience, webgpu, tsl, morph-lab, performance
- **Supersedes:** — (extends [ADR-035](./adr-035-morph-lab-webgl.md))
- **Superseded by:** —

## Context

The Storm Vortex morph ([ADR-035](./adr-035-morph-lab-webgl.md)) drove every
particle on the CPU — a per-frame `mesh.setMatrixAt(i, …)` loop over the whole
swarm. That capped the roof at ~2–3k tiles: past that the CPU matrix writes,
not the GPU, became the frame budget. Two further faults the founder called
out on the v2 render:

1. **"Blue confetti."** The tile material was low-metalness plastic with a
   bright blue emissive (`#5f9bff`) — it glowed, it did not read as slate.
2. **A dome seam.** The environment was two textured spheres
   (`EquirectangularReflectionMapping` on `sphereGeometry`); the equirect UV
   wrap left a visible seam and a pole pinch.

Pillar A of the Experience-Engineering constitution
([EXPERIENCE-ENGINEERING.md](../experience/EXPERIENCE-ENGINEERING.md)) is
GPU-first interactive 3D. three r0.185 ships `three/webgpu` (WebGPURenderer)
and `three/tsl` (the Three Shading Language); r3f 9.6 supports an async `gl`
factory. So the morph can move to a real compute pipeline.

## Decision

**Run the five-beat Morph Law as a TSL compute shader; scale the swarm to
50k+; derive the field on the GPU; dress it in real trade material; render the
sky seam-free.**

### 1. Compute particles, derived from the index (no upload)

`buildStormField(target, params)` (in `choreography.ts`) produces the flat,
GPU-shaped field — a clean `2 × courses × columns` grid, always ≥ `target`,
packed as index-contiguous `Float32Array`s. It shares its per-particle maths
with `buildStormVortex` through one private `tileFields()` helper, so the CPU
object path (2D fallback, tests) and the GPU path tell **one** story. It is
pure and deterministic; the tests pin count, bounds, the lock-in cascade, and
byte-for-byte determinism.

The WebGPU scene (`storm-field-webgpu.tsx`) does **not** upload that field.
Instead the compute shader **derives every per-particle value from
`instanceIndex`** — index → side/course/column, then home/scatter/hover/
wave/phase/jitter via the same maths, hashed on the GPU. This is the canonical
compute-particles pattern: no input storage buffers, only two outputs
(`position` as `vec3`, `rotation+scale` packed into one `vec4`) that the
material reads in its vertex node. It also stays trivially under the WebGPU
**default** device limit of 8 storage buffers per stage (three requests the
device with default, not adapter-max, limits — a real constraint that an
earlier 10-buffer design would have blown).

`particleState()` is ported to TSL 1:1 — Rest → Dissolve → Hover → Purpose →
Lock-in, `If/ElseIf/Else` on the beat uniforms, easings by multiplication
(WGSL `pow()` needs matching float types). GPU `sin` precision differs from
`Math.sin`, so the GPU field is visually — not bit — identical to the CPU one;
that is the correct trade for a renderer, and the choreography maths itself is
shared and tested.

Intensity → budget: calm 50k, dramatic 80k, maximum 130k.

### 2. Material truth — registry-keyed per trade

`particle-materials.ts` is a pure registry: **slate** (dark blue-grey stone,
`metalness 0.55`, near-black emissive), **resin**, **stone** — resolved from
the trade string, slate the default (the storm→roof morph is the canonical
Tier-3 moment). Emissive is a whisper of dissolve heat, never a base-colour
cast. The WebGPU tier uses `MeshStandardNodeMaterial` with this spec; the
WebGL fallback carries the same slate values. The "blue confetti" is gone on
both renderers. Tests lock the intent (metallic, dark albedo, near-black
emissive; roofing→slate, driveways→resin, patios→stone).

### 3. Seam-free sky

The dome is a **`scene.backgroundNode`**: `mix(texture(storm, equirectUV()),
texture(calm, equirectUV()), calm)`. `equirectUV()` defaults to the world view
direction, so the sky is computed per-fragment from the ray — no sphere
geometry, no UV-wrap seam, no pole pinch. The storm dome cross-fades to the
calm dome as the roof seats. Domes remain founder-gated media (ADR-035 v2);
the calm dome also lights the scene as IBL.

### 4. Detection + graceful degradation

`detectWebGpu()` probes for a real adapter; `preferWebGpu(tier, adapter)` is a
pure predicate — WebGPU is a strict **upgrade of the full-3D tier**, taken only
when an adapter is present. No adapter, or a constrained/still tier, falls back
to the existing WebGL scene (identical world via the shared `world.tsx`), then
to the 2D canvas, then the designed still. Reduced motion always wins. The lab
exposes the choice live (WebGPU auto / WebGL A/B) with an honest
compute-vs-CPU readout.

## Consequences

**Positive**

- The roof morph holds 50k–130k slate tiles on the GPU; the CPU matrix-write
  ceiling is gone.
- One choreography, three renderers (WebGPU / WebGL / 2D) — device tiers
  differ in rendering, never in story.
- Material and sky are honest: real slate, seam-free horizon.
- All heavy code (`three/webgpu` ≈ 2 MB) loads only through the lab's dynamic
  import; public sites never reference it.

**Negative / watch-list**

- WebGPU is browser-gated; the WebGL fallback must stay first-class.
- GPU/CPU hash precision differ — acceptable for a renderer, but the two paths
  are not bit-identical (the *choreography* is; the per-particle *seed* is
  recomputed).

## Verification

- Gates green: lint, type-check, 340 tests, production build.
- In-browser (WebGPURenderer, Chrome 148 / Electron, `navigator.gpu` present):
  the compute pipeline is valid (no `GPUValidationError`), the 80k-tile world
  renders, and the storm→calm dome cross-fade plays seam-free. The WebGL A/B
  toggle renders the identical world.
- **Lesson (the hard one):** the compute pipeline appeared "invalid" for a long
  diagnosis session — the cause was a **stale Turbopack module graph** in a dev
  server left running across a large refactor (extracting `world.tsx`), not the
  TSL. A clean dev-server restart resolved it. Restart the bundler after
  structural refactors before trusting a runtime failure. The preview harness
  also backgrounds the tab (pausing `requestAnimationFrame`) and renders at a
  small physical window, which limits mid-morph freeze-frame capture; the
  choreography is covered deterministically by tests instead.
