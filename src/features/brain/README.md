# Brain feature — TITAN Brain Workspace

The first user interface for the TITAN Brain: the workspace where the Brain will
eventually think, reason, and coordinate every AI employee.

## Status

**v0.1 — UI only. NOT AI.** There is no model connection (no OpenAI, Claude, or
any LLM), no reasoning, and no business logic. Every section is a clearly
labelled placeholder that explains what it will become.

## Route

- `/brain`

## Public API (`index.ts`)

- `BrainWorkspace` — the full workspace, rendered by the `/brain` route.

## Layout

```
┌───────────────────────── Brain command bar ─────────────────────────┐
│  status · search · command palette (⌘K) · project · notifications    │
├───────────────┬───────────────────────────────┬─────────────────────┤
│ Left panel    │ Centre panel                  │ Right panel          │
│ • AI Employees│ • TITAN Brain (animated core) │ • Decisions          │
│ • Active Tasks│ • Reasoning workspace         │ • Context            │
│ • Knowledge   │ • Reasoning stream (soon)     │ • Suggested Actions  │
│   Sources     │ • Memory graph (soon)         │ • System Status      │
└───────────────┴───────────────────────────────┴─────────────────────┘
```

## Internal structure

```
brain/
├── index.ts                       # public API (BrainWorkspace)
└── components/
    ├── brain-workspace.tsx        # 3-panel layout + ambient backdrop + stagger
    ├── brain-command-bar.tsx      # workspace command bar (placeholders)
    ├── brain-left-panel.tsx       # AI Employees · Active Tasks · Knowledge Sources
    ├── brain-center-panel.tsx     # Brain core + reasoning stream + memory graph
    ├── brain-right-panel.tsx      # Decisions · Context · Suggested Actions · Status
    ├── brain-core.tsx             # the animated Brain core (local keyframes)
    └── brain-ui.tsx               # shared glass/atoms (GlassPanel, chips, dots)
```

## Design

- Refined sci-fi command deck: dark, glassmorphic panels, a cyan→violet accent
  glow, and one memorable centerpiece — the breathing, orbiting Brain core.
- Reuses the existing design system (tokens, shadcn primitives). Core-only
  keyframes are defined locally so the feature stays self-contained.
- Responsive: three columns on wide screens, stacked (centre first) on narrow.

## Honesty rule

No faked AI. Idle/placeholder states everywhere, with `Planned` tags and copy
describing the future capability. System Status reports real facts (e.g. the
Knowledge Kernel interfaces exist; no AI providers are connected).
