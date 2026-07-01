# Experience Strategy Generator (`core/experience-strategy`)

**The first TITAN engine that produces real business value.** It turns a
business's basic details into a complete, structured **Experience Strategy** —
a strategy *document*, not a website.

> **Status: v0.1 — mock data.** No AI APIs, no UI, no website generation. The
> generator produces deterministic content tailored to the business name, trade,
> and location. It is designed so the Brain can inject a real Experience Engine +
> Pipeline later and populate strategies automatically.

## Input → Output

```
ExperienceStrategyRequest              ExperienceStrategy (document)
─ businessName                         1.  Visual Direction
─ trade                                2.  Hero Concept
─ location                       ──▶   3.  Storytelling
─ industryDna (optional)               4.  Animation Strategy
                                       5.  Interactive Features
    [ generateExperienceStrategy ]     6.  Media Direction
                                       7.  Conversion Strategy
                                       8.  SEO Strategy
                                       9.  Mobile Strategy
                                       10. AI Media Brief
```

## Usage

```ts
import { generateExperienceStrategy } from "@/core/experience-strategy";

const strategy = generateExperienceStrategy({
  businessName: "Rapid Response Plumbing",
  trade: "Plumbing",
  location: "Manchester",
});

strategy.seoStrategy.primaryKeywords;
// ["plumbing manchester", "plumbing near me", "emergency plumbing manchester"]
```

Or via the generator contract (swappable):

```ts
import { mockExperienceStrategyGenerator } from "@/core/experience-strategy";
const strategy = mockExperienceStrategyGenerator.generate(request);
```

## Built for the Brain

- `ExperienceStrategyGenerator` is an interface — the Brain will provide its own
  implementation and resolve it via `ExperienceStrategyGeneratorProvider`.
- `ExperienceStrategyContext` declares the backends (Experience Engine +
  Pipeline) a real generator will consume. The v0.1 mock does not use them; they
  document how automatic population will work later.

## Structure

```
experience-strategy/
├── index.ts        # public API (types + generator + version)
├── types.ts        # the 10 strategy sections + request/document types
└── generator.ts    # ExperienceStrategyGenerator + mock generateExperienceStrategy()
```

## Relationships & naming

- Consumes types from `core/industry-dna`, `core/experience-engine`, and
  `core/experience-pipeline` (all `core → core`).
- Note: `AnimationStrategy` and `MediaDirection` here are *strategy-document*
  sections and are distinct from the similarly-named types in
  `core/experience-engine`. Alias if a file ever imports both.
