/**
 * createKnowledgeKernel (ADR-046) — the real implementation of the ADR-010
 * contract. All kernel behaviour lives here, once: system metadata assignment,
 * monotonic revisions, and querying (label search, shallow field filters,
 * limit + cursor pagination) — over any KnowledgeStore adapter.
 */

import type {
  DnaKind,
  KnowledgeDraft,
  KnowledgeId,
  KnowledgeQuery,
  KnowledgeQueryResult,
} from "./common";
import type { DnaOf } from "./dna";
import type {
  KnowledgeCollection,
  KnowledgeKernel,
} from "./knowledge-kernel";
import type { KnowledgeStore, KnowledgeStoreRow } from "./store";

/** Split a draft into the metadata the caller may set + the domain fields. */
function splitDraft(draft: Record<string, unknown>): {
  label: string;
  provenance?: KnowledgeStoreRow["provenance"];
  confidence?: number;
  fields: Record<string, unknown>;
} {
  const { label, provenance, confidence, ...fields } = draft;
  return {
    label: String(label ?? ""),
    ...(provenance !== undefined
      ? { provenance: provenance as KnowledgeStoreRow["provenance"] }
      : {}),
    ...(confidence !== undefined ? { confidence: Number(confidence) } : {}),
    fields,
  };
}

function toRecord<K extends DnaKind>(row: KnowledgeStoreRow): DnaOf<K> {
  return {
    ...row.fields,
    id: row.id,
    kind: row.kind,
    label: row.label,
    revision: row.revision,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ...(row.provenance !== undefined ? { provenance: row.provenance } : {}),
    ...(row.confidence !== undefined ? { confidence: row.confidence } : {}),
  } as unknown as DnaOf<K>;
}

class KnowledgeRecordNotFoundError extends Error {
  constructor(kind: DnaKind, id: KnowledgeId) {
    super(`Knowledge record "${kind}:${id}" not found`);
    this.name = "KnowledgeRecordNotFoundError";
  }
}

export function createKnowledgeKernel(store: KnowledgeStore): KnowledgeKernel {
  async function put<K extends DnaKind>(
    kind: K,
    draft: KnowledgeDraft<DnaOf<K>>,
  ): Promise<DnaOf<K>> {
    const now = new Date().toISOString();
    const { label, provenance, confidence, fields } = splitDraft(
      draft as Record<string, unknown>,
    );
    const row: KnowledgeStoreRow = {
      id: crypto.randomUUID(),
      kind,
      label,
      revision: 1,
      createdAt: now,
      updatedAt: now,
      ...(provenance !== undefined ? { provenance } : {}),
      ...(confidence !== undefined ? { confidence } : {}),
      fields,
    };
    await store.insert(row);
    return toRecord<K>(row);
  }

  async function get<K extends DnaKind>(
    kind: K,
    id: KnowledgeId,
  ): Promise<DnaOf<K> | null> {
    const row = await store.get(kind, id);
    return row ? toRecord<K>(row) : null;
  }

  async function update<K extends DnaKind>(
    kind: K,
    id: KnowledgeId,
    patch: Partial<KnowledgeDraft<DnaOf<K>>>,
  ): Promise<DnaOf<K>> {
    const existing = await store.get(kind, id);
    if (!existing) throw new KnowledgeRecordNotFoundError(kind, id);
    const { label, provenance, confidence, fields } = splitDraft(
      patch as Record<string, unknown>,
    );
    const next: KnowledgeStoreRow = {
      ...existing,
      label: (patch as { label?: string }).label !== undefined ? label : existing.label,
      ...(provenance !== undefined ? { provenance } : {}),
      ...(confidence !== undefined ? { confidence } : {}),
      fields: { ...existing.fields, ...fields },
      revision: existing.revision + 1,
      updatedAt: new Date().toISOString(),
    };
    await store.update(next);
    return toRecord<K>(next);
  }

  async function remove(kind: DnaKind, id: KnowledgeId): Promise<void> {
    await store.remove(kind, id);
  }

  async function query<K extends DnaKind>(
    kind: K,
    q: KnowledgeQuery = {},
  ): Promise<KnowledgeQueryResult<DnaOf<K>>> {
    const rows = await store.list(kind);
    const needle = q.search?.toLowerCase();
    const matches = rows.filter((row) => {
      if (needle && !row.label.toLowerCase().includes(needle)) return false;
      if (q.where) {
        for (const [field, expected] of Object.entries(q.where)) {
          if (row.fields[field] !== expected) return false;
        }
      }
      return true;
    });
    const offset = q.cursor ? Number.parseInt(q.cursor, 10) || 0 : 0;
    const limit = q.limit ?? matches.length;
    const page = matches.slice(offset, offset + limit);
    const nextOffset = offset + page.length;
    return {
      records: page.map((row) => toRecord<K>(row)),
      total: matches.length,
      ...(nextOffset < matches.length ? { nextCursor: String(nextOffset) } : {}),
    };
  }

  function collection<K extends DnaKind>(
    kind: K,
  ): KnowledgeCollection<DnaOf<K>> {
    return {
      get: (id) => get(kind, id),
      query: (q) => query(kind, q),
      put: (draft) => put(kind, draft),
      update: (id, patch) => update(kind, id, patch),
      remove: (id) => remove(kind, id),
    };
  }

  return { get, query, put, update, remove, collection };
}
