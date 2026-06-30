# TITAN Architect — Architecture Documentation

This directory is the **system of record** for how TITAN Architect is engineered.
It exists to protect the architecture as the platform grows: every significant
technical decision is captured here so the *why* survives, not just the *what*.

TITAN Architect is treated as an **enterprise AI operating system**, not a
standard SaaS app. Decisions optimise for scalability, maintainability,
modularity, and long-term growth. We prefer clean architecture over rapid
implementation, and we avoid shortcuts.

## Contents

| Document | Purpose |
| --- | --- |
| [`architecture-charter.md`](./architecture-charter.md) | The binding rules: module boundaries, folder responsibilities, import rules, feature isolation, and where future modules live. |
| [`adr-template.md`](./adr-template.md) | Copy this to start a new ADR. |
| `adr-NNN-*.md` | Architecture Decision Records — one decision each. |

## Architecture Decision Records (ADRs)

An **ADR** captures a single architectural decision: the context that forced it,
the decision made, and the consequences accepted. ADRs are **immutable once
accepted** — we never rewrite history. If a decision changes, we write a *new*
ADR that supersedes the old one and update the old one's status.

### Index

| ADR | Title | Status |
| --- | --- | --- |
| [001](./adr-001-nextjs-app-router.md) | Next.js App Router as the application framework | Accepted |
| [002](./adr-002-tailwind-shadcn.md) | Tailwind CSS + shadcn/ui for styling and components | Accepted |
| [003](./adr-003-route-groups-app-shell.md) | Route groups and the protected app shell | Accepted |
| [004](./adr-004-authentication-seam.md) | Authentication as a swappable seam | Accepted |
| [005](./adr-005-config-driven-navigation.md) | Config-driven navigation | Accepted |
| [006](./adr-006-dark-theme-design-tokens.md) | Dark theme by default via design tokens | Accepted |
| [007](./adr-007-base-ui-composition.md) | Base UI composition model (render prop) | Accepted |

### Writing a new ADR

1. Copy `adr-template.md` to `adr-NNN-short-title.md` (next number, zero-padded).
2. Fill it in. Keep it to one decision.
3. Set status to **Proposed**, discuss, then move to **Accepted**.
4. Add a row to the index above.

### When is an ADR required?

Write an ADR before introducing or changing anything that is **expensive to
reverse**: a framework, a cross-cutting library, a layering or boundary rule, a
data or auth strategy, or a new top-level module. If in doubt, write one — the
cost is minutes, the value compounds for years.
