/**
 * Supabase (Postgres) adapter — the durable store (ADR-023).
 *
 * SERVER-ONLY: constructed from server-side environment variables; the
 * service-role key must never reach client code (`server-only` enforces it).
 * Schema lives in supabase/migrations/. Behaviour is specified by the shared
 * repository contract suite.
 */

import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Business, BusinessDraft, LifecycleStage, StageTransition } from "./model";
import {
  BusinessNotFoundError,
  type ArtifactKind,
  type ArtifactRecord,
  type ArtifactRepository,
  type BusinessRepository,
  type BusinessSpineRepositories,
  type SaveArtifactInput,
} from "./repository";

export interface SupabaseSpineConfig {
  url: string;
  serviceRoleKey: string;
}

interface BusinessRow {
  id: string;
  name: string;
  trade: string;
  location: string;
  contact: Business["contact"] | null;
  services: string | null;
  target_customer: string | null;
  goal: string | null;
  budget: string | null;
  urgency: string | null;
  current_website_url: string | null;
  stage: LifecycleStage;
  stage_history: StageTransition[];
  created_at: string;
  updated_at: string;
}

interface ArtifactRow {
  id: string;
  business_id: string;
  kind: ArtifactKind;
  version: number;
  payload: unknown;
  meta: Record<string, unknown> | null;
  created_at: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

function toBusiness(row: BusinessRow): Business {
  return {
    id: row.id,
    name: row.name,
    trade: row.trade,
    location: row.location,
    ...(row.contact ? { contact: row.contact } : {}),
    ...(row.services !== null ? { services: row.services } : {}),
    ...(row.target_customer !== null ? { targetCustomer: row.target_customer } : {}),
    ...(row.goal !== null ? { goal: row.goal } : {}),
    ...(row.budget !== null ? { budget: row.budget } : {}),
    ...(row.urgency !== null ? { urgency: row.urgency } : {}),
    ...(row.current_website_url !== null
      ? { currentWebsiteUrl: row.current_website_url }
      : {}),
    stage: row.stage,
    stageHistory: row.stage_history,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toArtifact(row: ArtifactRow): ArtifactRecord {
  return {
    id: row.id,
    businessId: row.business_id,
    kind: row.kind,
    version: row.version,
    payload: row.payload,
    ...(row.meta ? { meta: row.meta } : {}),
    createdAt: row.created_at,
  };
}

/** Fail loudly: a database error must never be silently swallowed. */
function must<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(`Supabase error: ${result.error.message}`);
  if (result.data === null) throw new Error("Supabase returned no data");
  return result.data;
}

class SupabaseBusinessRepository implements BusinessRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(draft: BusinessDraft): Promise<Business> {
    const createdAt = nowIso();
    const row = {
      id: crypto.randomUUID(),
      name: draft.name,
      trade: draft.trade,
      location: draft.location,
      contact: draft.contact ?? null,
      services: draft.services ?? null,
      target_customer: draft.targetCustomer ?? null,
      goal: draft.goal ?? null,
      budget: draft.budget ?? null,
      urgency: draft.urgency ?? null,
      current_website_url: draft.currentWebsiteUrl ?? null,
      stage: "lead" as const,
      stage_history: [{ stage: "lead", enteredAt: createdAt }],
      created_at: createdAt,
      updated_at: createdAt,
    };
    const inserted = must(
      await this.client.from("businesses").insert(row).select().single<BusinessRow>(),
    );
    return toBusiness(inserted);
  }

  async get(id: string): Promise<Business | null> {
    const { data, error } = await this.client
      .from("businesses")
      .select()
      .eq("id", id)
      .maybeSingle<BusinessRow>();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data ? toBusiness(data) : null;
  }

  async list(): Promise<Business[]> {
    const { data, error } = await this.client
      .from("businesses")
      .select()
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return (data as BusinessRow[]).map(toBusiness);
  }

  async updateStage(id: string, stage: LifecycleStage): Promise<Business> {
    const current = await this.get(id);
    if (!current) throw new BusinessNotFoundError(id);
    if (current.stage === stage) return current;

    const enteredAt = nowIso();
    const updated = must(
      await this.client
        .from("businesses")
        .update({
          stage,
          stage_history: [...current.stageHistory, { stage, enteredAt }],
          updated_at: enteredAt,
        })
        .eq("id", id)
        .select()
        .single<BusinessRow>(),
    );
    return toBusiness(updated);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client.from("businesses").delete().eq("id", id);
    if (error) throw new Error(`Supabase error: ${error.message}`);
  }
}

class SupabaseArtifactRepository implements ArtifactRepository {
  constructor(private readonly client: SupabaseClient) {}

  async save<T>(input: SaveArtifactInput<T>): Promise<ArtifactRecord<T>> {
    const owner = await this.client
      .from("businesses")
      .select("id")
      .eq("id", input.businessId)
      .maybeSingle();
    if (owner.error) throw new Error(`Supabase error: ${owner.error.message}`);
    if (!owner.data) throw new BusinessNotFoundError(input.businessId);

    const { data: latest, error: latestError } = await this.client
      .from("business_artifacts")
      .select("version")
      .eq("business_id", input.businessId)
      .eq("kind", input.kind)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle<{ version: number }>();
    if (latestError) throw new Error(`Supabase error: ${latestError.message}`);

    const inserted = must(
      await this.client
        .from("business_artifacts")
        .insert({
          id: crypto.randomUUID(),
          business_id: input.businessId,
          kind: input.kind,
          version: (latest?.version ?? 0) + 1,
          payload: input.payload,
          meta: input.meta ?? null,
          created_at: nowIso(),
        })
        .select()
        .single<ArtifactRow>(),
    );
    return toArtifact(inserted) as ArtifactRecord<T>;
  }

  async latest<T>(
    businessId: string,
    kind: ArtifactKind,
  ): Promise<ArtifactRecord<T> | null> {
    const { data, error } = await this.client
      .from("business_artifacts")
      .select()
      .eq("business_id", businessId)
      .eq("kind", kind)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle<ArtifactRow>();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data ? (toArtifact(data) as ArtifactRecord<T>) : null;
  }

  async getVersion<T>(
    businessId: string,
    kind: ArtifactKind,
    version: number,
  ): Promise<ArtifactRecord<T> | null> {
    const { data, error } = await this.client
      .from("business_artifacts")
      .select()
      .eq("business_id", businessId)
      .eq("kind", kind)
      .eq("version", version)
      .maybeSingle<ArtifactRow>();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data ? (toArtifact(data) as ArtifactRecord<T>) : null;
  }

  async listVersions(
    businessId: string,
    kind: ArtifactKind,
  ): Promise<ArtifactRecord[]> {
    const { data, error } = await this.client
      .from("business_artifacts")
      .select()
      .eq("business_id", businessId)
      .eq("kind", kind)
      .order("version", { ascending: false });
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return (data as ArtifactRow[]).map(toArtifact);
  }
}

/** Build the durable spine from server-side configuration. */
export function createSupabaseBusinessSpine(
  config: SupabaseSpineConfig,
): BusinessSpineRepositories {
  const client = createClient(config.url, config.serviceRoleKey, {
    auth: { persistSession: false },
  });
  return {
    businesses: new SupabaseBusinessRepository(client),
    artifacts: new SupabaseArtifactRepository(client),
  };
}
