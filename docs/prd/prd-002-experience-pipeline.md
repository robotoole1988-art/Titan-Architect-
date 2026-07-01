# PRD-002: TITAN Experience Pipeline

- **Status:** Draft
- **Date:** 2026-07-01
- **Author:** Robert O'Toole
- **Related:** ADR-013 (architecture), ADR-012 (Experience Engine), ADR-011 (Industry DNA)

## 1. Summary

The **TITAN Experience Pipeline** is the staged process that turns a business —
starting from raw intake — into a finished **Experience Blueprint**. Where the
Experience Engine (PRD-001) defines *what a finished experience is*, the Pipeline
defines *how we get there*: a sequence of thirteen discrete, independently
replaceable stages.

The **v0.1 scope is architecture and interfaces only**: no website generation,
no AI, no UI.

## 2. Problem & purpose

Turning a business into a premium experience is not one step — it is many:
understand the business, resolve its DNA, study its location and competitors and
customers, form a brief, then shape structure, media, animation, SEO, and
conversion. If this is one monolithic process, it is impossible to test,
improve, or evolve a single concern without risking the whole.

The Pipeline makes each concern a **named stage with a clear contract**, so each
can be built, validated, swapped, and improved on its own.

## 3. Goals & non-goals

### Goals
- Model the transformation as **thirteen ordered stages**, each with a clear
  Input, Output, Validation, and Metadata.
- Make every stage **independently replaceable** behind a common contract.
- Produce the Experience Engine's `ExperienceBrief` (stage 7) and
  `ExperienceBlueprint` (stage 13).

### Non-goals (v0.1, and some permanently out of this module)
- ❌ Generating websites.
- ❌ Connecting AI.
- ❌ Building UI.
- ❌ Any database or persistence.
- ❌ Implementing stage logic.

## 4. The thirteen stages

1. Business Intake
2. Industry DNA Resolution
3. Location Intelligence
4. Brand Strategy
5. Competitor Analysis
6. Customer Psychology
7. Experience Brief
8. Website Structure
9. Media Strategy
10. Animation Strategy
11. SEO Strategy
12. Conversion Strategy
13. Final Experience Blueprint

Data flows down the list; later stages consume earlier outputs.

## 5. Every stage's contract

Each stage exposes exactly four aspects:

- **Input** — a typed payload.
- **Output** — a typed payload (often the input of a later stage).
- **Validation** — `validate(input)` returns a structured result (errors,
  warnings, info).
- **Metadata** — id, order, name, and a **contract version** that makes safe
  replacement possible.

`execute(input, context)` is async-ready.

## 6. Independently replaceable stages

Stages are held in a typed registry, each typed to its own contract. A stage can
be replaced by any implementation of the same `PipelineStage<Input, Output>`
without affecting the other twelve. This lets us:

- Start with simple, rules-based stages and later replace individual ones with
  AI-assisted versions.
- A/B or version stages independently.
- Test each stage in isolation.

## 7. Users

- **Internal engines** — consume the pipeline's output blueprint.
- **The Brain** (future) — orchestrates runs and supplies guidance.
- **Operators** — review and override stage outputs.

## 8. Dependencies

- **Industry DNA** (`core/industry-dna`, ADR-011) — resolved at stage 2 and read
  throughout.
- **Experience Engine** (`core/experience-engine`, ADR-012) — the pipeline
  produces its `ExperienceBrief` and `ExperienceBlueprint`.

## 9. Success metrics (future, once implemented)

- Time to run the full pipeline for a new business.
- Quality/consistency of the final blueprint vs. a hand-crafted baseline.
- Ease of replacing a single stage without regressions.

## 10. Open questions (deferred to future ADRs)

- Orchestration: sequential vs. partially parallel; retries and resumption.
- How intermediate stage outputs are persisted and versioned.
- Where AI-assisted stages are introduced first.

## 11. References

- ADR-013 (Experience Pipeline architecture)
- PRD-001 / ADR-012 (Experience Engine)
- `src/core/experience-pipeline/` and its `README.md`
