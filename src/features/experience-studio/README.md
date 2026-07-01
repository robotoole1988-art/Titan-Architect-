# Experience Studio feature

The first visible workspace for **reviewing a TITAN Experience Strategy**. A
founder or team member can see how TITAN would position, design, and structure a
premium website experience for a business — a **strategy room**, not a dashboard.

## Status

**v0.1 — mock data.** No AI, no database, no website generation. The studio
renders the [Experience Strategy Generator](../../core/experience-strategy/)
output (`ExperienceStrategy`) for a sample business.

## Route

- `/experience-studio`

## Public API (`index.ts`)

- `ExperienceStudioPage` — the studio, rendered by the `/experience-studio` route.

## What it shows

The business identity (name · trade · location) and all ten strategy sections:
Hero Concept (featured), Visual Direction, Storytelling, Animation Strategy,
Interactive Features, Media Direction, Conversion Strategy, SEO Strategy, Mobile
Strategy, and the AI Media Brief. Plus two **coming-soon** actions:
**Generate Website** and **Approve Strategy** (both disabled).

## Design

Luxury "strategy room": deep neutral surfaces, a single refined **gold** accent,
editorial numbered cards, a cinematic full-width Hero Concept, and a staggered
entrance. Reuses the existing design system (tokens + shadcn primitives);
self-contained (no `globals.css` changes). Server-rendered — no client state.

## Structure

```
experience-studio/
├── index.ts                         # public API
├── model/mock-request.ts            # the sample business (mock)
└── components/
    ├── experience-studio-page.tsx   # the studio layout
    └── studio-atoms.tsx             # premium presentational atoms
```

## Architecture

- Consumes `core/experience-strategy` (`generateExperienceStrategy` + types) —
  a `feature → core` dependency. Uses the generator's output shape exactly.
- The `/experience-studio` app route is thin: it renders the feature's public
  `ExperienceStudioPage`. No cross-feature imports.
