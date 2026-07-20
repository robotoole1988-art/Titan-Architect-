# ADR-052 — Command Mode v1: approval-gated execution with guardrail tiers

- **Status:** Accepted
- **Date:** 2026-07-20
- **Implements:** the execution half of ADR-015's observe→decide→delegate
  contract, behind the founder gate
- **Builds on:** ADR-046 (memory spine / learning feed), ADR-048 (Ask the
  Brain — the validated parse seam), ADR-050 (Decision Engine — plans with
  `requiresApproval: true`), ADR-051 (health), ADR-024 (build review gate)
- **Constitutional reference:** the Brain doc's guardrail section
  (`src/core/brain-orchestrator/README.md` → "Guardrails — the execution
  constitution"), added by this ADR

## Context

The Brain remembers (046), answers (048), advises (050), and scores (051).
Its recommendations already carry `BrainExecutionPlan`s whose every task is
`requiresApproval: true` — but nothing can *run*. Execution is the missing
half, and it is exactly the seam where agentic systems fail: industry
experience puts >40% of agentic project failures at autonomous hand-offs,
where small errors compound unsupervised. TITAN's edge is founder-gated
discipline, so v1 is deliberately narrow.

## Decision

**One new core module: `core/command-mode`.** Pure, deterministic,
LLM-free. Three pillars:

### 1. Guardrail tiers — core architecture, not a feature flag

Every executable action declares a tier:

| Tier | Meaning | v1 policy |
| --- | --- | --- |
| `auto` | May run without a founder click | **No action holds this tier.** The machinery exists; the classification doesn't. |
| `recommend_first` | The Brain may propose it proactively; it runs only after founder approval | create_next_action, append_business_note, draft_follow_up |
| `approval_required` | Only the founder initiates it, and it still requires explicit approval | update_build_item, delegate_recommendation |

**Promotion to `auto` is a founder decision recorded as data, never a code
default.** `effectiveTier()` reads the catalogue default, then honours a
`tier_promoted` learning-feed observation — only when `source: "founder"`.
The founder's decision lives in the same append-only feed as everything
else the Brain learns from: inspectable, dated, attributable.

### 2. The action catalogue — policy as data

Five actions, all internal and reversible, defined as inspectable data
(id, tier, parameter spec, validation, preview):

1. `create_next_action` — a CRM next action/promise on a business
   (learning-feed `promise` + CRM activity note).
2. `append_business_note` — a structured note on a business record
   (activity log + feed observation).
3. `draft_follow_up` — drafts (never sends) a follow-up email for an
   enquiry, saved as a versioned `email_draft` artifact for founder review.
4. `update_build_item` — advance/annotate a build-queue item through the
   existing ADR-024 transition guard.
5. `delegate_recommendation` — marks a recommendation delegated
   (suppresses it like accepted/dismissed).

**Excluded by constitution, not by omission:** anything customer-visible
(publishing, sending, media approval), anything spending money, anything
deleting data. The catalogue test suite asserts the exclusions.

### 3. The execution flow — approve → execute → verify → learn

- Requests land as `command_requested` observations (with the exact
  preview of what will happen); the pending queue and history are **derived
  from the feed** — event-sourced, no new tables, append-only honesty.
- Approval is a founder click on a card that shows precisely what will
  run. Execution writes through the Business Spine repositories, then
  **verifies by re-reading** what it wrote.
- The outcome (`command_executed` / `command_failed` / `command_partial`)
  is appended with a full trace: who approved, when, what ran, what
  changed, revert info where applicable.
- **Failure honesty:** a failed action reports what failed and why, marks
  the plan failed in the feed, and never silently retries.
- Natural commands from Ask the Brain ("create a task to chase Bright
  Smile") resolve deterministically through the existing validated seam
  (ADR-048's conservative name resolution) — and **always** land as a
  pending approval, never direct execution, regardless of phrasing.
  Ambiguity comes back as a question, never a guess.

## Consequences

- The Brain can now act — but only through the founder's hands. Every
  execution is attributable, previewed, verified, and remembered.
- Approve→execute is synchronous; a crash between approval and outcome
  leaves the request pending (it simply re-appears for approval). Safe in
  v1 because every catalogued action is internal and reversible.
- `recommendation_delegated` joins accepted/dismissed as a suppression in
  the Decision Engine.
- One migration widens `business_artifacts` to accept `email_draft`.
- Department integrations (ads/GBP execution) arrive with their own
  departments and their own tier reviews — out of scope here, by design.
