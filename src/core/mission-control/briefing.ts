/**
 * Mission Control — the deterministic briefing engine (ADR-042).
 *
 * A PURE function over a plain snapshot + an explicit `now` + one thresholds
 * config. No repositories, no `Date.now()`, no randomness — the whole briefing
 * is reproducible and unit-testable, and every number traces to its source.
 * Playbooks over reasoning: this is the Brain's first surface, and it does not
 * need an LLM to be useful.
 */

import {
  buildItemLabel,
  type BuildItem,
  type BuildItemKind,
  type LifecycleStage,
  type SiteMetricRow,
} from "@/core/business";
import { DEFAULT_THRESHOLDS, type MissionControlThresholds } from "./config";
import type {
  AccountSummary,
  Briefing,
  BuildFlag,
  BuildQueueSection,
  EnquiryAttention,
  MissionControlData,
  PipelineItem,
  PipelineSection,
  StalledBuildItem,
  TopAction,
} from "./model";

const MINUTE = 60_000;
const DAY = 86_400_000;

/** Active pipeline stages, in canonical order. */
const ACTIVE_STAGES: readonly LifecycleStage[] = ["lead", "qualified", "proposed"];
/** A build item is "in progress" until it is approved or live. */
const IN_PROGRESS_STATUSES = new Set(["queued", "building", "ai_check", "review"]);

const ACCOUNT_PROVENANCE =
  "Measured first-party by TITAN on the live site — daily aggregates, no cookies, no third-party trackers.";

export interface BuildBriefingOptions {
  /** ISO-8601 "now" — supplied explicitly so the engine stays deterministic. */
  now: string;
  thresholds?: MissionControlThresholds;
}

function minutesSince(iso: string, nowMs: number): number {
  return Math.floor((nowMs - Date.parse(iso)) / MINUTE);
}
function daysSince(iso: string, nowMs: number): number {
  return Math.floor((nowMs - Date.parse(iso)) / DAY);
}

/** The most recent stage movement, or creation when history is empty. */
function lastMovementAt(business: MissionControlData["businesses"][number]): string {
  const history = business.stageHistory;
  return history.length > 0 ? history[history.length - 1].enteredAt : business.createdAt;
}

function buildEnquiries(
  data: MissionControlData,
  nameOf: (id: string) => string,
  nowMs: number,
  thresholds: MissionControlThresholds,
): EnquiryAttention[] {
  return data.enquiries
    .filter((enquiry) => enquiry.status === "new" || enquiry.status === "seen")
    .map((enquiry): EnquiryAttention => {
      const ageMinutes = minutesSince(enquiry.createdAt, nowMs);
      const minutesPastSla = Math.max(0, ageMinutes - thresholds.enquirySlaMinutes);
      return {
        enquiryId: enquiry.id,
        businessId: enquiry.businessId,
        businessName: nameOf(enquiry.businessId),
        name: enquiry.name,
        contact: enquiry.contact,
        sourcePage: enquiry.sourcePage,
        createdAt: enquiry.createdAt,
        ageMinutes,
        slaBreached: minutesPastSla > 0,
        minutesPastSla,
        link: `/crm/accounts?enquiry=${enquiry.id}`,
      };
    })
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)); // oldest first
}

function buildPipeline(
  data: MissionControlData,
  nowMs: number,
  thresholds: MissionControlThresholds,
): PipelineSection {
  const active = data.businesses.filter((b) =>
    (ACTIVE_STAGES as readonly string[]).includes(b.stage),
  );
  const byStage = ACTIVE_STAGES.map((stage) => ({
    stage,
    count: active.filter((b) => b.stage === stage).length,
  }));
  const items: PipelineItem[] = active.map((b) => {
    const daysSinceMovement = daysSince(lastMovementAt(b), nowMs);
    return {
      businessId: b.id,
      businessName: b.name,
      stage: b.stage,
      daysSinceMovement,
      stale: daysSinceMovement >= thresholds.pipelineStaleDays,
      link: `/crm/${b.id}`,
    };
  });
  const stale = items
    .filter((item) => item.stale)
    .sort((a, b) => b.daysSinceMovement - a.daysSinceMovement || a.businessId.localeCompare(b.businessId));
  const dealsNeedingAction = items
    .filter((item) => item.stage === "proposed" && item.daysSinceMovement >= thresholds.dealStaleDays)
    .sort((a, b) => b.daysSinceMovement - a.daysSinceMovement || a.businessId.localeCompare(b.businessId));
  return { byStage, total: active.length, stale, dealsNeedingAction };
}

