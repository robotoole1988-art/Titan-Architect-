# ADR-018: Business Intake Architecture

- **Status:** Accepted
- **Date:** 2026-07-01
- **Deciders:** Robert O'Toole
- **Tags:** architecture, feature, onboarding, ui
- **Supersedes:** —
- **Superseded by:** —

## Context

The Business → Blueprint journey needs a starting point: a way to capture the
basic business details TITAN needs before it can generate a strategy or a
blueprint. There is currently no front door. We want the first step — a premium
intake screen — without building a database, AI, or generation yet.

## Decision

We add **`src/features/business-intake`**, a **feature** (a vertical, user-facing
slice), with a thin `/business-intake` route and a navigation entry.

- **v0.1 uses mock / localStorage only.** Intakes are seeded from mock data and
  persisted to `localStorage`; there is no database, AI, or external API.
- Data lives behind a store (`business-intake-store.ts`) accessed via a
  `useSyncExternalStore`-based hook — SSR-safe, no `setState`-in-effect,
  consistent with the Codex and Directives features.
- The feature **produces a `BusinessIntake` record** and exports its type from
  the public API, so later modules can consume the saved shape.
- The next step, **Generate Strategy**, is present but **disabled ("coming
  soon")** on each saved intake, so the journey is visible without implying
  capability that does not exist.
- The `/business-intake` route is thin: it renders the feature's public
  `BusinessIntakePage`. No cross-feature imports.

### Why a feature (not a core module)

Business Intake is a user-facing screen with its own local data — a vertical
slice. That is exactly a feature's job. Core modules are horizontal capabilities;
an onboarding form is not one.

### Why the record type is exported

The saved `BusinessIntake` already carries the business name, trade, and location
the Experience Strategy Generator needs. Exporting the type from the feature's
public API lets the future flow (or a promoted shared type) consume it without
reaching into the feature's internals.

## Consequences

### Positive
- The journey now has a front door; details are captured as structured records.
- Reuses the proven localStorage store pattern; nothing new to learn.
- The disabled action makes the next step legible without faking capability.
- Exporting the record shape prepares the hand-off to generation.

### Negative / Trade-offs
- localStorage only; real persistence and multi-user are future work.
- Create + remove only (no editing) in v0.1.
- If a core module later needs the intake shape, the type should be promoted to
  a shared location (features cannot be imported by core).

### Neutral
- Design uses a bespoke premium onboarding treatment on the existing design
  system; no new tokens or fonts.

## Alternatives Considered

- **Put intake in a core module** — wrong layer; core is for horizontal
  capabilities, not user-facing screens. Rejected.
- **Persist to a database now** — out of scope for v0.1 and premature. Rejected
  in favour of localStorage behind a swappable store.
- **Wire "Generate Strategy" immediately** — the strategy hand-off is a separate
  concern with its own design; showing it as coming-soon keeps scope honest.

## References

- PRD-006 (Business Intake — product requirements).
- ADR-014 (Experience Strategy Generator — the next stage's input).
- ADR-008 (boundary enforcement), ADR-005 (config-driven navigation).
- `src/features/business-intake/` and its `README.md`.
