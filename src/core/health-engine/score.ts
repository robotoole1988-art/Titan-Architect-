/**
 * The scoring engine (ADR-051). Pure, deterministic, injectable clock, no
 * LLM anywhere in this path. Weighted factor means; factors with missing
 * inputs are excluded with the remaining weights renormalised, the gap
 * named, and confidence lowered — degraded data is VISIBLE, never smoothed.
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
import type {
  KnowledgeGraph,
  Observation,
  ObservationDraft,
} from "@/core/memory-spine";
import { resolveFaqBank } from "@/core/website-blueprint";
import {
  bandFor,
  brainHealthLevelFor,
  type DepartmentHealth,
  type DepartmentId,
  type HealthConfidence,
  type HealthEngineInput,
  type HealthFactor,
  type HealthTrend,
  type ScoreableHealth,
  type UnscoreableHealth,
} from "./model";

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/** How far back window-based factors look. */
const WINDOW_DAYS = 30;

function nodesOf<R>(graph: KnowledgeGraph, kind: string): R[] {
  return Object.values(graph.nodes)
    .filter((node) => node.ref.kind === kind)
    .map((node) => node.record as R);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

interface FactorDraft {
  id: string;
  label: string;
  detail: string;
  /** Nominal weight before renormalisation. */
  weight: number;
  score: number;
  evidence: EvidenceRecord[];
}

/** Weighted mean over present factors; weights renormalised to sum 1. */
function assemble(
  department: DepartmentId,
  drafts: FactorDraft[],
  gaps: string[],
  now: string,
  observations: ReadonlyArray<Observation>,
): ScoreableHealth {
  const totalWeight = drafts.reduce((sum, factor) => sum + factor.weight, 0);
  const factors: HealthFactor[] = drafts.map((factor) => ({
    ...factor,
    weight: factor.weight / totalWeight,
    score: round1(factor.score),
  }));
  const score = round1(
    factors.reduce((sum, factor) => sum + factor.weight * factor.score, 0),
  );
  const band = bandFor(score);
  const confidence: HealthConfidence =
    factors.length <= 1 ? "low" : gaps.length > 0 ? "medium" : "high";
  const formula = `score = ${factors
    .map(
      (factor) =>
        `${factor.id} (${factor.score}) × weight ${round1(factor.weight * 100) / 100}`,
    )
    .join(" + ")} = ${score}/100${gaps.length > 0 ? ` · excluded: ${gaps.join("; ")}` : ""}`;
  return {
    department,
    scoreable: true,
    score,
    band,
    trend: trendFor(department, score, now, observations),
    riskLevel: band === "red" ? "high" : band === "amber" ? "medium" : "low",
    confidence,
    factors,
    gaps,
    formula,
    brainHealth: {
      level: brainHealthLevelFor(band),
      detail: `${department} scored ${score}/100 (${band})`,
      checkedAt: now,
    },
    computedAt: now,
  };
}

function unscoreable(
  department: DepartmentId,
  needs: string,
  now: string,
): UnscoreableHealth {
  return {
    department,
    scoreable: false,
    reason: `not yet scoreable — needs ${needs}`,
    brainHealth: {
      level: "unknown",
      detail: `${department}: needs ${needs}`,
      checkedAt: now,
    },
    computedAt: now,
  };
}

/** Trend vs the latest snapshot from a PREVIOUS day. Null = first reading. */
function trendFor(
  department: DepartmentId,
  score: number,
  now: string,
  observations: ReadonlyArray<Observation>,
): HealthTrend | null {
  const today = now.slice(0, 10);
  const prior = observations
    .filter(
      (observation) =>
        observation.kind === "health_snapshot" &&
        observation.payload?.department === department &&
        typeof observation.payload?.score === "number" &&
        observation.occurredAt.slice(0, 10) < today,
    )
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0];
  if (!prior) return null;
  const delta = Math.round(score - (prior.payload!.score as number));
  return {
    delta,
    direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
    since: prior.occurredAt,
  };
}

function businessName(graph: KnowledgeGraph, businessId: string): string {
  return graph.nodes[`business:${businessId}`]?.label ?? businessId;
}

// ---------------------------------------------------------------------------
// Department scorers.
// ---------------------------------------------------------------------------

