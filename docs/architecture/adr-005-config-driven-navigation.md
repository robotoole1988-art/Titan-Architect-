# ADR-005: Config-driven navigation

- **Status:** Accepted
- **Date:** 2026-06-30
- **Deciders:** Robert O'Toole
- **Tags:** frontend, architecture, maintainability
- **Supersedes:** —
- **Superseded by:** —

## Context

As an OS-style platform, TITAN will accumulate many top-level sections over the
years. Navigation that is hardcoded in JSX becomes hard to change, easy to make
inconsistent, and impossible to drive from data (permissions, feature flags,
ordering). We need navigation to scale without editing layout components every
time a section is added.

## Decision

Navigation is **data, not markup**. The sidebar renders from typed structures in
`src/config/navigation.ts` (`primaryNavigation`, `secondaryNavigation`). Adding
or reordering a menu entry is a one-line change to that config; the rendering
components never change.

## Consequences

### Positive
- Adding a page to the menu is a single, safe, declarative edit.
- Navigation can later be filtered by role/permission or feature flag in one
  place, without touching rendering code.
- A single source of truth prevents menu/route drift.

### Negative / Trade-offs
- A thin layer of indirection between config and rendered output (well worth it).

### Neutral
- The config shape will likely grow (badges, nested items, visibility rules) as
  needs emerge.

## Alternatives Considered

- **Hardcoded `<Link>`s in the sidebar** — simplest initially, but unscalable
  and inconsistent over time; blocks permission-driven menus. Rejected.

## References

- ADR-003 (app shell that renders the navigation).
