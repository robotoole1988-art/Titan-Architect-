/**
 * Website Blueprint — shared primitives (interfaces only).
 *
 * No implementation, no rendering, no HTML/CSS/React/Tailwind, no media, no AI,
 * no database, no business logic. The Blueprint is the architect's drawing: it
 * describes WHAT to build and WHY — never HOW, and never for a specific platform.
 *
 * Explainability is built in from day one: every significant blueprint element
 * carries a confidence score, a reasoning reference, and source references, so
 * the Brain can eventually explain why each element exists.
 */

export type BlueprintExtensions = Record<string, unknown>;

/** Opaque identifier for any blueprint element. */
export type BlueprintId = string;

/** 0..1 confidence (rendered as a percentage in tools, e.g. 0.97 → 97%). */
export type ConfidenceScore = number;

/** Where a blueprint element was derived from — for explainability. */
export interface SourceReference {
  /** e.g. "industry-dna", "experience-strategy", "competitor-analysis". */
  source: string;
  detail?: string;
  /** Optional pointer into the Brain's memory. */
  memoryRef?: string;
}

/** Confidence + reasoning attached to a blueprint element. */
export interface BlueprintConfidence {
  score: ConfidenceScore;
  /** A short reference/summary of the reasoning — not the reasoning itself. */
  reasoningRef?: string;
  /** What this element was derived from. */
  sources?: ReadonlyArray<SourceReference>;
}

/**
 * The base every significant blueprint element extends. Carries an id, its
 * explainability (required), and an open extension bag. Making `confidence`
 * required bakes explainability into the architecture from day one.
 */
export interface BlueprintElement {
  id: BlueprintId;
  confidence: BlueprintConfidence;
  extensions?: BlueprintExtensions;
}

/** Priority a page/section carries. */
export type BlueprintPriority = "low" | "medium" | "high" | "critical";

/** The emotion a section aims to evoke (open — e.g. "trust", "relief"). */
export type UserEmotion = string;

/** Device targets, mobile-first by default. */
export type DeviceTarget = "mobile" | "tablet" | "desktop";
