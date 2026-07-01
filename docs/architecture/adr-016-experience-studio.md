# ADR-016: Experience Studio Architecture

- **Status:** Accepted
- **Date:** 2026-07-01
- **Deciders:** Robert O'Toole
- **Tags:** architecture, feature, experience, ui
- **Supersedes:** —
- **Superseded by:** —

## Context

The Experience Strategy Generator (ADR-014) produces a structured strategy, but
there has been no way to *see* it. We need the first visible surface for
reviewing a strategy — a premium workspace that renders the generator's output —
without building website generation, AI, or persistence yet.

The question is where this lives and how it relates to the core engines.

## Decision

We add **`src/features/experience-studio`**, a **feature** (a vertical,
user-facing slice), with a thin `/experience-studio` route.

- It **consumes** `core/experience-strategy` — calling `generateExperienceStrategy`
  and rendering the resulting `ExperienceStrategy` (its exact output shape). A
  `feature → core` dependency, which the boundary rules (ADR-008) permit.
- **v0.1 uses mock data**: a sample business request. No AI, no database, no
  website generation.
- It is **server-rendered** (no client state): the strategy is generated on the
  server and laid out as cards. This keeps it simple and avoids hydration
  concerns.
- The future actions — **Generate Website** and **Approve Strategy** — are
  present but **disabled ("coming soon")**, so the destination is visible without
  implying capability that does not exist.
- The `/experience-studio` app route is thin: it renders the feature's public
  `ExperienceStudioPage`. All UI lives inside the feature; nothing leaks out
  except its public API.

### Why a feature, not a core module

The studio is a **vertical, user-facing surface** — a screen a person looks at.
Core modules are horizontal capabilities consumed by many features. Rendering a
strategy for review is exactly a feature's job. Placing it in `features/` keeps
the engines (core) free of UI and keeps the studio's UI isolated behind its
public API.

### Why consume the generator output directly

The studio's entire purpose is to present the strategy the generator produces.
Depending on `core/experience-strategy` and rendering its output shape verbatim
means the studio always reflects the real contract — when the generator improves
(e.g. the Brain drives it), the studio shows the better output with no change.

## Consequences

### Positive
- A strategy is now reviewable by a human — the first step toward approval and
  generation.
- Clean separation: engines stay in `core`, the review UI stays in a `feature`.
- Using the real output shape keeps the studio honest and future-proof.
- The disabled actions make the roadmap legible without faking capability.

### Negative / Trade-offs
- v0.1 shows a fixed mock business; real customer selection comes later.
- Server-rendered only; interactive editing/approval is future work.

### Neutral
- Design uses a bespoke "strategy room" treatment built on the existing design
  system; no new design tokens or fonts were introduced.

## Alternatives Considered

- **Put the studio in a core module** — wrong layer; core is for horizontal
  capabilities, not user-facing screens. Rejected.
- **Re-declare the strategy shape in the feature** — would duplicate and drift
  from the generator's contract. Rejected in favour of consuming it directly.
- **Client-side generation with state** — unnecessary; the strategy is static
  for a given input, so server rendering is simpler and faster. Rejected.

## References

- PRD-004 (Experience Studio — product requirements).
- ADR-014 (Experience Strategy Generator — the output rendered).
- ADR-008 (boundary enforcement), ADR-005 (config-driven navigation).
- `src/features/experience-studio/` and its `README.md`.
