/**
 * The Decision Engine (ADR-050) — ADR-015's observe→decide contracts,
 * implemented for real.
 *
 * Six deterministic rules over the memory spine turn observed state into
 * ranked, evidence-backed recommendations: what happened, why it matters,
 * what to do, who, when, confidence, expected impact, risk. Pure functions,
 * injectable clock, Activation Law throughout (no data → no recommendation,
 * never a placeholder), and NO fabricated numbers — the only figures cited
 * are the ones the data itself measured. Read-only: every decision requires
 * approval and no task is ever assigned to a department in v1.
 */

import type { EvidenceRecord } from "@/core/ask-brain";
import type {
  Build,
  Business,
  Enquiry,
  MediaRecord,
  Publication,
  SiteMetricRow,
} from "@/core/business";
import {
  DEFAULT_THRESHOLDS,
  type MissionControlThresholds,
} from "@/core/mission-control";
import type { KnowledgeGraph, Observation } from "@/core/memory-spine";
import { resolveFaqBank } from "@/core/website-blueprint";
import type { BrainReasoner } from "@/core/ask-brain";
import type { Priority } from "./common";
import type { BrainDecision, BrainObservation, BrainTask } from "./decision";

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

export type RecommendationRuleId =
  | "enquiry_sla"
  | "stale_deal"
  | "build_blocked"
  | "measurement_move"
  | "media_review"
  | "missing_content";

export type RecommendationUrgency = "now" | "today" | "this_week";
export type RecommendationConfidence = "high" | "medium";
export type RecommendationRisk = "low" | "medium" | "high";

/** The manifesto shape, wrapped around the real ADR-015 objects. */
export interface Recommendation {
  /** Stable identity — `rule:subject`. Identical data → identical id. */
  id: string;
  rule: RecommendationRuleId;
  whatHappened: string;
  whyItMatters: string;
  recommendedAction: string;
  suggestedOwner: string;
  urgency: RecommendationUrgency;
  confidence: RecommendationConfidence;
  /** Qualitative unless real data supports a figure. */
  expectedImpact: string;
  /** The risk of NOT acting. */
  riskLevel: RecommendationRisk;
  /** Deterministic ranking score: severity × urgency × confidence. */
  score: number;
  evidence: EvidenceRecord[];
  /** The primary record to open. */
  link: string;
  /** ADR-015, for real. */
  observation: BrainObservation;
  decision: BrainDecision;
}

export interface DecisionEngineInput {
  graph: KnowledgeGraph;
  /** Learning-feed observations — accepted/dismissed ids suppress. */
  observations: ReadonlyArray<Observation>;
  now: string;
  thresholds?: Partial<MissionControlThresholds>;
}

const SEVERITY: Record<RecommendationRuleId, number> = {
  enquiry_sla: 100,
  stale_deal: 70,
  build_blocked: 60,
  measurement_move: 50,
  media_review: 40,
  missing_content: 30,
};

const URGENCY_FACTOR: Record<RecommendationUrgency, number> = {
  now: 3,
  today: 2,
  this_week: 1,
};

const CONFIDENCE_FACTOR: Record<RecommendationConfidence, number> = {
  high: 1,
  medium: 0.85,
};

const CAPABILITY: Record<RecommendationRuleId, string> = {
  enquiry_sla: "business-companion",
  stale_deal: "business-companion",
  build_blocked: "website",
  measurement_move: "business-intelligence",
  media_review: "experience-generation",
  missing_content: "research",
};

const PRIORITY: Record<RecommendationUrgency, Priority> = {
  now: "critical",
  today: "high",
  this_week: "normal",
};

interface RuleDraft {
  rule: RecommendationRuleId;
  subjectId: string;
  whatHappened: string;
  whyItMatters: string;
  recommendedAction: string;
  urgency: RecommendationUrgency;
  confidence: RecommendationConfidence;
  expectedImpact: string;
  riskLevel: RecommendationRisk;
  evidence: EvidenceRecord[];
  link: string;
  successCriteria: ReadonlyArray<string>;
}

