# Architecture

The architecture of TITAN Architect is documented in
[`docs/architecture/`](./docs/architecture/) — the system of record:

- [**Architecture Charter**](./docs/architecture/architecture-charter.md) —
  the binding rules: layers, module boundaries, import rules, and feature
  isolation.
- [**Architecture Decision Records**](./docs/architecture/README.md) — one
  immutable record per significant decision, with the full index.

Boundary rules are mechanically enforced by ESLint (ADR-008) and CI (ADR-009).
