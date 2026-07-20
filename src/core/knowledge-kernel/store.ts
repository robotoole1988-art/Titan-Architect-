/**
 * The kernel's store seam (ADR-046, implementing ADR-010).
 *
 * The kernel's behaviour (metadata, revisions, querying) lives in ONE place —
 * kernel.ts — over this minimal row store. Adapters implement these five
 * operations: in-memory here, Supabase in supabase-store.ts, both behind the
 * same contract, exactly like the Business Spine's adapter pattern (ADR-023).
 */

import type { DnaKind, KnowledgeProvenance } from "./common";

/** One stored knowledge record: system metadata + the kind's domain fields. */
export interface KnowledgeStoreRow {
  id: string;
  kind: DnaKind;
  label: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
  provenance?: KnowledgeProvenance;
  confidence?: number;
  /** The kind-specific domain fields (slug, services, area, ...). */
  fields: Record<string, unknown>;
}

export interface KnowledgeStore {
  insert(row: KnowledgeStoreRow): Promise<void>;
  get(kind: DnaKind, id: string): Promise<KnowledgeStoreRow | null>;
  /** Replace the row (same kind + id). */
  update(row: KnowledgeStoreRow): Promise<void>;
  remove(kind: DnaKind, id: string): Promise<void>;
  /** All rows of one kind, oldest first (stable order for pagination). */
  list(kind: DnaKind): Promise<KnowledgeStoreRow[]>;
}

/** In-memory store — tests and the memory persistence backend. */
export function createMemoryKnowledgeStore(): KnowledgeStore {
  const byKind = new Map<DnaKind, Map<string, KnowledgeStoreRow>>();
  const collection = (kind: DnaKind): Map<string, KnowledgeStoreRow> => {
    let rows = byKind.get(kind);
    if (!rows) {
      rows = new Map();
      byKind.set(kind, rows);
    }
    return rows;
  };
  return {
    async insert(row) {
      collection(row.kind).set(row.id, structuredClone(row));
    },
    async get(kind, id) {
      const row = collection(kind).get(id);
      return row ? structuredClone(row) : null;
    },
    async update(row) {
      collection(row.kind).set(row.id, structuredClone(row));
    },
    async remove(kind, id) {
      collection(kind).delete(id);
    },
    async list(kind) {
      return [...collection(kind).values()].map((row) => structuredClone(row));
    },
  };
}
