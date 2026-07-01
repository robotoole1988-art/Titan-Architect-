/**
 * Experience Pipeline — shared primitives (interfaces only).
 *
 * No implementation, no data, no AI, no database, no UI. Defines the generic,
 * independently-replaceable stage contract and the four aspects every stage
 * exposes: Input, Output, Validation, and Metadata.
 */

export type PipelineExtensions = Record<string, unknown>;

/** Stable identity of each pipeline stage (also encodes order in the pipeline). */
export type StageId =
  | "business-intake"
  | "industry-dna-resolution"
  | "location-intelligence"
  | "brand-strategy"
  | "competitor-analysis"
  | "customer-psychology"
  | "experience-brief"
  | "website-structure"
  | "media-strategy"
  | "animation-strategy"
  | "seo-strategy"
  | "conversion-strategy"
  | "final-experience-blueprint";

/** Base for every stage Input/Output payload — carries an open extension bag. */
export interface StagePayload {
  extensions?: PipelineExtensions;
}

/** The Metadata aspect: describes a stage and its replaceable contract version. */
export interface StageMetadata {
  id: StageId;
  /** 1-based position in the pipeline. */
  order: number;
  name: string;
  description?: string;
  /** Contract version — lets a stage be replaced safely. */
  version: string;
  extensions?: PipelineExtensions;
}

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  message: string;
  severity: ValidationSeverity;
  /** Optional path into the input the issue concerns. */
  path?: string;
}

/** The Validation aspect: the result of validating a stage's input. */
export interface ValidationResult {
  valid: boolean;
  issues: ReadonlyArray<ValidationIssue>;
}

/** Shared, non-AI context threaded through a pipeline run. */
export interface PipelineContext {
  /** Correlates all stages in one run. */
  runId: string;
  /** ISO-8601 start time of the run. */
  startedAt?: string;
  extensions?: PipelineExtensions;
}

/**
 * A single, **independently replaceable** pipeline stage.
 *
 * Any implementation with the same `TInput`/`TOutput` conforms to this contract
 * and can be swapped in without touching the rest of the pipeline. It exposes
 * the four required aspects:
 * - **Input**  — `TInput`
 * - **Output** — `TOutput`
 * - **Validation** — `validate(input)`
 * - **Metadata** — `metadata`
 *
 * `execute` is Promise-returning so a future implementation can be async.
 */
export interface PipelineStage<TInput extends StagePayload, TOutput extends StagePayload> {
  readonly metadata: StageMetadata;
  validate(input: TInput): ValidationResult;
  execute(input: TInput, context: PipelineContext): Promise<TOutput>;
}
