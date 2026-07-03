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

export type ProgressStage = (typeof LIFECYCLE_STAGES)[number];

/**
 * Lost states (ADR-024): off the progression ladder, terminal but always
 * reopenable — a lost business can be moved back to any pipeline stage.
 */
export const LOST_STAGES = ["not_interested", "not_going_ahead"] as const;

export type LostStage = (typeof LOST_STAGES)[number];

/** Every state a Business can be in: the ladder plus the lost states. */
export const ALL_LIFECYCLE_STATES = [...LIFECYCLE_STAGES, ...LOST_STAGES] as const;

export type LifecycleStage = (typeof ALL_LIFECYCLE_STATES)[number];

export function isLostStage(stage: LifecycleStage): stage is LostStage {
  return (LOST_STAGES as readonly string[]).includes(stage);
}

/** Position of a stage on the progression ladder (-1 for lost states). */
export function stageIndex(stage: LifecycleStage): number {
  return (LIFECYCLE_STAGES as readonly string[]).indexOf(stage);
}

/** Has `stage` reached (or passed) `threshold`? Lost states never have. */
export function isStageAtLeast(
  stage: LifecycleStage,
  threshold: LifecycleStage,
): boolean {
  const index = stageIndex(stage);
  return index !== -1 && index >= stageIndex(threshold);
}

/** Human label ("not_interested" → "not interested"). */
export function stageLabel(stage: LifecycleStage): string {
  return stage.replaceAll("_", " ");
}

/** One recorded lifecycle transition. */
export interface StageTransition {
  stage: LifecycleStage;
  /** ISO-8601 timestamp. */
  enteredAt: string;
  /** Optional context — e.g. why a business was lost. */
  reason?: string;
}

export interface BusinessContact {
  email?: string;
  phone?: string;
}

/** What Business Intake captures — everything the system needs to begin. */
export interface BusinessDraft {
  name: string;
  /** Display label (canonical taxonomy label when tradeId is set). */
  trade: string;
  /**
   * Canonical trade-taxonomy id (ADR-026). Absent on legacy/free-text
   * records — UIs flag those unclassified.
   */
  tradeId?: string;
  location: string;
  /**
   * Coverage areas — towns/localities the business serves (ADR-028). Each
   * becomes a unique area landing page in the generated site.
   */
  coverageAreas?: ReadonlyArray<string>;
  contact?: BusinessContact;
  /** Where enquiry notifications go (ADR-030); contact email is the fallback. */
  ownerEmail?: string;
  /** Optional per-site GA4 hook (ADR-030) — absent by default, no script. */
  ga4MeasurementId?: string;
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
