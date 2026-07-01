/**
 * Brain Orchestrator — the Department abstraction (interfaces only).
 *
 * A department is the Brain's ONLY execution surface. The Brain knows WHAT a
 * department can do and its current state — never HOW it does the work.
 * Departments own their implementation. This single abstraction is what lets the
 * platform scale to hundreds of departments **without changing the Brain**.
 */

import type {
  BrainExtensions,
  BrainHealth,
  BrainId,
  Iso8601,
  Priority,
  WorkStatus,
} from "./common";

/**
 * A capability a department provides. Deliberately an open string so the
 * platform scales to hundreds of departments without changing the Brain.
 * Today's well-known capabilities (see `WELL_KNOWN_CAPABILITIES`) map to the
 * existing Core modules and future engines.
 */
export type DepartmentCapability = string;

/** Well-known capabilities today. Descriptive only — new ones need no change. */
export const WELL_KNOWN_CAPABILITIES: ReadonlyArray<DepartmentCapability> = [
  "experience-generation",
  "experience-strategy",
  "website",
  "seo",
  "google-ads",
  "meta-ads",
  "local-services-ads",
  "research",
  "business-intelligence",
  "business-companion",
];

/** Who a department is, and which contract version it speaks. */
export interface DepartmentIdentity {
  id: BrainId;
  name: string;
  description?: string;
  version: string;
  extensions?: BrainExtensions;
}

/** An abstract description of an input or output a task expects/produces. */
export interface TaskContract {
  name: string;
  description?: string;
  required?: boolean;
  extensions?: BrainExtensions;
}

/** A task type a department supports, with its input/output contracts. */
export interface SupportedTask {
  type: string;
  description?: string;
  inputs?: ReadonlyArray<TaskContract>;
  outputs?: ReadonlyArray<TaskContract>;
  extensions?: BrainExtensions;
}

/** A dependency one department has on another (by capability or id). */
export interface DepartmentDependency {
  capability?: DepartmentCapability;
  departmentId?: BrainId;
  description?: string;
  extensions?: BrainExtensions;
}

/** Abstract execution characteristics the Brain uses for planning. */
export interface ExecutionMetadata {
  /** Typical duration of this department's work, for scheduling estimates. */
  averageDurationMs?: number;
  /** How many tasks it can run at once. */
  concurrency?: number;
  extensions?: BrainExtensions;
}

/** A live status snapshot the Brain observes for a department. */
export interface BrainDepartmentStatus {
  departmentId: BrainId;
  activity: "idle" | "busy" | WorkStatus;
  health: BrainHealth;
  /** Estimated completion of current work, if any. */
  estimatedCompletion?: Iso8601;
  activeTasks?: number;
  observedAt: Iso8601;
  extensions?: BrainExtensions;
}

/**
 * A department the Brain delegates to.
 *
 * The static contract (identity, capabilities, supported tasks, dependencies,
 * priority, execution metadata) describes what it can do. The live methods let
 * the Brain observe its status/health and delegate a task. The Brain calls
 * `execute`; the department owns HOW — the Brain never performs the work.
 */
export interface BrainDepartment {
  readonly identity: DepartmentIdentity;
  readonly capabilities: ReadonlyArray<DepartmentCapability>;
  readonly supportedTasks: ReadonlyArray<SupportedTask>;
  readonly dependencies: ReadonlyArray<DepartmentDependency>;
  readonly priority: Priority;
  readonly executionMetadata?: ExecutionMetadata;

  /** Observe the department's current status. */
  getStatus(): Promise<BrainDepartmentStatus>;
  /** Observe the department's health. */
  getHealth(): Promise<BrainHealth>;
}

/**
 * The set of departments available to the Brain. Delegation and scaling happen
 * through this registry: adding a department registers a new implementation —
 * the Brain's contracts do not change.
 */
export interface BrainDepartmentRegistry {
  all(): ReadonlyArray<BrainDepartment>;
  get(departmentId: BrainId): BrainDepartment | undefined;
  findByCapability(
    capability: DepartmentCapability,
  ): ReadonlyArray<BrainDepartment>;
}