/** Assemble the full recommendation — including the REAL ADR-015 objects. */
function toRecommendation(draft: RuleDraft, now: string): Recommendation {
  const id = `${draft.rule}:${draft.subjectId}`;
  const observation: BrainObservation = {
    id: `obs:${id}`,
    source: "memory-spine",
    observedAt: now,
    summary: draft.whatHappened,
    data: {
      rule: draft.rule,
      evidence: draft.evidence.map((record) => ({
        label: record.label,
        href: record.href,
        provenance: record.provenance,
      })),
    },
  };
  const task: BrainTask = {
    id: `task:${id}`,
    type: draft.rule,
    capability: CAPABILITY[draft.rule],
    priority: PRIORITY[draft.urgency],
    requiresApproval: true,
    successCriteria: draft.successCriteria,
    status: "pending",
    input: { link: draft.link },
  };
  const decision: BrainDecision = {
    id: `dec:${id}`,
    decidedAt: now,
    summary: draft.recommendedAction,
    basedOn: [observation.id],
    plan: {
      id: `plan:${id}`,
      objective: draft.recommendedAction,
      tasks: [task],
      createdAt: now,
    },
    requiresApproval: true,
    rationale: draft.whyItMatters,
    extensions: {
      confidence: draft.confidence,
      expectedImpact: draft.expectedImpact,
      riskLevel: draft.riskLevel,
      urgency: draft.urgency,
    },
  };
  return {
    id,
    rule: draft.rule,
    whatHappened: draft.whatHappened,
    whyItMatters: draft.whyItMatters,
    recommendedAction: draft.recommendedAction,
    suggestedOwner: "founder",
    urgency: draft.urgency,
    confidence: draft.confidence,
    expectedImpact: draft.expectedImpact,
    riskLevel: draft.riskLevel,
    score:
      SEVERITY[draft.rule] *
      URGENCY_FACTOR[draft.urgency] *
      CONFIDENCE_FACTOR[draft.confidence],
    evidence: draft.evidence,
    link: draft.link,
    observation,
    decision,
  };
}

function nodesOf<R>(graph: KnowledgeGraph, kind: string): R[] {
  return Object.values(graph.nodes)
    .filter((node) => node.ref.kind === kind)
    .map((node) => node.record as R);
}

function businessName(graph: KnowledgeGraph, businessId: string): string {
  return graph.nodes[`business:${businessId}`]?.label ?? businessId;
}

// ---------------------------------------------------------------------------
// The six rules. Each: pure, honest, evidence-first.
// ---------------------------------------------------------------------------

function enquirySlaRule(
  graph: KnowledgeGraph,
  now: string,
  thresholds: MissionControlThresholds,
): RuleDraft[] {
  const nowMs = Date.parse(now);
  return nodesOf<Enquiry>(graph, "enquiry")
    .filter((enquiry) => enquiry.status === "new" || enquiry.status === "seen")
    .flatMap((enquiry) => {
      const minutesWaiting = Math.floor((nowMs - Date.parse(enquiry.createdAt)) / MINUTE_MS);
      const past = minutesWaiting - thresholds.enquirySlaMinutes;
      if (past <= 0) return [];
      const name = businessName(graph, enquiry.businessId);
      return [
        {
          rule: "enquiry_sla" as const,
          subjectId: enquiry.id,
          whatHappened: `Enquiry from ${enquiry.name} for ${name} ("${enquiry.message.slice(0, 60)}") has waited ${minutesWaiting} minutes unanswered — ${past} minutes past the ${thresholds.enquirySlaMinutes}-minute speed-to-lead SLA.`,
          whyItMatters:
            "Speed-to-lead decides whether an enquiry converts: the odds fall sharply with every waiting hour, and this one is already past the line.",
          recommendedAction: `Respond to ${enquiry.name} now — call or reply, then mark the enquiry contacted.`,
          urgency: "now" as const,
          confidence: "high" as const,
          expectedImpact:
            "Keeps this lead winnable; a fast first response is the strongest conversion lever the data supports.",
          riskLevel: "high" as const,
          evidence: [
            {
              label: `${enquiry.name} — ${enquiry.status}`,
              detail: `${enquiry.message.slice(0, 80)} · ${enquiry.createdAt.slice(0, 16).replace("T", " ")}`,
              href: `/crm/${enquiry.businessId}`,
              ref: { kind: "enquiry", id: enquiry.id },
              provenance: "enquiries (memory spine)",
            },
          ],
          link: `/crm/${enquiry.businessId}`,
          successCriteria: ["Enquiry status moves to contacted within the SLA window"],
        },
      ];
    });
}

