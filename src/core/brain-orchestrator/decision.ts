/**
 * Brain Orchestrator — observe & decide contracts (interfaces only).
 *
 * These describe how the Brain collects information (observations), what it
 * decides, and the plan/tasks/results that flow from a decision. No execution.
 */

import type { IndustryDna } from "@/core/industry-dna";
import type {
  BrainExtensions,
  BrainId,
  BrainMemoryReference,
  Iso8601,
  Priority,
  WorkStatus,
} from "./common";
import type { DepartmentCapability } from "./department";

/** Context that frames the Brain's coordination for a customer/goal. */
export interface BrainContext {
  /** The customer/business the coordination concerns. */
  customerId?: BrainId;
  /** The resolved business knowledge, if loaded (read via the knowledge port). */
  businessDna?: IndustryDna;
  /** Business objectives guiding decisions. */
  objectives?: ReadonlyArray<string>;
  extensions?: BrainExtensions;
}

/** What the Brain looks at when observing. */
export interface BrainObservationInput {
  /** Events to consider. */
  events?: ReadonlyArray<BrainId>;
  /** Named sources to observe (e.g. "departments", "business-intelligence"). */
  sources?: ReadonlyArray<string>;
  extensions?: BrainExtensions;
}

/** A single piece of information the Brain has gathered (Observe). */
export interface BrainObservation {
  id: BrainId;
  /** Where it came from, e.g. "department", "business-intelligence", "event". */
  source: string;
  observedAt: Iso8601;
  summary?: string;
  data?: Readonly<Record<string, unknown>>;
  /** The event that prompted it, if any. */
  relatedEvent?: BrainId;
  extensions?: BrainExtensions;
}

/** A single unit of work the Brain delegates to a department. */
export interface BrainTask {
  id: BrainId;
  /** Task type (must match a department's `SupportedTask.type`). */
  type: string;
  /** The capability required to perform it. */
  capability: DepartmentCapability;
  /** The department chosen to perform it (assigned during planning). */
  assignedDepartmentId?: BrainId;
  input?: Readonly<Record<string, unknown>>;
  priority: Priority;
  /** Tasks that must complete before this one. */
  dependsOn?: ReadonlyArray<BrainId>;
  /** Whether human/founder approval is required before execution. */
  requiresApproval?: boolean;
  /** How success is judged. */
  successCriteria?: ReadonlyArray<string>;
  status: WorkStatus;
  extensions?: BrainExtensions;
}

/** An ordered plan of tasks the Brain will delegate. */
export interface BrainExecutionPlan {
  id: BrainId;
  workflowId?: BrainId;
  objective: string;
  tasks: ReadonlyArray<BrainTask>;
  createdAt: Iso8601;
  extensions?: BrainExtensions;
}

/** A decision the Brain makes (Decide): what happens, and the plan for it. */
export interface BrainDecision {
  id: BrainId;
  decidedAt: Iso8601;
  summary: string;
  /** The observations that informed it (ids). */
  basedOn?: ReadonlyArray<BrainId>;
  /** The plan produced, if the decision is to act. */
  plan?: BrainExecutionPlan;
  /** Whether the decision needs approval before acting. */
  requiresApproval?: boolean;
  rationale?: string;
  extensions?: BrainExtensions;
}

/** The outcome of a task, collected by the Brain from a department. */
export interface BrainResult {
  taskId: BrainId;
  departmentId: BrainId;
  status: WorkStatus;
  output?: Readonly<Record<string, unknown>>;
  /** Present when the task failed. */
  error?: string;
  /** Whether a retry is advisable. */
  retryable?: boolean;
  completedAt?: Iso8601;
  /** Reference to what the Brain recorded about this result. */
  memory?: BrainMemoryReference;
  extensions?: BrainExtensions;
}
