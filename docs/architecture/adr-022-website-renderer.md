# ADR-022: Website Renderer — the React realisation of the Blueprint

- **Status:** Accepted
- **Date:** 2026-07-02
- **Deciders:** Robert O'Toole
- **Tags:** architecture, renderer, features, blueprint, motion, quality
- **Supersedes:** —
- **Superseded by:** —

## Context

The Website Blueprint Engine (ADR-017/021) produces a validated,
platform-independent blueprint composed from registered section primitives. The
Blueprint Viewer shows the *architecture*; nothing yet shows the *website*. We
need the first Renderer: the piece that composes hand-crafted premium
primitives 1:1 from registry ids into a real, cinematic homepage — proving the
strategy → blueprint → render spine end to end.

Forces: `core/` must stay platform-independent (ADR-017), the charter's layers
and lint boundaries must hold (ADR-008), quality must meet the Manifesto's
"£10k cinematic experience" bar, and motion/media must create emotion and
guide attention — never decoration, never fake imagery.

## Decision

### Where it lives: `src/features/website-renderer/`

The Renderer is implemented as a **feature**, not a new layer and not a core
module:

- It cannot live in `core/` — it is deliberately platform-specific
  (React/Next.js/Tailwind/Framer Motion), and `core/` is the platform-
  independent kernel.
- A new top-level layer (e.g. `src/renderer/`) would require amending the
  charter's layer model and the ESLint boundary configuration for a single
  consumer. The feature layer already gives the Renderer exactly the rights it
  needs (feature → core public APIs) and the isolation we want (private
  internals, one public `index.ts`).
- If TITAN later grows multiple platform renderers (WordPress, native, email)
  or core services must invoke rendering, that is the moment to promote a
  shared rendering contract downward — recorded then in its own ADR.

The Renderer consumes **only the `core/website-blueprint` public API** (plus
shared UI/foundation). It never imports the strategy generator's internals; the
blueprint document is its entire input.

### Structure

```
src/features/website-renderer/
├── index.ts                  # public API: WebsitePreviewPage, renderPage, PRIMITIVE_COMPONENT_MAP
├── model/
│   ├── types.ts              # PrimitiveSectionProps, PrimitiveComponentMap, RenderPageOptions
│   ├── slots.ts              # content-slot parsing (slots are the ONLY copy source)
│   ├── primitive-map.tsx     # registry id → React component
│   └── render-page.tsx       # renderPage(blueprint): header → sections → footer
├── theme/                    # design tokens + typography (next/font)
├── motion/                   # shared motion system (Framer Motion)
├── primitives/               # one hand-crafted component per registry primitive
└── components/               # WebsitePreviewPage (chrome bar + rendered page)
```

- **`PrimitiveComponentMap`** — maps a registry primitive id to its component;
  each component receives the `SectionBlueprint`, its variant, the theme, and
  parsed slots. Variants are handled inside the primitive (one crafted
  implementation per primitive, variant as a prop), mirroring ADR-021's
  "variants share one crafted implementation".
- **Theme layer** — CSS custom-property token sets (colour roles, fluid type
  scale, spacing) selected by the blueprint's `designSystem.themeRef`, which
  the builder now emits deterministically (`titan-<archetype>`). The renderer
  reads the blueprint only; when the blueprint schema later carries full design
  tokens, the theme layer consumes them from there.
- **Motion system** — a shared library (scroll reveals, staggered entrances,
  parallax, magnetic CTAs) built on **Framer Motion** (new dependency,
  `framer-motion@^12`). All motion routes through this system and respects
  `prefers-reduced-motion` (Framer `MotionConfig reducedMotion="user"` +
  `useReducedMotion` for custom effects). Motion exists to create emotion and
  guide attention — never decoration.
- **`renderPage(blueprint, options?)`** — pure composition: resolves each
  section's primitive through the map and composes header → sections → footer.
  Deterministic: same blueprint, same markup.

### Failure semantics

An unmapped primitive id **fails loudly in development** (thrown error naming
the primitive and variant) and **degrades gracefully in production** (section
skipped with a console warning; the rest of the page renders). The behaviour is
injectable (`onUnmapped: "throw" | "skip"`, defaulting by `NODE_ENV`) so both
paths are unit-tested.

