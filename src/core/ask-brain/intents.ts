/**
 * The deterministic intent catalog (ADR-048). Six named questions, each a
 * pure function over the memory-spine graph + learning-feed observations.
 * Real records, app links, spine provenance, honest emptiness — zero LLM.
 */

import type {
  Build,
  Business,
  Enquiry,
  Publication,
  SiteMetricRow,
} from "@/core/business";
import {
  leadsNotContacted,
  neighbors,
  type KnowledgeGraph,
  type KnowledgeNode,
} from "@/core/memory-spine";
import type {
  AskContext,
  EvidenceRecord,
  IntentDefinition,
  IntentResult,
} from "./model";

const DAY_MS = 24 * 60 * 60 * 1000;

/** An in-progress build item untouched this long is STALLED. */
const STALLED_AFTER_DAYS = 3;

/** Build statuses that mean "someone is (supposed to be) working on it". */
const IN_PROGRESS_STATUSES = ["building", "ai_check"];

function businessNodes(graph: KnowledgeGraph): KnowledgeNode[] {
  return Object.values(graph.nodes).filter((node) => node.ref.kind === "business");
}

function businessName(graph: KnowledgeGraph, businessId: string): string {
  return graph.nodes[`business:${businessId}`]?.label ?? businessId;
}

function daysBetween(fromIso: string, toIso: string): number {
  return Math.floor((Date.parse(toIso) - Date.parse(fromIso)) / DAY_MS);
}

function result(
  intentId: string,
  params: Record<string, unknown>,
  summary: string,
  records: EvidenceRecord[],
  derivation: string,
): IntentResult {
  return { intentId, params, summary, records, isEmpty: records.length === 0, derivation };
}

const leadsNotContactedIntent: IntentDefinition = {
  id: "leads_not_contacted",
  title: "Leads not contacted",
  description:
    "Pipeline businesses (lead/qualified/proposed) whose last recorded touch is older than N days.",
  params: { days: "number of days of silence (default 7)" },
  examples: [
    "Which customers haven't been contacted in 7 days?",
    "Who has gone quiet this week?",
  ],
  run(context, params) {
    const days = typeof params.days === "number" && params.days >= 0 ? params.days : 7;
    const neglected = leadsNotContacted(context.graph, { days, now: context.now });
    const records = neglected.map<EvidenceRecord>((lead) => ({
      label: `${lead.business.name} — no touch for ${lead.daysSinceLastTouch} days`,
      detail: `Stage: ${lead.business.stage} · last touch ${lead.lastTouchAt.slice(0, 10)}`,
      href: `/crm/${lead.business.id}`,
      ref: { kind: "business", id: lead.business.id },
      provenance: "businesses + activity_log (memory spine)",
    }));
    const summary =
      records.length === 0
        ? `No pipeline business has gone more than ${days} days without a touch. Nothing needs chasing.`
        : `${records.length} pipeline ${records.length === 1 ? "business has" : "businesses have"} gone quiet for more than ${days} days — oldest: ${neglected[0].business.name} (${neglected[0].daysSinceLastTouch} days).`;
    return result(
      this.id,
      { days },
      summary,
      records,
      `Graph query: pipeline-stage businesses whose latest activity entry (else creation) is older than ${days} days before ${context.now.slice(0, 10)}.`,
    );
  },
};

