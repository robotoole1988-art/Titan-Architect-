# ADR-042: Mission Control — the first Brain surface (deterministic daily briefing)

- **Status:** Accepted
- **Date:** 2026-07-06
- **Deciders:** Robert O'Toole
- **Tags:** brain, mission-control, crm, measurement, deterministic
- **Supersedes:** —
- **Superseded by:** —

## Context

The Brain is TITAN's coordinating intelligence — it observes, decides,
delegates, and learns ([ADR-015](./adr-015-brain-orchestrator.md)), and the
Growth Department doctrine (GROWTH-DEPARTMENT.md) says specialists read and
write **one shared intelligence layer** and lead with **deterministic playbooks
before any LLM reasoning**. But the Brain has had no real *surface*: `/dashboard`
was a "Foundation ready" placeholder.

We want the first honest slice of the Brain: a **live daily briefing** that
turns the data we already hold into "what needs your attention today." It must
run **only on existing internal data** — CRM (Pipeline / Build Queue /
Accounts), first-party measurement ([ADR-030](./adr-030-lead-flow.md)),
enquiries, and speed-to-lead — with **no new external services** and **no LLM**.

The **memory spine** (a later milestone) will become the Brain's real data
substrate and will re-point this briefing. So the data access must be **cleanly
separable** from the briefing logic now.

## Decision

**Ship Mission Control as a thin vertical slice: a deterministic briefing engine
in `core/`, fed by a swappable data seam in the feature, rendered on `/dashboard`.**

### The deterministic engine — `core/mission-control/` (pure, no I/O)

`buildBriefing(data, { now, thresholds }) → Briefing`. A **pure function** over a
plain `MissionControlData` snapshot (businesses, enquiries, builds, publications,
metric rows) plus an explicit `now` and a single **thresholds/weights config**.
No repositories, no `Date.now()`, no randomness — so every rule is unit-testable
and every run is reproducible. Five sections, each from real data:

1. **Enquiries needing attention** — uncontacted enquiries (`new`/`seen`),
   oldest first, each with age and a **speed-to-lead SLA** flag
   (uncontacted longer than `enquirySlaMinutes`).
2. **Pipeline** — active leads/deals by stage (`lead`/`qualified`/`proposed`);
   flags **stale** (no stage movement past `pipelineStaleDays`) and **deals
   needing a next action** (a `proposed` business gone stale).
3. **Build Queue** — builds with in-progress items; flags items **waiting on
   your review** (the founder gate) and **stalled / past target** (not updated
   in `buildStaleDays`). *(The build model has no explicit "blocked" /
   "waiting-on-client-content" state today; we surface what the data supports —
   review-waiting and staleness — and note the richer states as a future
   build-model extension rather than invent them.)*
4. **Live accounts** — per published site: visits, enquiries, form conversion
   from first-party measurement, plus a **notable move vs the prior period**
   (±`notableMovePercent` over `accountPeriodDays`). Every figure is measured,
   never modelled.
5. **Today's top actions** — a **deterministically ranked** shortlist drawn from
   1–4. Each candidate gets a numeric score (base weight per kind + magnitude:
   minutes past SLA, days stalled/stale); sorted descending, tie-broken by age
   then id for stability. Each line carries *what*, *why it matters*, a
   *recommended action*, and a *link to the underlying record*.

**Thresholds and weights live in ONE place** (`config.ts`,
`DEFAULT_THRESHOLDS`) and are overridable per call.

### The data seam — `features/mission-control/data/resolve-briefing.ts`

The feature reads the Business Spine ([ADR-023](./adr-023-business-spine-persistence.md))
into a `MissionControlData` snapshot and calls `buildBriefing`. **This gather
function is the seam the memory spine will replace** — the engine never imports
a repository, so re-pointing it later touches only this file.

### The surface — `/dashboard`

The placeholder is replaced by the briefing (server component). **Read-only:** it
surfaces and recommends; it never mutates. Links go to the CRM records
(`/crm/accounts?enquiry=…`, `/crm/<id>`, `/crm/build-queue`) where the founder
takes the action with a click. Empty states are **honest absence**, not filler.

## Consequences

**Positive** — the Brain has a real, honest first surface; one deterministic
engine, fully tested; every number is provenance-linked and real; the memory
spine can re-point the data seam without touching the rules or the UI.

**Negative / watch-list** — the briefing re-queries the spine on each load (fine
at current scale; the memory spine will cache/aggregate later). Build "blocked /
waiting-on-client-content" is approximated by review-waiting + staleness until
the build model earns explicit states. Ranking weights are a deterministic
first guess — they live in config so they can be tuned as the founder uses it.

## Out of scope (explicitly deferred)

Ask-the-Brain / natural-language query; predictions / Future Mode; the memory
spine; any external data; any auto-action; per-user team briefings.

## Verification

- `/dashboard` renders the live briefing from real CRM + measurement data
  (verified in-browser); all five sections render from actual data; empty
  states are honest absence.
- Deterministic ranking + thresholds pinned by `tests/core/mission-control/`.
- Read-only; no figure invented; every number traces to its source.
- Gates green (lint, type-check, tests, build); CI green.
