# Command Mode v1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use sp-ecc:executing-plans to implement this plan task-by-task.

**Goal:** Approval-gated execution for the Brain — guardrail tiers as core
architecture, a five-action internal/reversible catalogue, and a founder
approval queue, so recommendations and natural commands can finally *run*
without ever running unsupervised.

**Architecture:** One new core module (`src/core/command-mode/`) beside the
Decision Engine: policy-as-data catalogue + tier machinery, an event-sourced
approval queue over the existing append-only learning feed (no new tables),
and a deterministic executor that writes through the Business Spine
repositories with verify + full trace. Feature seams in `features/brain`
surface the queue in the Brain workspace and Mission Control; the Ask the
Brain deterministic parser gains command phrasings that always land as
pending approvals.

**Tech Stack:** TypeScript, Next.js server actions, Vitest, Supabase (one
constraint-widening migration: `email_draft` artifact kind).

**Complexity:** High

**Risks:**
- HIGH: execution seam is where agentic systems fail (error compounding) —
  mitigated by v1 policy: zero auto-tier actions, founder approval on every
  run, internal/reversible actions only, verify-after-execute, honest
  failure outcomes, no silent retries.
- MEDIUM: approve→execute is synchronous; a crash between approve and
  outcome leaves the request pending — acceptable in v1 because every
  catalogued action is internal, reversible, and idempotent-safe to re-run;
  documented in ADR-052.
- LOW: parser over-matching questions as commands — command patterns are
  imperative-only, checked conservatively, and ambiguity returns a question,
  never a guess.

**Testing:** Unit: catalogue policy, tier machinery (promotion via founder
feed record), queue derivation, executor per action (happy/failed/partial),
command parsing, delegated suppression. Integration: approve→execute→verify
→feed against the in-memory spine. E2E: manual in-browser on real data.

---

### Task 1: ADR-052 + Brain doc guardrail section
Files: `docs/architecture/adr-052-command-mode.md` (create),
`docs/architecture/README.md` (ADR index row),
`src/core/brain-orchestrator/README.md` (add "Guardrails" section).
The ADR is constitutional: tiers defined (auto / recommend-first /
approval-required), v1 policy (no auto; promotion = founder decision recorded
in the learning feed, never a code default), catalogue inclusion rules
(internal + reversible only; excluded: customer-visible, spend, delete).

### Task 2: model.ts + catalogue.ts + tiers.ts (TDD)
Files: `src/core/command-mode/{model,catalogue,tiers,index}.ts`,
`tests/core/command-mode/catalogue.test.ts`.
- `GuardrailTier`; `CommandActionDefinition` (id, title, tier, params spec,
  validate, preview) — policy-as-data, JSON-inspectable.
- Five actions: `create_next_action`, `append_business_note`,
  `draft_follow_up`, `update_build_item`, `delegate_recommendation`.
- `effectiveTier(actionId, observations)`: catalogue default unless a
  `tier_promoted` observation with `source: "founder"` overrides.
- Tests: exactly five actions; none `auto` by default; every action
  reversible + internal; promotion machinery honours founder records only.

### Task 3: queue.ts (TDD)
Files: `src/core/command-mode/queue.ts`,
`tests/core/command-mode/queue.test.ts`.
Feed kinds: `command_requested`, `command_rejected`, `command_executed`,
`command_failed`, `command_partial`. Derive `pending` (requested minus
terminal) and `history` (outcomes with traces), both deterministic.

### Task 4: executor.ts (TDD)
Files: `src/core/command-mode/executor.ts`,
`tests/core/command-mode/executor.test.ts`.
`executeCommand(request, {spine, feed, now, approvedBy})`: validate → run
spine writes → verify by re-read → append outcome with full
`CommandTrace` (approvedBy/approvedAt/steps/changes/revert). Failure paths:
unknown targets, illegal build transitions → `command_failed` with the real
error; multi-write actions record `command_partial` honestly. Never retries.

### Task 5: natural commands (TDD)
Files: `src/core/command-mode/parse.ts`, `src/core/ask-brain/index.ts`
(export seam reuse), `src/features/brain/api/actions.ts`,
`tests/core/command-mode/parse.test.ts`.
Imperative patterns → catalogued action + params via
`resolveBusinessByName` (existing validated seam). Ambiguous → question.
`askBrainAction` requests (never executes) and answers honestly.

### Task 6: decision-engine seam (TDD)
Files: `src/core/brain-orchestrator/decision-engine.ts` (suppression),
`tests/core/brain-orchestrator/decision-engine.test.ts`.
`recommendation_delegated` suppresses like accepted/dismissed.

### Task 7: surfaces + migration
Files: `src/features/brain/api/{commands,command-actions}.ts`,
`src/features/brain/components/command-queue.tsx`, wire into
`brain-workspace.tsx`; Mission Control pending strip; recommendation cards
gain "Queue next action" / "Delegate…" (both create pending cards);
`supabase/migrations/20260720180000_command_mode_v1.sql` (+ MIGRATIONS.md,
`ArtifactKind` union + `email_draft`).

### Task 8: gates + merge
`npm run lint && npm run typecheck && npm test` green → merge to main →
push → CI green.

### Task 9: in-browser verification
Restart dev server (stale-Turbopack lesson), real data: command → pending
card → approve → history trace; Mission Control strip; failure path.

---
**READY?** Proceeding — the milestone prompt is the approved spec (autonomous session).
