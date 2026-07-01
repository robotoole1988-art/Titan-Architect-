# Website Blueprint (`core/website-blueprint`)

The **Website Blueprint Engine** transforms an approved **Experience Strategy**
into a complete, **platform-independent Website Blueprint** — the master
architectural document every future generator consumes.

> **Status: v0.1 — interfaces only.** No implementation, no rendering, no
> generation, no HTML/CSS/React/Tailwind, no media, no AI, no database, no
> business logic. **Think like an architect:** this produces the drawings, not
> the building.

## The transform

```
Experience Strategy  ──▶  [ WebsiteBlueprintEngine ]  ──▶  Website Blueprint
```

The Blueprint describes **WHAT** to build and **WHY** — never how, and never for
a specific platform. The same blueprint can later target React, Next.js,
WordPress, Shopify, Flutter, native mobile, or future frameworks **without
changing the Blueprint itself.**

## What the Blueprint contains

- **Site** — identity, information architecture, navigation, header, footer,
  design-system references, future-expansion points.
- **Pages** — each with name, purpose, audience, conversion goal, SEO intent,
  URL, ordered sections, media/animation/interaction/lead-capture/trust
  requirements, internal links, schema opportunities, accessibility, responsive
  behaviour, and future-AI notes.
- **Sections** — identifier, purpose, priority, intended emotion, conversion
  importance, content and component requirements, animation/media/interaction
  behaviour, visibility and responsive rules, and future-AI notes.
- **Cross-cutting aspects** — media, animation, interaction, SEO, accessibility,
  responsive, conversion, CTAs, lead capture, internal linking, trust signals.
- **Components** — hero, testimonials, FAQ, and generic component blueprints.

## Explainability, built in from day one

**Every** blueprint element extends `BlueprintElement`, which requires a
`confidence` (score + reasoning reference + source references). This lets the
Brain eventually explain *why* an element exists, e.g.:

```
Hero Section — confidence 0.97
derived from: industry-dna, experience-strategy, competitor-analysis,
              customer-psychology
```

The reasoning itself is not implemented here — only the architecture that makes
it expressible.

## Dependencies (abstractions only)

The engine consumes the Experience Strategy (its input) and is wired — via
dependency inversion — with optional abstractions of `industry-dna`,
`knowledge-kernel`, `experience-engine`, `experience-pipeline`, and
`brain-orchestrator`. It depends on interfaces, never concrete implementations,
and never couples tightly.

## Structure

```
website-blueprint/
├── index.ts               # public API (type-only + version)
├── common.ts              # ids, confidence/source, BlueprintElement base, enums
├── aspects.ts             # media/animation/interaction/seo/a11y/responsive/…
├── components.ts          # hero/header/footer/navigation/testimonials/faq/component
├── section.ts             # SectionBlueprint
├── page.ts                # PageBlueprint + PageCollection
├── site.ts                # identity/IA/design-system/future-expansion
├── website-blueprint.ts   # the master WebsiteBlueprint
└── engine.ts              # WebsiteBlueprintEngine + request + injected deps
```
