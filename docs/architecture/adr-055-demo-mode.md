# ADR-055 — The Reveal: sales demo mode v1

- **Status:** Proposed (feature branch `feat/demo-mode` — founder judges the
  reveal visually before the gate)
- **Date:** 2026-07-21
- **Implements:** Beat 2 ("Reveal") of `docs/customer/CUSTOMER-JOURNEY.md`
- **Builds on:** ADR-021/022 (registry + renderer), ADR-033/053 (media
  pipeline + gate), ADR-041 (WebGL morph retired — and it stays retired),
  ADR-054 (the founder gate this route lives behind)

## Context

The pitch is not "I will build you a website"; the pitch is **"watch
this."** The founder opens one route at a kitchen table and the prospect
watches their current presence transform into their TITAN build. Two
findings from the first live run constrain the design: **intakes are
write-once**, and there is **no honest way to show archetype alternatives
side-by-side without duplicating a business**. Demo mode must answer both
without bending either law.

## Decision

### 1. The route: `/demo/[businessId]`, founder-gated, chrome-free

Lives in the `(preview)` root-layout group (no OS chrome — the prospect
sees a stage, not a dashboard) but INSIDE the auth wall: the middleware
already protects every non-public path, and the route re-checks
`requireFounder()` server-side (the (preview) group has no layout guard of
its own). Phone-first layout; presentable on a laptop. Public surfaces are
untouched.

### 2. The Before: honest capture, never fabrication

`prepareDemo` (a founder action) captures the business's CURRENT presence:

- **Has a website URL** (intake `currentWebsiteUrl`): a server-side fetch
  at prep time reads the site's real `<title>`, meta description, and
  `og:image`. The image — THEIR real asset — is downloaded and stored
  through the existing `MediaStorage` as a media record (provider
  `"before-capture"`, cost 0). The founder's prepare click is the founder
  action, so the record is approved as part of prep (it is their own
  site's image, shown to them). The capture is recorded in the learning
  feed (`demo_before_capture`: url, title, description, mediaId,
  capturedAt) so the live pitch reads prepared data and never waits on a
  network fetch.
- **No URL**: the honest fallback — a crafted "how customers find you
  today" card built ONLY from the business record (name, trade, phone,
  location): the journey doc's no-presence rung. **A fake "before" site is
  never fabricated.** A failed fetch records an honest
  `captured: false` state and the route falls back to the presence card.
- Fetch guard: http(s) only, no private/loopback hosts, bounded sizes.

### 3. The Reveal: CSS film techniques only

A full-screen stage: the Before layer sits over the rendered TITAN
preview; the founder taps **Reveal**; a film-style transition — slow push
on the Before, a soft-edged light-sweep wipe (animated `clip-path`), the
build rising with a settle — hands the frame over. Compositor-friendly
properties only (transform / opacity / clip-path), smooth on a mid-range
phone. `prefers-reduced-motion` gets a plain crossfade. The WebGL morph
(ADR-041) stays retired.

### 4. Archetype variants: the taste-by-comparison seam, preview-only

`archetypeOverride` threads through BOTH generators (strategy + blueprint)
so a trade can be rendered AS IF it were another archetype — coherently
(copy, sequence, theme all speak the override). Alternates are curated per
archetype (`ARCHETYPE_ALTERNATES`, max two, never the primary). The demo
route flips between the strategy's own archetype and the alternates as
**in-memory renders: zero artifacts are written** — this answers both
findings (no intake edits, no duplicated businesses). If the founder
explicitly saves a direction, a NEW strategy version and a NEW blueprint
version are written through the normal artifact law — never overwriting.
Deterministic builders mean variant renders are synchronous; the pitch
never waits on generation.

### 5. Honest-empty throughout

No blueprint yet → the route says so and offers prep. No capture → the
presence card. Unfilled sections render public-mode honest collapse, not
scaffolding chips.

## Consequences

- The founder can walk in with a phone and stage the transformation for
  any business with an intake — including the invisible-online ones, who
  are the strongest before/afters in the portfolio.
- Variant taste is captured visually (the journey's law) with no state
  side-effects until a deliberate save.
- The before-capture quality depends on the prospect's site exposing
  og:image/title — honest degradation, matching the Input Ladder's
  provenance law.
- New feed kind `demo_before_capture`; media provider `"before-capture"`;
  no schema changes.
