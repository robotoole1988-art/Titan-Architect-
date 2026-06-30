/**
 * Knowledge Kernel — the public kernel interface.
 *
 * Interfaces only. This is the clean, type-safe surface every future feature
 * uses to store and retrieve knowledge. Features depend on these contracts,
 * never on a concrete implementation (which arrives later, behind its own ADR).
 *
 * All operations return Promises so that future implementations — local store,
 * database, or AI-backed retrieval — can be asynchronous without changing this
 * contract. No such implementation exists yet.
 *
 * Type safety: because `DnaKind` and `keyof DnaByKind` are defined to match,
 * using `DnaOf<K>` with `K extends DnaKind` resolves each call to the correct
 * record type — e.g. `kernel.get("trade", id)` yields `TradeDna | null`.
 */

import type {
  DnaKind,
  DnaRecord,
  KnowledgeDraft,
  KnowledgeId,
  KnowledgeQuery,
  KnowledgeQueryResult,
} from "./common";
import type { DnaOf } from "./dna";

/** Type-safe access to a single DNA collection (one kind). */
export interface KnowledgeCollection<T extends DnaRecord> {
  get(id: KnowledgeId): Promise<T | null>;
  query(query?: KnowledgeQuery): Promise<KnowledgeQueryResult<T>>;
  put(draft: KnowledgeDraft<T>): Promise<T>;
  update(id: KnowledgeId, patch: Partial<KnowledgeDraft<T>>): Promise<T>;
  remove(id: KnowledgeId): Promise<void>;
}

/** Read side of the kernel — what most features will depend on. */
export interface KnowledgeReader {
  get<K extends DnaKind>(kind: K, id: KnowledgeId): Promise<DnaOf<K> | null>;
  query<K extends DnaKind>(
    kind: K,
    query?: KnowledgeQuery,
  ): Promise<KnowledgeQueryResult<DnaOf<K>>>;
}

/** Write side of the kernel — for features that contribute knowledge. */
export interface KnowledgeWriter {
  put<K extends DnaKind>(kind: K, draft: KnowledgeDraft<DnaOf<K>>): Promise<DnaOf<K>>;
  update<K extends DnaKind>(
    kind: K,
    id: KnowledgeId,
    patch: Partial<KnowledgeDraft<DnaOf<K>>>,
  ): Promise<DnaOf<K>>;
  remove<K extends DnaKind>(kind: K, id: KnowledgeId): Promise<void>;
}

/**
 * The TITAN Knowledge Kernel: the single, clean public interface through which
 * every feature queries and contributes knowledge.
 */
export interface KnowledgeKernel extends KnowledgeReader, KnowledgeWriter {
  /** Ergonomic, type-safe handle to one DNA collection. */
  collection<K extends DnaKind>(kind: K): KnowledgeCollection<DnaOf<K>>;
}

/**
 * Supplies the active kernel implementation. The concrete kernel is wired in
 * later (a future ADR); features resolve the kernel through this seam and never
 * import a concrete implementation directly.
 */
export type KnowledgeKernelProvider = () => KnowledgeKernel;