function staleDealRule(
  graph: KnowledgeGraph,
  now: string,
  thresholds: MissionControlThresholds,
): RuleDraft[] {
  const nowMs = Date.parse(now);
  return nodesOf<Business>(graph, "business")
    .filter((business) => business.stage === "proposed")
    .flatMap((business) => {
      const lastMove =
        business.stageHistory[business.stageHistory.length - 1]?.enteredAt ??
        business.updatedAt;
      const days = Math.floor((nowMs - Date.parse(lastMove)) / DAY_MS);
      if (days <= thresholds.dealStaleDays) return [];
      return [
        {
          rule: "stale_deal" as const,
          subjectId: business.id,
          whatHappened: `${business.name}'s proposal has not moved for ${days} days (threshold: ${thresholds.dealStaleDays}).`,
          whyItMatters:
            "Proposals decay: the longer a deal sits quiet, the more likely the prospect has cooled or gone elsewhere.",
          recommendedAction: `Chase the decision — follow up with ${business.name} and agree a close, a next step, or an honest no.`,
          urgency: "today" as const,
          confidence: "high" as const,
          expectedImpact:
            "Either revives a winnable deal or frees attention for live prospects — both beat silence.",
          riskLevel: "medium" as const,
          evidence: [
            {
              label: `${business.name} — proposed`,
              detail: `No stage movement since ${lastMove.slice(0, 10)}`,
              href: `/crm/${business.id}`,
              ref: { kind: "business", id: business.id },
              provenance: "businesses (memory spine)",
            },
          ],
          link: `/crm/${business.id}`,
          successCriteria: ["The deal moves stage or records a dated next step"],
        },
      ];
    });
}

function buildBlockedRule(
  graph: KnowledgeGraph,
  now: string,
  thresholds: MissionControlThresholds,
): RuleDraft[] {
  const nowMs = Date.parse(now);
  return nodesOf<Build>(graph, "build").flatMap((build) => {
    const waiting = build.items.filter((item) => item.status === "review");
    const stalled = build.items.filter(
      (item) =>
        (item.status === "building" || item.status === "ai_check") &&
        Math.floor((nowMs - Date.parse(item.updatedAt)) / DAY_MS) >=
          thresholds.buildStaleDays,
    );
    if (waiting.length === 0 && stalled.length === 0) return [];
    const name = businessName(graph, build.businessId);
    const parts = [
      ...waiting.map((item) => `${item.kind} waiting on your review`),
      ...stalled.map(
        (item) =>
          `${item.kind} stalled ${Math.floor((nowMs - Date.parse(item.updatedAt)) / DAY_MS)} days`,
      ),
    ];
    return [
      {
        rule: "build_blocked" as const,
        subjectId: build.businessId,
        whatHappened: `${name}'s build is blocked: ${parts.join(" · ")}.`,
        whyItMatters:
          "A blocked build delays the customer going live — and everything downstream (measurement, enquiries, revenue) waits with it.",
        recommendedAction: `Unblock ${name}'s build — clear the review gate and restart the stalled items.`,
        urgency: "today" as const,
        confidence: "high" as const,
        expectedImpact: "Restores build momentum toward go-live.",
        riskLevel: "medium" as const,
        evidence: [
          {
            label: `${name} — build`,
            detail: parts.join(" · "),
            href: `/crm/build-queue`,
            ref: { kind: "build", id: build.id },
            provenance: "builds (memory spine)",
          },
        ],
        link: `/crm/${build.businessId}`,
        successCriteria: ["No items in review", "No in-progress item older than the stall threshold"],
      },
    ];
  });
}

