/**
 * Business Health Engine v1 (ADR-051) — public API.
 *
 * Deterministic department health over the memory spine: inspectable
 * formulas, honest not-scoreable states, trend from learning-feed
 * snapshots, ADR-015's BrainHealth implemented. No LLM in the scoring path.
 */

export {
  BAND_AMBER_AT,
  BAND_GREEN_AT,
  bandFor,
  brainHealthLevelFor,
} from "./model";
export type {
  DepartmentHealth,
  DepartmentId,
  HealthBand,
  HealthConfidence,
  HealthEngineInput,
  HealthFactor,
  HealthTrend,
  ScoreableHealth,
  UnscoreableHealth,
} from "./model";
export {
  buildHealthSnapshotObservations,
  computeDepartmentHealth,
} from "./score";
