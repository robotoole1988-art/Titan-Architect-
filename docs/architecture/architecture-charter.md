# TITAN Architect — Architecture Charter

> **Status:** Living document · **Version:** 1.0 · **Date:** 2026-06-30
>
> This charter is **binding**. It defines the structural rules of the codebase.
> Changes to these rules require an ADR. Code that violates the charter should
> be treated as a defect, even if it "works".

## 0. Purpose

TITAN Architect is an **enterprise AI operating system**, not a standard SaaS
application. This charter exists to protect four properties as the platform
grows over many years:

- **Scalability** — the system absorbs new modules without central rewrites.
- **Maintainability** — any engineer can locate, understand, and safely change
  one part without fear of the rest.
- **Modularity** — capabilities are self-contained and composed, not entangled.
- **Long-term growth** — today's structure does not become tomorrow's ceiling.

The guiding rule: **invest generously in structure; stay ruthless (YAGNI) on
features.** We document decisions, enforce boundaries, and prefer clean
architecture over rapid implementation. We do not take shortcuts.

## 1. The layered model

The codebase is organised into **layers**. Dependencies flow in **one
direction only — downward.** A layer may import from layers below it and never
from layers above it.

```
┌──────────────────────────────────────────────────────────┐
│  app/            Routing & composition (the entry points) │  ← highest
├──────────────────────────────────────────────────────────┤
│  features/       Vertical domain modules (the product)    │
├──────────────────────────────────────────────────────────┤
│  components/  providers/   Shared UI & app-wide context   │
├──────────────────────────────────────────────────────────┤
│  core/           Platform kernel (AI, Brain, auth, data)  │
├──────────────────────────────────────────────────────────┤
│  lib/  config/  hooks/  types/   Shared foundation        │  ← lowest
└──────────────────────────────────────────────────────────┘
            dependencies point DOWNWARD only
```

> **Note on `core/`:** the kernel layer is **introduced when first needed**
> (see §6), via its own ADR. We define its home and rules now so growth is
> deliberate — but we do not create empty scaffolding before there is real
> code to put in it. Today, the small amount of cross-cutting code lives in
> `providers/` and `lib/`.

## 2. Folder responsibilities

| Folder | Layer | Owns | Must NOT contain |
| --- | --- | --- | --- |
| `src/app/` | Routing | Route definitions, layouts, route handlers. Composition only. | Business logic, reusable UI, data logic. |
| `src/features/<name>/` | Feature | One domain's UI, hooks, data access, and logic — a vertical slice. | Code belonging to another feature. |
| `src/components/ui/` | Shared UI | Generic design-system primitives (Button, Card…). | Domain/business logic. |
| `src/components/layout/` | Shared UI | The app shell: Sidebar, CommandBar, AppShell. | Feature-specific content. |
| `src/components/common/` | Shared UI | Cross-feature presentational helpers (e.g. PagePlaceholder). | Domain logic. |
| `src/providers/` | Application | App-wide React context (theme, auth seam). | Feature logic. |
| `src/core/` | Kernel | Cross-cutting platform capabilities (see §6). | UI, routing, feature specifics. |
| `src/config/` | Foundation | Static configuration & single sources of truth (site, navigation). | Logic, side effects. |
| `src/lib/` | Foundation | Pure, dependency-light utilities. | React components, feature logic. |
| `src/hooks/` | Foundation | Generic reusable hooks (not tied to one feature). | Feature-specific hooks. |
| `src/types/` | Foundation | Shared TypeScript types/contracts. | Runtime code. |

## 3. Import rules

The dependency direction (§1) is enforced as concrete import rules:

1. **`app/`** may import from `features/*` (their **public API only**),
   `components/`, `providers/`, `config/`, `core/`, `lib/`, `hooks/`, `types/`.
2. **`features/<a>/`** may import from `components/`, `providers/`, `core/`
   (public API), `config/`, `lib/`, `hooks/`, `types/`.
3. **A feature must NOT import from another feature's internals.** If two
   features genuinely must share something, that shared thing is promoted
   *downward* into `core/`, `lib/`, or `types/` — never imported sideways.
4. **`components/`, `providers/`, `core/`, `lib/`, `config/` must NOT import
   from `features/` or `app/`.** Lower layers never know about higher ones.
5. **Within `core/`:** higher kernel services may depend on lower ones
   (e.g. `core/brain` may use `core/ai`), but not the reverse.
6. **No deep imports across module boundaries.** Import from a module's public
   entry point (`index.ts`), not its internal files.

