/**
 * TITAN Knowledge Kernel — public API.
 *
 * Interfaces only (no implementation, no AI, no database, no business logic).
 * This is the ONLY surface other modules may import from. Every future feature
 * queries and contributes knowledge through these contracts.
 *
 * See docs/architecture/adr-010-knowledge-kernel.md.
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
