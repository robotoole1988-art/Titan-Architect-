# Brain Orchestrator (`core/brain-orchestrator`)

The **TITAN Brain** — the central intelligence that coordinates the entire
platform. Think of it as the **CEO of TITAN**.

> **Status: v0.1 — interfaces only.** No implementation, no AI, no LLM, no
> database, no network, no UI, no business logic, no execution engine. This
> module describes **architecture only**.

## The CEO principle

A CEO does not personally build websites, run ads, or perform SEO. A CEO
understands the business, makes decisions, delegates, monitors progress,
receives reports, measures outcomes, and decides what happens next.

**The Brain behaves exactly like this.** It coordinates; **departments execute.**
This separation is a core TITAN architectural principle.

## Four responsibilities (and only these)

1. **Observe** — monitor departments, customers, platform/workflow state,
   business intelligence, system health, and events.
2. **Decide** — determine what must happen, which department does it, order,
   dependencies, priorities, approvals, and success criteria.
3. **Delegate** — assign tasks to departments, track progress, collect outputs,
   handle failures, retry, and escalate.
4. **Learn** — capture outcomes, decisions, and results as memory references.

## Departments — the only execution surface

The Brain delegates through the `BrainDepartment` abstraction. It knows **what**
a department can do and its current state — never **how**. Adding a department
registers a new implementation; **the Brain never changes.** This is what lets
the platform scale to hundreds of departments, thousands of workflows, and
millions of decisions without touching the Brain.

## Dependency inversion

The Brain depends on **abstractions, never concrete implementations**
(`dependencies.ts`):

- `knowledge: KnowledgeReader` — reads platform knowledge (Knowledge Kernel).
- `departments: BrainDepartmentRegistry` — the delegation surface.
- `memory: BrainMemory` — where learning is recorded.
- `capabilities?` — abstractions of the existing engines (Experience Engine /
  Pipeline / Strategy), **consumed by departments, never invoked by the Brain.**

The Brain reads Industry DNA (via the knowledge port) to understand a business,
and coordinates the Experience engines **through departments** — it never calls
them directly. A CEO does not operate the tools.

## Contracts

`BrainOrchestrator` · `BrainWorkflow` · `BrainExecutionPlan` · `BrainTask` ·
`BrainDepartment` · `BrainDecision` · `BrainObservation` · `BrainResult` ·
`BrainMemoryReference` · `BrainEvent` · `BrainNotification` · `BrainStatus` ·
`BrainHealth`.

## Structure

```
brain-orchestrator/
├── index.ts          # public API (type-only + version/capabilities consts)
├── common.ts         # ids, priority/status/health, memory ref, event, notification
├── department.ts     # BrainDepartment + registry (the execution abstraction)
├── decision.ts       # observations, tasks, execution plan, decision, result
├── workflow.ts       # BrainWorkflow (coordination templates)
├── dependencies.ts   # dependency inversion — ports + injected abstractions
└── orchestrator.ts   # BrainOrchestrator (observe/decide/delegate/learn)
```

## Guardrails — the execution constitution

The Brain acts only inside guardrail tiers (ADR-052). Every executable
action declares one:

- **`auto` (low risk)** — may run without a founder click. *No action holds
  this tier today.* The machinery exists (`core/command-mode`), but
  classification into it is a **founder decision recorded in the learning
  feed** (`tier_promoted`, `source: "founder"`) — never a code default.
- **`recommend_first` (medium risk)** — the Brain may propose it
  proactively; it runs only after founder approval.
- **`approval_required` (high risk)** — only the founder initiates it, and
  it still requires explicit approval.

Corollaries: every execution is previewed exactly before approval, verified
after running, fully traced (who approved, when, what ran, what changed,
revert info), and remembered in the learning feed. Failures are reported
honestly and never silently retried. Customer-visible actions, spending,
and deletion are excluded from the catalogue by constitution.

See `docs/prd/prd-003-brain-orchestrator.md`,
`docs/architecture/adr-015-brain-orchestrator.md`, and
`docs/architecture/adr-052-command-mode.md`.
