# ADR-050 — Decision Engine v1: recommendations with reasons

- **Status:** Accepted
- **Date:** 2026-07-20
- **Implements:** ADR-015 (Brain Orchestrator — until now, interfaces only)
- **Builds on:** ADR-046 (memory spine), ADR-048 (Ask the Brain — the honesty
  architecture and the reasoner seam), ADR-042 (Mission Control), ADR-049
  (clean dataset)

## Context

The Brain can remember (ADR-046) and answer (ADR-048); it cannot yet advise.
ADR-015's observe→decide contracts have been dormant since they were written.
The manifesto behaviour — *what happened, why it matters, what to do, who,
when, confidence, expected impact* — is now buildable honestly, because every
input it needs exists in the spine.

## Decision

**Implement the ADR-015 contracts inside `core/brain-orchestrator`** (the
ADR-046 pattern: the implementation lives with its contract).

**Six deterministic rules — only where data genuinely exists (Activation
Law):**

| Rule | Fires when |
| --- | --- |
| `enquiry_sla` | An enquiry sits new/seen past the SLA — respond now |
| `stale_deal` | A proposed-stage business hasn't moved past the threshold |
| `build_blocked` | Build items wait on founder review or have stalled |
| `measurement_move` | A live site's visits moved notably vs the prior period |
| `media_review` | Generated media sits unapproved in the founder gate |
| `missing_content` | A live site's trade has no researched FAQ bank |

Each rule is a pure function over the memory-spine graph + learning-feed
observations + the shared Mission Control thresholds — same discipline as
`buildBriefing`: injectable clock, reproducible, tested.

**The full ADR-015 shape, honestly derived.** Every recommendation carries a
real `BrainObservation` (what happened, with evidence records reusing
ADR-048's `EvidenceRecord` — links + spine provenance), a `BrainDecision`
(summary, rationale = why it matters, `requiresApproval: true` — v1 is
read-only), and a single-task `BrainExecutionPlan` (`BrainTask` with the
recommended action, capability, owner `founder`, priority, status `pending` —
no department executes anything). Confidence, expected impact, and risk ride
in `extensions` — the contract's sanctioned open slot. **No fabricated
numbers**: expected impact is qualitative unless real data supports a figure
(a measurement move cites its own measured delta; an SLA breach cites its own
minutes — nothing else pretends to a percentage).

**Ranking, deterministic and stable.** score = severity (rule class) ×
urgency (how far past threshold) × confidence, with the recommendation id as
the tiebreak. One recommendation per (rule, subject) — dedupe by construction.
Identical data in, identical ordering out, proven by tests.

**Founder controls close the loop.** Accept and Dismiss (with optional
reason) are appended to the learning feed, along with each first issuance of
a recommendation id. Accepted/dismissed ids are suppressed from future runs —
the feed is the memory. (Watch-list: suppression is by stable id, so a
condition that persists after acceptance stays suppressed; re-raising after a
cool-down is future work when the feed can support it.)

**LLM narration, same honesty architecture as ADR-048.** The existing
Anthropic reasoner may phrase the rationale readably — over the deterministic
payload only, never inventing, and never narrating absence. No key → the
deterministic phrasing stands.

**Surfaces.** Mission Control's "Today's top actions" is now driven by the
engine; the Brain workspace gains the recommendations panel. Each shows the
expandable *why* (observation, evidence, derivation, confidence, impact,
risk) and the Accept/Dismiss controls.

## Out of scope

Execution/automation (Command Mode), predictions/Future Mode, health scores,
department-specific logic, new external services.

## Verification

Rules, ranking stability, dedupe, suppression, and narration honesty covered
by deterministic tests over a dedicated fixture; recommendations verified
in-browser on real data (restarted dev server) with accept/dismiss
round-tripping to the learning feed. Gates + CI green.
