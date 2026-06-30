/**
 * Knowledge Kernel — common primitives.
 *
 * Interfaces only. No implementation, no AI, no database, no business logic.
 * These contracts define the shared shape of everything the kernel stores and
 * how it is queried. They are designed to be stable: implementations and
 * intelligence are layered on top later without changing this surface.
 */

/** Opaque identifier for any knowledge record. */
export type KnowledgeId = string;

/** The kinds of DNA the kernel understands. */
export type DnaKind =
  | "trade"
  | "location"
  | "brand"
  | "customer"
  | "competitor"
  | "marketing";

/**
 * Where a piece of knowledge came from. Reserved for provenance tracking;
 * future AI enrichment will populate this, but it is just data for now.
 */
export interface KnowledgeProvenance {
  /** e.g. "manual", "import:csv", "agent:research" — interpreted by the implementation. */
  source: string;
  /** ISO-8601 timestamp of when the knowledge was captured. */
  capturedAt: string;
  note?: string;
}

/** System-managed metadata carried by every knowledge record. */
export interface KnowledgeMetadata {
  id: KnowledgeId;
  kind: DnaKind;
  /** Human-readable label for the record. */
  label: string;
  /** Monotonic revision, incremented on each update. */
  revision: number;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last-updated timestamp. */
  updatedAt: string;
  provenance?: KnowledgeProvenance;
  /** 0..1 confidence in this knowledge. Reserved for future AI enrichment. */
  confidence?: number;
}

/** Base contract for all DNA records — domain fields are added by each kind. */
export type DnaRecord = KnowledgeMetadata;

/**
 * The writable shape of a record: its domain fields plus the metadata a caller
 * may set. System fields (`id`, `kind`, `revision`, timestamps) are assigned by
 * the kernel, never by the caller.
 */
export type KnowledgeDraft<T extends DnaRecord> = Omit<T, keyof KnowledgeMetadata> & {
  label: string;
  provenance?: KnowledgeProvenance;
  confidence?: number;
};

/**
 * A read query against a knowledge collection. Intentionally minimal for now;
 * `where` is deliberately open so it can be refined per kind as the kernel
 * matures, without breaking this contract.
 */
export interface KnowledgeQuery {
  /** Free-text search; interpretation is defined by the implementation. */
  search?: string;
  /** Structured field filters, refined per kind later. */
  where?: Readonly<Record<string, unknown>>;
  /** Maximum number of records to return. */
  limit?: number;
  /** Opaque pagination cursor from a previous result. */
  cursor?: string;
}

/** The result of a query, shaped to support pagination from day one. */
export interface KnowledgeQueryResult<T extends DnaRecord> {
  records: ReadonlyArray<T>;
  /** Total matching records, for pagination UIs. */
  total: number;
  /** Opaque cursor for the next page, present only when more results exist. */
  nextCursor?: string;
}
