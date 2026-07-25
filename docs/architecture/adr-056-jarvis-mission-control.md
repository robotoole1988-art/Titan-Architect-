# ADR-056 — Mission Control: the Jarvis exemplar

- **Status:** Proposed (feature branch `feat/jarvis-mission-control` — the
  founder judges the feeling at the gate)
- **Date:** 2026-07-25
- **Implements:** COCKPIT-DESIGN-LAW.md §1, §2, §3, §7 on the exemplar
  screen; Decades-Ahead Audit items 1+2+3 (M1)
- **Builds on:** ADR-042 (Mission Control), ADR-048 (the narration seam),
  ADR-049 (internal-business flag — the exclusion precedent), ADR-050/051/052
  (the modules being restaged)

## Context

The audit's verdict: substance ~8.6, staging ~6 — a decades-ahead engine
wearing a dev-tool's clothes, with test enquiries steering the top actions.
This milestone makes the Cockpit Law real on one screen, to be judged and
then rolled out. Four decisions below are the exemplar's contracts.

## Decision 1 — Test-artifact exclusion semantics (Law §7)

**One rule, `isTestEnquiry`, in the Business Spine beside ADR-049's
`isInternalBusinessName`.** An enquiry is a test artifact when ANY of:

1. **Explicit convention markers** (the ADR-049 mirror): name contains
   `(test)` or `(internal)`.
2. **Verification-run naming**: name contains the whole word
   `verification`. Bare `test` is deliberately EXCLUDED from this rule —
   it collides with real UK names ("Test Valley Roofing", the Hampshire
   borough), and a silently erased real lead is the worst failure a
   lead-gen product can have (adversarial-review finding). The
   parenthesised convention and rule 3 still catch every
   platform-authored row.
3. **Fiction-reserved identifiers — the principled backbone**: a contact
   that CANNOT belong to a real customer: RFC-2606/6761 reserved domains
   (`example.com/.org/.net`, `.test`, `.invalid`, `.example`) or the UK
   Ofcom drama-reserved number range (`07700 900000–900999`). Both live
   verification rows match this rule alone.

**Where it applies — the same two-tier semantics as ADR-049:**

- `loadMemorySnapshot` filters test enquiries unconditionally (the single
  choke point for every Brain surface: briefing, top actions, health
  inputs, Ask the Brain, Command Mode previews). No opt-out: no operating
  surface legitimately wants a test row steering it.
- The notification feed (which reads repositories directly — the audit's
  verified gap) applies the rule itself, AND excludes internal businesses'
  enquiries (a second verified gap: the bell counted them).
- **CRM detail surfaces keep test rows findable** (repositories stay
  unfiltered), exactly as internal businesses remain findable — exclusion
  is about steering, not erasure.
- **Outbound email is a notification surface too** (adversarial-review
  finding): the enquiry-notification send is gated on the same rule — a
  test submission stores its row (findability) but emails nobody. A
  verification run must never make a real client chase a test enquiry.
- **Aggregate metrics are excluded at the SOURCE, honestly bounded**
  (adversarial-review finding): the form-submit beacon is skipped for
  test submissions from this change forward. Page-VIEW beacons from
  verification visits are identity-free aggregates and cannot be
  row-filtered — historical counters and view-side noise remain in
  measurement figures, age out of the rolling windows, and are
  acknowledged here rather than papered over.
- **Legacy pending approvals** created from test rows before this ADR
  surface in the queue for explicit founder decline (append-only feed;
  one click, visible, honest). New command requests cannot reference test
  rows — previews resolve through the filtered snapshot.
- The learning feed is append-only: historical observations issued from
  test rows stand as history (constitution), but no longer steer — every
  current computation excludes the rows themselves. Health trend deltas may
  show a one-day artifact as polluted snapshots age out; honest and
  transient.

## Decision 2 — The address line contract (Law §1)

`composeSituationAddress` is **deterministic first**: up to three clauses
ranked by consequence — SLA breaches, then waiting enquiries, then red
departments, then stale deals, then builds on the founder gate — plus a
closing approval clause ("two await your approval" / "nothing awaits your
approval"). All figures from the (already test-filtered) briefing payload.
When there is genuinely nothing: the crafted quiet line — "All quiet.
Enquiries answered, nothing stalled, nothing awaiting your approval." —
which is honest by construction (it renders only when every input is zero).

The reasoner (ADR-048 seam, Sonnet) may REPHRASE the deterministic address
from its payload — same facts, better voice; calm, precise, never
exclamatory. Any decline and the deterministic line stands. The address
carries the page-level ⓘ; it never cites its machinery inline.

## Decision 3 — The exceptional-badge rule (Law §2)

A badge renders ONLY when it signals an exception:

| Element | Badge renders when | Otherwise |
| --- | --- | --- |
| Recommendation urgency | `urgency === "now"` → NOW | nothing |
| Recommendation risk | `riskLevel === "high"` and not already NOW | nothing |
| Confidence | never — it lives in the "why" disclosure | — |
| Enquiry rows | SLA breached → breach chip | plain muted age text |
| Build rows | stalled / waiting-on-review chips (already exceptional) | — |
| Account rows | notable visit move (already conditional) | — |
| Command pending | guardrail tier only; "via" becomes muted inline text | — |
| Command history | failed / partial only | executed = quiet check, no badge |
| Health strip | band dot only when amber/red; trend when it moved | green = clean tile |
| Ask answers | confidence badged only when NOT high | — |
| Header count pills | data, not decoration — retained | — |

Cards lead with the imperative (two-line clamp); narration stays behind
"why"; ONE primary action (Accept) with the rest in an overflow menu.

## Decision 4 — The ⓘ pattern (Law §3)

One ⓘ per module header. Hover/tap opens a popover carrying the EXACT
provenance text that previously stood on the wall (verbatim — the
provenance law is staged, not weakened): the Decision Engine line, the
Command Mode line, the Health Engine line, the briefing's "every figure is
measured" line, and the per-account measurement provenance. Machinery
inside the "why" disclosure stays where it is — that panel IS the founder
asking to see the work.

## Consequences

- The Brain never again recommends chasing a test row — its credibility is
  the product (Law §7).
- Mission Control opens as an address, not a wall; the same information
  density survives one affordance deeper.
- Ask the Brain becomes the front door: first element, voice-of-system
  styling, ⌘K focuses it anywhere in the cockpit shell.
- The exclusion rule is data-level and app-wide by construction (snapshot
  choke point); the staging changes are exemplar-local, to be rolled out
  screen-by-screen in M2 after the gate.