const buildsAttentionIntent: IntentDefinition = {
  id: "builds_attention",
  title: "Builds needing attention",
  description:
    "Builds with items waiting on founder review, or in-progress items untouched long enough to be stalled.",
  params: {},
  examples: ["Which builds are stalled?", "What's waiting on review?"],
  run(context) {
    const records: EvidenceRecord[] = [];
    for (const node of Object.values(context.graph.nodes)) {
      if (node.ref.kind !== "build") continue;
      const build = node.record as Build;
      const waiting = build.items.filter((item) => item.status === "review");
      const stalled = build.items.filter(
        (item) =>
          IN_PROGRESS_STATUSES.includes(item.status) &&
          daysBetween(item.updatedAt, context.now) >= STALLED_AFTER_DAYS,
      );
      if (waiting.length === 0 && stalled.length === 0) continue;
      const parts = [
        ...waiting.map((item) => `${item.kind} waiting on review`),
        ...stalled.map(
          (item) => `${item.kind} stalled ${daysBetween(item.updatedAt, context.now)} days`,
        ),
      ];
      records.push({
        label: `${businessName(context.graph, build.businessId)} — build needs attention`,
        detail: parts.join(" · "),
        href: `/crm/${build.businessId}`,
        ref: { kind: "build", id: build.id },
        provenance: "builds (memory spine)",
      });
    }
    const summary =
      records.length === 0
        ? "No builds are stalled or waiting on review. The queue is moving."
        : `${records.length} ${records.length === 1 ? "build needs" : "builds need"} attention: ${records.map((record) => record.label.split(" — ")[0]).join(", ")}.`;
    return result(
      this.id,
      {},
      summary,
      records,
      `Graph query: build items in "review", or in-progress items untouched for ${STALLED_AFTER_DAYS}+ days.`,
    );
  },
};

const enquiriesForIntent: IntentDefinition = {
  id: "enquiries_for",
  title: "Enquiries for a business",
  description: "Every enquiry captured for one business, newest first, with status.",
  params: { business: "the business name (a fragment is fine)" },
  examples: ["Show enquiries for Summit Roofing"],
  run(context, params) {
    const businessId = String(params.businessId ?? "");
    const enquiries = neighbors(
      context.graph,
      { kind: "business", id: businessId },
      { edge: "has_enquiry" },
    )
      .map((node) => node.record as Enquiry)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const records = enquiries.map<EvidenceRecord>((enquiry) => ({
      label: `${enquiry.name} — ${enquiry.status}`,
      detail: `${enquiry.message.slice(0, 80)} · via ${enquiry.sourcePage} · ${enquiry.createdAt.slice(0, 10)}`,
      href: `/crm/${businessId}`,
      ref: { kind: "enquiry", id: enquiry.id },
      provenance: "enquiries (memory spine)",
    }));
    const name = businessName(context.graph, businessId);
    const summary =
      records.length === 0
        ? `No enquiries recorded for ${name}.`
        : `${records.length} ${records.length === 1 ? "enquiry" : "enquiries"} for ${name} — newest from ${enquiries[0].name} (${enquiries[0].status}).`;
    return result(
      this.id,
      { businessId },
      summary,
      records,
      "Graph traversal: business —has_enquiry→ enquiries, newest first.",
    );
  },
};

/** Canonical pipeline ladder order for the stage summary. */
const STAGE_ORDER = [
  "lead",
  "qualified",
  "proposed",
  "won",
  "building",
  "review",
  "live",
  "account",
];

const pipelineByStageIntent: IntentDefinition = {
  id: "pipeline_by_stage",
  title: "Pipeline by stage",
  description: "Every business on the board, counted and listed by lifecycle stage.",
  params: {},
  examples: ["What's the pipeline by stage?"],
  run(context) {
    const businesses = businessNodes(context.graph).map((node) => node.record as Business);
    const byStage = new Map<string, Business[]>();
    for (const business of businesses) {
      byStage.set(business.stage, [...(byStage.get(business.stage) ?? []), business]);
    }
    const counts = STAGE_ORDER.filter((stage) => byStage.has(stage))
      .map((stage) => `${stage}: ${byStage.get(stage)!.length}`)
      .join(" · ");
    const records = STAGE_ORDER.flatMap((stage) => byStage.get(stage) ?? []).map<EvidenceRecord>(
      (business) => ({
        label: `${business.name} — ${business.stage}`,
        href: `/crm/${business.id}`,
        ref: { kind: "business", id: business.id },
        provenance: "businesses (memory spine)",
      }),
    );
    const summary =
      businesses.length === 0
        ? "The board is empty — no businesses yet."
        : `Pipeline: ${counts} (${businesses.length} ${businesses.length === 1 ? "business" : "businesses"}).`;
    return result(this.id, {}, summary, records, "Graph query: businesses grouped by lifecycle stage.");
  },
};

