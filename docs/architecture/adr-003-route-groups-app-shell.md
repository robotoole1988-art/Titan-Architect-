# ADR-003: Route groups and the protected app shell

- **Status:** Accepted
- **Date:** 2026-06-30
- **Deciders:** Robert O'Toole
- **Tags:** frontend, routing, architecture
- **Supersedes:** —
- **Superseded by:** —

## Context

The platform has two fundamentally different kinds of screen: **public** pages
(e.g. sign-in) with no application chrome, and **protected** pages (Dashboard,
Codex, etc.) that all share one application shell — a left sidebar and a top
command bar. We need these two contexts cleanly separated so that authentication
and the shell are each defined exactly once, not repeated per page.

## Decision

We will use Next.js **route groups** to separate concerns:

- `src/app/(auth)/` — public routes. Centred, no shell. Hosts `/login`.
- `src/app/(app)/` — protected routes. Wrapped by a shared layout that renders
  the application shell (`AppShell` = `Sidebar` + `CommandBar`).

Folders in parentheses do not affect the URL; they exist purely to share a
layout and a boundary. The `(app)` layout is the single place where the shell is
applied and where server-side authentication will be enforced (see ADR-004).

## Consequences

### Positive
- The app shell is defined once; every protected page inherits it automatically.
- A single, obvious location for the auth boundary — no per-page guards.
- New protected pages need zero shell wiring; they just render their content.

### Negative / Trade-offs
- Requires understanding the route-group convention (an accepted learning cost).

### Neutral
- Additional route groups (e.g. `(marketing)`) can be added later if needed.

## Alternatives Considered

- **Per-page shell imports** — every page imports the shell itself. Repetitive,
  error-prone, and scatters the auth boundary. Rejected.
- **A single root layout with conditional chrome** — branching logic in one
  layout to show/hide the shell. Brittle and conflates contexts. Rejected.

## References

- ADR-001 (App Router), ADR-004 (authentication seam).
