# PRD-003: TITAN Brain Orchestrator

- **Status:** Draft
- **Date:** 2026-07-01
- **Author:** Robert O'Toole
- **Related:** ADR-015 (architecture), ADR-010 (Knowledge Kernel), ADR-011 (Industry DNA), ADR-012/013/014 (Experience Engine, Pipeline, Strategy)

## 1. Summary

The **TITAN Brain Orchestrator** is the central intelligence that coordinates the
entire TITAN platform. It is the **CEO of TITAN**: it observes, decides,
delegates, monitors, and learns — but it never performs the work itself.
**Departments execute; the Brain coordinates.**

This PRD defines the product. **v0.1 is architecture and interfaces only** — no
AI, no LLM, no database, no network, no UI, no execution.

## 2. Why the Brain exists

As TITAN grows, it will contain many specialised capabilities — website
generation, SEO, Google Ads, Meta, research, business intelligence, a business
companion, and, in time, dozens or hundreds more. Something has to decide **what
should happen for each customer, in what order, by whom, and to what standard.**

Without a coordinator, every capability would have to know about every other
capability, sequencing and dependencies would be duplicated everywhere, and
adding a new capability would mean touching the whole system. The Brain exists to
be the single, thin coordination layer that makes the platform coherent and lets
it scale.

## 3. The problems it solves

- **Coordination.** One place decides what happens next for each customer.
- **Delegation.** Work is routed to the right department, in the right order,
  with the right dependencies and priorities.
- **Oversight.** Progress is monitored, outputs collected, failures handled,
  and escalations raised.
- **Consistency.** Success criteria and approvals are applied uniformly.
- **Scale.** New capabilities plug in as departments without rewiring the system.
- **Learning.** Outcomes and decisions are captured so the platform improves.

## 4. Why it behaves like a CEO, not a worker

A CEO of a world-class company does not personally build the website, run the ad
campaigns, or write the SEO content. A CEO **understands the business, decides
what matters, delegates to the right people, monitors progress, reads the
reports, measures outcomes, and decides what happens next.**

The Brain is built to behave **exactly** like this:

- It **knows who** should do the work, **when**, **why**, and **how success is
  measured**.
- It does **not** know how each department performs its specialist work.

This is deliberate. A "worker" Brain that tried to do everything would become a
monolith — impossible to scale, test, or replace. A "CEO" Brain stays
**lightweight, replaceable, and scalable**, while departments stay autonomous and
expert.

## 5. How departments interact

Every department exposes a uniform contract the Brain understands:

- **Identity** (id, name, version)
- **Capabilities** and **Supported Tasks** (with input/output contracts)
- **Dependencies** on other departments
- **Priority**, **Execution Metadata**
- **Current Status**, **Health**, **Estimated Completion**

The Brain reads these to decide and delegate; it calls a department to execute a
task and collects the result. **The department owns the how.** Adding a
department is registering a new implementation of the same contract — the Brain
does not change.

## 6. How workflows operate

A **workflow** is a named, ordered description of how the Brain coordinates a
goal. The canonical example is customer onboarding:

```
Customer Created
  → Load Industry DNA
  → Load Knowledge Kernel
  → Determine Business Objectives
  → Create Execution Plan
  → Assign Website Department
  → Assign Experience Department
  → Assign SEO Department
  → Assign Google Ads Department
  → Assign Research Department
  → Assign Business Companion
  → Monitor Progress
  → Collect Outputs
  → Complete Workflow
```

The Brain turns a workflow into an **execution plan** of tasks (each with a
capability, dependencies, priority, approval requirement, and success criteria),
delegates the tasks to departments, monitors them, collects outputs, and
completes. The workflow is a *description* of coordination — **not** an execution
engine.

## 7. How future AI Departments plug in

A new AI department — say, an "Email Marketing Department" — plugs in by
implementing the `BrainDepartment` contract: declaring its identity,
capabilities, supported tasks, and dependencies, and exposing status/health. It
registers with the Brain's department registry and immediately becomes available
for the Brain to observe, decide about, and delegate to.

**No change to the Brain is required** — not to its contracts, not to its
responsibilities. This is how the platform scales to hundreds of departments.

## 8. Future evolution

- **Real coordination logic** behind the interfaces (still no execution — the
  Brain decides and delegates; departments do the work).
- **AI-assisted decisioning** — the Brain's `decide` step gains genuine
  reasoning, injected via the same abstractions.
- **Human departments** alongside AI ones, using the identical contract.
- **Richer memory and learning**, feeding better future decisions.
- **Automation engines** as departments the Brain coordinates.

Each is additive and gets its own ADR; none require changing the Brain's shape.

## 9. Success metrics (future, once implemented)

- Coordination correctness: work happens in the right order, by the right
  department, to the defined success criteria.
- Time to add a new department (should be low and Brain-independent).
- Reliability: failures handled, retries and escalations working.
- Customer outcomes improved by better coordination and learning.

## 10. References

- ADR-015 (Brain Orchestrator architecture)
- `src/core/brain-orchestrator/` and its `README.md`
- Founder Manifesto and Product Vision (the CEO philosophy and the destination)
