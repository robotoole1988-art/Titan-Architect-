# ADR-006: Dark theme by default via design tokens

- **Status:** Accepted
- **Date:** 2026-06-30
- **Deciders:** Robert O'Toole
- **Tags:** frontend, design-system, theming
- **Supersedes:** —
- **Superseded by:** —

## Context

The platform must ship a dark theme by default, look consistent across a growing
surface area, and keep the door open to additional themes (light mode, future
brand themes) without rewriting components. Hardcoding colours into components
would make any theming change a sprawling, error-prone edit.

## Decision

Colours are expressed as **design tokens** — CSS custom properties (e.g.
`--background`, `--sidebar`, `--primary`) defined in `globals.css` and consumed
through Tailwind's semantic classes (`bg-background`, `text-foreground`).
Components reference **token names, never raw colour values**.

Theme switching uses **`next-themes`** with `defaultTheme="dark"`, toggling a
`dark` class on `<html>`. A blocking script applies the theme before paint to
avoid flashes; `suppressHydrationWarning` accommodates the client-set class.

## Consequences

### Positive
- A new theme = a new set of token values; components are untouched.
- Guaranteed visual consistency; no scattered hex codes.
- Light mode and brand themes are essentially free to add later.

### Negative / Trade-offs
- A small, well-understood hydration consideration handled via next-themes.

### Neutral
- The full token palette will be formalised when a dedicated design system is
  established.

## Alternatives Considered

- **Hardcoded colours / per-component dark variants** — unmaintainable at scale;
  every theming change touches many files. Rejected.
- **CSS-in-JS theming** — extra runtime and complexity for no gain over tokens
  with our Tailwind setup. Rejected.

## References

- ADR-002 (Tailwind + shadcn/ui).
