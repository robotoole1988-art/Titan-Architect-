# ADR-032: Signature Moments v1 — the scroll-morph engine

- **Status:** Accepted
- **Date:** 2026-07-04
- **Deciders:** Robert O'Toole
- **Tags:** renderer, design, motion, blueprint
- **Supersedes:** — (implements the laws of `docs/experience/SIGNATURE-MOMENTS.md`)
- **Superseded by:** —

## Context

The founder's creative canon (Signature Moments) defines scroll-driven
morphs where one thing naturally becomes another — the visitor never
consciously notices the transition. Two moments are marked v1: **Storm
Cloud → New Roof** (roofing) and **Gravel → Resin** (driveways). The laws
are binding: one moment per site, Lighthouse ≥90 with vector morphs only,
reduced-motion resolves to a designed still, intelligence composes crafted
moments and never free-generates.

## Decision

### Selection is stamped by the builder — catalogue ids only

The blueprint builder stamps `extensions.signatureMoment` on the **homepage
hero section only** (one moment per site — the opening act), from a
deterministic trade → moment table (`roofing` → `storm-cloud-new-roof`,
`driveways-paving` → `gravel-to-resin`; every other trade gets none until
its moment is crafted). This is the registry law applied to moments: the id
is data in the blueprint, the craft lives in the renderer, and a future
Experience Engine parameterises the SAME catalogue — it can never invent a
moment. Area pages never carry one.

### The morph engine: scroll progress → SVG interpolation

`features/website-renderer/moments/` holds the engine and the catalogue:

- A moment is a CLIENT component rendered as the hero's atmosphere layer
  (absolute, behind copy, `pointer-events: none`, `aria-hidden`).
- Scroll progress over the hero (framer `useScroll`) drives interpolation
  of SVG path pairs authored with IDENTICAL command structure, plus
  opacity/position/colour tracks — pure vectors, zero video, zero raster
  beyond the existing LCP poster.
- `resolveSignatureMoment(id)` returns a crafted component or null —
  an unknown id renders nothing (and warns in dev). Never free-generated.

### Performance and accessibility laws, enforced structurally

- **LCP untouched:** the hero stays a server component; first paint remains
  the poster + CSS-only copy entrance. The morph layer hydrates after the
  fact and only ever animates transforms/opacity/path — no layout, no
  filters.
- **Reduced motion = a designed still:** under `prefers-reduced-motion`
  the moment renders its COMPLETED state (the new roof, the finished resin)
  as a static composition — designed, not disabled.
- Lighthouse ≥90 mobile re-verified on BOTH demo trades before merge.

## Consequences

### Positive
- The two flagship morphs ship, and every future moment is "author two
  path states + tracks" on shared machinery.
- Selection-by-data keeps the Experience Engine seam open (parameterise
  colours/house style later without touching composition law).

### Negative / Trade-offs
- Path pairs must be authored with matching command structure — a craft
  constraint on moment authors (documented in the moments README header).
- Scroll-linked morphs are static during SSR; the drama begins on
  hydration. Accepted: the designed initial state IS the Act I atmosphere.

## Alternatives Considered

- **Lottie/video files** — violates the vector/performance law. Rejected.
- **A generic keyframe DSL in the blueprint** — free-generation by the back
  door; blueprints carry INTENT (a catalogue id), never mechanics. Rejected.
- **CSS-only scroll-timeline** — browser support still partial; framer is
  already the renderer's motion system (ADR-022). Rejected for v1.

## References

- `docs/experience/SIGNATURE-MOMENTS.md` (the laws + catalogue),
  ADR-021/022/029.
- `src/features/website-renderer/moments/`,
  `src/core/website-blueprint/builder.ts`.