function measurementMoveRule(
  graph: KnowledgeGraph,
  now: string,
  thresholds: MissionControlThresholds,
): RuleDraft[] {
  const nowMs = Date.parse(now);
  const period = thresholds.accountPeriodDays;
  const currentFrom = new Date(nowMs - period * DAY_MS).toISOString().slice(0, 10);
  const priorFrom = new Date(nowMs - 2 * period * DAY_MS).toISOString().slice(0, 10);
  const liveSites = nodesOf<Publication>(graph, "site").filter(
    (site) => site.status === "live",
  );
  const rows = nodesOf<SiteMetricRow>(graph, "metric-day");
  return liveSites.flatMap((site) => {
    const mine = rows.filter((row) => row.businessId === site.businessId);
    const current = mine
      .filter((row) => row.date >= currentFrom)
      .reduce((sum, row) => sum + row.views, 0);
    const prior = mine
      .filter((row) => row.date >= priorFrom && row.date < currentFrom)
      .reduce((sum, row) => sum + row.views, 0);
    // Activation Law: no prior baseline → no claim about movement.
    if (prior === 0) return [];
    const delta = Math.round(((current - prior) / prior) * 100);
    if (Math.abs(delta) < thresholds.notableMovePercent) return [];
    const name = businessName(graph, site.businessId);
    const down = delta < 0;
    return [
      {
        rule: "measurement_move" as const,
        subjectId: site.businessId,
        whatHappened: `${site.slug}'s visits moved ${delta}% — ${current} visits this period vs ${prior} the period before (${period}-day windows, first-party measurement).`,
        whyItMatters: down
          ? "A drop this size usually has a cause — indexing, a broken source, seasonality — and the enquiry flow this site exists for falls with it."
          : "A rise this size is worth understanding and repeating — something is working.",
        recommendedAction: down
          ? `Investigate ${name}'s traffic drop — check the site is up, indexed, and its enquiry form works.`
          : `Look at what drove ${name}'s traffic rise and press the same lever again.`,
        urgency: down ? ("today" as const) : ("this_week" as const),
        confidence: "high" as const,
        expectedImpact: down
          ? "Understanding the drop protects the enquiry flow this site exists to create."
          : "Repeating what worked compounds the gain.",
        riskLevel: down ? ("medium" as const) : ("low" as const),
        evidence: [
          {
            label: `${name} — ${site.slug}`,
            detail: `${current} visits vs ${prior} prior (${delta}%)`,
            href: `/sites/${site.slug}`,
            ref: { kind: "site", id: site.id },
            provenance: "site_metrics — first-party daily aggregates (memory spine)",
          },
        ],
        link: `/crm/${site.businessId}`,
        successCriteria: ["The move is explained and any fix is actioned"],
      },
    ];
  });
}

function mediaReviewRule(graph: KnowledgeGraph): RuleDraft[] {
  const byBusiness = new Map<string, MediaRecord[]>();
  for (const media of nodesOf<MediaRecord>(graph, "media-asset")) {
    if (media.status !== "review") continue;
    byBusiness.set(media.businessId, [...(byBusiness.get(media.businessId) ?? []), media]);
  }
  return [...byBusiness.entries()].map(([businessId, assets]) => {
    const name = businessName(graph, businessId);
    return {
      rule: "media_review" as const,
      subjectId: businessId,
      whatHappened: `${assets.length} generated asset${assets.length === 1 ? " is" : "s are"} waiting in the founder review gate for ${name}.`,
      whyItMatters:
        "Nothing generated ships without your approval — while it waits, the site serves without it.",
      recommendedAction: `Review ${name}'s generated media — approve what earns its place, reject what doesn't.`,
      urgency: "this_week" as const,
      confidence: "high" as const,
      expectedImpact: "Approved media dresses the live site; rejected media stops wasting the slot.",
      riskLevel: "low" as const,
      evidence: assets.map((asset) => ({
        label: `${asset.slotRef} (${asset.modality})`,
        detail: asset.brief.slice(0, 70),
        href: `/crm/${businessId}`,
        ref: { kind: "media-asset" as const, id: asset.id },
        provenance: "media_assets — founder gate (memory spine)",
      })),
      link: `/crm/${businessId}`,
      successCriteria: ["No assets left in review status"],
    };
  });
}