function buildQueue(
  data: MissionControlData,
  nameOf: (id: string) => string,
  nowMs: number,
  thresholds: MissionControlThresholds,
): BuildQueueSection {
  const flags: BuildFlag[] = [];
  for (const build of data.builds) {
    const inProgress = build.items.filter((item: BuildItem) =>
      IN_PROGRESS_STATUSES.has(item.status),
    );
    if (inProgress.length === 0) continue;
    const reviewWaiting: BuildItemKind[] = inProgress
      .filter((item) => item.status === "review")
      .map((item) => item.kind);
    const stalled: StalledBuildItem[] = inProgress
      .map((item) => ({ kind: item.kind, daysStalled: daysSince(item.updatedAt, nowMs) }))
      .filter((item) => item.daysStalled >= thresholds.buildStaleDays);
    flags.push({
      businessId: build.businessId,
      businessName: nameOf(build.businessId),
      inProgressCount: inProgress.length,
      reviewWaiting,
      stalled,
      link: "/crm/build-queue",
    });
  }
  flags.sort(
    (a, b) => b.stalled.length - a.stalled.length || a.businessId.localeCompare(b.businessId),
  );
  return { inProgress: flags, total: flags.length };
}

/** Sum views over rows whose date falls within [nowDay - days, nowDay - offset). */
function sumViewsInWindow(
  rows: readonly SiteMetricRow[],
  nowMs: number,
  fromDaysAgo: number,
  toDaysAgo: number,
): number {
  return rows.reduce((sum, row) => {
    const age = daysSince(`${row.date}T00:00:00.000Z`, nowMs);
    return age >= toDaysAgo && age < fromDaysAgo ? sum + row.views : sum;
  }, 0);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function buildAccounts(
  data: MissionControlData,
  nowMs: number,
  thresholds: MissionControlThresholds,
): AccountSummary[] {
  const period = thresholds.accountPeriodDays;
  const accounts: AccountSummary[] = [];
  for (const publication of data.publications) {
    if (publication.status !== "live") continue;
    const business = data.businesses.find((b) => b.id === publication.businessId);
    if (!business) continue;
    const rows = data.metrics.filter((row) => row.businessId === business.id);
    const visits = rows.reduce((sum, row) => sum + row.views, 0);
    const submits = rows.reduce((sum, row) => sum + row.formSubmits, 0);
    const enquiries = data.enquiries.filter((e) => e.businessId === business.id).length;
    const periodVisits = sumViewsInWindow(rows, nowMs, period, 0);
    const priorVisits = sumViewsInWindow(rows, nowMs, period * 2, period);
    const visitDeltaPercent =
      priorVisits > 0 ? Math.round(((periodVisits - priorVisits) / priorVisits) * 100) : null;
    const notableMove: AccountSummary["notableMove"] =
      visitDeltaPercent === null
        ? null
        : visitDeltaPercent >= thresholds.notableMovePercent
          ? "up"
          : visitDeltaPercent <= -thresholds.notableMovePercent
            ? "down"
            : null;
    accounts.push({
      businessId: business.id,
      businessName: business.name,
      slug: publication.slug,
      visits,
      enquiries,
      conversionPercent: visits > 0 ? round1((submits / visits) * 100) : null,
      periodVisits,
      priorVisits,
      visitDeltaPercent,
      notableMove,
      provenance: ACCOUNT_PROVENANCE,
      link: "/crm/accounts",
    });
  }
  return accounts.sort(
    (a, b) => b.visits - a.visits || a.businessId.localeCompare(b.businessId),
  );
}

function buildTopActions(
  enquiries: EnquiryAttention[],
  pipeline: PipelineSection,
  data: MissionControlData,
  nameOf: (id: string) => string,
  nowMs: number,
  thresholds: MissionControlThresholds,
): TopAction[] {
  const weights = thresholds.weights;
  const candidates: TopAction[] = [];

  for (const enquiry of enquiries) {
    if (enquiry.slaBreached) {
      candidates.push({
        kind: "enquiry_sla",
        score: weights.enquirySla + enquiry.minutesPastSla,
        what: `Respond to ${enquiry.name} (${enquiry.businessName})`,
        why: `${enquiry.minutesPastSla}m past the ${thresholds.enquirySlaMinutes}m speed-to-lead SLA`,
        recommendedAction: `Call or email ${enquiry.contact} now, then mark contacted`,
        link: enquiry.link,
        businessId: enquiry.businessId,
      });
    } else {
      candidates.push({
        kind: "new_enquiry",
        score: weights.newEnquiry + enquiry.ageMinutes,
        what: `Respond to ${enquiry.name} (${enquiry.businessName})`,
        why: `New enquiry ${enquiry.ageMinutes}m ago — still within the ${thresholds.enquirySlaMinutes}m SLA`,
        recommendedAction: `Reply to ${enquiry.contact} fast to keep speed-to-lead`,
        link: enquiry.link,
        businessId: enquiry.businessId,
      });
    }
  }

  for (const deal of pipeline.dealsNeedingAction) {
    candidates.push({
      kind: "deal_stale",
      score: weights.dealStale + deal.daysSinceMovement * 10,
      what: `Follow up ${deal.businessName}`,
      why: `Proposal has not moved in ${deal.daysSinceMovement} days`,
      recommendedAction: "Chase the decision, or update the stage in the CRM",
      link: deal.link,
      businessId: deal.businessId,
    });
  }

  for (const build of data.builds) {
    for (const item of build.items) {
      if (!IN_PROGRESS_STATUSES.has(item.status)) continue;
      const days = daysSince(item.updatedAt, nowMs);
      const label = buildItemLabel(item.kind);
      const businessName = nameOf(build.businessId);
      if (item.status === "review") {
        candidates.push({
          kind: "build_review",
          score: weights.buildReview + days * 10,
          what: `Review ${businessName} — ${label}`,
          why: `${label} is waiting on your approval`,
          recommendedAction: "Approve or send it back in the Build Queue",
          link: "/crm/build-queue",
          businessId: build.businessId,
        });
      } else if (days >= thresholds.buildStaleDays) {
        candidates.push({
          kind: "build_stalled",
          score: weights.buildStalled + days * 10,
          what: `Chase ${businessName} build — ${label}`,
          why: `${label} has not moved in ${days} days`,
          recommendedAction: "Unblock it in the Build Queue",
          link: "/crm/build-queue",
          businessId: build.businessId,
        });
      }
    }
  }

  return candidates
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.businessId.localeCompare(b.businessId) ||
        a.kind.localeCompare(b.kind) ||
        a.link.localeCompare(b.link),
    )
    .slice(0, thresholds.topActionsLimit);
}

/** Build the daily briefing from a snapshot. Pure and deterministic. */
export function buildBriefing(
  data: MissionControlData,
  options: BuildBriefingOptions,
): Briefing {
  const thresholds = options.thresholds ?? DEFAULT_THRESHOLDS;
  const nowMs = Date.parse(options.now);
  const nameById = new Map(data.businesses.map((b) => [b.id, b.name]));
  const nameOf = (id: string) => nameById.get(id) ?? "Unknown business";

  const enquiriesNeedingAttention = buildEnquiries(data, nameOf, nowMs, thresholds);
  const pipeline = buildPipeline(data, nowMs, thresholds);
  const buildQueueSection = buildQueue(data, nameOf, nowMs, thresholds);
  const accounts = buildAccounts(data, nowMs, thresholds);
  const topActions = buildTopActions(
    enquiriesNeedingAttention,
    pipeline,
    data,
    nameOf,
    nowMs,
    thresholds,
  );

  return {
    generatedAt: options.now,
    enquiriesNeedingAttention,
    pipeline,
    buildQueue: buildQueueSection,
    accounts,
    topActions,
    isEmpty: data.businesses.length === 0,
  };
}
