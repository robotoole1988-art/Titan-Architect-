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
import { isInternalBusinessName } from "./model";
import type { Business, BusinessDraft, LifecycleStage, StageTransition } from "./model";
import {
  BUILD_ITEM_KINDS,
  assertBuildItemTransition,
  isManualBuildKind,
  type BuildItemKind,
  type BuildItemStatus,
} from "./build-model";
import {
  BusinessNotFoundError,
  type ActivityEntry,
  type ActivityKind,
  type ActivityRepository,
  type ArtifactKind,
  type ArtifactRecord,
  type ArtifactRepository,
  type Build,
  type BuildItem,
  type BuildRepository,
  type BusinessRepository,
  type BusinessSpineRepositories,
  type Enquiry,
  type EnquiryDraft,
  type EnquiryStatus,
  type MetricEventKind,
  type MetricsRepository,
  type SiteMetricRow,
  type MediaModality,
  type MediaProvenance,
  type MediaRecord,
  type MediaRecordDraft,
  type MediaRepository,
  type MediaReviewStatus,
  type EnquiryRepository,
  type LogActivityInput,
  type Publication,
  type PublicationRepository,
  type PublicationStatus,
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
  trade_id: string | null;
  location: string;
  coverage_areas: string[] | null;
  contact: Business["contact"] | null;
  owner_email: string | null;
  ga4_measurement_id: string | null;
  services: string | null;
  target_customer: string | null;
  goal: string | null;
  budget: string | null;
  urgency: string | null;
  current_website_url: string | null;
  stage: LifecycleStage;
  stage_history: StageTransition[];
  internal: boolean;
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
    ...(row.trade_id !== null ? { tradeId: row.trade_id } : {}),
    location: row.location,
    ...(row.coverage_areas && row.coverage_areas.length > 0
      ? { coverageAreas: row.coverage_areas }
      : {}),
    ...(row.contact ? { contact: row.contact } : {}),
    ...(row.owner_email !== null ? { ownerEmail: row.owner_email } : {}),
    ...(row.ga4_measurement_id !== null
      ? { ga4MeasurementId: row.ga4_measurement_id }
      : {}),
    ...(row.services !== null ? { services: row.services } : {}),
    ...(row.target_customer !== null ? { targetCustomer: row.target_customer } : {}),
    ...(row.goal !== null ? { goal: row.goal } : {}),
    ...(row.budget !== null ? { budget: row.budget } : {}),
    ...(row.urgency !== null ? { urgency: row.urgency } : {}),
    ...(row.internal ? { internal: true } : {}),
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
      trade_id: draft.tradeId ?? null,
      location: draft.location,
      coverage_areas: draft.coverageAreas ? [...draft.coverageAreas] : [],
      contact: draft.contact ?? null,
      owner_email: draft.ownerEmail ?? null,
      ga4_measurement_id: draft.ga4MeasurementId ?? null,
      services: draft.services ?? null,
      target_customer: draft.targetCustomer ?? null,
      goal: draft.goal ?? null,
      budget: draft.budget ?? null,
      urgency: draft.urgency ?? null,
      current_website_url: draft.currentWebsiteUrl ?? null,
      // The creation guard (ADR-049).
      internal: draft.internal ?? isInternalBusinessName(draft.name),
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

  async updateStage(
    id: string,
    stage: LifecycleStage,
    reason?: string,
  ): Promise<Business> {
    const current = await this.get(id);
    if (!current) throw new BusinessNotFoundError(id);
    if (current.stage === stage) return current;

    const enteredAt = nowIso();
    const updated = must(
      await this.client
        .from("businesses")
        .update({
          stage,
          stage_history: [
            ...current.stageHistory,
            { stage, enteredAt, ...(reason ? { reason } : {}) },
          ],
          updated_at: enteredAt,
        })
        .eq("id", id)
        .select()
        .single<BusinessRow>(),
    );
    return toBusiness(updated);
  }

  async updateDetails(
    id: string,
    patch: Partial<Pick<BusinessDraft, "ownerEmail" | "ga4MeasurementId">>,
  ): Promise<Business> {
    const row: Record<string, unknown> = { updated_at: nowIso() };
    if ("ownerEmail" in patch) row.owner_email = patch.ownerEmail ?? null;
    if ("ga4MeasurementId" in patch) {
      row.ga4_measurement_id = patch.ga4MeasurementId ?? null;
    }
    const { data, error } = await this.client
      .from("businesses")
      .update(row)
      .eq("id", id)
      .select()
      .maybeSingle<BusinessRow>();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    if (!data) throw new BusinessNotFoundError(id);
    return toBusiness(data);
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

interface ActivityRow {
  id: string;
  business_id: string;
  kind: ActivityKind;
  message: string;
  meta: Record<string, unknown> | null;
  created_at: string;
}

function toActivity(row: ActivityRow): ActivityEntry {
  return {
    id: row.id,
    businessId: row.business_id,
    kind: row.kind,
    message: row.message,
    ...(row.meta ? { meta: row.meta } : {}),
    createdAt: row.created_at,
  };
}

class SupabaseActivityRepository implements ActivityRepository {
  constructor(private readonly client: SupabaseClient) {}

  async log(input: LogActivityInput): Promise<ActivityEntry> {
    const owner = await this.client
      .from("businesses")
      .select("id")
      .eq("id", input.businessId)
      .maybeSingle();
    if (owner.error) throw new Error(`Supabase error: ${owner.error.message}`);
    if (!owner.data) throw new BusinessNotFoundError(input.businessId);

    const inserted = must(
      await this.client
        .from("business_activity")
        .insert({
          id: crypto.randomUUID(),
          business_id: input.businessId,
          kind: input.kind,
          message: input.message,
          meta: input.meta ?? null,
          created_at: nowIso(),
        })
        .select()
        .single<ActivityRow>(),
    );
    return toActivity(inserted);
  }

  async list(businessId: string): Promise<ActivityEntry[]> {
    const { data, error } = await this.client
      .from("business_activity")
      .select()
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return (data as ActivityRow[]).map(toActivity);
  }
}

interface BuildRow {
  id: string;
  business_id: string;
  created_at: string;
}

interface BuildItemRow {
  id: string;
  build_id: string;
  kind: BuildItemKind;
  status: BuildItemStatus;
  manual: boolean;
  note: string | null;
  updated_at: string;
}

function toBuildItem(row: BuildItemRow): BuildItem {
  return {
    id: row.id,
    buildId: row.build_id,
    kind: row.kind,
    status: row.status,
    manual: row.manual,
    ...(row.note !== null ? { note: row.note } : {}),
    updatedAt: row.updated_at,
  };
}

const KIND_ORDER = new Map(BUILD_ITEM_KINDS.map((kind, index) => [kind, index]));

function toBuild(row: BuildRow, items: BuildItemRow[]): Build {
  return {
    id: row.id,
    businessId: row.business_id,
    createdAt: row.created_at,
    items: items
      .map(toBuildItem)
      .sort(
        (a, b) => (KIND_ORDER.get(a.kind) ?? 99) - (KIND_ORDER.get(b.kind) ?? 99),
      ),
  };
}

class SupabaseBuildRepository implements BuildRepository {
  constructor(private readonly client: SupabaseClient) {}

  private async itemsFor(buildIds: string[]): Promise<Map<string, BuildItemRow[]>> {
    if (buildIds.length === 0) return new Map();
    const { data, error } = await this.client
      .from("build_items")
      .select()
      .in("build_id", buildIds);
    if (error) throw new Error(`Supabase error: ${error.message}`);
    const grouped = new Map<string, BuildItemRow[]>();
    for (const row of data as BuildItemRow[]) {
      const bucket = grouped.get(row.build_id) ?? [];
      bucket.push(row);
      grouped.set(row.build_id, bucket);
    }
    return grouped;
  }

  async createForBusiness(
    businessId: string,
  ): Promise<{ build: Build; created: boolean }> {
    const existing = await this.getForBusiness(businessId);
    if (existing) return { build: existing, created: false };

    const owner = await this.client
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .maybeSingle();
    if (owner.error) throw new Error(`Supabase error: ${owner.error.message}`);
    if (!owner.data) throw new BusinessNotFoundError(businessId);

    const createdAt = nowIso();
    const buildId = crypto.randomUUID();
    const buildRow = must(
      await this.client
        .from("builds")
        .insert({ id: buildId, business_id: businessId, created_at: createdAt })
        .select()
        .single<BuildRow>(),
    );
    const itemRows = must(
      await this.client
        .from("build_items")
        .insert(
          BUILD_ITEM_KINDS.map((kind) => ({
            id: crypto.randomUUID(),
            build_id: buildId,
            kind,
            status: "queued",
            manual: isManualBuildKind(kind),
            note: null,
            updated_at: createdAt,
          })),
        )
        .select(),
    );
    return { build: toBuild(buildRow, itemRows as BuildItemRow[]), created: true };
  }

  async getForBusiness(businessId: string): Promise<Build | null> {
    const { data, error } = await this.client
      .from("builds")
      .select()
      .eq("business_id", businessId)
      .maybeSingle<BuildRow>();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    if (!data) return null;
    const items = await this.itemsFor([data.id]);
    return toBuild(data, items.get(data.id) ?? []);
  }

  async list(): Promise<Build[]> {
    const { data, error } = await this.client
      .from("builds")
      .select()
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
    if (error) throw new Error(`Supabase error: ${error.message}`);
    const rows = data as BuildRow[];
    const items = await this.itemsFor(rows.map((row) => row.id));
    return rows.map((row) => toBuild(row, items.get(row.id) ?? []));
  }

  async setItemStatus(
    buildId: string,
    kind: BuildItemKind,
    status: BuildItemStatus,
    note?: string,
  ): Promise<Build> {
    const { data: item, error } = await this.client
      .from("build_items")
      .select()
      .eq("build_id", buildId)
      .eq("kind", kind)
      .maybeSingle<BuildItemRow>();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    if (!item) throw new BusinessNotFoundError(`${buildId}/${kind}`);

    assertBuildItemTransition(item.status, status);
    must(
      await this.client
        .from("build_items")
        .update({
          status,
          updated_at: nowIso(),
          ...(note !== undefined ? { note } : {}),
        })
        .eq("id", item.id)
        .select()
        .single<BuildItemRow>(),
    );

    const buildRow = must(
      await this.client
        .from("builds")
        .select()
        .eq("id", buildId)
        .single<BuildRow>(),
    );
    const items = await this.itemsFor([buildId]);
    return toBuild(buildRow, items.get(buildId) ?? []);
  }
}

interface PublicationRow {
  id: string;
  business_id: string;
  slug: string;
  version: number;
  blueprint_version: number;
  status: PublicationStatus;
  created_at: string;
  status_changed_at: string;
}

function toPublication(row: PublicationRow): Publication {
  return {
    id: row.id,
    businessId: row.business_id,
    slug: row.slug,
    version: row.version,
    blueprintVersion: row.blueprint_version,
    status: row.status,
    createdAt: row.created_at,
    statusChangedAt: row.status_changed_at,
  };
}

class SupabasePublicationRepository implements PublicationRepository {
  constructor(private readonly client: SupabaseClient) {}

  async publish(
    businessId: string,
    blueprintVersion: number,
    slug: string,
  ): Promise<Publication> {
    const owner = await this.client
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .maybeSingle();
    if (owner.error) throw new Error(`Supabase error: ${owner.error.message}`);
    if (!owner.data) throw new BusinessNotFoundError(businessId);

    const now = nowIso();
    const supersede = await this.client
      .from("publications")
      .update({ status: "superseded", status_changed_at: now })
      .eq("business_id", businessId)
      .eq("status", "live");
    if (supersede.error) {
      throw new Error(`Supabase error: ${supersede.error.message}`);
    }

    const { data: latest, error: latestError } = await this.client
      .from("publications")
      .select("version")
      .eq("business_id", businessId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle<{ version: number }>();
    if (latestError) throw new Error(`Supabase error: ${latestError.message}`);

    const inserted = must(
      await this.client
        .from("publications")
        .insert({
          id: crypto.randomUUID(),
          business_id: businessId,
          slug,
          version: (latest?.version ?? 0) + 1,
          blueprint_version: blueprintVersion,
          status: "live",
          created_at: now,
          status_changed_at: now,
        })
        .select()
        .single<PublicationRow>(),
    );
    return toPublication(inserted);
  }

  private async liveWhere(
    column: string,
    value: string,
  ): Promise<Publication | null> {
    const { data, error } = await this.client
      .from("publications")
      .select()
      .eq(column, value)
      .eq("status", "live")
      .maybeSingle<PublicationRow>();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data ? toPublication(data) : null;
  }

  async current(businessId: string): Promise<Publication | null> {
    return this.liveWhere("business_id", businessId);
  }

  async currentBySlug(slug: string): Promise<Publication | null> {
    return this.liveWhere("slug", slug);
  }

  async currentByHostname(hostname: string): Promise<Publication | null> {
    const { data, error } = await this.client
      .from("site_domains")
      .select("business_id")
      .eq("hostname", hostname.toLowerCase())
      .maybeSingle<{ business_id: string }>();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data ? this.current(data.business_id) : null;
  }

  async history(businessId: string): Promise<Publication[]> {
    const { data, error } = await this.client
      .from("publications")
      .select()
      .eq("business_id", businessId)
      .order("version", { ascending: false });
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return (data as PublicationRow[]).map(toPublication);
  }

  async unpublish(businessId: string): Promise<void> {
    const { error } = await this.client
      .from("publications")
      .update({ status: "unpublished", status_changed_at: nowIso() })
      .eq("business_id", businessId)
      .eq("status", "live");
    if (error) throw new Error(`Supabase error: ${error.message}`);
  }

  async slugOwner(slug: string): Promise<string | null> {
    const { data, error } = await this.client
      .from("publications")
      .select("business_id")
      .eq("slug", slug)
      .limit(1)
      .maybeSingle<{ business_id: string }>();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data?.business_id ?? null;
  }

  async addDomain(hostname: string, businessId: string): Promise<void> {
    const { error } = await this.client.from("site_domains").upsert({
      hostname: hostname.toLowerCase(),
      business_id: businessId,
      created_at: nowIso(),
    });
    if (error) throw new Error(`Supabase error: ${error.message}`);
  }
}

interface EnquiryRow {
  id: string;
  business_id: string;
  publication_id: string;
  name: string;
  contact: string;
  message: string;
  source_page: string;
  created_at: string;
  status: EnquiryStatus;
  seen_at: string | null;
  contacted_at: string | null;
  outcome_at: string | null;
}

function toEnquiry(row: EnquiryRow): Enquiry {
  return {
    id: row.id,
    businessId: row.business_id,
    publicationId: row.publication_id,
    name: row.name,
    contact: row.contact,
    message: row.message,
    sourcePage: row.source_page,
    createdAt: row.created_at,
    status: row.status,
    ...(row.seen_at !== null ? { seenAt: row.seen_at } : {}),
    ...(row.contacted_at !== null ? { contactedAt: row.contacted_at } : {}),
    ...(row.outcome_at !== null ? { outcomeAt: row.outcome_at } : {}),
  };
}

interface MetricRow {
  business_id: string;
  path: string;
  date: string;
  views: number;
  form_starts: number;
  form_submits: number;
}

function toMetric(row: MetricRow): SiteMetricRow {
  return {
    businessId: row.business_id,
    path: row.path,
    date: row.date,
    views: row.views,
    formStarts: row.form_starts,
    formSubmits: row.form_submits,
  };
}

class SupabaseEnquiryRepository implements EnquiryRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(draft: EnquiryDraft): Promise<Enquiry> {
    const owner = await this.client
      .from("businesses")
      .select("id")
      .eq("id", draft.businessId)
      .maybeSingle();
    if (owner.error) throw new Error(`Supabase error: ${owner.error.message}`);
    if (!owner.data) throw new BusinessNotFoundError(draft.businessId);

    const inserted = must(
      await this.client
        .from("enquiries")
        .insert({
          id: crypto.randomUUID(),
          business_id: draft.businessId,
          publication_id: draft.publicationId,
          name: draft.name,
          contact: draft.contact,
          message: draft.message,
          source_page: draft.sourcePage,
          created_at: nowIso(),
          status: "new",
        })
        .select()
        .single<EnquiryRow>(),
    );
    return toEnquiry(inserted);
  }

  async get(id: string): Promise<Enquiry | null> {
    const { data, error } = await this.client
      .from("enquiries")
      .select()
      .eq("id", id)
      .maybeSingle<EnquiryRow>();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data ? toEnquiry(data) : null;
  }

  async setStatus(
    id: string,
    status: EnquiryStatus,
    atIso: string,
  ): Promise<Enquiry> {
    const current = await this.get(id);
    if (!current) throw new Error(`Unknown enquiry "${id}"`);
    const patch: Record<string, unknown> = { status };
    if (status === "seen" && !current.seenAt) patch.seen_at = atIso;
    if (status === "contacted" && !current.contactedAt) {
      patch.contacted_at = atIso;
    }
    if (status === "qualified" || status === "disqualified") {
      patch.outcome_at = atIso;
    }
    const updated = must(
      await this.client
        .from("enquiries")
        .update(patch)
        .eq("id", id)
        .select()
        .single<EnquiryRow>(),
    );
    return toEnquiry(updated);
  }

  async listForBusiness(businessId: string): Promise<Enquiry[]> {
    const { data, error } = await this.client
      .from("enquiries")
      .select()
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return (data as EnquiryRow[]).map(toEnquiry);
  }

  async listRecent(limit: number): Promise<Enquiry[]> {
    const { data, error } = await this.client
      .from("enquiries")
      .select()
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(limit);
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return (data as EnquiryRow[]).map(toEnquiry);
  }
}

interface MediaRow {
  id: string;
  business_id: string;
  slot_ref: string;
  brief: string;
  modality: MediaModality;
  url: string;
  lqip: string | null;
  poster_url: string | null;
  duration_seconds: number | null;
  width: number | null;
  height: number | null;
  status: MediaReviewStatus;
  provenance: MediaProvenance;
  created_at: string;
}

function toMediaRecord(row: MediaRow): MediaRecord {
  return {
    id: row.id,
    businessId: row.business_id,
    slotRef: row.slot_ref,
    brief: row.brief,
    modality: row.modality,
    url: row.url,
    ...(row.lqip !== null ? { lqip: row.lqip } : {}),
    ...(row.poster_url !== null ? { posterUrl: row.poster_url } : {}),
    ...(row.duration_seconds !== null
      ? { durationSeconds: row.duration_seconds }
      : {}),
    ...(row.width !== null ? { width: row.width } : {}),
    ...(row.height !== null ? { height: row.height } : {}),
    status: row.status,
    provenance: row.provenance,
    createdAt: row.created_at,
  };
}

class SupabaseMediaRepository implements MediaRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(draft: MediaRecordDraft): Promise<MediaRecord> {
    const owner = await this.client
      .from("businesses")
      .select("id")
      .eq("id", draft.businessId)
      .maybeSingle();
    if (owner.error) throw new Error(`Supabase error: ${owner.error.message}`);
    if (!owner.data) throw new BusinessNotFoundError(draft.businessId);
    const inserted = must(
      await this.client
        .from("media_assets")
        .insert({
          id: crypto.randomUUID(),
          business_id: draft.businessId,
          slot_ref: draft.slotRef,
          brief: draft.brief,
          modality: draft.modality,
          url: draft.url,
          lqip: draft.lqip ?? null,
          poster_url: draft.posterUrl ?? null,
          duration_seconds: draft.durationSeconds ?? null,
          width: draft.width ?? null,
          height: draft.height ?? null,
          status: "review",
          provenance: draft.provenance,
          created_at: nowIso(),
        })
        .select()
        .single<MediaRow>(),
    );
    return toMediaRecord(inserted);
  }

  async get(id: string): Promise<MediaRecord | null> {
    const { data, error } = await this.client
      .from("media_assets")
      .select()
      .eq("id", id)
      .maybeSingle<MediaRow>();
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data ? toMediaRecord(data) : null;
  }

  async setStatus(id: string, status: MediaReviewStatus): Promise<MediaRecord> {
    const updated = must(
      await this.client
        .from("media_assets")
        .update({ status })
        .eq("id", id)
        .select()
        .single<MediaRow>(),
    );
    return toMediaRecord(updated);
  }

  async listForBusiness(businessId: string): Promise<MediaRecord[]> {
    const { data, error } = await this.client
      .from("media_assets")
      .select()
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return (data as MediaRow[]).map(toMediaRecord);
  }

  async listApprovedForBusiness(businessId: string): Promise<MediaRecord[]> {
    const { data, error } = await this.client
      .from("media_assets")
      .select()
      .eq("business_id", businessId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return (data as MediaRow[]).map(toMediaRecord);
  }
}

class SupabaseMetricsRepository implements MetricsRepository {
  constructor(private readonly client: SupabaseClient) {}

  async record(
    businessId: string,
    path: string,
    kind: MetricEventKind,
    date: string,
  ): Promise<void> {
    const owner = await this.client
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .maybeSingle();
    if (owner.error) throw new Error(`Supabase error: ${owner.error.message}`);
    if (!owner.data) throw new BusinessNotFoundError(businessId);

    const column =
      kind === "view" ? "views" : kind === "form_start" ? "form_starts" : "form_submits";
    // Read-modify-write: racing beacons may drop the odd count — acceptable
    // for v1 daily aggregates (an RPC upsert is the scale-up path).
    const existing = await this.client
      .from("site_metrics")
      .select()
      .eq("business_id", businessId)
      .eq("path", path)
      .eq("date", date)
      .maybeSingle<MetricRow>();
    if (existing.error) throw new Error(`Supabase error: ${existing.error.message}`);
    if (existing.data) {
      const { error } = await this.client
        .from("site_metrics")
        .update({ [column]: existing.data[column as keyof MetricRow] as number + 1 })
        .eq("business_id", businessId)
        .eq("path", path)
        .eq("date", date);
      if (error) throw new Error(`Supabase error: ${error.message}`);
      return;
    }
    const { error } = await this.client.from("site_metrics").insert({
      business_id: businessId,
      path,
      date,
      views: 0,
      form_starts: 0,
      form_submits: 0,
      [column]: 1,
    });
    if (error) throw new Error(`Supabase error: ${error.message}`);
  }

  async listForBusiness(businessId: string): Promise<SiteMetricRow[]> {
    const { data, error } = await this.client
      .from("site_metrics")
      .select()
      .eq("business_id", businessId);
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return (data as MetricRow[]).map(toMetric);
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
    activity: new SupabaseActivityRepository(client),
    builds: new SupabaseBuildRepository(client),
    publications: new SupabasePublicationRepository(client),
    enquiries: new SupabaseEnquiryRepository(client),
    metrics: new SupabaseMetricsRepository(client),
    media: new SupabaseMediaRepository(client),
  };
}
