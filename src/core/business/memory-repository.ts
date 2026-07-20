/**
 * In-memory adapter — the zero-setup default (ADR-023).
 *
 * Keeps the app fully working with no configuration: data survives
 * navigation and HMR (state parked on globalThis in the provider) but NOT a
 * server restart. The Supabase adapter is the durable store.
 */

import { isInternalBusinessName } from "./model";
import type { Business, BusinessDraft, LifecycleStage } from "./model";
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
  type ActivityRepository,
  type ArtifactKind,
  type ArtifactRecord,
  type ArtifactRepository,
  type Build,
  type BuildRepository,
  type BusinessRepository,
  type BusinessSpineRepositories,
  type Enquiry,
  type EnquiryDraft,
  type EnquiryStatus,
  type MetricEventKind,
  type MetricsRepository,
  type SiteMetricRow,
  type MediaRecord,
  type MediaRecordDraft,
  type MediaRepository,
  type MediaReviewStatus,
  type EnquiryRepository,
  type LogActivityInput,
  type Publication,
  type PublicationRepository,
  type SaveArtifactInput,
  type CustomerReview,
  type CustomerReviewDraft,
  type ReviewRepository,
} from "./repository";

interface MemoryState {
  businesses: Map<string, Business>;
  artifacts: ArtifactRecord[];
  activity: ActivityEntry[];
  builds: Build[];
  publications: Publication[];
  domains: Map<string, string>;
  enquiries: Enquiry[];
  /** Monotonic insertion order — timestamps can tie within a millisecond. */
  sequence: Map<string, number>;
  nextSequence: number;
  metrics: Map<string, SiteMetricRow>;
  media: MediaRecord[];
  reviews: CustomerReview[];
}

function nowIso(): string {
  return new Date().toISOString();
}

class MemoryBusinessRepository implements BusinessRepository {
  constructor(private readonly state: MemoryState) {}

  async create(draft: BusinessDraft): Promise<Business> {
    const createdAt = nowIso();
    const business: Business = {
      ...draft,
      // The creation guard (ADR-049): self-declared internal names are
      // flagged automatically and never pollute Brain surfaces.
      ...(draft.internal ?? isInternalBusinessName(draft.name)
        ? { internal: true }
        : {}),
      id: crypto.randomUUID(),
      stage: "lead",
      stageHistory: [{ stage: "lead", enteredAt: createdAt }],
      createdAt,
      updatedAt: createdAt,
    };
    this.state.businesses.set(business.id, business);
    this.state.sequence.set(business.id, this.state.nextSequence++);
    return structuredClone(business);
  }

  async get(id: string): Promise<Business | null> {
    const business = this.state.businesses.get(id);
    return business ? structuredClone(business) : null;
  }

  async list(): Promise<Business[]> {
    const order = this.state.sequence;
    return [...this.state.businesses.values()]
      .sort((a, b) => (order.get(b.id) ?? 0) - (order.get(a.id) ?? 0))
      .map((business) => structuredClone(business));
  }

  async updateStage(
    id: string,
    stage: LifecycleStage,
    reason?: string,
  ): Promise<Business> {
    const business = this.state.businesses.get(id);
    if (!business) throw new BusinessNotFoundError(id);
    if (business.stage !== stage) {
      const enteredAt = nowIso();
      const updated: Business = {
        ...business,
        stage,
        stageHistory: [
          ...business.stageHistory,
          { stage, enteredAt, ...(reason ? { reason } : {}) },
        ],
        updatedAt: enteredAt,
      };
      this.state.businesses.set(id, updated);
      return structuredClone(updated);
    }
    return structuredClone(business);
  }

  async updateDetails(
    id: string,
    patch: Partial<Pick<BusinessDraft, "ownerEmail" | "ga4MeasurementId">>,
  ): Promise<Business> {
    const business = this.state.businesses.get(id);
    if (!business) throw new BusinessNotFoundError(id);
    if ("ownerEmail" in patch) business.ownerEmail = patch.ownerEmail;
    if ("ga4MeasurementId" in patch) business.ga4MeasurementId = patch.ga4MeasurementId;
    business.updatedAt = nowIso();
    return structuredClone(business);
  }