function enquiriesHealth(
  graph: KnowledgeGraph,
  now: string,
  thresholds: MissionControlThresholds,
  observations: ReadonlyArray<Observation>,
): DepartmentHealth {
  const nowMs = Date.parse(now);
  const windowStart = nowMs - WINDOW_DAYS * DAY_MS;
  const enquiries = nodesOf<Enquiry>(graph, "enquiry").filter(
    (enquiry) => Date.parse(enquiry.createdAt) >= windowStart,
  );
  if (enquiries.length === 0) {
    return unscoreable("enquiries", "enquiries captured on a live site", now);
  }
  const sla = thresholds.enquirySlaMinutes;
  const compliant = enquiries.filter((enquiry) => {
    if (enquiry.contactedAt) {
      return Date.parse(enquiry.contactedAt) - Date.parse(enquiry.createdAt) <= sla * MINUTE_MS;
    }
    // Unhandled but still young counts as compliant so far.
    return nowMs - Date.parse(enquiry.createdAt) <= sla * MINUTE_MS;
  });
  const breaches = enquiries.filter(
    (enquiry) =>
      (enquiry.status === "new" || enquiry.status === "seen") &&
      nowMs - Date.parse(enquiry.createdAt) > sla * MINUTE_MS,
  );
  return assemble(
    "enquiries",
    [
      {
        id: "sla_compliance",
        label: "Speed-to-lead compliance",
        detail: `${compliant.length} of ${enquiries.length} enquiries (last ${WINDOW_DAYS} days) answered within the ${sla}-minute SLA`,
        weight: 0.7,
        score: (compliant.length / enquiries.length) * 100,
        evidence: enquiries.slice(0, 3).map((enquiry) => ({
          label: `${enquiry.name} — ${enquiry.status}`,
          href: `/crm/${enquiry.businessId}`,
          ref: { kind: "enquiry" as const, id: enquiry.id },
          provenance: "enquiries (memory spine)",
        })),
      },
      {
        id: "open_breaches",
        label: "Open SLA breaches",
        detail: `${breaches.length} enquir${breaches.length === 1 ? "y" : "ies"} currently unanswered past the SLA`,
        weight: 0.3,
        score: Math.max(0, 100 - breaches.length * 25),
        evidence: breaches.map((enquiry) => ({
          label: `${enquiry.name} — waiting since ${enquiry.createdAt.slice(0, 16).replace("T", " ")}`,
          href: `/crm/${enquiry.businessId}`,
          ref: { kind: "enquiry" as const, id: enquiry.id },
          provenance: "enquiries (memory spine)",
        })),
      },
    ],
    [],
    now,
    observations,
  );
}

function pipelineHealth(
  graph: KnowledgeGraph,
  now: string,
  thresholds: MissionControlThresholds,
  observations: ReadonlyArray<Observation>,
): DepartmentHealth {
  const nowMs = Date.parse(now);
  const active = nodesOf<Business>(graph, "business").filter((business) =>
    ["lead", "qualified", "proposed"].includes(business.stage),
  );
  if (active.length === 0) {
    return unscoreable("pipeline", "businesses in the active pipeline", now);
  }
  const lastMove = (business: Business): number =>
    Date.parse(
      business.stageHistory[business.stageHistory.length - 1]?.enteredAt ??
        business.updatedAt,
    );
  const fresh = active.filter(
    (business) =>
      nowMs - lastMove(business) <= thresholds.pipelineStaleDays * DAY_MS,
  );
  const staleProposed = active.filter(
    (business) =>
      business.stage === "proposed" &&
      nowMs - lastMove(business) > thresholds.dealStaleDays * DAY_MS,
  );
  const evidence = (list: Business[]): EvidenceRecord[] =>
    list.slice(0, 4).map((business) => ({
      label: `${business.name} — ${business.stage}`,
      href: `/crm/${business.id}`,
      ref: { kind: "business" as const, id: business.id },
      provenance: "businesses (memory spine)",
    }));
  return assemble(
    "pipeline",
    [
      {
        id: "freshness",
        label: "Pipeline freshness",
        detail: `${fresh.length} of ${active.length} active businesses moved within ${thresholds.pipelineStaleDays} days`,
        weight: 0.6,
        score: (fresh.length / active.length) * 100,
        evidence: evidence(active),
      },
      {
        id: "stale_deals",
        label: "Stale proposals",
        detail: `${staleProposed.length} proposal${staleProposed.length === 1 ? "" : "s"} older than ${thresholds.dealStaleDays} days without movement`,
        weight: 0.4,
        score: Math.max(0, 100 - staleProposed.length * 33),
        evidence: evidence(staleProposed),
      },
    ],
    [],
    now,
    observations,
  );
}

