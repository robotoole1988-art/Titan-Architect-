/**
 * Brain Orchestrator — the orchestrator contract (interfaces only).
 *
 * The TITAN Brain is the CEO of the platform. It has exactly four
 * responsibilities — **Observe, Decide, Delegate, Learn** — and it never
 * performs the work itself. Departments execute; the Brain coordinates.
 *
 * Every method is a coordination contract. There is no implementation, no AI,
 * no LLM, no database, no network, and no execution engine here.
 */

import type {
  BrainHealth,
  BrainId,
  BrainMemoryReference,
  Iso8601,
} from "./common";
import type {
  BrainContext,
  BrainDecision,
  BrainExecutionPlan,
  BrainObservation,
  BrainObservationInput,
  BrainResult,
} from "./decision";
import type { BrainWorkflow } from "./workflow";
import type { BrainDependencies } from "./dependencies";

/** The version of the Brain Orchestrator contract these interfaces implement. */
export const BRAIN_ORCHESTRATOR_VERSION = "0.1";

/** A status snapshot of the Brain itself. */
export interface BrainStatus {
  phase: "idle" | "observing" | "deciding" | "delegating" | "learning";
  activeWorkflows: number;
  activePlans: number;
  observedAt: Iso8601;
}

/**
 * The TITAN Brain Orchestrator.
 *
 * Responsibilities (and only these):
 * 1. **Observe** — collect information about departments, customers, platform,
 *    workflows, intelligence, health, and events.
 * 2. **Decide** — determine what needs to happen, which department should do it,
 *    order, dependencies, priorities, approvals, and success criteria.
 * 3. **Delegate** — assign tasks to departments, track progress, collect
 *    outputs, handle failures, retry where appropriate, escalate when required.
 * 4. **Learn** — capture outcomes, decisions and results as memory references.
 */
export interface BrainOrchestrator {
  /** 1. Observe — gather information into observations. */
  observe(
    input: BrainObservationInput,
  ): Promise<ReadonlyArray<BrainObservation>>;

  /** 2. Decide — turn observations into a decision (optionally a plan). */
  decide(
    observations: ReadonlyArray<BrainObservation>,
    context: BrainContext,
  ): Promise<BrainDecision>;

  /** Plan a workflow into an ordered execution plan (choose departments). */
  plan(
    workflow: BrainWorkflow,
    context: BrainContext,
  ): Promise<BrainExecutionPlan>;

  /**
   * 3. Delegate — assign the plan's tasks to departments and collect results.
   * The Brain coordinates and monitors; departments perform the work.
   */
  delegate(plan: BrainExecutionPlan): Promise<ReadonlyArray<BrainResult>>;

  /** 4. Learn — record outcomes and decisions, returning memory references. */
  learn(
    results: ReadonlyArray<BrainResult>,
  ): Promise<ReadonlyArray<BrainMemoryReference>>;

  /** Report the Brain's own status. */
  getStatus(): Promise<BrainStatus>;
  /** Report the Brain's own health. */
  getHealth(): Promise<BrainHealth>;
}

/** Reference to a department by id, used across coordination contracts. */
export type BrainDepartmentRef = BrainId;

/**
 * Builds an orchestrator from its injected abstractions — the composition point
 * for dependency inversion. Concrete dependencies (a real knowledge reader,
 * department registry, and memory store) are provided here; the Brain's
 * contracts never reference them directly.
 */
export type BrainOrchestratorFactory = (
  dependencies: BrainDependencies,
) => BrainOrchestrator;

/** Resolves the active orchestrator — swappable, so the Brain stays replaceable. */
export type BrainOrchestratorProvider = () => BrainOrchestrator;