  async remove(id: string): Promise<void> {
    this.state.businesses.delete(id);
    this.state.artifacts = this.state.artifacts.filter(
      (artifact) => artifact.businessId !== id,
    );
    this.state.activity = this.state.activity.filter(
      (entry) => entry.businessId !== id,
    );
    this.state.builds = this.state.builds.filter(
      (build) => build.businessId !== id,
    );
    this.state.publications = this.state.publications.filter(
      (publication) => publication.businessId !== id,
    );
    this.state.enquiries = this.state.enquiries.filter(
      (enquiry) => enquiry.businessId !== id,
    );
    for (const key of [...this.state.metrics.keys()]) {
      if (key.startsWith(`${id}|`)) this.state.metrics.delete(key);
    }
    this.state.media = this.state.media.filter(
      (record) => record.businessId !== id,
    );
    this.state.reviews = this.state.reviews.filter(
      (review) => review.businessId !== id,
    );
    for (const [hostname, owner] of this.state.domains) {
      if (owner === id) this.state.domains.delete(hostname);
    }
  }
}

class MemoryPublicationRepository implements PublicationRepository {
  constructor(private readonly state: MemoryState) {}

  private forBusiness(businessId: string): Publication[] {
    return this.state.publications.filter(
      (publication) => publication.businessId === businessId,
    );
  }

  async publish(
    businessId: string,
    blueprintVersion: number,
    slug: string,
  ): Promise<Publication> {
    if (!this.state.businesses.has(businessId)) {
      throw new BusinessNotFoundError(businessId);
    }
    const now = nowIso();
    const existing = this.forBusiness(businessId);
    for (const publication of existing) {
      if (publication.status === "live") {
        publication.status = "superseded";
        publication.statusChangedAt = now;
      }
    }
    const publication: Publication = {
      id: crypto.randomUUID(),
      businessId,
      slug,
      version: existing.length
        ? Math.max(...existing.map((p) => p.version)) + 1
        : 1,
      blueprintVersion,
      status: "live",
      createdAt: now,
      statusChangedAt: now,
    };
    this.state.publications.push(publication);
    return structuredClone(publication);
  }

  async current(businessId: string): Promise<Publication | null> {
    const live = this.forBusiness(businessId).find((p) => p.status === "live");
    return live ? structuredClone(live) : null;
  }

  async currentBySlug(slug: string): Promise<Publication | null> {
    const live = this.state.publications.find(
      (p) => p.slug === slug && p.status === "live",
    );
    return live ? structuredClone(live) : null;
  }

  async currentByHostname(hostname: string): Promise<Publication | null> {
    const businessId = this.state.domains.get(hostname.toLowerCase());
    return businessId ? this.current(businessId) : null;
  }

  async history(businessId: string): Promise<Publication[]> {
    return this.forBusiness(businessId)
      .sort((a, b) => b.version - a.version)
      .map((publication) => structuredClone(publication));
  }

  async unpublish(businessId: string): Promise<void> {
    const live = this.forBusiness(businessId).find((p) => p.status === "live");
    if (live) {
      live.status = "unpublished";
      live.statusChangedAt = nowIso();
    }
  }

  async slugOwner(slug: string): Promise<string | null> {
    return (
      this.state.publications.find((p) => p.slug === slug)?.businessId ?? null
    );
  }

  async addDomain(hostname: string, businessId: string): Promise<void> {
    if (!this.state.businesses.has(businessId)) {
      throw new BusinessNotFoundError(businessId);
    }
    this.state.domains.set(hostname.toLowerCase(), businessId);
  }
}

class MemoryEnquiryRepository implements EnquiryRepository {
  constructor(private readonly state: MemoryState) {}

  async create(draft: EnquiryDraft): Promise<Enquiry> {
    if (!this.state.businesses.has(draft.businessId)) {
      throw new BusinessNotFoundError(draft.businessId);
    }
    const enquiry: Enquiry = {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      status: "new",
    };
    this.state.enquiries.push(enquiry);
    return structuredClone(enquiry);
  }

  async get(id: string): Promise<Enquiry | null> {
    const enquiry = this.state.enquiries.find((entry) => entry.id === id);
    return enquiry ? structuredClone(enquiry) : null;
  }

  async setStatus(
    id: string,
    status: EnquiryStatus,
    atIso: string,
  ): Promise<Enquiry> {
    const enquiry = this.state.enquiries.find((entry) => entry.id === id);
    if (!enquiry) throw new Error(`Unknown enquiry "${id}"`);
    enquiry.status = status;
    if (status === "seen" && !enquiry.seenAt) enquiry.seenAt = atIso;
    if (status === "contacted" && !enquiry.contactedAt) {
      enquiry.contactedAt = atIso;
    }
    if (status === "qualified" || status === "disqualified") {
      enquiry.outcomeAt = atIso;
    }
    return structuredClone(enquiry);
  }

  async listForBusiness(businessId: string): Promise<Enquiry[]> {
    return this.state.enquiries
      .filter((enquiry) => enquiry.businessId === businessId)
      .reverse()
      .map((enquiry) => structuredClone(enquiry));
  }

