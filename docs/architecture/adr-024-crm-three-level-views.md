# ADR-024: CRM v1 — three views of one record, and the approval gate

- **Status:** Accepted
- **Date:** 2026-07-04
- **Deciders:** Robert O'Toole
- **Tags:** architecture, crm, core, lifecycle, quality
- **Supersedes:** — (extends ADR-023's lifecycle; ADR-023 remains accepted)
- **Superseded by:** —

## Context

The Business Spine (ADR-023) established the single Business record and its
lifecycle. The founder's CRM specification defines three levels: a sales
pipeline of prospects (Lead), a build production line with a hard founder
approval gate (Build), and live customer accounts (Account). The architectural
risk is obvious: three levels drift into three systems with three copies of
the truth.

## Decision

### Three views, one record

`/crm` presents Pipeline, Build Queue, and Accounts as three lenses over the
SAME Business record — no CRM-specific entities duplicate business state.
`/businesses` remains the neutral all-records list. What each level shows is
derived from the record's lifecycle stage and its Build.

### Lifecycle extension

The lifecycle gains two **lost states** — `not_interested` and
`not_going_ahead` — off the progression ladder, terminal but always
reopenable, with an optional **reason** recorded on the stage transition (the
history entry gains `reason?`). The founder's Level-1 stages map onto the
existing ladder: unqualified→`lead`, qualified→`qualified`,
proposed→`proposed`, closed→`won`.

### Builds and the gate

Winning a business creates its **Build** — exactly once, ever — containing the
seven build items (`website`, `google_ads`, `lsa`, `seo`, `gbp`, `meta_ads`,
`ai_search`), each climbing `queued → building → ai_check → review → approved
→ live`. **The review gate is law**, enforced in core
(`assertBuildItemTransition`) by every adapter and covered by contract tests:
`live` is reachable only from `approved`, and `approved` only from `review` —
the founder's explicit action in the Build Queue. All other movements are
deliberately permissive (send-backs with notes, manual progression).

**v1 honesty:** only the website item is automated — blueprint generation
advances it to review; approval and go-live remain human. Every other item is
labelled **manual** in the UI until its department comes online. When the
website goes live, the business advances to `live` and appears in Accounts,
whose performance panel is an explicit "measurement coming" scaffold — TITAN
never shows a number it didn't measure.

### Workflows live in core

Rules that span repositories — build-created-once-on-won, activity logging,
website-item advancement — are framework-free functions in
`core/business/workflows.ts` (`transitionBusinessStage`,
`recordArtifactGenerated`), called by every feature's server actions and
unit-tested directly. A timestamped **activity log** per business (new
`business_activity` table) records notes and automatic entries (stage changes,
artifact generation, build events).

### Pitch intelligence

`core/pitch-intelligence` is a typed, deterministic per-trade knowledge module
(talking points, pain points, objection handlers, indicative UK job values) —
richly seeded for roofing, driveways, and plumbing & heating, with defaults
elsewhere. It is the seed of Industry DNA surfacing in the CRM; the Knowledge
Kernel feeds it later. No AI calls.

## Consequences

### Positive
- The CRM cannot drift from the pipeline views — same record, same stages.
- The approval gate is enforced by code and tests on every storage adapter,
  not by UI convention.
- Lost leads keep their history and reasons — reopenable, never deleted.
- The activity log gives every business a durable, inspectable narrative.

### Negative / Trade-offs
- Six of seven build items are manually tracked — labelled honestly; each
  automation department will replace hand-moves without schema changes.
- The gate rules live in application core, not database constraints; a direct
  SQL write could bypass them (accepted until RLS/roles arrive).
- Pitch content is hand-curated and static until the Knowledge Kernel serves it.

### Neutral
- Migration `20260704000000_crm_v1.sql`: widened stage check,
  `business_activity`, `builds`, `build_items`.
- The in-memory spine's dev-cache key is now shape-versioned (a spine upgraded
  under HMR must not serve a stale, incomplete singleton).

## Alternatives Considered

- **Separate Lead/Build/Account entities** — mirrors the three levels
  structurally, but guarantees drift and re-keying migrations later. Rejected:
  the founder's spec itself says "three views of one lifecycle".
- **Gate enforced in the UI only** — invisible until it fails. Rejected; the
  gate is a core rule with tests.
- **Database triggers for the gate** — enforces at the deepest layer but
  splits business rules between SQL and TypeScript. Rejected for now;
  revisit with RLS.

## References

- ADR-023 (Business Spine), ADR-019 (URL boundary), ADR-010 (Knowledge Kernel
  — future source for pitch intelligence).
- `src/core/business/{build-model,workflows}.ts`, `src/core/pitch-intelligence/`,
  `src/features/crm/`, `supabase/migrations/20260704000000_crm_v1.sql`,
  `tests/core/business/`.