> **Enforcement:** these rules are **mechanically enforced** by
> `eslint-plugin-boundaries` in `eslint.config.mjs` — a violating import fails
> `npm run lint`, not just code review. The default is *deny*: an import is
> forbidden unless explicitly allowed. See **ADR-008** for the configuration,
> rationale, and worked examples. Lint runs automatically on every push and pull
> request via GitHub Actions (**ADR-009**), so violations are caught in CI.
> Making CI *blocking* is one repository setting away: enable branch protection
> requiring the `CI` check to pass before merge.

## 4. Feature isolation

Every feature is a **self-contained module** with a **public API** and private
internals. The canonical anatomy:

```
src/features/<name>/
├── index.ts        # PUBLIC API — the ONLY file other layers may import from
├── components/     # UI private to this feature
├── hooks/          # hooks private to this feature
├── api/            # this feature's data access (server actions / handlers)
├── model/          # domain logic, types, schemas, validation
└── README.md       # what this module owns and exposes
```

Rules:

- **`index.ts` is the contract.** Anything not exported from it is private and
  off-limits to the rest of the codebase.
- **Features are independently understandable.** Deleting a feature should not
  break unrelated features.
- **Cross-feature communication** happens through the kernel (`core/`) — shared
  services, typed contracts, or events — never through direct internal imports.
- **Keep logic out of the routing layer.** A route in `app/(app)/<name>/page.tsx`
  should be thin: it imports the feature's public surface and renders it.

## 5. Naming & consistency conventions

- Files: `kebab-case.tsx`. React components: `PascalCase`. Hooks: `useXxx`.
- One public concept per file; co-locate tightly related code.
- Prefer **explicit, descriptive names** over abbreviations.
- TypeScript is mandatory; avoid `any`. Model real domain types in `model/`.
- Configuration and content are **data** (`config/`), not hardcoded in JSX.

## 6. Where future modules live

TITAN's roadmap includes intelligence and product modules. Their homes are
fixed **now** so growth stays deliberate. The key distinction:

- **Feature modules are vertical** — a user-facing domain (one section of the
  product). They live in `features/`.
- **Kernel modules are horizontal** — shared platform capability used by many
  features. They live in `core/`.

| Module | Home | Why |
| --- | --- | --- |
| **Knowledge Kernel** | `src/core/knowledge-kernel/` | The central knowledge layer: the shared contract for storing and retrieving the six DNA types (Trade, Location, Brand, Customer, Competitor, Marketing). Horizontal infrastructure every feature queries. Interfaces only today — see **ADR-010**. The first citizen of the `core/` layer. |
| **AI engine** | `src/core/ai/` | The lowest-level model capability: provider clients, prompt/templating, token & usage accounting, streaming. Horizontal infrastructure used everywhere. Depends only on the foundation layer. |
| **Brain** | `src/core/brain/` | The central intelligence layer — orchestration, agent runtime, planning, routing, and shared memory/context. It is the heart of the AI OS, consumed by many features. Built **on top of** `core/ai`. Not a feature. |
| **Codex** | `src/features/codex/` | A user-facing domain (company knowledge & IP). Vertical slice. If knowledge storage/retrieval becomes shared infrastructure the Brain depends on, that *service* is promoted to `core/` (e.g. `core/knowledge/`) while the Codex UI stays a feature. |
| **Directives** | `src/features/directives/` | A user-facing domain (strategic build directives). Vertical slice. May expose a typed contract the Brain reads. |
| **PRDs** | `src/features/prds/` | A user-facing domain (product requirement documents). Vertical slice. |

Dependency shape for the AI stack:

```
features/codex ─┐
features/prds  ─┼─▶ core/brain ─▶ core/ai ─▶ lib/ (foundation)
features/...   ─┘   (orchestration)  (models)
```

Features call **into** the Brain through its public API; the Brain calls into
the AI engine. Nothing flows upward — `core/ai` never imports a feature, and
`core/brain` never imports `app/`.

### Adding a new module — checklist

1. Decide: vertical (feature) or horizontal (kernel)? → choose `features/` or `core/`.
2. Create the module folder with an `index.ts` public API and a `README.md`.
3. If it changes a boundary, layering rule, or introduces `core/`, **write an ADR**.
4. Wire its route in `app/(app)/<name>/` (thin) and add it to `config/navigation.ts`.
5. Keep all logic inside the module; expose only what others need via `index.ts`.

## 7. Amending this charter

This is a living document, but not a casual one. Any change to the layering,
boundaries, or import rules **must be accompanied by an ADR** that records the
context and consequences. Bump the version above when the charter changes.
