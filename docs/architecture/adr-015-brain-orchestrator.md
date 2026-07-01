# ADR-015: TITAN Brain Orchestrator Architecture

- **Status:** Accepted
- **Date:** 2026-07-01
- **Deciders:** Robert O'Toole
- **Tags:** architecture, core, brain, orchestration, foundation
- **Supersedes:** —
- **Superseded by:** —

## Context

TITAN is becoming a platform of many specialised capabilities — the Experience
engines today; SEO, Google Ads, Meta, research, business intelligence, and a
business companion tomorrow; potentially hundreds of AI (and human) departments
over time. Something must decide, for every customer, **what should happen, in
what order, by whom, and to what standard** — and must do so in a way that still
works when there are hundreds of departments and millions of decisions.

This is one of the most important architectural components in TITAN. Getting its
shape right now — before any implementation — determines whether the platform can
scale coherently or collapses into a monolith.

## Decision

We introduce a new core module, **`src/core/brain-orchestrator`** — **interfaces
only** (no implementation, no AI, no LLM, no database, no network, no UI, no
business logic, no execution engine).

The Brain is modelled as the **CEO of TITAN**, with exactly four responsibilities
and no others:

1. **Observe** — collect information (departments, customers, platform/workflow
   state, business intelligence, health, events).
2. **Decide** — determine what happens, which department does it, order,
   dependencies, priorities, approvals, and success criteria.
3. **Delegate** — assign tasks to departments, track progress, collect outputs,
   handle failures, retry, and escalate.
4. **Learn** — capture outcomes, decisions, and results as memory references.

The contracts are: `BrainOrchestrator`, `BrainWorkflow`, `BrainExecutionPlan`,
`BrainTask`, `BrainDepartment`, `BrainDecision`, `BrainObservation`,
`BrainResult`, `BrainMemoryReference`, `BrainEvent`, `BrainNotification`,
`BrainStatus`, `BrainHealth`.

### Why orchestration exists

Without a coordinator, every capability must know about every other capability;
sequencing, dependencies, priorities, approvals, and failure-handling get
re-implemented everywhere; and adding a capability means editing the whole
system. A single, thin orchestration layer makes the platform coherent and lets
capabilities be added independently. Coordination is a distinct concern from
execution, and it deserves its own home.

### Why the Brain is intentionally lightweight

The Brain coordinates; it does not execute. It holds no business logic, no AI, no
tool-specific knowledge. This is a deliberate constraint, not an omission:

- A "worker" Brain that performed work would accumulate every capability's logic
  and become an unmaintainable monolith — the opposite of scalable.
- A lightweight Brain stays **understandable, testable, and replaceable**. It can
  be swapped for a smarter implementation without disturbing departments.
- Lightweight coordination is what allows scale to hundreds of departments,
  thousands of workflows, and millions of decisions **without changing the Brain
  architecture** — because the Brain's surface does not grow with the number of
  capabilities.

### Why departments remain independent

The `BrainDepartment` contract is the Brain's **only** execution surface. The
Brain knows *what* a department can do and its current state — never *how*.
Departments own their implementation and their dependencies. This independence
means:

- New departments (AI or human) plug in by implementing one contract and
  registering; the Brain is untouched.
- A department can be rewritten, versioned, or replaced without affecting the
  Brain or its peers.
- Specialist expertise stays where it belongs — in the department.

### Why dependency inversion was chosen

The Brain depends on **abstractions, never concrete implementations**. It is
wired with ports — a knowledge reader, a department registry, a memory store, and
(for departments' use) capability provider abstractions — all injected. It never
imports or constructs concrete modules, and it never calls the Experience engines
directly (a CEO does not operate the tools; departments do).

Dependency inversion is essential here because the Brain is the highest-level
policy in the system. If it depended on concrete lower-level modules, every change
below would ripple up into the most critical component. By depending on
abstractions, the Brain is insulated from implementation change, is trivially
testable with fakes, and remains replaceable — and lower modules can evolve
freely beneath stable contracts.

## Consequences

### Positive
- One coherent coordination layer; capabilities add independently.
- The Brain stays lightweight, testable, and replaceable.
- Scales to hundreds of departments and beyond with no change to the Brain.
- Departments remain autonomous and expert.
- Clean seams (ports) make future AI-assisted decisioning a drop-in.

### Negative / Trade-offs
- **Indirection.** Coordinating through abstractions and departments is less
  direct than calling a function; the payoff is decoupling and scale.
- **More contracts to maintain** than a monolithic approach.
- **v0.1 shapes are early** and will evolve as real coordination is built;
  changing a contract requires care and a new ADR.
- Interfaces without implementation are validated by type-checking and the first
  implementation, not yet at runtime.

### Neutral
- The coordination *logic*, AI decisioning, persistence of memory, execution, and
  how each department is built are all out of scope — each gets its own ADR.

## Alternatives Considered

- **A monolithic engine that performs the work itself** — simplest initially,
  but becomes an unscalable, untestable tangle as capabilities grow, and violates
  the separation between coordination and execution. Rejected.
- **No central coordinator; capabilities call each other directly** — spreads
  sequencing and dependency logic everywhere and couples every capability to
  every other. Rejected.
- **The Brain depends on concrete Core modules** — would couple the highest-level
  policy to lower-level implementations, so every change below ripples up.
  Rejected in favour of dependency inversion.
- **One module per contract** — over-fragmentation for a set of contracts that
  share one coherent purpose. Rejected; the module is internally organised by
  concern instead.

## Long-term consequences

This decision fixes the platform's spine: **coordination is separated from
execution, forever.** For as long as it holds, TITAN can add capabilities —
including AI departments, human departments, and automation engines — by adding
departments, never by rewriting the centre. The Brain can grow smarter (real
reasoning, better learning) behind stable contracts, and can be replaced wholesale
if a better coordinator emerges, without disturbing the departments that do the
work. The main risk to manage is contract drift: the Brain's contracts must be
evolved deliberately (via ADRs), because everything depends on their stability.

## References

- PRD-003 (Brain Orchestrator — product requirements).
- ADR-010/011 (Knowledge Kernel, Industry DNA), ADR-012/013/014 (Experience
  Engine, Pipeline, Strategy) — the capabilities the Brain coordinates.
- ADR-008 (boundary enforcement governing the `core` layer).
- `src/core/brain-orchestrator/` and its `README.md`.
