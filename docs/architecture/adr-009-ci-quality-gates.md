# ADR-009: Automated quality gates in CI

- **Status:** Accepted
- **Date:** 2026-07-01
- **Deciders:** Robert O'Toole
- **Tags:** ci, tooling, governance
- **Supersedes:** —
- **Superseded by:** —

## Context

ADR-008 made the Architecture Charter mechanically enforceable through ESLint,
and we have a type-checker and a production build that together catch a wide
class of defects. But all three only protect the codebase when *someone
remembers to run them locally*. For an enterprise platform with a growing
history and (eventually) multiple contributors, "remembering" is not a control.
A broken build or a boundary violation can be committed and merged unnoticed.

We need these checks to run **automatically on every change**, so that code which
fails them cannot quietly enter the main line.

## Decision

We add a **GitHub Actions** workflow (`.github/workflows/ci.yml`) that runs on
every `push` to `main` and on **every pull request**. A single job performs the
three quality gates, as separate steps for clear failure attribution:

1. `npm run lint` — code quality **and** architecture boundaries (ADR-008).
2. `npm run typecheck` — `tsc --noEmit`, full TypeScript correctness.
3. `npm run build` — a real production build of every route.

Supporting choices, kept deliberately simple:

- **`npm ci`** for installs — reproducible, lockfile-exact dependencies.
- **Node 24** with npm caching — matches local development.
- **Concurrency cancellation** — superseded runs on the same ref are cancelled to
  avoid wasted minutes.
- A `typecheck` script was added to `package.json` so the gate is a named,
  reusable command rather than an inline invocation.

This ADR does not change the architecture or add product features; it adds a
guard around what already exists.

## What CI protects

- **Architectural integrity** — a pull request that violates a charter import
  rule (ADR-008) fails CI and cannot be merged clean.
- **Type safety** — no `any`-shaped regressions or broken contracts slip in.
- **Buildability** — `main` always compiles; every route renders. No "works on my
  machine" breakage reaches the shared branch.
- **Reproducibility** — `npm ci` proves the lockfile alone is sufficient to build
  from a clean checkout.

## Consequences

### Positive
- The local guarantees of ADR-008 become *merge* guarantees, not just *intent*.
- Failures are surfaced early, on the PR, with a clear failing step.
- A green history becomes a trustworthy signal of health.

### Negative / Trade-offs
- CI minutes are consumed on each push/PR (mitigated by caching + concurrency).
- The pipeline must be maintained as the toolchain evolves.

### Neutral
- Branch protection (requiring CI to pass before merge) is a repository setting,
  configured in GitHub, not in this workflow. Enabling it is the natural
  next step to make the gate truly blocking.

## Alternatives Considered

- **Pre-commit hooks only** (e.g. Husky) — useful for fast local feedback, but
  bypassable (`--no-verify`) and not a server-side guarantee. Complementary, not
  a replacement. May be added later.
- **A single combined `npm run ci` step** — fewer lines, but a failure wouldn't
  say *which* gate broke. Rejected in favour of explicit steps.
- **Other CI providers** (CircleCI, GitLab CI) — no advantage here; the code
  already lives on GitHub. Rejected for simplicity.

## References

- ADR-008 (the boundary rules this pipeline enforces on every change).
- `.github/workflows/ci.yml`.
