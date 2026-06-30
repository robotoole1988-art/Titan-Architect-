# ADR-008: Automated architecture boundaries via ESLint

- **Status:** Accepted
- **Date:** 2026-06-30
- **Deciders:** Robert O'Toole
- **Tags:** architecture, tooling, governance
- **Supersedes:** —
- **Superseded by:** —

## Context

The Architecture Charter defines layered import rules and feature isolation
(see `architecture-charter.md`, §3–§4). Until now those rules were enforced only
by human code review. Review is fallible and does not scale: as the codebase and
contributor count grow, a single careless import can quietly erode the layering
the whole platform depends on. For an enterprise AI operating system intended to
live for years, the boundaries must be enforced **mechanically**, not by
vigilance.

## Decision

We enforce the charter's import rules automatically with
**`eslint-plugin-boundaries`** (v6, `boundaries/dependencies` rule), configured
in `eslint.config.mjs`.

Each top-level `src/` folder is mapped to an architectural **element (layer)**:

| Element | Folder(s) |
| --- | --- |
| `app` | `src/app` |
| `feature` | `src/features/*` (the `*` is captured as the feature name) |
| `shared` | `src/components` |
| `providers` | `src/providers` |
| `core` | `src/core` |
| `foundation` | `src/lib`, `src/config`, `src/hooks`, `src/types` |

A single rule set then encodes the charter. The dependency default is
**`disallow`** — an import is forbidden unless a rule explicitly allows it. This
"deny by default" stance means new, unforeseen import paths are blocked until we
consciously decide to permit them.

### Rules added

1. **Layer direction is one-way (downward).** Each layer may import its own tier
   and the tiers below it, never above:
   `app → feature → (shared | providers) → core → foundation`.
2. **`app/` cannot import the kernel (`core`).** This is the mechanical proxy for
   "no business logic in `app/`": a route that needs kernel capability must go
   through a feature, keeping route files thin and compositional.
3. **Features cannot import another feature's internals.** A feature may freely
   import its own files, but not the private files of a sibling feature.
4. **Features are importable only through their public `index.ts`.** When `app`
   or another feature does import a feature, it may reach only the public entry
   point (`internalPath: index.{ts,tsx}`), never a deep internal path. This makes
   requirement #3's "public index only, if needed later" the *sole* legal way to
   cross a feature boundary.
5. **The foundation has no upward dependencies.** `lib`, `config`, `hooks`, and
   `types` may import only each other.

Violations report the offending layers and link back to the charter.

## Worked examples

### ✅ Allowed

```ts
// app/(app)/dashboard/page.tsx  (app → shared)
import { PagePlaceholder } from "@/components/common/page-placeholder";

// app/layout.tsx  (app → foundation, app → providers)
import { siteConfig } from "@/config/site";
import { AppProviders } from "@/providers";

// components/layout/user-menu.tsx  (shared → providers)
import { useAuth } from "@/providers/auth-provider";

// features/codex/components/entry-list.tsx  (feature → its OWN internals)
import { CodexEntry } from "../model/entry";

// features/roadmap/index.ts  (feature → another feature's PUBLIC index)
import { listDirectives } from "@/features/directives";

// core/brain/orchestrator.ts  (core → core, built on the AI engine)
import { complete } from "@/core/ai";
```

### ❌ Forbidden

```ts
// features/roadmap/view.tsx  — reaching into another feature's internals
import { parsePrd } from "@/features/prds/model/parser";
//        ✖ 'feature' may not import 'feature' (internal path, not index)

// app/(app)/codex/page.tsx  — business logic / kernel access in app/
import { embed } from "@/core/ai";
//        ✖ 'app' may not import 'core'

// lib/format.ts  — foundation depending upward on a feature
import { CodexEntry } from "@/features/codex";
//        ✖ 'foundation' may not import 'feature'

// components/ui/button.tsx  — shared UI reaching up into a feature
import { useRoadmap } from "@/features/roadmap";
//        ✖ 'shared' may not import 'feature'
```

## Consequences

### Positive
- The charter is now self-enforcing; architectural erosion fails `npm run lint`.
- "Deny by default" means the safe path is the default path.
- Error messages teach the rules and link to the charter, onboarding new
  contributors automatically.
- Future modules (`core/ai`, `core/brain`, `features/*`) inherit enforcement for
  free — no per-module setup.

### Negative / Trade-offs
- A small amount of ESLint configuration to maintain as layers evolve.
- Legitimate new cross-layer needs require a conscious config change (this is the
  point, but it is friction).
- Enforcement runs in lint, not yet in CI/pre-commit — wiring it into an
  automated gate is a tracked follow-up so violations cannot be merged.

### Neutral
- Rules resolve TypeScript path aliases (`@/*`) and relative imports alike.

## Alternatives Considered

- **`import/no-restricted-paths`** (eslint-plugin-import) — can express simple
  zones but cannot cleanly model "any feature vs. any *other* feature" with a
  captured name, nor public-entry-point enforcement. Rejected as insufficient.
- **Manual code review only** — does not scale and is unreliable. Rejected.
- **Nx / module-federation tooling** — heavyweight for our current needs.
  Rejected for now; revisit if we adopt a monorepo.

## References

- `docs/architecture/architecture-charter.md` (§3 Import rules, §4 Feature isolation).
- ADR-002 (the Base UI / shadcn stack these rules govern).
- eslint-plugin-boundaries: https://www.jsboundaries.dev
