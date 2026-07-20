/**
 * Memory Spine v1 (ADR-046) — the knowledge-graph model.
 *
 * The graph is a DERIVED, deterministic view over the Business Spine: typed
 * nodes carrying their full source records, and typed edges derived only from
 * real foreign keys. It is plain, JSON-serialisable data — no classes, no
 * hidden state — so consumers can snapshot, diff, and test it byte-for-byte.
 */

import type {
  ActivityEntry,
  ArtifactRecord,
  Build,
  Business,
  CustomerReview,
  Enquiry,
  MediaRecord,
  Publication,
  SiteMetricRow,
} from "@/core/business";
import type { CplEstimate } from "@/core/market-intelligence";

/** The entity kinds the graph knows. */
export type NodeKind =
  | "business"
  | "enquiry"
  | "deal"
  | "build"
  | "site"
  | "campaign"
  | "metric-day"
  | "media-asset"
  | "activity"
  | "review"
  | "market";

/** A stable reference to one node: kind + source-record id. */
export interface EntityRef {
  kind: NodeKind;
  id: string;
}

/** The canonical node key, `kind:id` — how the node map is indexed. */
export function refKey(ref: EntityRef): string {
  return `${ref.kind}:${ref.id}`;
}

/** Where a node or edge came from — always a REAL source, never invented. */
export interface SpineProvenance {
  /** Source table/module, e.g. "enquiries", "artifacts:deal". */
  source: string;
  /** The id of the record this fact was read from. */
  recordId: string;
}

/** One node: the ref, a human label, provenance, and the FULL source record. */
export interface KnowledgeNode<R = unknown> {
  ref: EntityRef;
  label: string;
  provenance: SpineProvenance;
  record: R;
}

/** The relationship kinds — one per real foreign key (ADR-046 table). */
export type EdgeKind =
  | "has_enquiry"
  | "captured_by"
  | "has_deal"
  | "has_campaign"
  | "has_build"
  | "published"
  | "measured"
  | "has_media"
  | "logged"
  | "has_review"
  | "in_market";

export interface KnowledgeEdge {
  from: EntityRef;
  to: EntityRef;
  kind: EdgeKind;
  provenance: SpineProvenance;
}

/**
 * The graph: nodes keyed by `kind:id`, edges in stable derivation order, and
 * integrity notes — every dangling foreign key is REPORTED here, never
 * silently skipped and never fabricated around.
 */
export interface KnowledgeGraph {
  nodes: Readonly<Record<string, KnowledgeNode>>;
  edges: ReadonlyArray<KnowledgeEdge>;
  integrityNotes: ReadonlyArray<string>;
}

/** Market context for one business, attributed to the provider that priced it. */
export interface MarketContext {
  businessId: string;
  trade: string;
  location: string;
  estimate: CplEstimate;
  providerName: string;
}

/**
 * The plain snapshot the graph is built from — everything read from EXISTING
 * sources (ADR-023/024/025/027/030/033). One shared layer: every consumer
 * sees the same snapshot shape.
 */
export interface MemorySnapshot {
  businesses: ReadonlyArray<Business>;
  enquiries: ReadonlyArray<Enquiry>;
  /** Latest deal artifact per business (versions are revisions of one deal). */
  deals: ReadonlyArray<ArtifactRecord>;
  /** Latest campaign plan artifact per business. */
  campaigns: ReadonlyArray<ArtifactRecord>;
  builds: ReadonlyArray<Build>;
  /** Full publication history — status rides on each record. */
  publications: ReadonlyArray<Publication>;
  metrics: ReadonlyArray<SiteMetricRow>;
  media: ReadonlyArray<MediaRecord>;
  activity: ReadonlyArray<ActivityEntry>;
  /** Customer reviews (ADR-053) — verified AND unverified; consumers gate. */
  reviews: ReadonlyArray<CustomerReview>;
  markets: ReadonlyArray<MarketContext>;
}

/** The composite id of a metric-day node (metrics have no natural id). */
export function metricDayId(row: SiteMetricRow): string {
  return `${row.businessId}:${row.path}:${row.date}`;
}
