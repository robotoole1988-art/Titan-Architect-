# ADR-017: Website Blueprint Engine Architecture

- **Status:** Accepted
- **Date:** 2026-07-01
- **Deciders:** Robert O'Toole
- **Tags:** architecture, core, experience, blueprint, foundation
- **Supersedes:** —
- **Superseded by:** —

## Context

TITAN can create an Experience Strategy (ADR-014) and review/approve it
(Experience Studio, PRD-004). The next step is to turn an approved strategy into
an actual website — but doing that in one leap, straight to generated code, would
hide every architectural decision inside markup where it cannot be inspected,
reused, or explained, and would lock the platform to a single rendering
technology.

We need an intermediate, durable layer: the **architecture of the website**,
produced before any construction. An architect draws before building; TITAN
needs the digital equivalent.

## Decision

We introduce a new core module, **`src/core/website-blueprint`** — **interfaces
only** (no implementation, rendering, generation, HTML/CSS/React/Tailwind, media,
AI, database, or business logic).

It defines the **Website Blueprint** — a complete, structured, platform-
independent description of a website (site identity, information architecture,
navigation, header/footer, pages, sections, components, and cross-cutting aspects
for media, animation, interaction, SEO, accessibility, responsive, conversion,
CTAs, lead capture, internal linking, and trust) — and a **`WebsiteBlueprintEngine`**
contract that transforms an `ExperienceStrategy` into a `WebsiteBlueprint`.

### Why Website Blueprints exist as their own core module

The Blueprint is a distinct, reusable artifact consumed by many future
capabilities. It is not part of any one generator, nor a UI concern. Giving it
its own `core` module makes it a first-class, shared source of truth with a
stable contract — and keeps generators (and their framework specifics) out of it.

### Why the Blueprint is platform-independent

The Blueprint describes **what** and **why**, never **how**. It deliberately
contains no framework, markup, or styling. This is the single most important
property: it lets one blueprint target React, Next.js, WordPress, Shopify,
Flutter, native mobile, or future frameworks **without changing**. TITAN is never
locked to a rendering technology, and can add or switch stacks from the same
source of truth.

### Why every future generator consumes the Blueprint

By making the Blueprint the single source of truth, every generator — website,
landing page, media, SEO — reads the same document and produces its part.
Improving a generator never requires re-deciding the architecture; redesigns
start from an updated blueprint, not a blank page; and consistency across
generators is guaranteed because they share one input.

### Why explainability is built in from day one

Every blueprint element extends a base that **requires** a confidence score and
carries reasoning and source references. Explainability is therefore structural,
not an afterthought: the architecture can always express *why* an element exists
(e.g. a hero at 0.97 confidence derived from Industry DNA, Experience Strategy,
competitor analysis, and customer psychology). Building this in now — rather than
retrofitting it — is what will let the Brain explain and defend TITAN's output,
and turns the platform from a black box into an inspectable system.

### Dependencies via inversion

The engine's input is the Experience Strategy; it is otherwise wired, via
dependency inversion, with **optional abstractions** of Industry DNA, Knowledge
Kernel, Experience Engine, Experience Pipeline, and Brain Orchestrator. It
depends on interfaces, never concrete implementations, and never couples tightly.

## Consequences

### Positive
- A durable, inspectable architecture sits between strategy and generation.
- Platform independence: one blueprint, many targets, no rework.
- One source of truth for every generator; improvements compound.
- Explainability is guaranteed by the type system, from day one.

### Negative / Trade-offs
- **A large schema** to design and maintain; it will evolve as generators use it.
- **An extra layer** between strategy and output — the payoff is durability,
  reuse, and explainability.
- Requiring `confidence` on every element adds weight; this is deliberate, to
  make explainability non-optional.
- Interfaces without implementation are validated by type-checking and the first
  generator, not yet at runtime.

### Neutral
- Blueprint *generation*, *rendering*, persistence, and how each generator
  consumes the Blueprint are out of scope — each gets its own ADR.

## Alternatives Considered

- **Generate the website directly from the strategy** — fastest, but buries
  architecture in markup, locks to one platform, and cannot be inspected,
  reused, or explained. Rejected.
- **A platform-specific blueprint (e.g. React-shaped)** — easier to render, but
  forfeits platform independence and couples the source of truth to one stack.
  Rejected.
- **Explainability as optional metadata added later** — would make it an
  afterthought and leave most elements unexplained. Rejected in favour of a
  required, structural approach.

## Long-term consequences

This fixes a durable spine for the Experience Department: **strategy → blueprint →
generation**, with the blueprint as the platform-independent, explainable source
of truth. For as long as it holds, TITAN can add generators, adopt new
frameworks, redesign, and improve with AI — all from the same blueprint, never by
re-deciding the architecture. The main thing to manage is schema evolution: the
Blueprint's contracts must be changed deliberately (via ADRs), because every
generator depends on their stability.

## References

- PRD-005 (Website Blueprint Engine — product requirements).
- ADR-014 (Experience Strategy Generator — the input), ADR-012/013 (Experience
  Engine, Pipeline), ADR-011 (Industry DNA), ADR-015 (Brain Orchestrator).
- ADR-008 (boundary enforcement governing the `core` layer).
- `src/core/website-blueprint/` and its `README.md`.
