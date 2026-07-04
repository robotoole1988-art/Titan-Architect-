/**
 * TITAN Business Spine — public API (ADR-023).
 *
 * The Business record (one entity, one lifecycle: lead → … → account), its
 * versioned pipeline artifacts, and the repository abstractions features
 * consume — never a database client directly. Adapters: in-memory (zero-setup
 * default) and Supabase (durable, server-env-activated).
 *
 * This is the ONLY surface other modules may import from.
 */

export {
  LIFECYCLE_STAGES,
  LOST_STAGES,
  ALL_LIFECYCLE_STATES,
  stageIndex,
  isStageAtLeast,
  isLostStage,
  stageLabel,
} from "./model";
export type {
  ProgressStage,
  LostStage,
  LifecycleStage,
  StageTransition,
  BusinessContact,
  BusinessDraft,
  Business,
} from "./model";

export {
  BUILD_ITEM_KINDS,
  BUILD_ITEM_STATUSES,
  BuildTransitionError,
  assertBuildItemTransition,
  buildItemLabel,
  isManualBuildKind,
} from "./build-model";
export type { BuildItemKind, BuildItemStatus } from "./build-model";

export { BusinessNotFoundError } from "./repository";
export type {
  BusinessRepository,
  ArtifactKind,
  ArtifactRecord,
  SaveArtifactInput,
  ArtifactRepository,
  ActivityKind,
  ActivityEntry,
  LogActivityInput,
  ActivityRepository,
  BuildItem,
  Build,
  BuildRepository,
  BusinessSpineRepositories,
} from "./repository";

export type {
  PublicationStatus,
  Publication,
  PublicationRepository,
  Enquiry,
  EnquiryDraft,
  EnquiryRepository,
  EnquiryStatus,
  MetricEventKind,
  MetricsRepository,
  SiteMetricRow,
  MediaModality,
  MediaProvenance,
  MediaRecord,
  MediaRecordDraft,
  MediaRepository,
  MediaReviewStatus,
} from "./repository";
export { ENQUIRY_STATUSES } from "./repository";

export {
  transitionBusinessStage,
  recordArtifactGenerated,
  publishWebsite,
  unpublishWebsite,
  uniqueSlugFor,
  processEnquiry,
  markEnquiryStatus,
  responseTimeMs,
  averageResponseTimeMs,
  formatResponseTime,
} from "./workflows";
export type { EnquiryInput, EnquiryOutcome } from "./workflows";

export { createMemoryBusinessSpine } from "./memory-repository";
export { createSupabaseBusinessSpine } from "./supabase-repository";
export type { SupabaseSpineConfig } from "./supabase-repository";

export {
  resolvePersistenceBackend,
  resolveBusinessSpine,
} from "./provider";
export type { PersistenceBackend } from "./provider";
