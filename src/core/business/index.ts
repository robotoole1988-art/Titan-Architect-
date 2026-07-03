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
  stageIndex,
  isStageAtLeast,
} from "./model";
export type {
  LifecycleStage,
  StageTransition,
  BusinessContact,
  BusinessDraft,
  Business,
} from "./model";

export { BusinessNotFoundError } from "./repository";
export type {
  BusinessRepository,
  ArtifactKind,
  ArtifactRecord,
  SaveArtifactInput,
  ArtifactRepository,
  BusinessSpineRepositories,
} from "./repository";

export { createMemoryBusinessSpine } from "./memory-repository";
export { createSupabaseBusinessSpine } from "./supabase-repository";
export type { SupabaseSpineConfig } from "./supabase-repository";

export {
  resolvePersistenceBackend,
  resolveBusinessSpine,
} from "./provider";
export type { PersistenceBackend } from "./provider";
