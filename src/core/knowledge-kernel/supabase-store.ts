/**
 * Supabase adapter for the kernel's store seam (ADR-046) — the
 * `knowledge_records` table. Server-side only; the service-role client, like
 * every spine adapter (ADR-023).
 */

import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { DnaKind, KnowledgeProvenance } from "./common";
import type { KnowledgeStore, KnowledgeStoreRow } from "./store";

interface KnowledgeRecordRow {
  id: string;
  kind: DnaKind;
  label: string;
  revision: number;
  fields: Record<string, unknown>;
  provenance: KnowledgeProvenance | null;
  confidence: number | null;
  created_at: string;
  updated_at: string;
}

function toStoreRow(row: KnowledgeRecordRow): KnowledgeStoreRow {
  return {
    id: row.id,
    kind: row.kind,
    label: row.label,
    revision: row.revision,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.provenance !== null ? { provenance: row.provenance } : {}),
    ...(row.confidence !== null ? { confidence: row.confidence } : {}),
    fields: row.fields ?? {},
  };
}

export interface SupabaseKnowledgeStoreConfig {
  url: string;
  serviceRoleKey: string;
}

export function createSupabaseKnowledgeStore(
  config: SupabaseKnowledgeStoreConfig,
): KnowledgeStore {
  const client: SupabaseClient = createClient(config.url, config.serviceRoleKey, {
    auth: { persistSession: false },
  });
  const table = () => client.from("knowledge_records");

  return {
    async insert(row) {
      const { error } = await table().insert({
        id: row.id,
        kind: row.kind,
        label: row.label,
        revision: row.revision,
        fields: row.fields,
        provenance: row.provenance ?? null,
        confidence: row.confidence ?? null,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
      });
      if (error) throw new Error(`Supabase error: ${error.message}`);
    },
    async get(kind, id) {
      const { data, error } = await table()
        .select()
        .eq("kind", kind)
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return data ? toStoreRow(data as KnowledgeRecordRow) : null;
    },
    async update(row) {
      const { error } = await table()
        .update({
          label: row.label,
          revision: row.revision,
          fields: row.fields,
          provenance: row.provenance ?? null,
          confidence: row.confidence ?? null,
          updated_at: row.updatedAt,
        })
        .eq("kind", row.kind)
        .eq("id", row.id);
      if (error) throw new Error(`Supabase error: ${error.message}`);
    },
    async remove(kind, id) {
      const { error } = await table().delete().eq("kind", kind).eq("id", id);
      if (error) throw new Error(`Supabase error: ${error.message}`);
    },
    async list(kind) {
      const { data, error } = await table()
        .select()
        .eq("kind", kind)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true });
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return (data as KnowledgeRecordRow[]).map(toStoreRow);
    },
  };
}
