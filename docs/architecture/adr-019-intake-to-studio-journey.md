# ADR-019: Connecting features into a journey (Business Intake → Experience Studio)

- **Status:** Accepted
- **Date:** 2026-07-01
- **Deciders:** Robert O'Toole
- **Tags:** architecture, features, journey, boundaries
- **Supersedes:** —
- **Superseded by:** —

## Context

Business Intake (PRD-006) collects a business's details; Experience Studio
(PRD-004) displays a generated strategy. They were merged separately and not yet
connected. We need the first complete customer-visible journey — a saved intake's
**Generate Strategy** action should open the Studio and show a strategy generated
for that business — without coupling the two features, duplicating the generator,
or adding a database, auth, or AI.

## Decision

Connect the two features by **passing the business context forward through the
URL**, and let the shared core generator do the work:

- **Business Intake** builds a link on each saved intake:
  `/experience-studio?businessName=…&trade=…&location=…`. It imports nothing from
  Experience Studio — it only constructs a URL string.
- The **Experience Studio route** reads those query params and passes them to the
  studio component. The route imports no `core` module (respecting `app ↛ core`).
- **Experience Studio** builds an `ExperienceStrategyRequest` from the params and
  calls the existing `generateExperienceStrategy` (core). If the params are
  absent or incomplete, it falls back to the sample business — so a missing or
  invalid reference degrades gracefully.

The URL is the **approved public boundary** between the two features. Neither
feature imports the other; generation stays in core.

### Why the URL, not a cross-feature import

Passing context via the URL keeps the features fully decoupled and directional:
Business Intake *pushes* context forward; Experience Studio consumes it (or a
sample). The Studio never depends on Intake's storage, so it can display a
strategy for any business — and refreshing works because the context lives in the
URL, not in another feature's localStorage. This honours the Charter's guidance to
avoid cross-feature coupling and the Manifesto's "no unnecessary architecture".

## Consequences

### Positive
- The first complete journey works, with zero cross-feature coupling.
- The core generator remains the single owner of generation (no duplication).
- Refresh-safe and gracefully degrading by construction.
- Establishes the pattern for future journeys (push context via the URL).

### Negative / Trade-offs
- Business context travels in the URL. For v0.1 the generator needs only name,
  trade, and location, so the URL stays short; richer hand-offs may later warrant
  a shared contract promoted to `core`.

### Neutral
- No new module; a small, well-layered connection between existing pieces.

## Alternatives Considered

- **Experience Studio imports Business Intake's public API to resolve an intake
  by id from localStorage** — allowed by the boundary rules (feature → feature
  public index), but couples a display feature to an onboarding feature's storage
  and forces the Studio to be client-only. Rejected in favour of the decoupled
  URL boundary.
- **Duplicate a small generator in the Studio** — violates "do not duplicate
  generator logic in UI". Rejected.

## References

- PRD-004 (Experience Studio), PRD-006 (Business Intake), ADR-014 (Experience
  Strategy Generator), ADR-016, ADR-018.
- ADR-008 (boundary enforcement), ADR-005 (config-driven navigation).
