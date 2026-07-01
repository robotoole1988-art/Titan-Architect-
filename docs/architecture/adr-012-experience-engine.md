# ADR-012: TITAN Experience Engine Architecture

- **Status:** Accepted
- **Date:** 2026-07-01
- **Deciders:** Robert O'Toole
- **Tags:** architecture, core, experience, engine, foundation
- **Supersedes:** —
- **Superseded by:** —

## Context

TITAN models a trade business completely as **Industry DNA** (ADR-011). The next
question is how to turn that DNA into the thing customers actually see: a
premium, cinematic, high-converting digital experience — websites, immersive
heroes, 3D/interactive moments, service and location pages, media and animation
direction, SEO-ready structure, and lead-capture flows, mobile-first throughout
(see PRD-001).

If each future product built this its own way, the platform would fragment and
lose the consistency and compounding value that come from one shared model. We
need a single, well-defined **engine contract** that takes DNA + guidance and
produces a structured experience — defined **before** any generation logic, UI,
or AI exists.

## Decision

We introduce a new core module, **`src/core/experience-engine`** — **interfaces
only** (no implementation, no data, no AI, no database, no UI).

It defines three things:

1. **`ExperienceBrief`** (input) — references the business's `IndustryDna`
   (Brand DNA and Website DNA are its `.brand` / `.website` sections), plus
   conversion `objectives`, creative `guidance` (human now, Brain later), and
   the `targetPages` to produce.

2. **`ExperienceBlueprint`** (output) — a *structured specification* of the
   experience: `pages` (home/landing/service/location…), each with hero,
   sections, SEO and lead-capture direction, plus site-wide `mediaDirection`,
   `animationStrategy`, `interaction` (3D), `seo`, `leadCapture`, and
   `responsive` (mobile-first) strategy. It **describes** the experience; it is
   not the built website.

3. **`ExperienceEngine`** (contract) — `generate(brief)` and
   `generatePage(brief, page)`, both `Promise`-returning, plus an
   `ExperienceEngineProvider` seam so consumers never import a concrete engine.

Design choices, made now so later work is additive:

- **Structured output, not raw markup** — a blueprint can be reviewed, versioned,
  improved, and rendered by different targets.
- **Async-ready** — a future rules-based, template-based, or AI-assisted
  implementation needs no contract change.
- **Extensible everywhere** — every structure extends an `ExperienceMeta` base
  with an open `extensions` bag, and interfaces allow widening.

The engine lives in `core/` because it is horizontal platform capability. It
**depends on** `core/industry-dna` (a `core → core` dependency, direction
respected — the engine consumes the DNA schema, never the reverse), which the
boundary rules (ADR-008) already permit.

## Consequences

### Positive
- One authoritative contract for producing experiences; no per-product divergence.
- Future products (a Website Engine) and the Brain build against a stable
  interface before any generation, UI, or AI exists.
- Structured blueprints are inspectable and improvable, unlike opaque HTML.
- Extensible, so new experience capabilities are additive.

### Negative / Trade-offs
- A sizeable contract to keep coherent as real generation exercises it.
- v0.1 shapes are an early model and will evolve; changing the contract requires
  care and a new ADR.
- Interfaces without an implementation are validated by type-checking and the
  first consumer, not yet at runtime.

### Neutral
- Generation strategy, persistence/versioning of blueprints, rendering, and
  Brain collaboration are explicitly out of scope — each gets its own ADR.

## Alternatives Considered

- **Generate HTML directly per product** — fastest short-term, but opaque,
  unversionable, and divergent across products. Rejected.
- **Put the engine in a feature** — it is shared, horizontal capability consumed
  by multiple products; a feature (vertical slice) is the wrong home. Rejected in
  favour of `core/`.
- **Design a rendering/template system first** — premature; couples the contract
  to a rendering choice not yet made. Rejected: contract first, rendering later.

## References

- PRD-001 (TITAN Experience Engine — product requirements).
- ADR-011 (Industry DNA — the engine's primary input).
- ADR-010 (Knowledge Kernel), ADR-008 (boundary enforcement).
- `src/core/experience-engine/` and its `README.md`.
