/**
 * Brain Orchestrator — shared primitives (interfaces only).
 *
 * No implementation, no AI, no LLM calls, no database, no network, no UI, no
 * execution engine. These are the small building blocks every Brain contract
 * shares. The Brain describes coordination; it never performs work.
 */

/** Open bag for future, unmodelled attributes on any Brain structure. */
export type BrainExtensions = Record<string, unknown>;

/** Opaque identifier for any Brain entity (task, workflow, department, …). */
export type BrainId = string;

/** ISO-8601 timestamp. */
export type Iso8601 = string;

/** Relative importance the Brain assigns to work. */
export type Priority = "low" | "normal" | "high" | "critical";

/** The lifecycle state of a unit of work. */
export type WorkStatus =
  | "pending"
  | "in-progress"
  | "blocked"
  | "succeeded"
  | "failed"
  | "cancelled";

/** A coarse health signal the Brain observes. */
export type HealthLevel = "healthy" | "degraded" | "unhealthy" | "unknown";

/** A health snapshot. */
export interface BrainHealth {
  level: HealthLevel;
  detail?: string;
  checkedAt?: Iso8601;
  extensions?: BrainExtensions;
}

/**
 * A pointer to something in the Brain's memory — not the memory itself.
 * The Brain records outcomes and learning as references; storage lives behind
 * the memory port (see `dependencies.ts`), never in these contracts.
 */
export interface BrainMemoryReference {
  id: BrainId;
  /** e.g. "decision" | "outcome" | "learning". */
  kind: string;
  summary?: string;
  createdAt?: Iso8601;
  extensions?: BrainExtensions;
}

/** Something that happened that the Brain may observe. */
export interface BrainEvent {
  id: BrainId;
  /** e.g. "customer.created", "task.completed", "department.degraded". */
  type: string;
  occurredAt: Iso8601;
  payload?: Readonly<Record<string, unknown>>;
  extensions?: BrainExtensions;
}

/** A message the Brain emits. Describing it, not delivering it. */
export interface BrainNotification {
  id: BrainId;
  level: "info" | "action-required" | "warning" | "critical";
  message: string;
  createdAt?: Iso8601;
  /** What this notification concerns (a task, workflow, or department id). */
  subjectId?: BrainId;
  extensions?: BrainExtensions;
}
