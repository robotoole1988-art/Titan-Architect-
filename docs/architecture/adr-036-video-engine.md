# ADR-036: Video Engine v1 — cinematic film through the founder gate

- **Status:** Accepted
- **Date:** 2026-07-05
- **Deciders:** Robert O'Toole
- **Tags:** core, media, renderer, crm, video
- **Supersedes:** — (activates the video modality reserved by ADR-033)
- **Superseded by:** —

## Context

The media seam (ADR-033) was multi-modal from day one — `MediaModality`
already carried `"video"`, the record already had `posterUrl` and
`durationSeconds`, and the Supabase table already had `poster_url` /
`duration_seconds` columns. The image adapter threw loudly for video "the
next milestone." This is that milestone: short, photoreal, atmospheric
cinematic clips generated per business — the axis of realism WebGL cannot
reach. First use: hero ambience for the two demo sites.

## Decision

### Model choice — assessed live against the founder's token

Queried the Replicate `text-to-video` collection with the founder's
existing `REPLICATE_API_TOKEN`. The realistic candidates for short photoreal
clips, and the call:

| Model | Duration | ~Cost | Why / why not |
| --- | --- | --- | --- |
| **kwaivgi/kling-v2.1** *(CHOSEN)* | native 5s / 10s | ~$0.25 (5s std), ~$0.45 (5s pro) | Highest-quality photoreal T2V widely available (4.1M runs); superb camera-move adherence (drone/aerial), `negative_prompt` to enforce the no-people/no-text law, `start_image` seed available for future brand-coherent shots. |
| bytedance/seedance-1-lite | 5s (adj.) | ~$0.02/s | Cheapest, `camera_fixed` control, 3.5M runs — recorded as the **budget fallback**. |
| luma/ray-flash-2-720p | 5s / 9s | ~$0.022/s | Native `loop` input (seamless ambience) — recorded as the **seamless-loop alternative**. |
| google/veo-3 / veo-2 | — | high | Veo-3 ships audio (out of scope) and both are costly. Rejected. |

**Decision: `kwaivgi/kling-v2.1`, standard mode, 5s default.** The model,
mode, and duration are **injectable** on the adapter so the founder can
swap to Seedance (cost) or Ray-Flash (native loop) without a code change.
Quality is the point of this milestone — these clips are demo/sales
collateral the founder judges on taste — so the default is the quality
benchmark, not the cheapest.

### The video adapter (polling, not `Prefer: wait`)

Image generation used `Prefer: wait` (synchronous, ≤60s). Video takes
minutes, so the video branch **creates a prediction and polls** the
prediction URL to a terminal status (`succeeded` / `failed` / `canceled`),
with an injectable transport + clock for tests, a bounded timeout, and the
runtime `window` guard (server-side only, never CI). The `no people, no
faces, no text, no logos` law is enforced both in the prompt (via
`buildMediaPrompt`) and in Kling's `negative_prompt`.

### Poster frame — honest engineering without ffmpeg

ffmpeg is not on the build host, and pulling a Node mp4-frame dependency
just for a placeholder is not worth it. The film's poster is the
business's **already-approved hero photograph** — the same scene, already
the LCP, already LQIP'd, already hand-blessed by the founder. It is set as
the record's `posterUrl` at generation time (looked up from the approved
hero image) and is what paints first. A frame-accurate poster via ffmpeg is
a documented future enhancement, not a blocker.

### Founder gate is mandatory (unchanged)

Clips are born in **review** like every asset; only approved clips reach a
site; rejection reopens the slot for another take (the ADR-033/034
retake mechanism — a `.take-N` object per attempt). Per-clip cost + full
provenance recorded. The two-take commissions per demo exercise exactly
this: two creative directions at one slot, the founder approves one.

### Blueprint wiring

`deriveMediaPlan` gains a homepage-hero **`{hero}.film`** slot (modality
`video`, 5s) whose brief maps the strategy's existing `videoStyle` /
hero visual concept into a film brief. Preview and the build queue show
video assets — poster, duration, cost, gate status — like any other media.

### Hero ambience integration — LCP is untouchable

The approved clip becomes the hero background via a **client-only**
`AmbientFilm` layer: SSR ships the poster/still ONLY (the existing
`CinematicImage`, which is the LCP); no `<video>` tag is server-rendered.
After first idle, on a capable device that is not
`prefers-reduced-motion` and not `Save-Data`, the muted looping clip
lazy-loads and cross-fades in over the poster, subtly graded to theme.
Reduced-motion / reduced-data / low-tier devices keep the still poster
forever. Public-mode Lighthouse ≥90 must hold with clips live — proven on
both demos.

## Consequences

- No new dependency: the adapter is `fetch` + polling; storage learns
  `video/mp4` content type; everything else already existed.
- Video is materially slower and costlier than image; the CRM shows the
  per-modality estimate and the gate shows real per-clip cost.
- Future: ffmpeg poster frames, `start_image` brand-coherent seeding,
  multi-clip storyboards, morph-lab compositing (all out of scope here).

## Alternatives Considered

- **`Prefer: wait` for video** — caps at 60s; video isn't ready by then.
  Polling is required. Rejected.
- **A frame-extraction dependency for posters** — cost/complexity for a
  placeholder the approved hero photo already provides better. Deferred.
- **Server-rendered `<video autoplay>`** — risks LCP and ships bytes to
  reduced-data users. The client-only fade-in keeps the still as the LCP.
  Rejected.
