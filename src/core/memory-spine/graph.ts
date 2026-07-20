/**
 * buildKnowledgeGraph (ADR-046) — pure and deterministic.
 *
 * Snapshot in, graph out. Every node carries its full source record and
 * provenance; every edge is derived from a real foreign key and exists only
 * when BOTH endpoints exist in the snapshot. A dangling reference produces an
 * integrity note — the honest record of a gap — never an invented edge.
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
import {
  metricDayId,
  refKey,
  type EdgeKind,
  type EntityRef,
  type KnowledgeEdge,
  type KnowledgeGraph,
  type KnowledgeNode,
  type MarketContext,
  type MemorySnapshot,
  type NodeKind,
} from "./model";

interface GraphDraft {
  nodes: Record<string, KnowledgeNode>;
  edges: KnowledgeEdge[];
  integrityNotes: string[];
}

function addNode<R>(
  draft: GraphDraft,
  kind: NodeKind,
  id: string,
  label: string,
  source: string,
  record: R,
): void {
  const ref: EntityRef = { kind, id };
  draft.nodes[refKey(ref)] = {
    ref,
    label,
    provenance: { source, recordId: id },
    record,
  };
}

/** Add an edge ONLY when both endpoints exist; report the gap otherwise. */
function addEdge(
  draft: GraphDraft,
  kind: EdgeKind,
  from: EntityRef,
  to: EntityRef,
  source: string,
  recordId: string,
): void {
  const missing: string[] = [];
  if (!draft.nodes[refKey(from)]) missing.push(`${from.kind} "${from.id}"`);
  if (!draft.nodes[refKey(to)]) missing.push(`${to.kind} "${to.id}"`);
  if (missing.length > 0) {
    draft.integrityNotes.push(
      `${from.kind} "${from.id}" → ${to.kind} "${to.id}": ${kind} edge omitted — missing ${missing.join(" and ")} (source ${source}:${recordId})`,
    );
    return;
  }
  draft.edges.push({ from, to, kind, provenance: { source, recordId } });
}

const ref = (kind: NodeKind, id: string): EntityRef => ({ kind, id });

export function buildKnowledgeGraph(snapshot: MemorySnapshot): KnowledgeGraph {
  const draft: GraphDraft = { nodes: {}, edges: [], integrityNotes: [] };

  // --- Nodes first (edges validate against them). Stable input order in,
  // stable graph out: determinism is insertion order, nothing random, no clock.
  for (const business of snapshot.businesses satisfies ReadonlyArray<Business>) {
    addNode(draft, "business", business.id, business.name, "businesses", business);
  }
  for (const enquiry of snapshot.enquiries satisfies ReadonlyArray<Enquiry>) {
    addNode(draft, "enquiry", enquiry.id, `Enquiry from ${enquiry.name}`, "enquiries", enquiry);
  }
  for (const deal of snapshot.deals satisfies ReadonlyArray<ArtifactRecord>) {
    addNode(draft, "deal", deal.id, `Deal v${deal.version}`, "artifacts:deal", deal);
  }
  for (const campaign of snapshot.campaigns satisfies ReadonlyArray<ArtifactRecord>) {
    addNode(
      draft,
      "campaign",
      campaign.id,
      `Campaign plan v${campaign.version}`,
      "artifacts:campaign_plan",
      campaign,
    );
  }
  for (const build of snapshot.builds satisfies ReadonlyArray<Build>) {
    addNode(draft, "build", build.id, "Website build", "builds", build);
  }
  for (const publication of snapshot.publications satisfies ReadonlyArray<Publication>) {
    addNode(
      draft,
      "site",
      publication.id,
      `${publication.slug} v${publication.version} (${publication.status})`,
      "publications",
      publication,
    );
  }
  for (const row of snapshot.metrics satisfies ReadonlyArray<SiteMetricRow>) {
    const id = metricDayId(row);
    addNode(draft, "metric-day", id, `${row.path} · ${row.date}`, "site_metrics", row);
  }
  for (const media of snapshot.media satisfies ReadonlyArray<MediaRecord>) {
    addNode(draft, "media-asset", media.id, media.slotRef, "media_assets", media);
  }
  for (const entry of snapshot.activity satisfies ReadonlyArray<ActivityEntry>) {
    addNode(draft, "activity", entry.id, entry.message, "activity_log", entry);
  }
  for (const review of snapshot.reviews satisfies ReadonlyArray<CustomerReview>) {
    addNode(
      draft,
      "review",
      review.id,
      `${review.rating}★ review from ${review.customerName}${review.verification ? "" : " (unverified)"}`,
      "business_reviews",
      review,
    );
  }
  for (const market of snapshot.markets satisfies ReadonlyArray<MarketContext>) {
    addNode(
      draft,
      "market",
      market.businessId,
      `${market.trade} · ${market.location} CPL`,
      `market-intelligence:${market.providerName}`,
      market,
    );
  }

  // --- Edges: one per REAL foreign key (the ADR-046 table, in order).
  for (const enquiry of snapshot.enquiries) {
    addEdge(
      draft,
      "has_enquiry",
      ref("business", enquiry.businessId),
      ref("enquiry", enquiry.id),
      "enquiries",
      enquiry.id,
    );
    addEdge(
      draft,
      "captured_by",
      ref("enquiry", enquiry.id),
      ref("site", enquiry.publicationId),
      "enquiries",
      enquiry.id,
    );
  }
  for (const deal of snapshot.deals) {
    addEdge(draft, "has_deal", ref("business", deal.businessId), ref("deal", deal.id), "artifacts:deal", deal.id);
  }
  for (const campaign of snapshot.campaigns) {
    addEdge(
      draft,
      "has_campaign",
      ref("business", campaign.businessId),
      ref("campaign", campaign.id),
      "artifacts:campaign_plan",
      campaign.id,
    );
  }
  for (const build of snapshot.builds) {
    addEdge(draft, "has_build", ref("business", build.businessId), ref("build", build.id), "builds", build.id);
  }
  for (const publication of snapshot.publications) {
    addEdge(
      draft,
      "published",
      ref("business", publication.businessId),
      ref("site", publication.id),
      "publications",
      publication.id,
    );
  }
  for (const row of snapshot.metrics) {
    const id = metricDayId(row);
    addEdge(draft, "measured", ref("business", row.businessId), ref("metric-day", id), "site_metrics", id);
  }
  for (const media of snapshot.media) {
    addEdge(draft, "has_media", ref("business", media.businessId), ref("media-asset", media.id), "media_assets", media.id);
  }
  for (const entry of snapshot.activity) {
    addEdge(draft, "logged", ref("business", entry.businessId), ref("activity", entry.id), "activity_log", entry.id);
  }
  for (const review of snapshot.reviews) {
    addEdge(draft, "has_review", ref("business", review.businessId), ref("review", review.id), "business_reviews", review.id);
  }
  for (const market of snapshot.markets) {
    addEdge(
      draft,
      "in_market",
      ref("business", market.businessId),
      ref("market", market.businessId),
      `market-intelligence:${market.providerName}`,
      market.businessId,
    );
  }

  return draft;
}