  async listRecent(limit: number): Promise<Enquiry[]> {
    return this.state.enquiries
      .slice(-limit)
      .reverse()
      .map((enquiry) => structuredClone(enquiry));
  }
}

class MemoryMediaRepository implements MediaRepository {
  constructor(private readonly state: MemoryState) {}

  async create(draft: MediaRecordDraft): Promise<MediaRecord> {
    if (!this.state.businesses.has(draft.businessId)) {
      throw new BusinessNotFoundError(draft.businessId);
    }
    const record: MediaRecord = {
      ...structuredClone(draft),
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      status: "review",
    };
    this.state.media.push(record);
    return structuredClone(record);
  }

  async get(id: string): Promise<MediaRecord | null> {
    const record = this.state.media.find((entry) => entry.id === id);
    return record ? structuredClone(record) : null;
  }

  async setStatus(id: string, status: MediaReviewStatus): Promise<MediaRecord> {
    const record = this.state.media.find((entry) => entry.id === id);
    if (!record) throw new Error(`Unknown media record "${id}"`);
    record.status = status;
    return structuredClone(record);
  }

  async listForBusiness(businessId: string): Promise<MediaRecord[]> {
    return this.state.media
      .filter((record) => record.businessId === businessId)
      .reverse()
      .map((record) => structuredClone(record));
  }

  async listApprovedForBusiness(businessId: string): Promise<MediaRecord[]> {
    return (await this.listForBusiness(businessId)).filter(
      (record) => record.status === "approved",
    );
  }
}

class MemoryMetricsRepository implements MetricsRepository {
  constructor(private readonly state: MemoryState) {}

  async record(
    businessId: string,
    path: string,
    kind: MetricEventKind,
    date: string,
  ): Promise<void> {
    if (!this.state.businesses.has(businessId)) {
      throw new BusinessNotFoundError(businessId);
    }
    const key = `${businessId}|${path}|${date}`;
    const row =
      this.state.metrics.get(key) ??
      ({ businessId, path, date, views: 0, formStarts: 0, formSubmits: 0 } satisfies SiteMetricRow);
    if (kind === "view") row.views += 1;
    if (kind === "form_start") row.formStarts += 1;
    if (kind === "form_submit") row.formSubmits += 1;
    this.state.metrics.set(key, row);
  }

  async listForBusiness(businessId: string): Promise<SiteMetricRow[]> {
    return [...this.state.metrics.values()]
      .filter((row) => row.businessId === businessId)
      .map((row) => structuredClone(row));
  }
}

class MemoryActivityRepository implements ActivityRepository {
  constructor(private readonly state: MemoryState) {}

  async log(input: LogActivityInput): Promise<ActivityEntry> {
    if (!this.state.businesses.has(input.businessId)) {
      throw new BusinessNotFoundError(input.businessId);
    }
    const entry: ActivityEntry = {
      id: crypto.randomUUID(),
      businessId: input.businessId,
      kind: input.kind,
      message: input.message,
      ...(input.meta ? { meta: structuredClone(input.meta) } : {}),
      createdAt: nowIso(),
    };
    this.state.activity.push(entry);
    return structuredClone(entry);
  }

  async list(businessId: string): Promise<ActivityEntry[]> {
    // Insertion order is authoritative; newest first.
    return this.state.activity
      .filter((entry) => entry.businessId === businessId)
      .reverse()
      .map((entry) => structuredClone(entry));
  }
}

class MemoryBuildRepository implements BuildRepository {
  constructor(private readonly state: MemoryState) {}

  async createForBusiness(
    businessId: string,
  ): Promise<{ build: Build; created: boolean }> {
    if (!this.state.businesses.has(businessId)) {
      throw new BusinessNotFoundError(businessId);
    }
    const existing = this.state.builds.find(
      (build) => build.businessId === businessId,
    );
    if (existing) return { build: structuredClone(existing), created: false };

    const createdAt = nowIso();
    const buildId = crypto.randomUUID();
    const build: Build = {
      id: buildId,
      businessId,
      createdAt,
      items: BUILD_ITEM_KINDS.map((kind) => ({
        id: crypto.randomUUID(),
        buildId,
        kind,
        status: "queued",
        manual: isManualBuildKind(kind),
        updatedAt: createdAt,
      })),
    };
    this.state.builds.push(build);
    return { build: structuredClone(build), created: true };
  }

  async getForBusiness(businessId: string): Promise<Build | null> {
    const build = this.state.builds.find(
      (candidate) => candidate.businessId === businessId,
    );
    return build ? structuredClone(build) : null;
  }

  async list(): Promise<Build[]> {
    return [...this.state.builds]
      .reverse()
      .map((build) => structuredClone(build));
  }

