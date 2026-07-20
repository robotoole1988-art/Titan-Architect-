/**
 * Supabase adapter for the learning feed (ADR-046) — the `observations`
 * table. APPEND-ONLY: this adapter (like the contract) exposes no update and
 * no delete. Server-side only; service-role client (ADR-023 pattern).
 */

import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  LearningFeed,
  Observation,
  ObservationDraft,
} from "./learning-feed";
import type { EntityRef, NodeKind } from "./model";

interface ObservationRow {
  id: string;
  kind: string;
  occurred_at: string;
  business_id: string | null;
  subject_kind: string | null;
  subject_id: string | null;
  summary: string;
  payload: Record<string, unknown> | null;
  outcome: Record<string, unknown> | null;
  source: string;
}

function toObservation(row: ObservationRow): Observation {
  const subject: EntityRef | undefined =
    row.subject_kind && row.subject_id
      ? { kind: row.subject_kind as NodeKind, id: row.subject_id }
      : undefined;
  return {
    id: row.id,
    kind: row.kind,
    occurredAt: row.occurred_at,
    ...(row.business_id !== null ? { businessId: row.business_id } : {}),
    ...(subject !== undefined ? { subject } : {}),
    summary: row.summary,
    ...(row.payload !== null ? { payload: row.payload } : {}),
    ...(row.outcome !== null ? { outcome: row.outcome } : {}),
    source: row.source,
  };
}

export interface SupabaseLearningFeedConfig {
  url: string;
  serviceRoleKey: string;
}

export function createSupabaseLearningFeed(
  config: SupabaseLearningFeedConfig,
): LearningFeed {
  const client: SupabaseClient = createClient(config.url, config.serviceRoleKey, {
    auth: { persistSession: false },
  });
  const table = () => client.from("observations");

  return {
    async append(draft: ObservationDraft) {
      const { data, error } = await table()
        .insert({
          kind: draft.kind,
          occurred_at: draft.occurredAt ?? new Date().toISOString(),
          business_id: draft.businessId ?? null,
          subject_kind: draft.subject?.kind ?? null,
          subject_id: draft.subject?.id ?? null,
          summary: draft.summary,
          payload: draft.payload ?? null,
          outcome: draft.outcome ?? null,
          source: draft.source,
        })
        .select()
        .single();
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return toObservation(data as ObservationRow);
    },
    async list(filter = {}) {
      let query = table()
        .select()
        .order("occurred_at", { ascending: false })
        .order("id", { ascending: false });
      if (filter.businessId !== undefined) {
        query = query.eq("business_id", filter.businessId);
      }
      if (filter.kind !== undefined) {
        query = query.eq("kind", filter.kind);
      }
      if (filter.limit !== undefined) {
        query = query.limit(filter.limit);
      }
      const { data, error } = await query;
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return (data as ObservationRow[]).map(toObservation);
    },
  };
}
