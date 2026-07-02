# ADR-021: Section Primitive Registry — blueprints compose, never free-generate

- **Status:** Accepted
- **Date:** 2026-07-02
- **Deciders:** Robert O'Toole
- **Tags:** architecture, core, blueprint, registry, quality
- **Supersedes:** —
- **Superseded by:** —

## Context

ADR-017 established the Website Blueprint as the platform-independent
architectural document between strategy and generation, with a
`WebsiteBlueprintEngine` contract but no implementation. To build the first
real engine we had to decide *what a section identifier actually is*.

The schema left `SectionBlueprint.identifier` and `ComponentBlueprint.type` as
open strings. An open namespace invites the worst failure mode of AI-built
websites: every generated site becomes a one-off layout that no renderer can
implement to a premium standard, no two sites share improvements, and quality
is capped by whatever the generator improvised that day. TITAN's promise is the
opposite — cinematic, hand-crafted-quality websites at scale.

## Decision

We introduce a **Section Primitive Registry** in `src/core/website-blueprint/`
— a typed, curated catalogue of ~10–15 named section primitives (e.g.
`hero.cinematic-reveal`, `hero.rapid-response`, `story.transformation-arc`,
`proof.credential-band`, `services.interactive-explorer`,
`conversion.emergency-cta`, `trust.review-wall`, `location.service-area`).

Each entry defines the primitive's **id**, its **legal variants**, its
**archetype affinities**, its **required content slots**, and the
**aspects it supports** (animation / interaction / media).

Registry ids are the **only legal values** a generator may write into
`SectionBlueprint.identifier` and `ComponentBlueprint.type`. A
`validateBlueprint(blueprint, registry)` function enforces this: identifiers
and component types must resolve to a registered primitive, the selected
variant (carried in the element's `extensions.variant` bag, keeping the
ADR-017 contracts unchanged) must be legal, every required content slot must be
populated, and no section may use an aspect its primitive does not support.
Every generator test passes every generated blueprint through the validator.

**The future Renderer composes hand-crafted premium primitives 1:1 from these
ids; it never free-generates layout.** Prose fields on the blueprint
(`purpose`, headline direction, cinematic treatment) remain richly populated —
they are direction and explainability, never the composition mechanism.

The first engine implementation follows the same decision: the deterministic
builder maps each trade archetype to a deliberate sequence of primitives
(emergency leads with conversion/trust; premium and project lead with cinematic
story and portfolio proof; care opens with gentle progressive disclosure) and
fills the slots from the Experience Strategy. Same strategy in, same blueprint
out — no AI, no clocks, no randomness.

### Why a closed catalogue rather than an open namespace

- **Quality has a floor.** Every primitive can be hand-crafted once to a
  premium standard and reused by every site. Improving one primitive improves
  every blueprint that references it.
- **The renderer is implementable.** A registry of ~15 primitives × a few
  variants is a finite, buildable component library. An open namespace is not.
- **Blueprints stay inspectable.** A section is a named, documented concept
  with declared slots — not an improvised layout hidden in prose.
- **Curation is the moat.** The catalogue grows deliberately (a new primitive
  is a reviewed design investment), not accidentally.

## Consequences

### Positive
- Generator output is mechanically verifiable (`validateBlueprint`) — a
  blueprint that validates is renderable by construction.
- Deterministic generation is testable: archetypes produce provably different
  structures, and regressions are caught by golden assertions.
- Explainability improves: each section's confidence records its
  archetype-affinity reasoning and registry source.

### Negative / Trade-offs
- **Expressiveness is bounded** by the catalogue. A trade needing a section we
  don't have waits for a registry addition (a deliberate design task).
- Variants ride in the `extensions` bag rather than a first-class field; if
  variants become central, a future ADR should promote them into the schema.
- The archetype → sequence mapping is fixed per archetype in this version;
  per-business re-ranking is explicitly future Brain work.

### Neutral
- Vitest is introduced as the repo's test runner (`npm test`, wired into CI
  alongside lint/typecheck/build per ADR-009) — the validator-enforced tests
  are the first real test suite.
- The registry serves the homepage-only engine today; multi-page blueprints
  reuse it unchanged.

## Alternatives Considered

- **Open string identifiers (status quo)** — maximum flexibility, but
  unrenderable at premium quality and unverifiable. Rejected.
- **AI-generated layout per site** — differentiated in theory, but quality
  becomes non-deterministic and unreviewable, and no renderer can keep up.
  Rejected; the Brain may later *choose and re-rank* primitives, never invent
  layout.
- **Variants as separate registry entries** (e.g. `hero.cinematic-reveal--full-bleed`)
  — simpler validation but explodes the catalogue and hides that variants share
  one crafted implementation. Rejected.

## References

- ADR-017 (Website Blueprint Engine), PRD-005.
- ADR-014 / ADR-020 (Experience Strategy + trade archetypes — the input).
- ADR-019 (URL boundary pattern the Blueprint Viewer follows).
- `src/core/website-blueprint/registry.ts`, `validator.ts`, `builder.ts`;
  `tests/core/website-blueprint/`.
