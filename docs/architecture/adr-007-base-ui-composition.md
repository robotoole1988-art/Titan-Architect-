# ADR-007: Base UI composition model (render prop)

- **Status:** Accepted
- **Date:** 2026-06-30
- **Deciders:** Robert O'Toole
- **Tags:** frontend, ui, convention
- **Supersedes:** —
- **Superseded by:** —

## Context

This is a **note ADR**: it records an important, non-obvious property of our
component stack so future contributors are not surprised. The current shadcn/ui
generator builds its primitives on **Base UI** (`@base-ui/react`), not on Radix
UI, which has historically been the more common foundation. Their composition
and prop APIs differ, and code or examples written for Radix will not compile
against ours.

## Decision

We standardise on **Base UI's composition model** and document its conventions:

- **Composition uses the `render` prop, not `asChild`.** To render a trigger as
  a custom element, pass `render={<MyComponent />}`; the trigger's children
  become that element's children.
- **`TooltipProvider` uses `delay`, not `delayDuration`.**
- When copying examples from the wider shadcn/Radix ecosystem, translate
  `asChild` → `render` and verify prop names against Base UI.

## Consequences

### Positive
- Contributors avoid a confusing, recurring class of type errors.
- A single documented convention keeps composition consistent.

### Negative / Trade-offs
- Some community snippets need translation before they compile.
- We are tied to Base UI's API and release decisions for these primitives.

### Neutral
- If the ecosystem standard shifts, a future ADR can supersede this one.

## Alternatives Considered

- **Re-implement components on Radix** — significant effort to swap the
  generated foundation for marginal familiarity benefit. Rejected for now.

## References

- ADR-002 (Tailwind + shadcn/ui). Base UI docs: https://base-ui.com
