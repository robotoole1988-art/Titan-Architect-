# ADR-051 — Business Health Engine v1: problems visible before they're critical

- **Status:** Accepted
- **Date:** 2026-07-20
- **Implements:** ADR-015's `BrainHealth`/`HealthLevel` contract
- **Builds on:** ADR-046 (memory spine), ADR-050 (Decision Engine — the
  honesty architecture and the recommendation channel), ADR-042 (Mission
  Control), ADR-048 (the narration seam)

## Context

The Brain remembers, answers, and advises. The manifesto's fourth pillar is
continuous health: every department scored, trends visible, problems surfaced
before they become critical — without a single invented number.

## Decision

**One new core module: `core/health-engine`.** Five departments, computed
purely and deterministically over the memory spine graph + learning-feed
observations, with an injectable clock and NO LLM anywhere in the scoring
path:

| Department | Scored from |
| --- | --- |
| Enquiries | SLA compliance over the window + currently-open breaches |
| Pipeline | Freshness of active-stage businesses + stale proposals |
| Delivery | Build-item flow (not blocked/stalled) + founder-gate wait |
| Experience | FAQ coverage of live sites + media-gate approval ratio |
| Measurement | Traffic trend vs prior period + conversion trend |

**Inspectable formulas.** A score is a weighted mean of named factors; every
factor carries its weight, its computed value, its inputs in plain English,
and evidence records (links + spine provenance). The formula string renders
in the UI — the founder can audit any number back to spine records.

**Honesty rules.**
- *Activation Law*: a department without the data to score honestly returns
  `scoreable: false` with "not yet scoreable — needs X". Never a fake score.
- *Degraded data lowers confidence visibly*: a factor whose input is missing
  (e.g. Lighthouse runs are not yet recorded in the spine; no generated media
  to assess) is excluded, remaining weights renormalise, confidence drops,
  and the gap is named in the panel. No vanity smoothing; no industry
  benchmarks presented as fact — trends compare a department with itself.
- *ADR-015 for real*: each department result maps onto `BrainHealth`
  (green→healthy, amber→degraded, red→unhealthy, not-scoreable→unknown).

**Trend from the feed, not from guesswork.** Each load appends at most one
`health_snapshot` observation per department per day; trend is the delta
against the latest prior snapshot. No prior snapshot → trend is honestly
null ("first reading").

**Wired into what exists.** A `department_health` rule joins the Decision
Engine: red or amber health emits a recommendation naming the dragging
factors, with the same evidence/confidence shape as every other rule.
Surfaces: a compact strip on Mission Control; the full drill-down panel
(factors, evidence, formula, trend, confidence) in the Brain workspace.
Claude may narrate the overall picture through the existing seam — computed
payload only, silent fallback.

## Watch-list

Snapshot dedupe is best-effort (fresh read immediately before append):
simultaneous first-loads of two surfaces can still double-append on a brand
new day. Duplicates are harmless — trend reads prior-DAY snapshots only —
but a storage-level uniqueness guard is the proper fix when the feed gains
constraints.

## Out of scope

Predictions/Future Mode; execution; per-department AI specialists; new
external services; industry benchmarks.

## Verification

Every formula, band boundary, trend path, not-scoreable state, confidence
degradation, snapshot payload, and the health→recommendation rule covered by
deterministic tests; verified in-browser on real data (restarted dev
server). Gates + CI green.