### Media discipline

No AI-generated photos of work, no stock imagery. v1 creates atmosphere with
composition, typography, and motion (gradient/canvas storm scenes), and renders
every real-photography requirement as an **art-directed media slot**: a
deliberately designed frame annotated with the blueprint's `MediaBlueprint`
direction and `generationRef`. Reviews and FAQ items follow the same honesty
rule — premium slot frames awaiting real content, never fabricated
testimonials.

### Scope of v1

The emergency-archetype homepage sequence end to end (hero.rapid-response,
conversion.emergency-cta, trust.review-wall, proof.credential-band,
services.interactive-explorer, location.service-area, process.journey-map,
faq.reassurance-accordion, conversion.lead-capture) plus
story.transformation-arc (the scroll-driven before/after reveal). Preview route
`/experience-studio/preview` follows the ADR-019 URL boundary with graceful
fallback. Mobile-first, semantic landmarks, keyboard-operable interactions,
Lighthouse mobile performance ≥ 90 on the production build.

### Performance posture (how the ≥90 gate is met)

- **The preview gets its own root layout** (multiple-root-layouts pattern:
  `(app)`, `(auth)`, and `(preview)` each own an `<html>`). A rendered website
  must not pay for the OS shell's fonts, providers, or hydration — measured,
  the shell added ~1s to first paint. This also matches the product intent: a
  full-bleed site under a thin TITAN chrome bar.
- **The hero is a server component animated in pure CSS** (local keyframes,
  `prefers-reduced-motion` media queries). The opening storm must move on the
  first frame, before any JavaScript. Framer Motion serves the below-fold,
  interaction-rich primitives, whose bundle hydrates lazily via one
  `next/dynamic` client boundary.
- **The storm ground is a designed, generated poster image** (checked-in PNG
  of composed gradients — media discipline holds: no photography, no stock).
  As a real `<img>` it is the page's LCP element, decoupling LCP from webfont
  arrival.
- **Fonts:** display/body are preloaded with `display: "optional"` so the
  oversized headline never re-wraps mid-view (CLS 0 by construction); the
  annotation mono is `optional` + non-preloaded — its fallback is acceptable.
- Measured on `next build` + `next start`, mobile emulation, three runs:
  **performance 90/90/88 (median 90), accessibility 96, CLS 0, TBT ~70 ms,
  observed LCP ~365 ms.**

## Consequences

### Positive
- The full spine works in-product: Intake → Strategy → Blueprint → **Render**.
- ADR-021's promise is honoured mechanically: the Renderer composes only
  registered primitives; unmapped ids cannot ship silently.
- Every primitive is hand-crafted once and reused by every business the
  archetype serves; quality compounds.

### Negative / Trade-offs
- Framer Motion adds a client-side dependency (~30 kB gz on rendered pages);
  accepted for a shared, reduced-motion-aware motion system.
- Primitives are client components where interaction demands it; the preview
  page is heavier than the studio pages. The Lighthouse gate keeps this honest.
- Only the emergency path is mapped in v1; other archetypes' previews fail
  loudly in dev until their primitives land (deliberate, visible debt).

### Neutral
- The preview renders full-bleed under its own root layout with a thin TITAN
  chrome bar; a standalone/exported rendering target is future work.
- The app now has three root layouts — `(app)`, `(auth)`, `(preview)` — an
  extension of ADR-003's route-group model recorded here.

## Alternatives Considered

- **A new `src/renderer/` top-level layer** — architecturally tidy but requires
  charter + boundary changes for one consumer today. Deferred; revisit when a
  second renderer target exists.
- **Rendering inside `core/`** — violates platform independence (ADR-017).
  Rejected.
- **CSS-only motion, no library** — lighter, but scroll-linked reveals,
  layout-aware staggering, and drag physics would be hand-rolled and
  inconsistent. Rejected in favour of one well-audited system.
- **Stock/AI imagery for instant "wow"** — faster to impress, dishonest and
  generic; violates the media discipline. Rejected.

## References

- ADR-017 (Blueprint contracts), ADR-021 (primitive registry — "the Renderer
  never free-generates layout"), ADR-019 (URL boundary), ADR-008 (boundaries).
- `src/features/website-renderer/`, `tests/features/website-renderer/`.
