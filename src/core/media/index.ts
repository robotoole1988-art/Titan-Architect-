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
  VideoModelKey,
  VideoModelSpec,
} from "./model";
export {
  VIDEO_MODELS,
  estimateGenerationCostUsd,
  videoModelCostUsd,
} from "./model";
export {
  buildFilmPrompt,
  buildMediaPrompt,
  buildMorphFilmPrompt,
  buildPairPrompts,
  seedFrom,
} from "./prompt";
export { commissionFilm, commissionMorphFilm } from "./commission";
export type { FilmCommission, MorphFilmCommission } from "./commission";
export { createReplicateProvider } from "./replicate";
export { createFalProvider } from "./fal";
export {
  availableVideoModels,
  createCompositeProvider,
  resolveMediaProvider,
} from "./provider";
export { deriveMediaPlan } from "./plan";
export type { MediaPlanItem } from "./plan";
export {
  createLocalDiskStorage,
  createSupabaseStorage,
  generateMissingMedia,
} from "./generate";
export type { GenerateMediaSummary, MediaStorage } from "./generate";
export { createLqip } from "./lqip";