function missingContentRule(graph: KnowledgeGraph): RuleDraft[] {
  const liveByBusiness = new Map<string, Publication>();
  for (const site of nodesOf<Publication>(graph, "site")) {
    if (site.status === "live") liveByBusiness.set(site.businessId, site);
  }
  return nodesOf<Business>(graph, "business").flatMap((business) => {
    const site = liveByBusiness.get(business.id);
    if (!site) return [];
    if (resolveFaqBank({ trade: business.trade, ...(business.tradeId ? { tradeId: business.tradeId } : {}) })) {
      return [];
    }
    return [
      {
        rule: "missing_content" as const,
        subjectId: business.id,
        whatHappened: `${business.name}'s site is live without FAQ answers — no researched Q&A bank exists for ${business.trade} (ADR-047).`,
        whyItMatters:
          "The FAQ section and its FAQPage search markup stay collapsed until researched answers exist — honest, but a missed trust and SEO surface.",
        recommendedAction: `Research and craft a ${business.trade} FAQ bank (typical UK ranges with provenance), then republish.`,
        urgency: "this_week" as const,
        confidence: "high" as const,
        expectedImpact:
          "Lights up the FAQ and FAQPage machinery already built for this site.",
        riskLevel: "low" as const,
        evidence: [
          {
            label: `${business.name} — ${site.slug}`,
            detail: `Trade "${business.trade}" has no FAQ bank`,
            href: `/sites/${site.slug}`,
            ref: { kind: "site", id: site.id },
            provenance: "publications + faq-content bank (memory spine)",
          },
        ],
        link: `/crm/${business.id}`,
        successCriteria: ["A researched bank exists for the trade", "The site republished with FAQ live"],
      },
    ];
  });
}

// ---------------------------------------------------------------------------
// The engine.
// ---------------------------------------------------------------------------

/** Recommendation ids the founder has already actioned or dismissed. */
function suppressedIds(observations: ReadonlyArray<Observation>): Set<string> {
  const ids = new Set<string>();
  for (const observation of observations) {
    if (
      observation.kind !== "recommendation_accepted" &&
      observation.kind !== "recommendation_dismissed"
    ) {
      continue;
    }
    const id = observation.payload?.recommendationId;
    if (typeof id === "string") ids.add(id);
  }
  return ids;
}

export function generateRecommendations(
  input: DecisionEngineInput,
): Recommendation[] {
  const thresholds: MissionControlThresholds = {
    ...DEFAULT_THRESHOLDS,
    ...input.thresholds,
  };
  const drafts: RuleDraft[] = [
    ...enquirySlaRule(input.graph, input.now, thresholds),
    ...staleDealRule(input.graph, input.now, thresholds),
    ...buildBlockedRule(input.graph, input.now, thresholds),
    ...measurementMoveRule(input.graph, input.now, thresholds),
    ...mediaReviewRule(input.graph),
    ...missingContentRule(input.graph),
  ];
  const suppressed = suppressedIds(input.observations);
  return drafts
    .map((draft) => toRecommendation(draft, input.now))
    .filter((recommendation) => !suppressed.has(recommendation.id))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

/**
 * Optional readable phrasing over the DETERMINISTIC payload (ADR-048 honesty
 * architecture): the reasoner narrates only what the rule derived; any
 * failure returns null and the deterministic text stands.
 */
export async function narrateRecommendation(
  recommendation: Recommendation,
  reasoner: BrainReasoner,
): Promise<string | null> {
  return reasoner
    .composeAnswer({
      question: "Why does this matter and what should I do?",
      result: {
        intentId: recommendation.rule,
        params: {},
        summary: `${recommendation.whatHappened} ${recommendation.whyItMatters} Recommended: ${recommendation.recommendedAction}`,
        records: recommendation.evidence,
        isEmpty: false,
        derivation: `Decision Engine rule "${recommendation.rule}" (ADR-050).`,
      },
    })
    .catch(() => null);
}
