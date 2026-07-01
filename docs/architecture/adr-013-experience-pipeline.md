# ADR-013: TITAN Experience Pipeline Architecture

- **Status:** Accepted
- **Date:** 2026-07-01
- **Deciders:** Robert O'Toole
- **Tags:** architecture, core, pipeline, experience, foundation
- **Supersedes:** —
- **Superseded by:** —

## Context

The Experience Engine (ADR-012) defines the *contract* for a finished
experience — the `ExperienceBrief` (input) and `ExperienceBlueprint` (output).
What it does not define is *how a real business is transformed into that
blueprint*. That transformation is not a single step: it spans understanding the
business, resolving its Industry DNA, analysing its location, competitors and
customers, forming a brief, and then shaping structure, media, animation, SEO,
and conversion.

If that transformation is one monolithic function, it becomes impossible to
test, evolve, or improve a single concern in isolation — and impossible to
introduce AI into one part without touching everything. We need the
transformation modelled as **discrete, independently replaceable stages**,
defined **before** any stage logic, UI, or AI exists.

## Decision

We introduce a new core module, **`src/core/experience-pipeline`** — **interfaces
only** (no implementation, no data, no AI, no database, no UI).

It defines:

1. **A generic stage contract**, `PipelineStage<TInput, TOutput>`, exposing the
   four required aspects for every stage:
   - **Input** (`TInput`) and **Output** (`TOutput`) typed payloads,
   - **Validation** — `validate(input): ValidationResult`,
   - **Metadata** — `metadata: StageMetadata` (id, order, name, **contract
     version**).
   `execute(input, context)` is `Promise`-returning (async-ready).

2. **Thirteen stages**, each with its own `Input`, `Output`, and stage type
   (`business-intake` → `final-experience-blueprint`). Data flows down the list;
   later stages consume earlier outputs. Stage 7 produces the engine's
   `ExperienceBrief`; stage 13 produces its `ExperienceBlueprint`.

3. **A pipeline composition** — a `PipelineStageRegistry` that types each stage
   to its own contract (making each **independently replaceable**), plus an
   `ExperiencePipeline` interface with `run(...)`, a `PIPELINE_STAGE_ORDER`
   constant, and a provider seam.

The module lives in `core/` and **consumes** `core/industry-dna` (ADR-011) and
`core/experience-engine` (ADR-012) — `core → core` dependencies in the correct
direction, which the boundary rules (ADR-008) permit.

### Why staged and independently replaceable

- **Isolation of concerns** — each stage owns one transformation with a clear
  contract, so it can be built, validated, and reasoned about alone.
- **Safe evolution** — a stage's `version` and typed contract let it be replaced
  (e.g. a rules-based stage swapped for an AI-assisted one) without touching the
  others.
- **Testability** — stages can be exercised in isolation with typed inputs.
- **Composability** — the pipeline is data flowing through swappable parts, not a
  tangle.

## Consequences

### Positive
- One clear model of the whole transformation, with every step named.
- Any stage can be replaced independently — the key to introducing AI gradually.
- Produces the Experience Engine's brief and blueprint, tying the core modules
  together into a coherent flow.
- Extensible: every payload carries an `extensions` bag; stages are contracts,
  not implementations.

### Negative / Trade-offs
- A larger surface of interfaces to keep coherent as stages are implemented.
- v0.1 stage boundaries are an early model and may shift; changing a stage
  contract requires care and a new ADR.
- Interfaces without implementation are validated by type-checking and the first
  implementation, not yet at runtime.

### Neutral
- Orchestration (sequencing, retries, resumption), persistence of intermediate
  outputs, and where AI-assisted stages land are out of scope — each gets its own
  ADR.

## Alternatives Considered

- **A single monolithic generator** — simplest to start, but untestable,
  hard to evolve, and impossible to swap one concern. Rejected.
- **One module per stage** — maximum isolation, but premature and heavy for
  thirteen contracts that share one shape. Rejected for now; a stage could be
  promoted later if it grows.
- **Untyped stage handlers** — flexible but throws away the safety and clarity
  the typed contracts provide. Rejected.

## References

- PRD-002 (Experience Pipeline — product requirements).
- ADR-012 (Experience Engine), ADR-011 (Industry DNA), ADR-008 (boundaries).
- `src/core/experience-pipeline/` and its `README.md`.
