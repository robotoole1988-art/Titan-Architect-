# Experience Studio feature

The first visible workspace for **reviewing a TITAN Experience Strategy**. A
founder or team member can see how TITAN would position, design, and structure a
premium website experience for a business — a **strategy room**, not a dashboard.

## Status

**v0.2 — strategy + blueprint.** No AI, no database, no visual website
rendering. The studio renders the
[Experience Strategy Generator](../../core/experience-strategy/) output
(`ExperienceStrategy`) and, via **Generate Blueprint**, the
[Website Blueprint Engine](../../core/website-blueprint/) output
(`WebsiteBlueprint`) in a read-only viewer.

## Routes

- `/experience-studio` — the strategy room.
- `/experience-studio/blueprint` — the Blueprint Viewer (read-only): ordered
  section cards showing each registered primitive, its variant, intent,
  content slots, aspects, and the experience arc. Business context arrives via
  the URL (ADR-019 pattern) and degrades gracefully to the sample business.
- The viewer's **Preview Website** action opens `/experience-studio/preview`
  (the [Website Renderer](../website-renderer/) feature), carrying the same
  URL context forward.

## Public API (`index.ts`)

- `ExperienceStudioPage` — the studio, rendered by the `/experience-studio` route.
- `BlueprintViewerPage` — the viewer, rendered by the
  `/experience-studio/blueprint` route.

## What it shows

The business identity (name · trade · location) and all ten strategy sections:
Hero Concept (featured), Visual Direction, Storytelling, Animation Strategy,
Interactive Features, Media Direction, Conversion Strategy, SEO Strategy, Mobile
Strategy, and the AI Media Brief. Plus **Generate Blueprint** (active — opens
the Blueprint Viewer, carrying the business context in the URL) and
**Approve Strategy** (coming soon, disabled).

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
    ├── blueprint-viewer-page.tsx    # the read-only Blueprint Viewer
    └── studio-atoms.tsx             # premium presentational atoms
```

## Architecture

- Consumes `core/experience-strategy` (`generateExperienceStrategy` + types)
  and `core/website-blueprint` (engine + registry + validator) — `feature →
  core` dependencies. Uses the engines' output shapes exactly.
- The `/experience-studio` and `/experience-studio/blueprint` app routes are
  thin: they render the feature's public pages. No cross-feature imports; the
  URL is the boundary (ADR-019).
