# ADR-029: Premium Primitive Set — the project/premium archetypes, crafted

- **Status:** Accepted
- **Date:** 2026-07-08
- **Deciders:** Robert O'Toole
- **Tags:** renderer, design, theme, primitives
- **Supersedes:** — (extends ADR-022)
- **Superseded by:** —

## Context

Renderer v1 crafted the emergency archetype to the WOW bar; project/premium
archetypes (driveways, landscaping, kitchens) render labelled placeholders.
These trades sell **aspiration, not urgency**: premium home transformation,
luxury curb appeal, status and pride. The design language that makes a
stressed homeowner call a roofer at 2am is exactly wrong for someone
imagining their new driveway at golden hour.

## Decision

### "Golden Hour" — the premium theme

Delivered through the existing theme layer (ADR-022), registered for BOTH
`titan-premium` and `titan-project` themeRefs (two archetypes, one emotional
register: considered, warm, expensive).

- **Ground:** warm limestone light (`#f6f2ea`) — the first LIGHT theme;
  against the emergency set's storm-dark it instantly reads as a different
  company. Generous whitespace carries the luxury.
- **Ink:** espresso (`#241f18`) with muted/faint steps — editorial contrast
  from weight and scale, not colour noise.
- **One confident accent:** burnt bronze (`#b4602f`) — reserved, like the
  emergency amber, for the action and the underline moments.
- **Scene tones:** the shared media-scene vars become golden-hour stone
  gradients (`#e8d5b5 → #c9a97e`), so every art-directed media frame carries
  the mood with zero photography.
- **Motion language:** slower and more graceful than emergency's urgency —
  longer reveal durations, softer easings, larger parallax headroom. Same
  reduced-motion discipline (MotionConfig `user`).

### The crafted set

Every primitive/variant the project and premium sequences use (homepage AND
area pages) resolves to a crafted component — the labelled placeholder
remains only for the care/recurring set (next milestone):

- `hero.cinematic-reveal` (full-bleed / split-editorial / video-backdrop) —
  layered CSS/gradient art direction, weighted headline entrance, LCP-safe
  (server-rendered, CSS-only first paint; the video-backdrop variant renders
  an art-directed backdrop SLOT — no fake footage).
- `proof.portfolio-showcase` (before-after-reveal / cinematic-carousel /
  filterable-grid) — art-directed project frames with media-brief
  annotations; before/after reuses the transformation arc's slider mechanics.
- `gallery.immersive-grid` (masonry / full-bleed-slider) — the premium
  archetype's imagery-led section, as annotated frames until real media.
- `services.interactive-explorer` `tabbed` variant becomes the **surface
  selector**: visitors explore surfaces/materials (block paving, resin,
  tarmac — driven from content slots), texture-suggestive styling per
  surface, a pricing-guide CTA hook per surface.
- Review wall, FAQ, service area, process rail, transformation arc, lead
  capture: unchanged mechanics — the theme layer restyles them premium.

### Bars (unchanged, non-negotiable)

Slots-only copy; mobile-first; reduced-motion-safe; Lighthouse ≥90 mobile on
the published premium demo; no fabricated imagery or testimonials; the
registry coverage test proves no premium-sequence primitive resolves to a
placeholder.

## Consequences

### Positive
- A driveways site and a roofing site now feel like different companies
  built by the same world-class studio — the archetype thesis proven twice.
- The theme layer carried most of the restyle for free (ADR-022's bet paid).

### Negative / Trade-offs
- Light-theme surfaces required auditing primitives written on dark ground.
- The video-backdrop variant ships as an art-directed slot; real motion
  media awaits the media pipeline.

### Neutral / Future
- **3D/WebGL is deliberately absent** — motion + art direction carry v1; a
  future enhancement may add progressive 3D (recorded here, not promised).
- Care/recurring craft is the next primitive milestone.

## Alternatives Considered

- **Dark premium theme** — safer to implement, but "expensive" in this
  category reads light, warm, editorial; and archetype differentiation
  demands distance from the emergency mood. Rejected.
- **A separate premium renderer** — duplicate machinery; the theme layer +
  per-primitive craft achieves the same with one composition path. Rejected.
- **Stock/AI photography for the aspiration mood** — violates the media
  discipline (ADR-022); atmosphere comes from composition, typography,
  gradient art direction, and annotated media briefs. Rejected.

## References

- ADR-021/022 (registry, renderer + theme layer), ADR-028 (area pages the
  set must serve).
- `src/features/website-renderer/theme/theme.ts`, `primitives/`.
