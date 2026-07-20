/**
 * Named structured queries (ADR-046) — the rule-based questions the spine
 * answers today, built on graph traversal (and, for promises, the learning
 * feed). Deterministic given the same graph and clock; nothing is inferred,
 * nothing invented.
 */

import type {
  ArtifactRecord,
  Business,
  Enquiry,
  Publication,
  SiteMetricRow,
} from "@/core/business";
import type { Observation } from "./learning-feed";
import type { KnowledgeGraph } from "./model";
import { neighbors, traverse } from "./traverse";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Pipeline stages that count as a "lead" needing touches. */
const LEAD_STAGES: ReadonlyArray<string> = ["lead", "qualified", "proposed"];

export interface NeglectedLead {
  business: Business;
  /** Whole days since the last recorded touch (activity, else creation). */
  daysSinceLastTouch: number;
  lastTouchAt: string;
}

/**
 * Pipeline businesses whose most recent activity entry (falling back to the
 * business's creation) is more than `days` days before `now` — oldest first.
 */
export function leadsNotContacted(
  graph: KnowledgeGraph,
  options: { days: number; now: string },
): NeglectedLead[] {
  const nowMs = Date.parse(options.now);
  const neglected: NeglectedLead[] = [];
  for (const node of Object.values(graph.nodes)) {
    if (node.ref.kind !== "business") continue;
    const business = node.record as Business;
    if (!LEAD_STAGES.includes(business.stage)) continue;
    const touches = neighbors(graph, node.ref, { edge: "logged" }).map(
      (activity) => (activity.record as { createdAt: string }).createdAt,
    );
    const lastTouchAt =
      touches.length > 0
        ? touches.reduce((latest, at) => (at > latest ? at : latest))
        : business.createdAt;
    const daysSinceLastTouch = Math.floor((nowMs - Date.parse(lastTouchAt)) / DAY_MS);
    if (daysSinceLastTouch > options.days) {
      neglected.push({ business, daysSinceLastTouch, lastTouchAt });
    }
  }
  return neglected.sort((a, b) => b.daysSinceLastTouch - a.daysSinceLastTouch);
}

/**
 * Every enquiry and every deal for a business, resolved through the business
 * hub — the truthful shape of the data (there is no enquiry→deal link to
 * pretend otherwise about).
 */
export function enquiriesAndDealsFor(
  graph: KnowledgeGraph,
  businessId: string,
): { enquiries: Enquiry[]; deals: ArtifactRecord[] } {
  const businessRef = { kind: "business", id: businessId } as const;
  return {
    enquiries: neighbors(graph, businessRef, { edge: "has_enquiry" }).map(
      (node) => node.record as Enquiry,
    ),
    deals: neighbors(graph, businessRef, { edge: "has_deal" }).map(
      (node) => node.record as ArtifactRecord,
    ),
  };
}

/**
 * Measurement for a site, by slug: LIVE site → (in) published → business →
 * (out) measured → metric days. Multi-hop, because metrics truly key on the
 * business — the graph walks the real path rather than faking a direct one.
 */
export function measurementForSite(
  graph: KnowledgeGraph,
  slug: string,
): { site: Publication; metrics: SiteMetricRow[] } | null {
  const siteNode = Object.values(graph.nodes).find(
    (node) =>
      node.ref.kind === "site" &&
      (node.record as Publication).slug === slug &&
      (node.record as Publication).status === "live",
  );
  if (!siteNode) return null;
  const metricNodes = traverse(graph, siteNode.ref, [
    { edge: "published", direction: "in" },
    { edge: "measured" },
  ]);
  return {
    site: siteNode.record as Publication,
    metrics: metricNodes.map((node) => node.record as SiteMetricRow),
  };
}

/** Structured promises recorded for a business, from the learning feed. */
export function promisesFor(
  businessId: string,
  observations: ReadonlyArray<Observation>,
): Observation[] {
  return observations.filter(
    (observation) =>
      observation.kind === "promise" && observation.businessId === businessId,
  );
}
