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
  /**
   * Update notification/measurement settings (ADR-030). Undefined clears.
   * Throws {@link BusinessNotFoundError}.
   */
  updateDetails(
    id: string,
    patch: Partial<Pick<BusinessDraft, "ownerEmail" | "ga4MeasurementId">>,
  ): Promise<Business>;
  /** Delete the business and (cascade) its artifacts. */
  remove(id: string): Promise<void>;
}

/** The artifact kinds the pipeline persists today. */
export type ArtifactKind =
  | "strategy"
  | "blueprint"
  | "deal"
  | "campaign_plan"
  /** Command Mode (ADR-052): a drafted — never sent — follow-up email. */
  | "email_draft";

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

/**
 * The speed-to-lead lifecycle (ADR-030): forward-only.
 * new → seen → contacted → qualified | disqualified.
 */
export const ENQUIRY_STATUSES = [
  "new",
  "seen",
  "contacted",
  "qualified",
  "disqualified",
] as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

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
  /** Lifecycle state (ADR-030). New enquiries are born "new". */
  status: EnquiryStatus;
  seenAt?: string;
  /** First contact — the speed-to-lead timestamp. */
  contactedAt?: string;
  /** When the enquiry was qualified/disqualified. */
  outcomeAt?: string;
}

export type EnquiryDraft = Omit<
  Enquiry,
  "id" | "createdAt" | "status" | "seenAt" | "contactedAt" | "outcomeAt"
>;

export interface EnquiryRepository {
  /** Throws {@link BusinessNotFoundError} for unknown businesses. */
  create(draft: EnquiryDraft): Promise<Enquiry>;
  get(id: string): Promise<Enquiry | null>;
  /**
   * Set the lifecycle status, stamping the matching timestamp field
   * (seen→seenAt, contacted→contactedAt, outcome→outcomeAt). Transition
   * RULES live in the workflow — the repository stores.
   */
  setStatus(id: string, status: EnquiryStatus, atIso: string): Promise<Enquiry>;
  /** Newest first. */
  listForBusiness(businessId: string): Promise<Enquiry[]>;
  /** Newest first across ALL businesses — the in-app inbox (ADR-030). */
  listRecent(limit: number): Promise<Enquiry[]>;
}

/** First-party measurement events (ADR-030). */
export type MetricEventKind = "view" | "form_start" | "form_submit";

/** One daily aggregate row: business × path × date. Never per-visitor. */
export interface SiteMetricRow {
  businessId: string;
  path: string;
  /** ISO date, e.g. "2026-07-09". */
  date: string;
  views: number;
  formStarts: number;
  formSubmits: number;
}

export interface MetricsRepository {
  /** Increment one event counter. Throws {@link BusinessNotFoundError}. */
  record(
    businessId: string,
    path: string,
    kind: MetricEventKind,
    date: string,
  ): Promise<void>;
  listForBusiness(businessId: string): Promise<SiteMetricRow[]>;
}

/** Generated-media modality (ADR-033) — image now, video next. */
export type MediaModality = "image" | "video";

/** The founder review gate for generated media (ADR-033). */
export type MediaReviewStatus = "review" | "approved" | "rejected";

export interface MediaProvenance {
  provider: string;
  model: string;
  prompt: string;
  costUsd: number;
  generatedAt: string;
}

/** One generated asset: asset → business → slot → brief + provenance. */
export interface MediaRecord {
  id: string;
  businessId: string;
  /** The blueprint's stable slot reference (generationRef or derived). */
  slotRef: string;
  brief: string;
  modality: MediaModality;
  /** Permanent-storage URL/path. */
  url: string;
  /** Base64 micro-preview for first paint (optional). */
  lqip?: string;
  /** Video: poster frame. */
  posterUrl?: string;
  durationSeconds?: number;
  width?: number;
  height?: number;
  status: MediaReviewStatus;
  provenance: MediaProvenance;
  createdAt: string;
}

export type MediaRecordDraft = Omit<MediaRecord, "id" | "createdAt" | "status">;

export interface MediaRepository {
  /** Born in "review" — the founder gate. Throws {@link BusinessNotFoundError}. */
  create(draft: MediaRecordDraft): Promise<MediaRecord>;
  get(id: string): Promise<MediaRecord | null>;
  setStatus(id: string, status: MediaReviewStatus): Promise<MediaRecord>;
  /** Newest first. */
  listForBusiness(businessId: string): Promise<MediaRecord[]>;
  /** ONLY approved assets ever reach a published site. */
  listApprovedForBusiness(businessId: string): Promise<MediaRecord[]>;
}

/**
 * Where a review came from (ADR-053). Modelled as data so GBP API ingestion
 * can slot in later as just another source — no schema change:
 * "direct" = the customer gave it to the business directly;
 * "google" = a Google review (today: founder-transcribed, screenshot on
 * file; later: GBP API with `sourceRef` as the external id);
 * "other" = any other named channel (say which in the attestation).
 */
export type ReviewSource = "direct" | "google" | "other";

/**
 * The verification attestation (ADR-053) — WHO verified the review and HOW
 * ("email from customer on file", "Google review, screenshot on file").
 * Never a bare boolean: the evidence trail is the point.
 */
export interface ReviewVerification {
  /** Who attested, e.g. "founder". */
  verifiedBy: string;
  /** How it was verified, plain English, specific. */
  method: string;
  /** When the attestation was made (ISO-8601). */
  verifiedAt: string;
}

/**
 * A real customer review (ADR-053). HONESTY LAW: nothing renders and no
 * Review/AggregateRating JSON-LD is emitted unless `verification` is
 * present — unverified records are an ingestion buffer, not content.
 */
export interface CustomerReview {
  id: string;
  businessId: string;
  customerName: string;
  /** Integer 1–5 (validated at the workflow layer). */
  rating: number;
  text: string;
  /** When the CUSTOMER gave the review (ISO date) — not when recorded. */
  reviewedAt: string;
  source: ReviewSource;
  /** External reference (future GBP review id/URL). */
  sourceRef?: string;
  verification?: ReviewVerification;
  createdAt: string;
}

export type CustomerReviewDraft = Omit<CustomerReview, "id" | "createdAt">;

export interface ReviewRepository {
  /** Throws {@link BusinessNotFoundError} for unknown businesses. */
  create(draft: CustomerReviewDraft): Promise<CustomerReview>;
  /** All reviews, newest reviewedAt first. */
  listForBusiness(businessId: string): Promise<CustomerReview[]>;
  /**
   * ONLY verified reviews — the single read the renderer and JSON-LD path
   * are allowed to use (ADR-053). Newest reviewedAt first.
   */
  listVerifiedForBusiness(businessId: string): Promise<CustomerReview[]>;
}

/** Everything the spine persists, resolved together. */
export interface BusinessSpineRepositories {
  businesses: BusinessRepository;
  artifacts: ArtifactRepository;
  activity: ActivityRepository;
  builds: BuildRepository;
  publications: PublicationRepository;
  enquiries: EnquiryRepository;
  metrics: MetricsRepository;
  media: MediaRepository;
  reviews: ReviewRepository;
}
