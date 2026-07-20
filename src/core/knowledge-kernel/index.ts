/**
 * TITAN Knowledge Kernel — public API.
 *
 * The ADR-010 contracts, and — since ADR-046 — their real implementation:
 * `createKnowledgeKernel` over a store seam (memory here, Supabase behind
 * `resolveKnowledgeKernel`). This is the ONLY surface other modules may
 * import from.
 *
 * See docs/architecture/adr-010-knowledge-kernel.md and adr-046-memory-spine.md.
 */

export type {
  KnowledgeId,
  DnaKind,
  KnowledgeProvenance,
  KnowledgeMetadata,
  DnaRecord,
  KnowledgeDraft,
  KnowledgeQuery,
  KnowledgeQueryResult,
} from "./common";

export type {
  TradeDna,
  LocationDna,
  BrandDna,
  CustomerDna,
  CompetitorDna,
  MarketingDna,
  DnaByKind,
  DnaOf,
} from "./dna";

export type {
  KnowledgeCollection,
  KnowledgeReader,
  KnowledgeWriter,
  KnowledgeKernel,
  KnowledgeKernelProvider,
} from "./knowledge-kernel";

export { createKnowledgeKernel } from "./kernel";
export {
  createMemoryKnowledgeStore,
  type KnowledgeStore,
  type KnowledgeStoreRow,
} from "./store";
export { resolveKnowledgeKernel } from "./provider";
