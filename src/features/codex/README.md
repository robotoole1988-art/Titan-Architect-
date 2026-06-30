# Codex feature

The first real feature of TITAN Architect. The Codex captures company knowledge
and intellectual property as versioned entries.

## Status

**v0.1** — list, detail, and create/edit UI with **local data only**. No
database yet; entries are seeded from mock data and persisted to `localStorage`.

## Public API (`index.ts`)

The rest of the app may import **only** from this feature's `index.ts`:

- `CodexListPage` — the `/codex` screen.
- `CodexDetailPage` — the `/codex/[id]` screen.
- `CodexFormPage` — the create (`/codex/new`) and edit (`/codex/[id]/edit`) screen.
- Types: `CodexEntry`, `CodexCategory`, `CodexStatus`.

## Internal structure

```
codex/
├── index.ts                       # public API (the only import surface)
├── model/
│   ├── types.ts                   # CodexEntry, categories, statuses
│   ├── mock-data.ts               # seed entries (v0.1, no DB)
│   ├── codex-store.ts             # local store + localStorage persistence
│   └── format.ts                  # date formatting helper
├── hooks/
│   └── use-codex.ts               # React access to the store
└── components/
    ├── codex-list-page.tsx
    ├── codex-detail-page.tsx
    ├── codex-form-page.tsx
    └── codex-status-badge.tsx
```

## Data model

An entry has: `title`, `category`, `status`, `version`, `updatedAt`
(last updated, system-managed), and `content`.

- **Categories:** Vision, Architecture, AI Organisation, Brain, Directives,
  PRDs, Roadmap, Decisions.
- **Statuses:** Draft, Approved, Deprecated.

## Replacing the data layer later

The store (`model/codex-store.ts`) is the single integration point for data.
Swapping `localStorage` for a real backend means changing that module (and
adding an `api/` module); the hook and components are unaffected.
