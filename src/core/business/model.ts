/**
 * The Business record — the spine of the platform (ADR-023).
 *
 * One entity, one lifecycle. The future CRM's three levels (Lead → Build →
 * Account) are views of this record moving through its stages. Business
 * Intake creates it; strategies, blueprints, and (later) websites and
 * marketing all hang off it.
 */

/**
 * The full lifecycle — a superset of the founder's CRM stages. UIs may show
 * subsets; the record always carries the precise stage.
 */
export const LIFECYCLE_STAGES = [
  "lead",
  "qualified",
  "proposed",
  "won",
  "building",
  "review",
  "live",
  "account",
] as const;

export type LifecycleStage = (typeof LIFECYCLE_STAGES)[number];

/** Position of a stage in the lifecycle (0-based). */
export function stageIndex(stage: LifecycleStage): number {
  return LIFECYCLE_STAGES.indexOf(stage);
}

/** Has `stage` reached (or passed) `threshold`? */
export function isStageAtLeast(
  stage: LifecycleStage,
  threshold: LifecycleStage,
): boolean {
  return stageIndex(stage) >= stageIndex(threshold);
}

/** One recorded lifecycle transition. */
export interface StageTransition {
  stage: LifecycleStage;
  /** ISO-8601 timestamp. */
  enteredAt: string;
}

export interface BusinessContact {
  email?: string;
  phone?: string;
}

/** What Business Intake captures — everything the system needs to begin. */
export interface BusinessDraft {
  name: string;
  trade: string;
  location: string;
  contact?: BusinessContact;
  services?: string;
  targetCustomer?: string;
  goal?: string;
  budget?: string;
  urgency?: string;
  currentWebsiteUrl?: string;
}

/** The stored Business record. */
export interface Business extends BusinessDraft {
  id: string;
  stage: LifecycleStage;
  /** Every transition, oldest first; index 0 is creation as a lead. */
  stageHistory: ReadonlyArray<StageTransition>;
  /** ISO-8601 timestamps. System-managed. */
  createdAt: string;
  updatedAt: string;
}
