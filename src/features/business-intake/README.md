# Business Intake feature

The **first step of the Business → Blueprint journey.** The screen where a
founder or team member enters the basic business details TITAN needs before
generating strategy and blueprint outputs.

## Status

**v0.1 — mock / localStorage.** No database, no AI, no external APIs. Saved
intakes persist to `localStorage`.

## Route

- `/business-intake`

## Public API (`index.ts`)

- `BusinessIntakePage` — the intake screen, rendered by the route.
- Types: `BusinessIntake` (the saved record later modules consume),
  `BusinessIntakeDraft`, `MarketingBudget`, `BusinessGoal`, `UrgencyLevel`.

## Fields

Business Name, Trade, Location, Services, Target Customer, Monthly Marketing
Budget, Current Website URL, Main Goal, Urgency Level. Name / Trade / Location
are required.

## Output

A saved `BusinessIntake` record (with system-managed `id` / `createdAt` /
`updatedAt`). These records are the input the future strategy and blueprint
engines will consume — the intake already carries the business name, trade, and
location the Experience Strategy Generator needs.

## UI

Premium dark onboarding surface: a two-column layout with the intake form and
the list of saved intakes. Each saved intake shows its goal, budget, urgency,
and a **disabled "Generate Strategy" (coming soon)** action, plus Remove.

## Structure

```
business-intake/
├── index.ts
├── model/
│   ├── types.ts                    # BusinessIntake + options
│   ├── mock-data.ts                # a seed intake
│   ├── business-intake-store.ts    # localStorage store
│   └── format.ts
├── hooks/
│   └── use-business-intake.ts      # useSyncExternalStore access
└── components/
    ├── business-intake-page.tsx    # layout
    ├── business-intake-form.tsx    # the form (create)
    └── saved-intakes-list.tsx      # the saved list (+ remove)
```

## Architecture

- Self-contained feature; no cross-feature imports. The `/business-intake` route
  is thin (renders the feature's public `BusinessIntakePage`).
- Data lives behind the store, so swapping localStorage for a real backend later
  touches only `model/business-intake-store.ts`.
