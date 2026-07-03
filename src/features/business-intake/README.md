# Business Intake feature

The **first step of the Business → Blueprint journey.** The screen where a
founder or team member enters the basic business details TITAN needs before
generating strategy and blueprint outputs.

## Status

**v0.2 — writes the Business record (ADR-023).** Saving an intake creates a
durable `Business` in the Business Spine (`core/business`) at lifecycle stage
**lead** — the parent record every strategy, blueprint, and website hangs off.
Storage is the repository abstraction: in-memory by default, Supabase when
configured. The old localStorage store is retired.

## Route

- `/business-intake`

## Public API (`index.ts`)

- `BusinessIntakePage` — the intake screen, rendered by the route.
- Types: `BusinessIntakeDraft` (the form's fields), `MarketingBudget`,
  `BusinessGoal`, `UrgencyLevel`. (The saved record type is `Business` from
  `core/business`.)

## Fields

Business Name, Trade, Location, Services, Target Customer, Monthly Marketing
Budget, Current Website URL, Main Goal, Urgency Level. Name / Trade / Location
are required.

## UI

Premium dark onboarding surface: a two-column layout with the intake form and
the saved businesses. Each saved business shows its lifecycle stage, goal and
budget, an active **Generate Strategy** action (by stored id), a **Journey**
link, and Remove.

## Structure

```
business-intake/
├── index.ts
├── api/
│   └── actions.ts                  # server actions → Business Spine repository
├── model/
│   ├── types.ts                    # the intake draft + options
│   └── format.ts
└── components/
    ├── business-intake-page.tsx    # layout
    ├── business-intake-form.tsx    # the form (client) → createBusinessFromIntake
    └── saved-intakes-list.tsx      # server-rendered list (+ remove)
```

## Architecture

- Writes through `core/business` repository interfaces only — never a
  database client (ADR-023). The `/business-intake` route stays thin.
- Onward journey links carry the stored business **id** (ADR-019's URL
  boundary, evolved by ADR-023); pages resolve records server-side with
  graceful fallback.