function deliveryHealth(
  graph: KnowledgeGraph,
  now: string,
  thresholds: MissionControlThresholds,
  observations: ReadonlyArray<Observation>,
): DepartmentHealth {
  const nowMs = Date.parse(now);
  const builds = nodesOf<Build>(graph, "build");
  if (builds.length === 0) return unscoreable("delivery", "at least one build", now);
  const nonTerminal = builds.flatMap((build) =>
    build.items
      .filter((item) => item.status !== "approved" && item.status !== "live")
      .map((item) => ({ build, item })),
  );
  if (nonTerminal.length === 0) {
    return unscoreable("delivery", "builds with in-flight items", now);
  }
  const blocked = nonTerminal.filter(
    ({ item }) =>
      item.status === "review" ||
      ((item.status === "building" || item.status === "ai_check") &&
        nowMs - Date.parse(item.updatedAt) >= thresholds.buildStaleDays * DAY_MS),
  );
  const reviewWaiting = nonTerminal.filter(({ item }) => item.status === "review");
  const evidence = blocked.slice(0, 4).map(({ build, item }) => ({
    label: `${businessName(graph, build.businessId)} — ${item.kind} (${item.status})`,
    href: `/crm/build-queue`,
    ref: { kind: "build" as const, id: build.id },
    provenance: "builds (memory spine)",
  }));
  return assemble(
    "delivery",
    [
      {
        id: "flow",
        label: "Build-item flow",
        detail: `${nonTerminal.length - blocked.length} of ${nonTerminal.length} in-flight items moving (not blocked in review or stalled past ${thresholds.buildStaleDays} days)`,
        weight: 0.6,
        score: ((nonTerminal.length - blocked.length) / nonTerminal.length) * 100,
        evidence,
      },
      {
        id: "gate_wait",
        label: "Founder-gate wait",
        detail: `${reviewWaiting.length} item${reviewWaiting.length === 1 ? "" : "s"} waiting on founder review`,
        weight: 0.4,
        score: Math.max(0, 100 - reviewWaiting.length * 20),
        evidence: reviewWaiting.slice(0, 4).map(({ build, item }) => ({
          label: `${businessName(graph, build.businessId)} — ${item.kind} in review`,
          href: `/crm/build-queue`,
          ref: { kind: "build" as const, id: build.id },
          provenance: "builds (memory spine)",
        })),
      },
    ],
    [],
    now,
    observations,
  );
}

function experienceHealth(
  graph: KnowledgeGraph,
  now: string,
  observations: ReadonlyArray<Observation>,
): DepartmentHealth {
  const liveSites = nodesOf<Publication>(graph, "site").filter(
    (site) => site.status === "live",
  );
  if (liveSites.length === 0) {
    return unscoreable("experience", "a live published site", now);
  }
  const businesses = new Map(
    nodesOf<Business>(graph, "business").map((business) => [business.id, business]),
  );
  const withFaq = liveSites.filter((site) => {
    const business = businesses.get(site.businessId);
    return business
      ? resolveFaqBank({
          trade: business.trade,
          ...(business.tradeId ? { tradeId: business.tradeId } : {}),
        }) !== null
      : false;
  });
  const factors: FactorDraft[] = [
    {
      id: "faq_coverage",
      label: "FAQ content coverage",
      detail: `${withFaq.length} of ${liveSites.length} live sites have a researched FAQ bank (ADR-047)`,
      weight: 0.5,
      score: (withFaq.length / liveSites.length) * 100,
      evidence: liveSites.map((site) => ({
        label: `${businessName(graph, site.businessId)} — ${site.slug}`,
        href: `/sites/${site.slug}`,
        ref: { kind: "site" as const, id: site.id },
        provenance: "publications + faq-content bank (memory spine)",
      })),
    },
  ];
  const gaps: string[] = [];
  const media = nodesOf<MediaRecord>(graph, "media-asset");
  const approved = media.filter((asset) => asset.status === "approved").length;
  const inReview = media.filter((asset) => asset.status === "review").length;
  if (approved + inReview > 0) {
    factors.push({
      id: "media_gate",
      label: "Media approval ratio",
      detail: `${approved} approved vs ${inReview} waiting in the founder gate`,
      weight: 0.3,
      score: (approved / (approved + inReview)) * 100,
      evidence: media
        .filter((asset) => asset.status === "review")
        .slice(0, 3)
        .map((asset) => ({
          label: `${asset.slotRef} (${asset.modality}) — in review`,
          href: `/crm/${asset.businessId}`,
          ref: { kind: "media-asset" as const, id: asset.id },
          provenance: "media_assets (memory spine)",
        })),
    });
  } else {
    gaps.push("no generated media to assess");
  }
  // Honest gap: the spine holds no Lighthouse results yet.
  gaps.push(
    "Lighthouse performance is not scored — needs recorded Lighthouse runs in the spine",
  );
  return assemble("experience", factors, gaps, now, observations);
}

