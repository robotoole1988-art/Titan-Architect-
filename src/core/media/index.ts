/**
 * core/media — public API (ADR-033). Multi-modal generation seam (image
 * now, video next), UK-authenticity prompt law, media plan derivation,
 * storage seam, and the founder-gated generation workflow.
 */

export type {
  GeneratedMedia,
  MediaGenerationProvider,
  MediaGenerationRequest,
  MediaModality,
  MediaProvenance,
  MediaRecord,
  MediaRecordDraft,
  MediaRepository,
  MediaReviewStatus,
} from "./model";
export { buildMediaPrompt, buildPairPrompts, seedFrom } from "./prompt";
export {
  createReplicateProvider,
  estimateGenerationCostUsd,
  resolveMediaProvider,
} from "./replicate";
export { deriveMediaPlan } from "./plan";
export type { MediaPlanItem } from "./plan";
export {
  createLocalDiskStorage,
  createSupabaseStorage,
  generateMissingMedia,
} from "./generate";
export type { GenerateMediaSummary, MediaStorage } from "./generate";
