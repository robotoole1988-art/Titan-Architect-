/**
 * Repository abstractions for the Business Spine (ADR-023).
 *
 * Features and engines consume THESE interfaces — never a database client.
 * Adapters (in-memory, Supabase) implement the same contract and are proven
 * by one shared contract test suite (tests/core/business/).
 */

import type { Business, BusinessDraft, LifecycleStage } from "./model";
import type { BuildItemKind, BuildItemStatus } from "./build-model";

export class BusinessNotFoundError extends Error {
  constructor(id: string) {
    super(`Business "${id}" not found`);
    this.name = "BusinessNotFoundError";
  }
}

export interface BusinessRepository {
  /** Create a Business from an intake draft: stage "lead", history opened. */
  create(draft: BusinessDraft): Promise<Business>;
  get(id: string): Promise<Business | null>;
  /** Newest first. */
  list(): Promise<Business[]>;
  /**
   * Move the lifecycle stage, appending to stage history (no-op history-wise
   * when the stage is unchanged). An optional reason is recorded on the
   * transition (e.g. why a business was lost). Throws
   * {@link BusinessNotFoundError}.
   */
  updateStage(
    id: string,
    stage: LifecycleStage,
    reason?: string,
  ): Promise<Business>;
  /** Delete the business and (cascade) its artifacts. */
  remove(id: string): Promise<void>;
}

/** The artifact kinds the pipeline persists today. */
export type ArtifactKind = "strategy" | "blueprint" | "deal";

/** A saved, versioned pipeline artifact linked to its Business. */
export interface ArtifactRecord<T = unknown> {
  id: string;
  businessId: string;
  kind: ArtifactKind;
  /** 1-based, auto-incremented per business + kind. Never overwritten. */
  version: number;
  payload: T;
  /** Cross-references, e.g. { strategyVersion: 2 } on a blueprint. */
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface SaveArtifactInput<T> {
  businessId: string;
  kind: ArtifactKind;
  payload: T;
  meta?: Record<string, unknown>;
}

export interface ArtifactRepository {
  /** Version = latest + 1. Throws {@link BusinessNotFoundError} for unknown ids. */
  save<T>(input: SaveArtifactInput<T>): Promise<ArtifactRecord<T>>;
  latest<T>(businessId: string, kind: ArtifactKind): Promise<ArtifactRecord<T> | null>;
  getVersion<T>(
    businessId: string,
    kind: ArtifactKind,
    version: number,
  ): Promise<ArtifactRecord<T> | null>;
  /** Newest first. */
  listVersions(businessId: string, kind: ArtifactKind): Promise<ArtifactRecord[]>;
}

/** What the timestamped activity log records (ADR-024). */
export type ActivityKind =
  | "note"
  | "stage_change"
  | "artifact_generated"
  | "build_created"
  | "build_item_update"
  | "publication"
  | "enquiry";

export interface ActivityEntry {
  id: string;
  businessId: string;
  kind: ActivityKind;
  message: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface LogActivityInput {
  businessId: string;
  kind: ActivityKind;
  message: string;
  meta?: Record<string, unknown>;
}

export interface ActivityRepository {
  /** Throws {@link BusinessNotFoundError} for unknown businesses. */
  log(input: LogActivityInput): Promise<ActivityEntry>;
  /** Newest first. */
  list(businessId: string): Promise<ActivityEntry[]>;
}

/** One deliverable inside a Build (ADR-024). */
export interface BuildItem {
  id: string;
  buildId: string;
  kind: BuildItemKind;
  status: BuildItemStatus;
  /** True while the founder runs this item by hand (no department yet). */
  manual: boolean;
  /** Latest reviewer note (e.g. why an item was sent back). */
  note?: string;
  updatedAt: string;
}

/** The production run created when a business is won. One per business. */
export interface Build {
  id: string;
  businessId: string;
  createdAt: string;
  /** Ordered by BUILD_ITEM_KINDS. */
  items: BuildItem[];
}

export interface BuildRepository {
  /**
   * Get-or-create: exactly one build per business, seeded with every item at
   * "queued". `created` reports whether this call made it. Throws
   * {@link BusinessNotFoundError}.
   */
  createForBusiness(businessId: string): Promise<{ build: Build; created: boolean }>;
  getForBusiness(businessId: string): Promise<Build | null>;
  /** Newest first. */
  list(): Promise<Build[]>;
  /**
   * Move an item's status. Enforces the review gate via
   * assertBuildItemTransition (throws BuildTransitionError). An optional note
   * is stored on the item (send-back reasons).
   */
  setItemStatus(
    buildId: string,
    kind: BuildItemKind,
    status: BuildItemStatus,
    note?: string,
  ): Promise<Build>;
}

/** A published website: an immutable snapshot pinned to a blueprint version (ADR-027). */
export type PublicationStatus = "live" | "superseded" | "unpublished";

export interface Publication {
  id: string;
  businessId: string;
  /** Stable public path segment, e.g. "summit-roofing-rescue". */
  slug: string;
  /** 1-based publication number per business. */
  version: number;
  /** The EXACT blueprint artifact version being served. Never mutated. */
  blueprintVersion: number;
  status: PublicationStatus;
  createdAt: string;
  statusChangedAt: string;
}

export interface PublicationRepository {
  /**
   * Create the next publication version (live), superseding the previous
   * live one. The caller supplies the (stable) slug and the pinned blueprint
   * version. Throws {@link BusinessNotFoundError}.
   */
  publish(
    businessId: string,
    blueprintVersion: number,
    slug: string,
  ): Promise<Publication>;
  /** The live publication, or null when unpublished/never published. */
  current(businessId: string): Promise<Publication | null>;
  currentBySlug(slug: string): Promise<Publication | null>;
  /** Custom-domain resolution via the site_domains mapping. */
  currentByHostname(hostname: string): Promise<Publication | null>;
  /** All versions, newest first. */
  history(businessId: string): Promise<Publication[]>;
  /** Take the live publication offline (live → unpublished). */
  unpublish(businessId: string): Promise<void>;
  /** Which business owns a slug (any status), for uniqueness checks. */
  slugOwner(slug: string): Promise<string | null>;
  /** Map a custom hostname to a business (table-driven, ADR-027). */
  addDomain(hostname: string, businessId: string): Promise<void>;
}

/** A visitor enquiry from a PUBLISHED site — belongs to the account (ADR-027). */
export interface Enquiry {
  id: string;
  businessId: string;
  publicationId: string;
  name: string;
  contact: string;
  message: string;
  sourcePage: string;
  createdAt: string;
}

export type EnquiryDraft = Omit<Enquiry, "id" | "createdAt">;

export interface EnquiryRepository {
  /** Throws {@link BusinessNotFoundError} for unknown businesses. */
  create(draft: EnquiryDraft): Promise<Enquiry>;
  /** Newest first. */
  listForBusiness(businessId: string): Promise<Enquiry[]>;
}

/** Everything the spine persists, resolved together. */
export interface BusinessSpineRepositories {
  businesses: BusinessRepository;
  artifacts: ArtifactRepository;
  activity: ActivityRepository;
  builds: BuildRepository;
  publications: PublicationRepository;
  enquiries: EnquiryRepository;
}
