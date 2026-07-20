/**
 * Mission Control — public API (ADR-042).
 *
 * The Brain's first surface: a deterministic daily briefing built from a plain
 * snapshot of existing internal data (CRM + first-party measurement). The
 * engine is pure; the data seam that fills the snapshot lives in the feature
 * and is the piece the memory spine will re-point later. This is the ONLY
 * surface other layers may import from.
 */

export { buildBriefing } from "./briefing";
export type { BuildBriefingOptions } from "./briefing";
export { projectMissionControlData } from "./project";
export { DEFAULT_THRESHOLDS } from "./config";
export type { MissionControlThresholds, MissionControlWeights } from "./config";
export type {
  AccountSummary,
  Briefing,
  BuildFlag,
  BuildQueueSection,
  EnquiryAttention,
  MissionControlData,
  PipelineItem,
  PipelineSection,
  PipelineStageCount,
  StalledBuildItem,
  TopAction,
  TopActionKind,
} from "./model";
