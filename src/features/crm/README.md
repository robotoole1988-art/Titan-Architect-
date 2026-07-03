# CRM feature

The founder's **three-level command centre** (ADR-024): three views of the one
Business record — never three systems.

## Routes

- `/crm` — **Level 1, Pipeline**: pre-won businesses as cards in stage columns
  (lead / qualified / proposed / lost), button stage moves (history + activity
  recorded), quick-add lead form. Lost cards are reopenable.
- `/crm/[id]` — the business in the sales lens: intake data, full stage
  control (with optional reason), timestamped activity log with manual notes,
  and the **pitch intelligence panel** (`core/pitch-intelligence` — per-trade
  talking points, pain points, objection handlers, indicative UK job values).
- `/crm/build-queue` — **Level 2, Build Queue**: every build and its items.
  **The review gate is law** — Approve / Send back (with note) / Go live; the
  website item is automated by the blueprint pipeline, all other items are
  labelled `manual` until their departments come online.
- `/crm/accounts` — **Level 3, Accounts**: live businesses with their live
  bundle (items + since-when), recent activity, and a "measurement coming"
  performance scaffold. No fake numbers — ever.

## Public API (`index.ts`)

`CrmPipelinePage`, `CrmLeadDetailPage`, `CrmBuildQueuePage`, `CrmAccountsPage`.

## Architecture

- All writes go through `core/business` workflows/repositories (ADR-023/024);
  the gate and build-once rules are core, contract-tested logic — the UI only
  offers legal moves.
- Generation actions come from Experience Studio's public API; generation
  stays in core.
- `/businesses` remains the neutral all-records list; the CRM is the
  operational lens.
