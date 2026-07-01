# Experience Engine (`core/experience-engine`)

The **TITAN Experience Engine** turns a business's DNA and guidance into a
premium, cinematic, high-converting digital experience — expressed as a
structured **Experience Blueprint**.

> **Status: v0.1 — interfaces only.** No implementation, no data, no AI, no
> database, no UI. This module defines the contract; generation comes later,
> behind its own ADR.

## Inputs → Output

```
ExperienceBrief                         ExperienceBlueprint
─ Industry DNA (incl. Brand & Website)  ─ pages (home/landing/service/location…)
─ objectives (lead-capture, booking…)   ─ hero direction (immersive)
─ guidance (creative/AI direction)  ──▶ ─ media direction (photo/video/3D)
─ target pages                          ─ animation strategy
                                        ─ interaction (3D/interactive)
        [ ExperienceEngine ]            ─ SEO structure
                                        ─ lead-capture flows
                                        ─ responsive (mobile-first)
```

## Public interface

Import only from the package root (`@/core/experience-engine`):

```ts
import type { ExperienceEngine, ExperienceBrief } from "@/core/experience-engine";

async function example(engine: ExperienceEngine, brief: ExperienceBrief) {
  const blueprint = await engine.generate(brief);
  const service = await engine.generatePage(brief, "service");
}
```

All methods are `Promise`-returning, so a future implementation (rules-based,
template-based, or AI-assisted) can be async without changing callers.

## Structure

```
experience-engine/
├── index.ts               # public API (type-only exports + version)
├── common.ts              # extensions, meta base, page/objective/media unions
├── brief.ts               # ExperienceBrief (input) — consumes Industry DNA
├── blueprint.ts           # ExperienceBlueprint (output) + all sub-specs
└── experience-engine.ts   # the ExperienceEngine contract + provider seam
```

## Extensibility

Every structure extends `ExperienceMeta` (an open `extensions` bag) and is an
`interface`, so it can be widened via `extends` or declaration merging. All
optional fields let a blueprint be produced partially.

## Relationships

- **Consumes** `core/industry-dna` (ADR-011) — the brief's primary input.
- **Produces** an Experience Blueprint that a future **Website Engine** (product)
  renders into a real site. That rendering is out of scope here.
- The **Brain** (future) supplies the `guidance` input.

See `docs/prd/prd-001-experience-engine.md` and
`docs/architecture/adr-012-experience-engine.md`.