function measurementHealth(
  graph: KnowledgeGraph,
  now: string,
  thresholds: MissionControlThresholds,
  observations: ReadonlyArray<Observation>,
): DepartmentHealth {
  const nowMs = Date.parse(now);
  const period = thresholds.accountPeriodDays;
  const currentFrom = new Date(nowMs - period * DAY_MS).toISOString().slice(0, 10);
  const priorFrom = new Date(nowMs - 2 * period * DAY_MS).toISOString().slice(0, 10);
  const rows = nodesOf<SiteMetricRow>(graph, "metric-day");
  const liveSites = nodesOf<Publication>(graph, "site").filter(
    (site) => site.status === "live",
  );
  interface SiteWindow {
    site: Publication;
    current: { views: number; submits: number };
    prior: { views: number; submits: number };
    delta: number;
  }
  const windows: SiteWindow[] = liveSites.flatMap((site) => {
    const mine = rows.filter((row) => row.businessId === site.businessId);
    const sum = (from: string, to?: string) =>
      mine
        .filter((row) => row.date >= from && (to === undefined || row.date < to))
        .reduce(
          (totals, row) => ({
            views: totals.views + row.views,
            submits: totals.submits + row.formSubmits,
          }),
          { views: 0, submits: 0 },
        );
    const current = sum(currentFrom);
    const prior = sum(priorFrom, currentFrom);
    if (prior.views === 0) return []; // no baseline — no claim
    return [
      {
        site,
        current,
        prior,
        delta: Math.round(((current.views - prior.views) / prior.views) * 100),
      },
    ];
  });
  if (windows.length === 0) {
    return unscoreable(
      "measurement",
      "a measured baseline (two periods of first-party visits)",
      now,
    );
  }
  const meanDelta = Math.round(
    windows.reduce((sum, window) => sum + window.delta, 0) / windows.length,
  );
  const evidence = windows.map((window) => ({
    label: `${businessName(graph, window.site.businessId)} — ${window.site.slug}`,
    detail: `${window.current.views} visits vs ${window.prior.views} prior (${window.delta}%)`,
    href: `/sites/${window.site.slug}`,
    ref: { kind: "site" as const, id: window.site.id },
    provenance: "site_metrics — first-party daily aggregates (memory spine)",
  }));
  const factors: FactorDraft[] = [
    {
      id: "traffic_trend",
      label: "Traffic vs prior period",
      detail: `mean visit change ${meanDelta}% across ${windows.length} measured site${windows.length === 1 ? "" : "s"} (worst: ${Math.min(...windows.map((w) => w.delta))}%)`,
      weight: 0.6,
      score: 50 + clamp(meanDelta, -50, 50),
      evidence,
    },
  ];
  const gaps: string[] = [];
  const currentViews = windows.reduce((sum, w) => sum + w.current.views, 0);
  const priorViews = windows.reduce((sum, w) => sum + w.prior.views, 0);
  const priorSubmits = windows.reduce((sum, w) => sum + w.prior.submits, 0);
  const currentSubmits = windows.reduce((sum, w) => sum + w.current.submits, 0);
  if (priorViews > 0 && priorSubmits > 0) {
    const currentConv = currentViews > 0 ? currentSubmits / currentViews : 0;
    const priorConv = priorSubmits / priorViews;
    const convDelta = Math.round(((currentConv - priorConv) / priorConv) * 100);
    factors.push({
      id: "conversion",
      label: "Enquiry conversion vs prior period",
      detail: `conversion moved ${convDelta}% (${currentSubmits}/${currentViews} now vs ${priorSubmits}/${priorViews} prior)`,
      weight: 0.4,
      score: 50 + clamp(convDelta, -50, 50),
      evidence,
    });
  } else {
    gaps.push("no prior-period enquiry conversions to compare against");
  }
  return assemble("measurement", factors, gaps, now, observations);
}

// ---------------------------------------------------------------------------
// Public API.
// ---------------------------------------------------------------------------

export function computeDepartmentHealth(
  input: HealthEngineInput,
): DepartmentHealth[] {
  const thresholds: MissionControlThresholds = {
    ...DEFAULT_THRESHOLDS,
    ...input.thresholds,
  };
  const { graph, now, observations } = input;
  return [
    enquiriesHealth(graph, now, thresholds, observations),
    pipelineHealth(graph, now, thresholds, observations),
    deliveryHealth(graph, now, thresholds, observations),
    experienceHealth(graph, now, observations),
    measurementHealth(graph, now, thresholds, observations),
  ];
}

/**
 * Snapshot drafts for the learning feed — one per department (score null
 * when not scoreable, so gaps accumulate history too). The feature layer
 * appends at most one per department per day.
 */
export function buildHealthSnapshotObservations(
  healths: ReadonlyArray<DepartmentHealth>,
  now: string,
): ObservationDraft[] {
  return healths.map((health) => ({
    kind: "health_snapshot",
    occurredAt: now,
    summary: health.scoreable
      ? `${health.department} health ${health.score}/100 (${health.band})`
      : `${health.department}: ${health.reason}`,
    payload: {
      department: health.department,
      score: health.scoreable ? health.score : null,
      ...(health.scoreable
        ? { band: health.band, confidence: health.confidence }
        : {}),
    },
    source: "health-engine",
  }));
}
