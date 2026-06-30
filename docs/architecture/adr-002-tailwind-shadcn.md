# ADR-002: Tailwind CSS + shadcn/ui for styling and components

- **Status:** Accepted
- **Date:** 2026-06-30
- **Deciders:** Robert O'Toole
- **Tags:** frontend, design-system, ui
- **Supersedes:** —
- **Superseded by:** —

## Context

An enterprise OS needs a consistent, accessible, themeable UI that can grow for
years without fragmenting into inconsistent one-off styles. We need a styling
strategy and a component foundation that we **own and can evolve**, rather than
a black-box library that dictates our look and locks us in.

## Decision

We will use **Tailwind CSS (v4)** for styling and **shadcn/ui** as the component
foundation.

Tailwind gives us a constrained, token-driven utility system that keeps styling
consistent and co-located with markup. shadcn/ui is **not a dependency** — its
components are generated into our own `src/components/ui/` source tree, so we own
the code outright and can adapt any component without fighting a library. This
combination is the strongest base for a long-lived design system.

## Consequences

### Positive
- We own every component; no upstream lock-in or version-bump surprises.
- Tailwind tokens (see ADR-006) enforce visual consistency at scale.
- Accessible primitives out of the box; a clear path to a formal design system.

### Negative / Trade-offs
- Generated UI components become our maintenance responsibility.
- Tailwind utility classes add markup verbosity (mitigated by componentisation).
- shadcn/ui's current generator targets Base UI primitives, which differ from
  the historically common Radix API (see ADR-007).

### Neutral
- A future dedicated `design-system/` package remains open but is not built yet.

## Alternatives Considered

- **MUI / Chakra / Ant Design** — fast to start, but opinionated, heavier, and
  harder to deeply customise; styling lock-in. Rejected.
- **Plain CSS Modules** — full control but slow to reach an enterprise-grade,
  consistent component set from scratch. Rejected.

## References

- ADR-006 (design tokens), ADR-007 (Base UI composition).