const topSitesIntent: IntentDefinition = {
  id: "top_sites",
  title: "Top sites this period",
  description: "Live sites ranked by first-party measured visits over the last N days.",
  params: { days: "period length in days (default 7)" },
  examples: ["Which sites got the most visits this week?"],
  run(context, params) {
    const days = typeof params.days === "number" && params.days > 0 ? params.days : 7;
    const cutoff = new Date(Date.parse(context.now) - days * DAY_MS)
      .toISOString()
      .slice(0, 10);
    const totals = new Map<string, { views: number; submits: number }>();
    for (const node of Object.values(context.graph.nodes)) {
      if (node.ref.kind !== "metric-day") continue;
      const row = node.record as SiteMetricRow;
      if (row.date < cutoff) continue;
      const current = totals.get(row.businessId) ?? { views: 0, submits: 0 };
      totals.set(row.businessId, {
        views: current.views + row.views,
        submits: current.submits + row.formSubmits,
      });
    }
    const liveSites = Object.values(context.graph.nodes).filter(
      (node) =>
        node.ref.kind === "site" && (node.record as Publication).status === "live",
    );
    const ranked = [...totals.entries()]
      .filter(([, sums]) => sums.views > 0 || sums.submits > 0)
      .sort((a, b) => b[1].views - a[1].views);
    const records = ranked.flatMap<EvidenceRecord>(([businessId, sums]) => {
      const site = liveSites.find(
        (node) => (node.record as Publication).businessId === businessId,
      );
      if (!site) return [];
      const slug = (site.record as Publication).slug;
      return [
        {
          label: `${businessName(context.graph, businessId)} — ${slug}`,
          detail: `${sums.views} visits · ${sums.submits} enquiries submitted (last ${days} days)`,
          href: `/sites/${slug}`,
          ref: site.ref,
          provenance: "site_metrics — first-party daily aggregates (memory spine)",
        },
      ];
    });
    const summary =
      records.length === 0
        ? `No measured visits in the last ${days} days.`
        : `Busiest site over the last ${days} days: ${records[0].label} (${records[0].detail}).`;
    return result(
      this.id,
      { days },
      summary,
      records,
      `Graph query: metric-day aggregates since ${cutoff}, summed per business, joined to the live publication.`,
    );
  },
};

const recordedForIntent: IntentDefinition = {
  id: "recorded_for",
  title: "Recorded for a customer",
  description:
    "Structured observations recorded for one business in the learning feed — optionally only promises.",
  params: {
    business: "the business name (a fragment is fine)",
    kind: 'optional observation kind filter, e.g. "promise"',
  },
  examples: ["What did we promise Summit?", "What did we record for Kerbside?"],
  run(context, params) {
    const businessId = String(params.businessId ?? "");
    const kind = typeof params.kind === "string" ? params.kind : undefined;
    const matches = context.observations.filter(
      (observation) =>
        observation.businessId === businessId &&
        (kind === undefined || observation.kind === kind),
    );
    const records = matches.map<EvidenceRecord>((observation) => ({
      label: observation.summary,
      detail: `${observation.kind} · ${observation.occurredAt.slice(0, 10)} · recorded by ${observation.source}`,
      href: `/crm/${businessId}`,
      ref: { kind: "business", id: businessId },
      provenance: `learning-feed:${observation.source}`,
    }));
    const name = businessName(context.graph, businessId);
    const what = kind ? `${kind}s` : "observations";
    const summary =
      records.length === 0
        ? `Nothing recorded${kind ? ` as a ${kind}` : ""} for ${name} in the learning feed.`
        : `${records.length} ${what} recorded for ${name} — latest: "${matches[0].summary}"`;
    return result(
      this.id,
      kind ? { businessId, kind } : { businessId },
      summary,
      records,
      "Learning-feed query: observations filtered by business (and kind), newest first.",
    );
  },
};

export const INTENT_CATALOG: ReadonlyArray<IntentDefinition> = [
  leadsNotContactedIntent,
  buildsAttentionIntent,
  enquiriesForIntent,
  pipelineByStageIntent,
  topSitesIntent,
  recordedForIntent,
];

export function runIntent(
  intentId: string,
  context: AskContext,
  params: Record<string, unknown>,
): IntentResult {
  const intent = INTENT_CATALOG.find((candidate) => candidate.id === intentId);
  if (!intent) throw new Error(`Unknown intent "${intentId}"`);
  return intent.run(context, params);
}
