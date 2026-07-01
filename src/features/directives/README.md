# Directives feature

Strategic build directives that guide TITAN's development — each directive
captures an objective, its requirements, and the criteria for "done".

## Status

**v0.1** — list, detail, and create/edit UI with **local data only**. No
database yet; directives are seeded from mock data and persisted to
`localStorage`.

## Public API (`index.ts`)

The rest of the app may import **only** from this feature's `index.ts`:

- `DirectivesListPage` — the `/directives` screen.
- `DirectiveDetailPage` — the `/directives/[id]` screen.
- `DirectiveFormPage` — the create (`/directives/new`) and edit
  (`/directives/[id]/edit`) screen.
- Types: `Directive`, `DirectiveStatus`, `DirectivePriority`, `DirectiveProduct`.

## Internal structure

```
directives/
├── index.ts                        # public API (the only import surface)
├── model/
│   ├── types.ts                    # Directive, statuses, priorities, products
│   ├── mock-data.ts                # seed directives (v0.1, no DB)
│   ├── directives-store.ts         # local store + localStorage persistence
│   └── format.ts                   # date formatting helper
├── hooks/
│   └── use-directives.ts           # React access to the store
└── components/
    ├── directives-list-page.tsx
    ├── directive-detail-page.tsx
    ├── directive-form-page.tsx
    └── directive-badges.tsx        # status + priority badges
```

## Data model

A directive has: `title`, `number`, `status`, `priority`, `product`,
`objective`, `requirements`, `acceptanceCriteria`, and system-managed
`createdAt` / `updatedAt`.

- **Statuses:** Draft, Approved, In Progress, Completed, Deprecated.
- **Priorities:** Low, Medium, High, Critical.
- **Products:** TITAN Architect, TITAN Brain, TITAN Command Centre,
  TITAN Client App, TITAN Website Engine, TITAN Ads Engine, TITAN SEO Engine.

## Replacing the data layer later

The store (`model/directives-store.ts`) is the single integration point for
data. Swapping `localStorage` for a real backend (or the Knowledge Kernel)
means changing that module alone; the hook and components are unaffected.
