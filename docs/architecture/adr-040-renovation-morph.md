# ADR-040: Renovation morph — a tired house particle-reassembles into a renovated one

- **Status:** Superseded by [ADR-041](./adr-041-retire-particle-morph.md)
- **Date:** 2026-07-05
- **Deciders:** Robert O'Toole
- **Tags:** experience, webgpu, morph-lab, signature-moment
- **Supersedes:** — (extends [ADR-038](./adr-038-morph-lab-webgpu.md); reopens the
  public question deferred in the [ADR-032](./adr-032-signature-moments.md) morph retreat)
- **Superseded by:** [ADR-041](./adr-041-retire-particle-morph.md) — the
  renovation morph was retired with the rest of the real-time particle morph;
  this ADR stays as historical record.

## Context

The founder wants the customer-facing scroll moment the reference makes
concrete ("Particle Morphing with New Cinema 4D Particles"): as the visitor
scrolls, a **tired house** — weathered brick, cracked/slipped/missing slate, a
broken chimney — dissolves into a particle cloud and **reassembles as a fully
renovated home**: pristine roof, a clean **new chimney**, brightened brick.

This is not a new engine. Morph Lab v3 ([ADR-038](./adr-038-morph-lab-webgpu.md))
already is that engine — WebGPU/TSL compute particles, 50k+, the five-beat
Morph Law, WebGL/2D fallback. It currently plays *storm → roof* and is
internal-only (public was retreated in [ADR-032](./adr-032-signature-moments.md)
pending a decision exactly like this). The decision: **craft the old→new house
morph in the lab first, then take it public** (a later milestone), and frame
the **whole property**, not just the roof.

## Decision

**A second choreography — `renovation.ts` — over the same five-beat law and the
same compute machinery.**

### 1. Two forms, one particle set

Where the storm choreography gives each particle a single `home` (seated roof)
and a `scatter` (vortex), the renovation field gives each particle **`oldHome`**
(its place in the tired house) and **`newHome`** (its place in the renovated
house), plus the shared `scatter` cloud for the dissolve. The whole house is
covered — walls, roof tiles, chimney — partitioned by region:

- **Roof tiles** seat on the gable grid at `newHome`; at `oldHome` they are
  slipped downhill, rotated, and a fraction are missing (dropped to gaps).
- **Walls** barely move (`oldHome ≈ newHome`); the "tired" reads in the
  material, not the geometry.
- **Chimney** is the drama: `oldHome` is collapsed/scattered low (broken),
  `newHome` is a clean stack — so the chimney **builds itself** at lock-in.

### 2. The five beats, old → new

`renovationState(particle, t, params)` mirrors `particleState` but starts on
`oldHome` and resolves on `newHome`:

- **Rest** — the tired house sits (`oldHome`, weathered material).
- **Dissolve** — everything lifts off into the `scatter` cloud, tumbling.
- **Hover** — the cloud holds and breathes (the C4D beat).
- **Purpose → Lock-in** — particles seek `newHome` in cascading waves (eaves
  first, ridge and chimney last), decelerating mechanically and clicking home.

Condition rides a `renovationLight(t)` ramp (0 = weathered, 1 = fresh) that the
material reads: a dark, desaturated, moss-tinted palette brightens to clean
slate + warm brick as the house reassembles. Per-particle hash keeps tile and
brick variation.

### 3. Same renderer, same tiers

The WebGPU scene uploads `oldHome` + `newHome` as storage buffers (well under
the 8-buffer device limit — everything else is derived from `instanceIndex` as
in ADR-038), and the TSL compute does the five-beat interpolation + the
brightness ramp; WebGL and the 2D canvas fall back on the pure CPU
`renovationState`. The Morph Lab gains a **Renovation** mode beside the Storm
Vortex, on the same scroll/autoplay drive and honest fps readout.

## Consequences

**Positive** — the customer's before→after *is* the signature moment, on the
engine we already trust; the whole property transforms, chimney and all; one
choreography core, three renderers.

**Negative / watch-list** — `renovation.ts` duplicates the beat shape of
`choreography.ts` (kept separate so the storm morph is untouched); the roof-tile
"slip/missing" and the chimney rebuild need art-directing in the lab before it
earns the public homepage. Public placement is a **separate later milestone**
(this one is lab-only, per the founder's "craft first" call).

## Verification

- Pure core pinned by 11 tests in `tests/features/website-renderer/renovation.test.ts`
  (region coverage, two forms — >50% of particles move, the chimney builds up
  `meanNewY > meanOldY + 0.4`, >60% of roof tiles have slipped, the flat GPU
  field mirrors the object field, determinism, the five beats old→new, the
  brightness ramp monotone weathered→fresh).
- **In-lab, in-browser (2026-07-05, WebGPU compute path, dev build)** — added a
  "Morph" toggle to the lab (Storm Vortex ⇄ Renovation) and drove the scroll
  timeline through the five beats:
  - **REST · t=0.00** — the tired house sits assembled: dark moss-tinted slate
    over grimy brick, chimney collapsed low.
  - **DISSOLVE · t=0.23** — the whole house lifts apart into a broad cloud of
    ~80k particles.
  - **LOCK-IN · t≈1.00** — reseated as the renovated home: clean blue-grey
    slate roof, warm brick, and a **new chimney stack standing tall** at the
    ridge. The condition ramp brightens the palette across the reassembly.
  - Held **60 fps · ~16.7 ms** at 80k compute particles throughout; zero
    console errors; the Storm Vortex mode still renders after the stage refactor.
- Renovation is a **WebGPU-only craft surface** in the lab: non-WebGPU tiers show
  an honest note. The WebGL/2D public fallback ships with the public milestone.
- Gates green (lint, type-check, 360 tests, production build); public wiring
  deferred to a separate later milestone.
