# ADR-039: Video Engine — native-4K hero film + morph-as-film, on a swappable provider

- **Status:** Accepted
- **Date:** 2026-07-05
- **Deciders:** Robert O'Toole
- **Tags:** media, video, provider, hero, morph
- **Supersedes:** — (extends [ADR-036](./adr-036-video-engine.md), streams via [ADR-037](./adr-037-media-streaming.md))
- **Superseded by:** —

## Context

The hero WOW is moving from the real-time WebGL/WebGPU morph
([ADR-035](./adr-035-morph-lab-webgl.md) / [ADR-038](./adr-038-morph-lab-webgpu.md))
toward premium AI **film** — the medium that already tested well with the
founder. This is a **quality-ceiling test**, not a rollout: prove the ceiling
on Summit + Kerbside, judge it, then decide. The Video Engine
([ADR-036](./adr-036-video-engine.md)) and the same-origin Range proxy
([ADR-037](./adr-037-media-streaming.md)) already exist; this is a model
upgrade plus one new commission path, behind the existing provider seam.

Two new capabilities:

1. **Native-4K hero film** — Kling's first native-4K text-to-video (no upscale).
2. **Morph-as-film** — the storm-to-roof Transformium as a directed
   transformation between a start frame and an end frame.

## Decision

### 1. A provider-agnostic video-model registry

`VIDEO_MODELS` (in `core/media/model.ts`) names three tiers as **intent**, not
provider ids: `standard` (Kling v2.1 Master, the ADR-036 clip), `hero-4k`
(native 4K text-to-video), `morph` (Kling O1 first→last keyframe). Each spec
carries its backend, endpoint/model id, resolution, max duration, and pricing.
`videoModelCostUsd(key, seconds)` prices a render; `estimateGenerationCostUsd`
uses it. The request (`MediaGenerationRequest`) gains `videoModel`,
`startImageUrl`, `endImageUrl` — the seam stays one shape.

### 2. fal.ai for the premium tiers, chosen on evidence

fal.ai hosts **both** models natively — `fal-ai/kling-video/v3/4k/text-to-video`
and `fal-ai/kling-video/o1/standard/image-to-video` (dual-keyframe) — so it is
the provider for `hero-4k` and `morph`. `createFalProvider` speaks fal's REST
**queue**: `POST https://queue.fal.run/{endpoint}` with `Authorization: Key
$FAL_KEY`, poll `status_url` to `COMPLETED`, `GET` the result's `video.url`.
Transport and sleep are injectable (tests never touch the network); the
no-people/no-text law rides the negative prompt; `duration` is sent as fal's
enum **string**.

### 3. One composite seam, routed by modality + tier

`createCompositeProvider({ replicate, fal })` keeps the split invisible:
**images and `standard` film stay on Replicate**; **`hero-4k` and `morph` go
to fal**. `resolveMediaProvider()` builds it from whichever keys are present —
non-null if either backend is configured, and a missing backend throws a clear
"set FAL_KEY" / "set REPLICATE_API_TOKEN" at commission time.
`availableVideoModels()` tells the UI which tiers are live.

### 4. The morph commission path

`commissionMorphFilm` takes a start frame (raw storm / loose slate) and an
optional end frame (finished seated roof) — existing posters or supplied
stills — and renders the O1 transformation. The **start frame is the poster**,
so first paint matches the film's opening frame. `commissionFilm` gains a
`videoModel` so the hero box can order Standard or Native-4K. 4K records 3840×2160,
morph 1920×1080; per-render cost is logged onto provenance and the activity log.

### Unchanged (deliberately)

The founder review gate (born in review, nothing auto-approved), the
`/api/media` Range proxy (4K mp4 streams through it as-is), the renderer, and
the Morph Lab. 4K is **not** rolled across all trades — it is the Summit +
Kerbside test.

## Consequences

**Positive** — the quality ceiling is now commissionable and judgeable; the
provider is genuinely swappable (fal today, Replicate's equivalents or another
host tomorrow) with no change above the seam; images and standard film are
untouched.

**Negative / watch-list** — native 4K is **expensive** ($0.42/s → $2.10 per 5s
vs $0.28 flat standard; O1 $0.112/s → $0.56 per 5s); a test, not a default.
Two provider keys now matter (`REPLICATE_API_TOKEN` for image/standard,
`FAL_KEY` for 4K/morph). 4K files are large — poster-first LCP must carry
first paint (it already does, ADR-036); the film streams after.

## Verification

- Gates green: lint, type-check, 349 tests (fal queue adapter, registry, cost,
  composite routing, commission wiring), production build.
- In-browser: the CRM media gate shows the quality select + morph form when the
  keys are present; a commissioned 4K/O1 film lands in review and plays through
  `/api/media`; poster-first LCP holds Lighthouse ≥90 on a production build.
- **Prerequisite:** `FAL_KEY` in `.env.local` (founder action) before the live
  4K/morph commission. Restart the dev server; judge 4K on a production build.
