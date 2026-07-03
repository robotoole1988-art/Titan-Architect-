# ADR-023: Business Spine — durable persistence and the Business record

- **Status:** Accepted
- **Date:** 2026-07-03
- **Deciders:** Robert O'Toole
- **Tags:** architecture, core, persistence, data, crm
- **Supersedes:** —
- **Superseded by:** —

## Context

The full journey works — Intake → Strategy → Blueprint → rendered website —
but nothing durably persists. Intakes live in browser localStorage; strategies
and blueprints are re-derived from URL query strings on every view. This is
exactly the failure class that killed TradeFlow v6: browser-local data, lost
leads, nothing shared across devices.

TITAN also needs its central domain entity. The future CRM's three levels
(Lead → Build → Account) are *views* of one thing: a **Business** moving
through a lifecycle. Without that record, every feature invents its own
storage and the platform has no spine.

## Decision

### One Business record, one lifecycle

A new kernel module, **`src/core/business/`**, defines the platform's central
entity. A Business carries identity (name, trade, location, contact), intake
data (services, target customer, goal, budget, urgency, current site), a
**lifecycle stage** — `lead → qualified → proposed → won → building → review →
live → account` (a superset of the founder's CRM stages; UIs may show subsets)
— and a full **stage history** (stage + timestamp per transition). Business
Intake creates it; everything else hangs off it.

Strategies and Blueprints become **versioned artifacts** linked to their
Business: regenerating creates version n+1, never overwrites. A blueprint
artifact records which strategy version it was built from. The pipeline's
explainability is therefore durable: you can always see what was generated,
from what, and when.

### Repositories as abstractions; two adapters

Features and engines consume **repository interfaces**
(`BusinessRepository`, `ArtifactRepository`), never a database client. The
interfaces live in `core/business` beside the entity, consistent with the
charter's kernel layer (§6: core owns shared platform capabilities; a
database client in a feature would be a boundary violation waiting to happen).

Two adapters implement the same contract:

- **In-memory (default).** Zero-setup fallback: the app works out of the box,
  demos keep working, tests run anywhere. Process-lifetime only — data
  survives navigation but not a server restart. Clearly labelled as such.
- **Supabase (Postgres).** Activated ONLY by server-side environment
  variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`). Keys never appear
  in client code; every repository call happens in server components and
  server actions (`server-only` guards the module against client imports).

A provider (`resolveBusinessRepositories`) selects the adapter from the
environment at the server boundary. Swapping stores changes zero feature code.

### Why Supabase

- **Durable, synced, backed up** — hosted Postgres with point-in-time
  recovery; a business saved today exists tomorrow, on any device.
- **Plain Postgres** — SQL migrations in the repo (`supabase/migrations/`),
  no proprietary data model; exit costs stay low.
- **Room to grow** — auth, storage, and row-level security are first-class
  when accounts arrive (explicitly out of scope now).
- **Free tier** — a real database for a five-minute setup (documented in the
  README; the founder runs this step).

### Testing strategy

One **contract test suite** runs against every adapter: the in-memory adapter
always; the Supabase adapter when a test instance is configured
(`TITAN_SUPABASE_TEST=1` + env vars — e.g. a local `supabase start`, which
needs Docker and is therefore opt-in). The contract is the specification; an
adapter that passes it is a valid store.

### URL boundary evolves, pattern preserved (ADR-019)

Journey links now carry a stored record's **id**
(`/experience-studio?businessId=…`) and pages resolve the record server-side.
The URL remains the only coupling between features, and the query-string form
(`businessName/trade/location`) remains as the ephemeral, zero-setup fallback
— a missing or unknown id degrades gracefully to the sample business.

## Consequences

### Positive
- Lead data survives restarts, devices, and browsers — the TradeFlow failure
  class is closed.
- The Business record gives the future CRM its spine: three levels become
  three views of one lifecycle.
- Artifact versioning makes regeneration safe and history inspectable.
- The repository seam means the store can change (or be mocked) without
  touching features.

### Negative / Trade-offs
- The in-memory default silently loses data on restart — acceptable for the
  zero-setup path, prominently documented, and exactly why Supabase setup is
  a five-minute README task.
- Supabase adapter correctness is guaranteed by contract tests only when a
  test instance is available; CI runs the in-memory contract.
- jsonb artifact payloads are schemaless in the database; the TypeScript
  contracts remain the source of truth (deliberate — the blueprint schema is
  still evolving, ADR-017).

### Neutral
- No auth, no RLS yet: the service-role key is used server-side only. RLS
  policies arrive with user accounts (future ADR).
- localStorage intake storage is retired; the intake feature now writes
  through the repository.

## Alternatives Considered

- **Keep localStorage** — the failure mode this milestone exists to kill.
  Rejected.
- **SQLite file (e.g. better-sqlite3)** — durable locally, but single-machine:
  no sync across devices, nothing for a future hosted deployment. Rejected.
- **Prisma/Drizzle ORM over Postgres** — adds a schema toolchain we don't need
  yet; the repository interface is our seam, and plain SQL migrations keep the
  surface small. Revisit if query complexity grows.
- **Direct Supabase client calls from features** — fastest, but couples every
  feature to one vendor and makes the zero-setup fallback impossible.
  Rejected; the charter demands the abstraction.

## References

- ADR-010 (Knowledge Kernel — the kernel-layer precedent), ADR-018 (Business
  Intake), ADR-019 (URL boundary), ADR-021/022 (artifacts being persisted).
- `src/core/business/`, `supabase/migrations/`,
  `tests/core/business/`.
