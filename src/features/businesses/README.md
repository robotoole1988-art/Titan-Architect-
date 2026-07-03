# Businesses feature

The pipeline view over the **Business Spine** (`core/business`, ADR-023):
every saved business and its journey through TITAN. The seed of the command
centre — read-mostly, deliberately NOT the full three-level CRM (that arrives
later as views over the same record).

## Routes

- `/businesses` — every business: name, trade, location, lifecycle stage,
  link into its journey. Footer notes the active store (in-memory / Supabase).
- `/businesses/[id]` — the Journey: Business → Strategy → Blueprint → Website
  → Marketing, each **done** (link to the stored artifact), **available**
  (action button), or **upcoming** (greyed; Marketing is planned). Shows the
  stage history and the view's one write: the lifecycle stage control.

## Public API (`index.ts`)

- `BusinessesPage`, `BusinessJourneyPage`.

## Architecture

- Reads through the repository abstractions only (`resolveBusinessSpine`) —
  never a database client (ADR-023).
- Generation actions are imported from Experience Studio's public API
  (feature → feature via `index.ts`, allowed by ADR-008); generation itself
  stays in core.
