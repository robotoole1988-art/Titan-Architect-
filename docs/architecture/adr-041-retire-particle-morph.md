# ADR-041: Retire the real-time particle morph and the Morph Lab

- **Status:** Accepted
- **Date:** 2026-07-06
- **Deciders:** Robert O'Toole
- **Tags:** experience, webgpu, morph-lab, removal, media
- **Supersedes:** [ADR-035](./adr-035-morph-lab-webgl.md),
  [ADR-038](./adr-038-morph-lab-webgpu.md),
  [ADR-040](./adr-040-renovation-morph.md)
- **Superseded by:** —

## Context

TITAN spent several milestones building a **real-time particle morph**: a
WebGL foundation and the five-beat Morph Law ([ADR-035](./adr-035-morph-lab-webgl.md)),
a WebGPU/TSL compute renderer holding 50k+ particles ([ADR-038](./adr-038-morph-lab-webgpu.md)),
and a whole-house "tired → renovated" morph ([ADR-040](./adr-040-renovation-morph.md)),
all exercised behind an internal **Morph Lab** at
`/experience-studio/morph-lab`. It was never shipped to a public site — the
v1 2D morphs were retreated in the [ADR-032](./adr-032-signature-moments.md)
addendum, and the 3D work stayed lab-only pending a public decision.

In parallel, the **Video Engine** matured into a genuinely premium hero: native
4K films and a Kling **O1** dual-keyframe film-morph on a swappable provider
([ADR-036](./adr-036-video-engine.md), [ADR-037](./adr-037-media-streaming.md),
[ADR-039](./adr-039-video-4k-morph.md)), delivered poster-first, lazy, and
reduced-motion-safe, holding Lighthouse ≥ 90.

**The medium pivoted.** Generated cinematic film clears the WOW bar without a
GPU-bound real-time renderer running on the visitor's device — no per-device
WebGPU/WebGL tiering risk, no fill-bound retina canvases, no ~2 MB three.js
compute payload in the graph. Keeping a second, harder-to-ship morph engine
alive — even lab-only — is carrying cost and a standing risk that it leaks
toward production. The founder's call: **retire it now**, so it can never ship,
and let premium AI film be the hero.

## Decision

**Remove the real-time particle morph and the Morph Lab from the active app.
This is a removal only — git history is the archive; this ADR is the map back.**

### Removed

- The route **`/experience-studio/morph-lab`** (404 now) and its page.
- The compute renderers: `storm-field-webgpu.tsx` (WebGPU/TSL) and
  `storm-vortex-scene.tsx` (WebGL), and the renovation compute renderer
  `renovation-scene-webgpu.tsx`.
- The choreography cores: `choreography.ts` (`buildStormField`,
  `buildStormVortex`, `vortexParams`, the private `tileFields` helper, the
  five-beat maths) and `renovation.ts`.
- The Morph Lab UI/controls (`lab-page.tsx`), the 2D fallback
  (`fallback-2d.tsx`), the lab dome environment/data-loader (`environment.ts`,
  `api.ts`), and their public exports from the website-renderer `index.ts`.
- The morph-specific tests (`morph-lab.test.ts`, `renovation.test.ts`).

### Preserved (retained shared 3D foundation)

Deliberately kept, still compiling and under test — reusable, renderer-agnostic
pieces that are not the morph:

- **`webgl/device-tier.ts`** — device-capability tiering + WebGPU detection.
- **`morph-lab/particle-materials.ts`** — trade-keyed PBR material registry.
- **`morph-lab/world.tsx`** (House / Garden) and **`procedural-textures.ts`** —
  three.js craft geometry/textures, kept for any future 3D work. `world.tsx`
  carries a type-only `@react-three/fiber` import so its intrinsic JSX
  (`<mesh>`…) still type-checks now that no scene pulls the augmentation in.
- A pruned `webgl-foundation.test.ts` covers device-tier + materials.

Untouched (explicitly out of scope): the film **Video Engine**, `/api/media`
and the streaming proxy, the 4K/O1 work, and all renderer **themes, sky-domes
(as media assets), Golden Hour, and crafted primitives**. The internal
"TITAN Morph Lab (internal)" lab business and its reviewed dome media records
remain in the database untouched — only the code that consumed them is gone.

### Direction going forward

The hero WOW is **premium AI film (Kling)**. A **Kling O1 film-morph** (the
before→after as generated film, not a real-time renderer) is **parked as a
future option** — revisit if a demo calls for it. Pillar A (real-time compute)
and Pillar B (authored/baked) remain engineering references in
[EXPERIENCE-ENGINEERING.md](../experience/EXPERIENCE-ENGINEERING.md), not
scheduled builds. [SIGNATURE-MOMENTS.md](../experience/SIGNATURE-MOMENTS.md)
carries the same dated superseded note.

## Consequences

**Positive** — one hero medium (film), less surface area, no per-device
real-time renderer risk, no chance the lab leaks to production. ADR-035/038/040
stay as an honest historical record of a capability we proved and chose not to
ship.

**Negative / watch-list** — the interactive, orbit-able, "living" quality of a
real-time morph is set aside (film is linear). `world.tsx` /
`particle-materials.ts` / `device-tier.ts` are retained but have **no live
consumer** today — kept on purpose as foundation, not orphaned by accident; if
a future 3D milestone never comes, a later cleanup ADR may remove them. `three`
/ `@react-three/fiber` remain in `package.json` for that retained code.

## Restore

Everything removed here lives in git history. The last commit that contains the
**full** morph (Storm Vortex, Renovation, Morph Lab route, choreography, tests)
is the pre-removal tip of `main`:

```
dffdb13  Merge feat/renovation-morph: Renovation morph … (ADR-040)
```

To inspect or restore a file without rewriting history, e.g.:

```
git show dffdb13 -- src/features/website-renderer/morph-lab/storm-field-webgpu.tsx
git checkout dffdb13 -- src/features/website-renderer/morph-lab/
```

The choreography/renovation cores and their tests are pure and deterministic,
so they restore cleanly; the compute scenes depend on `three/webgpu` +
`three/tsl` (present) and the retained `world.tsx` / `particle-materials.ts` /
`device-tier.ts`.

## Verification

- `/experience-studio/morph-lab` returns 404; no dead imports; the two demo
  heroes (Summit, Kerbside) still render their poster/film with no console
  errors (verified in-browser).
- No live or public path references the morph.
- Gates green: lint, type-check, tests, production build. CI green.
