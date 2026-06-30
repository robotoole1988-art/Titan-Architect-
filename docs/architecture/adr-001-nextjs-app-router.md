# ADR-001: Next.js App Router as the application framework

- **Status:** Accepted
- **Date:** 2026-06-30
- **Deciders:** Robert O'Toole
- **Tags:** frontend, framework, foundation
- **Supersedes:** —
- **Superseded by:** —

## Context

TITAN Architect is the foundation for a multi-year enterprise AI operating
system. The framework choice underpins routing, rendering, data loading,
server-side logic, and the eventual authentication and AI-orchestration layers.
It is the single most expensive decision to reverse, so it must support
large-scale growth rather than prototype speed.

Requirements: first-class TypeScript, a mature ecosystem, server-side execution
for secure AI/data work, nested layouts for a shared application shell, and a
credible long-term maintenance story.

## Decision

We will build TITAN Architect on **Next.js (App Router)**, latest stable
(Next.js 16, React 19).

The App Router provides file-system routing, nested layouts, React Server
Components, and `middleware` — the exact primitives an enterprise platform
needs. Server Components let AI and data logic run securely on the server,
keeping secrets and heavy work out of the browser. The `app/` directory is
treated strictly as a **routing and composition layer**; no business logic
lives there (see the Architecture Charter).

## Consequences

### Positive
- Nested layouts give us a shared app shell defined once (see ADR-003).
- Server Components and Route Handlers provide a secure home for AI/data logic.
- `middleware` enables centralised authentication enforcement (see ADR-004).
- Large, well-supported ecosystem reduces long-term maintenance risk.

### Negative / Trade-offs
- Steeper learning curve (Server vs. Client Components, caching model).
- Couples us to the Next.js release cadence and conventions.

### Neutral
- Deployment is flexible (Vercel or self-hosted Node); not decided here.

## Alternatives Considered

- **Vite + React + React Router** — simpler and lighter, but a pure client SPA
  with no server layer, weaker auth story, and no built-in secure place for AI
  logic. Rejected as insufficient for an enterprise OS.
- **Remix / TanStack Start** — capable, but smaller ecosystems and less
  organisational familiarity. Rejected to minimise long-term risk.

## References

- ADR-003 (route groups and app shell), ADR-004 (authentication seam).
