# ADR-033: Media Pipeline — multi-modal generation behind the founder gate

- **Status:** Accepted
- **Date:** 2026-07-04
- **Deciders:** Robert O'Toole
- **Tags:** core, media, renderer, crm, storage
- **Supersedes:** — (fills the media seam reserved since ADR-017/022)
- **Superseded by:** —

## Context

Every blueprint carries art-directed media BRIEFS; every rendered site shows
honest annotated frames where photography belongs. The briefs are already
generation prompts in waiting. Demo sites must look like finished £10k
builds; customer sites must never show fabricated imagery without the
founder approving each asset.

## Decision

### `core/media` — a MULTI-MODAL seam, image first, video next

`MediaGenerationProvider` is modality-agnostic by design (the immediate
next milestone is a video adapter for drone-style hero ambience — the seam
must not be image-shaped):

- `generate(request)` where request carries `modality: "image" | "video"`,
  the prompt, dimensions/duration, and format hints; the result carries the
  asset bytes/URL, per-generation **cost** (logged — cost telemetry is part
  of the record, never a mystery bill), and provider metadata.
- v1 adapter: **Replicate (Flux 1.1 Pro or current best)**, activated ONLY
  by server-side `REPLICATE_API_TOKEN` (env-gated, injectable transport for
  tests, **never called in CI**, runtime window guard — the ADR-026 lesson).

### Briefs → prompts, with UK authenticity as LAW

`buildMediaPrompt(brief, context)` converts a blueprint media brief into a
generation prompt and ALWAYS appends the authenticity clauses: UK housing
stock, weather-true light, region-plausible streets; photorealistic; **never
people's faces; no text, signage, or logos in image**. The clauses are
enforced by the builder (tested), not by author discipline.

### Media records + permanent storage

A `MediaRecord` links asset → business → slot (the blueprint's stable
`generationRef`) → brief, and carries: `modality`, `durationSeconds?`
(video), `posterUrl?`/`lqip` (base64 micro-preview for first paint),
generation provenance (provider, model, prompt, cost, generatedAt), and the
review lifecycle. Storage is a seam: **Supabase Storage bucket** in
production (migration adds `media_assets` table + bucket note); a
local-disk adapter (`public/generated-media/`) for development — demo
assets are checked in as the founder's sales collateral.

### The founder review gate (build-item discipline)

Generated media is born in **review**. The founder approves or rejects each
asset in the CRM media panel; ONLY approved assets are resolved onto
published sites. The honest annotated frame remains the fallback for every
slot without an approved asset — real customers pre-media see briefs, never
placeholders pretending to be photos.

### Cinematic imagery motion

Media slots gain life inside the existing motion system (ADR-022): slow
Ken Burns drift on hero backdrops, parallax depth on portfolio frames,
viewport reveal choreography — reduced-motion safe. **LCP is protected
structurally**: LQIP paints first, full assets are lazy, hero posters keep
priority.

### Scoping the "no video" law (founder-approved amendment)

Signature Moments law 3 ("never video files") is **scoped to morph
transitions**, which remain pure vector. AI-generated cinematic footage is
permitted as ATMOSPHERE under a strict budget: poster-first paint, lazy
compressed loop, reduced-motion AND reduced-data resolve to the designed
still, Lighthouse ≥90 holds. SIGNATURE-MOMENTS.md is amended with one
sentence to this effect (this milestone instruction is the founder's
approval).

## Consequences

### Positive
- Demo sites become finished-looking sales assets; customer sites gain a
  lawful path to real-feeling imagery with the founder in the loop per asset.
- The video milestone plugs into an already-multi-modal seam and record
  schema — no redesign.

### Negative / Trade-offs
- Generation spends real money — mitigated by per-image cost telemetry on
  every record and the explicit founder-triggered flow (nothing generates
  automatically).
- AI imagery risks inauthenticity — mitigated by the prompt law, the
  per-asset gate, and the no-faces/no-text rules.

### Neutral
- Migration `20260710000000_media_v1.sql` (media_assets + kind widening as
  needed). Out of scope, recorded: video generation adapter (next), customer
  upload UI, shot-list generator (Media Department v2), other trades' demos.

## Alternatives Considered

- **Stock photography** — violates the media discipline (ADR-022): generic,
  non-region-true, licence-encumbered. Rejected.
- **Unreviewed auto-placement of generated media** — fabricated imagery on a
  customer's site without founder eyes is an honesty breach. Rejected.
- **Image-only provider interface** — known video milestone lands next;
  designing the seam twice is waste. Rejected.

## References

- ADR-017 (generationRef reserved), ADR-022 (media discipline), ADR-029,
  ADR-032; `docs/experience/SIGNATURE-MOMENTS.md` (law 3 as amended).
- `src/core/media/`, `src/features/crm` media panel,
  `supabase/migrations/20260710000000_media_v1.sql`.
