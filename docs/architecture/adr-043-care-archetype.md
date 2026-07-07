# ADR-043: The care/trust archetype — theme + crafted primitive set

- **Status:** Accepted
- **Date:** 2026-07-06
- **Deciders:** Robert O'Toole
- **Tags:** experience, renderer, primitives, theme, archetype, registry
- **Supersedes:** —
- **Superseded by:** —

## Context

TITAN has two fully-crafted looks: **storm/emergency** (ADR-022, roofing) and
**Golden Hour/premium** (ADR-029, driveways). To sell beyond the two launch
trades we need the third emotional register — **care/trust** — for trades where
**credibility and reassurance** close the sale, not urgency or luxury: dentists,
healthcare, vets, solicitors, accountants.

The scaffolding already exists: `care` is a registered `TradeArchetype`, the
strategy generator has a care thesis, the builder has a fixed care section
sequence (gentle welcome → team & credentials → accreditations → guided
services → reviews → FAQ → consultation booking), and the archetype emits
`themeRef: titan-care`. Two things were missing, so care sites fell back to the
generic dark theme with two sections on the labelled placeholder:

1. **No `titan-care` theme** — no crafted token set for the care register.
2. **Two care primitives had no crafted component** — `story.gentle-welcome`
   and `trust.team-introduction` resolved to the premium placeholder.

Registry law holds (ADR-021): we **craft** primitives and register them;
intelligence composes them, it never free-generates.

## Decision

### The care theme — "Quiet Confidence" (`titan-care`)

A calm, clean, credible register, deliberately distinct from the other two:

- **Light, airy, cool** — a soft sage-grey paper and near-white raised cards
  (storm is dark; Golden Hour is warm limestone). Plenty of light and breathing
  room — the strategy's colour direction.
- **Deep forest-slate ink** — warm and human, authoritative without being black.
- **ONE calm, healthful accent** — eucalyptus green (trust/health), not amber,
  not bronze.
- **A serif display face** — Fraunces, self-hosted via next/font, exposed as
  `--wr-font-serif`. The care theme overrides `--wr-font-display` to it, so
  every heading reads with the quiet credibility of a serif — established, warm,
  trustworthy — while the body stays the humanist Instrument Sans. No primitive
  changes: the override rides the existing `var(--wr-font-display)` seam.
- **Scene tones** are soft sage → eucalyptus, so every art-directed media frame
  carries the calm mood without photography.

### The two crafted care primitives

- **`story.gentle-welcome`** (soft-intro / meet-the-practice) — an unhurried,
  fear-removing welcome: a large calm statement, warm reassurance points, and a
  soft media frame. Removes the awkwardness before anything is sold.
- **`trust.team-introduction`** (portrait-grid / spotlight-profiles) — the
  people and the credentials. **Honesty is the whole point:** it never
  fabricates team members or headshots. Portrait frames are art-directed slots
  that render real approved team media when it exists and otherwise, in public,
  **collapse to the real credentials/accreditations** (from the taxonomy —
  GDC, CQC, and the like) rather than show empty faces. In preview they carry
  the photography brief. No fake people, ever (the provenance law, ADR-034).

Both are registered in `PRIMITIVE_COMPONENT_MAP`; the care archetype now
composes with **zero** placeholders.

### Strategy mapping

The care keyword set gains the trust-led professional trades named in the
milestone — **solicitor, legal, conveyancing, accountant, accountancy** — so
they classify as `care`. The care register (reassurance, credibility, honest
pricing, "no judgement") reads true for both healthcare and professional
services.

### The imagery treatment brief (Flux)

Unchanged and already fit for purpose: the care strategy's `photographyStyle`
and `shotList` brief the media engine for **warm, authentic, UK-real** imagery
of the actual team and comfortable clients — "no stock clinics." Each
`MediaBlueprint` still carries a `generationRef`; generating the photos remains
a gated, later step (no images generated in this milestone).

## Consequences

**Positive** — sellable coverage extends to the whole trust-led cluster with one
crafted, registered look; the registry law holds; the serif override
demonstrates the theme seam is strong enough to re-skin type per archetype with
no component churn.

**Negative / watch-list** — the care strategy copy is healthcare-leaning
("patient / client"); it reads acceptably for solicitors/accountants but a
dedicated professional-services copy tuning is a future refinement. Team
portraits await real, approved media before they populate.

## Out of scope

No free-generation; no new external services; no changes to the storm or Golden
Hour themes; not all 35 trades — only the care/trust cluster; no 4K film; no
fabricated reviews, team, or credentials.

## Verification

- `resolveTheme("titan-care")` returns the crafted theme (not the default).
- `classifyArchetype` maps dentist / solicitor / accountant → `care`.
- A care blueprint composes the care sequence with **no placeholder** primitives.
- One care demo (a dentist) generates end-to-end — homepage + unique area pages,
  JSON-LD, anti-doorway CI passing — and is screenshotted section by section for
  the founder's premium/not-cheap judgment before it ships.
- Lighthouse ≥ 90 on a production build (photo-hero high-80s accepted).
- Gates green (lint, type-check, tests, build); CI green.
