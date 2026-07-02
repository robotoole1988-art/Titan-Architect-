# Website Blueprint (`core/website-blueprint`)

The **Website Blueprint Engine** transforms an approved **Experience Strategy**
into a complete, **platform-independent Website Blueprint** — the master
architectural document every future generator consumes.

> **Status: v0.2 — first real engine.** A deterministic implementation now sits
> behind the ADR-017 contracts: the **Section Primitive Registry** (ADR-021),
> the **blueprint builder** (strategy → homepage blueprint), and the
> **validator** that enforces the registry. Still no rendering, no
> HTML/CSS/React/Tailwind, no media, no AI, no database. **Think like an
> architect:** this produces the drawings, not the building.

## The transform

```
Experience Strategy  ──▶  [ WebsiteBlueprintEngine ]  ──▶  Website Blueprint
```

The Blueprint describes **WHAT** to build and **WHY** — never how, and never for
a specific platform. The same blueprint can later target React, Next.js,
WordPress, Shopify, Flutter, native mobile, or future frameworks **without
changing the Blueprint itself.**

## The Section Primitive Registry (ADR-021)

Every section a blueprint may contain is a **named primitive** in a typed,
curated catalogue (~15 entries, e.g. `hero.cinematic-reveal`,
`hero.rapid-response`, `conversion.emergency-cta`, `trust.review-wall`). Each
primitive declares its legal **variants**, its **archetype affinities**, its
required **content slots**, and the **aspects** it supports
(animation/interaction/media).

Registry ids are the only legal values in `SectionBlueprint.identifier` and
`ComponentBlueprint.type`; `validateBlueprint(blueprint, registry)` enforces
this, and every generator test runs every blueprint through it. The future
Renderer composes hand-crafted premium primitives 1:1 from these ids — it never
free-generates layout.

## The builder (deterministic, homepage only)

`buildWebsiteBlueprint` / `createWebsiteBlueprintEngine` implement the engine:
the trade **archetype drives the structure** (emergency leads with
conversion/trust; premium and project lead with cinematic story and portfolio
proof; care opens with gentle progressive disclosure), content slots are
populated from the strategy's thesis and copy direction, and aspects are
derived from each primitive's declared capabilities plus the strategy's
animation/interaction strategy. Same strategy in, same blueprint out. Tests
live in `tests/core/website-blueprint/`.

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
├── index.ts               # public API (contracts + registry/validator/builder)
├── common.ts              # ids, confidence/source, BlueprintElement base, enums
├── aspects.ts             # media/animation/interaction/seo/a11y/responsive/…
├── components.ts          # hero/header/footer/navigation/testimonials/faq/component
├── section.ts             # SectionBlueprint
├── page.ts                # PageBlueprint + PageCollection
├── site.ts                # identity/IA/design-system/future-expansion
├── website-blueprint.ts   # the master WebsiteBlueprint
├── engine.ts              # WebsiteBlueprintEngine + request + injected deps
├── registry.ts            # Section Primitive Registry (ADR-021)
├── validator.ts           # validateBlueprint — enforces the registry
└── builder.ts             # deterministic engine implementation (homepage)
```