  async setItemStatus(
    buildId: string,
    kind: BuildItemKind,
    status: BuildItemStatus,
    note?: string,
  ): Promise<Build> {
    const build = this.state.builds.find((candidate) => candidate.id === buildId);
    if (!build) throw new BusinessNotFoundError(buildId);
    const item = build.items.find((candidate) => candidate.kind === kind);
    if (!item) throw new BusinessNotFoundError(`${buildId}/${kind}`);
    assertBuildItemTransition(item.status, status);
    item.status = status;
    item.updatedAt = nowIso();
    if (note !== undefined) item.note = note;
    return structuredClone(build);
  }
}

class MemoryArtifactRepository implements ArtifactRepository {
  constructor(private readonly state: MemoryState) {}

  private ofKind(businessId: string, kind: ArtifactKind): ArtifactRecord[] {
    return this.state.artifacts.filter(
      (artifact) => artifact.businessId === businessId && artifact.kind === kind,
    );
  }

  async save<T>(input: SaveArtifactInput<T>): Promise<ArtifactRecord<T>> {
    if (!this.state.businesses.has(input.businessId)) {
      throw new BusinessNotFoundError(input.businessId);
    }
    const existing = this.ofKind(input.businessId, input.kind);
    const record: ArtifactRecord<T> = {
      id: crypto.randomUUID(),
      businessId: input.businessId,
      kind: input.kind,
      version: existing.length
        ? Math.max(...existing.map((artifact) => artifact.version)) + 1
        : 1,
      payload: structuredClone(input.payload),
      ...(input.meta ? { meta: structuredClone(input.meta) } : {}),
      createdAt: nowIso(),
    };
    this.state.artifacts.push(record as ArtifactRecord);
    return structuredClone(record);
  }

  async latest<T>(
    businessId: string,
    kind: ArtifactKind,
  ): Promise<ArtifactRecord<T> | null> {
    const all = this.ofKind(businessId, kind);
    if (all.length === 0) return null;
    const top = all.reduce((a, b) => (a.version > b.version ? a : b));
    return structuredClone(top) as ArtifactRecord<T>;
  }

  async getVersion<T>(
    businessId: string,
    kind: ArtifactKind,
    version: number,
  ): Promise<ArtifactRecord<T> | null> {
    const match = this.ofKind(businessId, kind).find(
      (artifact) => artifact.version === version,
    );
    return match ? (structuredClone(match) as ArtifactRecord<T>) : null;
  }

  async listVersions(
    businessId: string,
    kind: ArtifactKind,
  ): Promise<ArtifactRecord[]> {
    return this.ofKind(businessId, kind)
      .sort((a, b) => b.version - a.version)
      .map((artifact) => structuredClone(artifact));
  }
}

class MemoryReviewRepository implements ReviewRepository {
  constructor(private readonly state: MemoryState) {}

  async create(draft: CustomerReviewDraft): Promise<CustomerReview> {
    if (!this.state.businesses.has(draft.businessId)) {
      throw new BusinessNotFoundError(draft.businessId);
    }
    const review: CustomerReview = {
      ...structuredClone(draft),
      id: crypto.randomUUID(),
      createdAt: nowIso(),
    };
    this.state.reviews.push(review);
    return structuredClone(review);
  }

  async listForBusiness(businessId: string): Promise<CustomerReview[]> {
    return this.state.reviews
      .filter((review) => review.businessId === businessId)
      .sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt))
      .map((review) => structuredClone(review));
  }

  async listVerifiedForBusiness(businessId: string): Promise<CustomerReview[]> {
    return (await this.listForBusiness(businessId)).filter(
      (review) => review.verification !== undefined,
    );
  }
}

/** A fresh, isolated in-memory spine (each call is its own universe). */
export function createMemoryBusinessSpine(): BusinessSpineRepositories {
  const state: MemoryState = {
    businesses: new Map(),
    artifacts: [],
    activity: [],
    builds: [],
    publications: [],
    domains: new Map(),
    enquiries: [],
    metrics: new Map(),
    media: [],
    reviews: [],
    sequence: new Map(),
    nextSequence: 1,
  };
  return {
    businesses: new MemoryBusinessRepository(state),
    artifacts: new MemoryArtifactRepository(state),
    activity: new MemoryActivityRepository(state),
    builds: new MemoryBuildRepository(state),
    publications: new MemoryPublicationRepository(state),
    enquiries: new MemoryEnquiryRepository(state),
    metrics: new MemoryMetricsRepository(state),
    media: new MemoryMediaRepository(state),
    reviews: new MemoryReviewRepository(state),
  };
}
