# Experience Pipeline (`core/experience-pipeline`)

The **TITAN Experience Pipeline** transforms a business — from raw intake all the
way to a finished **Experience Blueprint** — through thirteen discrete,
independently-replaceable stages.

> **Status: v0.1 — interfaces only.** No implementation, no data, no AI, no
> database, no UI. This module defines the stage contracts; the stages
> themselves are implemented later, behind their own ADRs.

## The thirteen stages

| # | Stage | Produces (Output) |
| --- | --- | --- |
| 1 | Business Intake | normalised business facts |
| 2 | Industry DNA Resolution | `IndustryDna` |
| 3 | Location Intelligence | service areas, demand, seasonality |
| 4 | Brand Strategy | positioning, personality, tone |
| 5 | Competitor Analysis | competitor profiles, market gaps |
| 6 | Customer Psychology | motivations, pain points, objections |
| 7 | Experience Brief | `ExperienceBrief` |
| 8 | Website Structure | pages / sitemap |
| 9 | Media Strategy | `MediaDirection` |
| 10 | Animation Strategy | `AnimationStrategy` |
| 11 | SEO Strategy | `SeoStructure`, keyword clusters |
| 12 | Conversion Strategy | lead-capture flows, CTAs |
| 13 | Final Experience Blueprint | `ExperienceBlueprint` |

Data flows down the list — later stages consume earlier outputs.

## Every stage has the four required aspects

Each stage is a `PipelineStage<Input, Output>`:

- **Input** — the stage's typed `…Input` payload.
- **Output** — the stage's typed `…Output` payload.
- **Validation** — `validate(input): ValidationResult`.
- **Metadata** — `metadata: StageMetadata` (id, order, name, version).

`execute(input, context)` is `Promise`-returning (async-ready).

## Independently replaceable

The `PipelineStageRegistry` types each stage to its own contract, so any single
stage can be swapped for another implementation of the same `PipelineStage`
without affecting the rest:

```ts
import type { ExperiencePipeline, BrandStrategyStage } from "@/core/experience-pipeline";

// A drop-in replacement for one stage; the other twelve are untouched.
declare const customBrandStrategy: BrandStrategyStage;
```

## Structure

```
experience-pipeline/
├── index.ts                 # public API (type-only + version/order consts)
├── common.ts                # PipelineStage<I,O>, StageMetadata, ValidationResult, context
├── stages.ts                # 13 × (Input, Output, Stage type)
└── experience-pipeline.ts   # registry + ExperiencePipeline contract + stage order
```

## Relationships

- **Consumes** `core/industry-dna` (ADR-011) and `core/experience-engine`
  (ADR-012). The pipeline *produces* the engine's `ExperienceBrief` (stage 7)
  and `ExperienceBlueprint` (stage 13).
- The **Brain** (future) orchestrates runs and supplies guidance.

See `docs/prd/prd-002-experience-pipeline.md` and
`docs/architecture/adr-013-experience-pipeline.md`.
