/**
 * Mission Control — the briefing shapes (ADR-042).
 *
 * `MissionControlData` is the plain input snapshot; whoever assembles it (today
 * the feature reads the Business Spine; tomorrow the memory spine re-points it)
 * is a separate concern from the pure engine. `Briefing` is the output the
 * surface renders — five sections plus a ranked shortlist, every figure real.
 */

import type {
  Build,
  Business,
  BuildItemKind,
  Enquiry,
  LifecycleStage,
  Publication,
  SiteMetricRow,
} from "@/core/business";

/** The read-only snapshot the engine reasons over. No repositories, ever. */
export interface MissionControlData {
  businesses: readonly Business[];
  enquiries: readonly Enquiry[];
  builds: readonly Build[];
  /** Live publications (the engine also defends by filtering to `live`). */
  publications: readonly Publication[];
  metrics: readonly SiteMetricRow[];
}

/** An uncontacted enquiry, oldest first, with its speed-to-lead SLA flag. */
export interface EnquiryAttention {
  enquiryId: string;
  businessId: string;
  businessName: string;
  name: string;
  contact: string;
  sourcePage: string;
  createdAt: string;
  ageMinutes: number;
  slaBreached: boolean;
  /** 0 when still within SLA. */
  minutesPastSla: number;
  link: string;
}

export interface PipelineStageCount {
  stage: LifecycleStage;
  count: number;
}

export interface PipelineItem {
  businessId: string;
  businessName: string;
  stage: LifecycleStage;
  daysSinceMovement: number;
  stale: boolean;
  link: string;
}

export interface PipelineSection {
  /** Active stages (lead → qualified → proposed), canonical order. */
  byStage: PipelineStageCount[];
  total: number;
  /** Active businesses with no stage movement past the threshold. */
  stale: PipelineItem[];
  /** Stale `proposed` businesses — a deal needs a next action. */
  dealsNeedingAction: PipelineItem[];
}

export interface StalledBuildItem {
  kind: BuildItemKind;
  daysStalled: number;
}

export interface BuildFlag {
  businessId: string;
  businessName: string;
  inProgressCount: number;
  /** Items sitting in review, waiting on the founder gate. */
  reviewWaiting: BuildItemKind[];
  /** In-progress items not updated past the target. */
  stalled: StalledBuildItem[];
  link: string;
}

export interface BuildQueueSection {
  inProgress: BuildFlag[];
  total: number;
}

/** A live account's real, first-party numbers with provenance. */
export interface AccountSummary {
  businessId: string;
  businessName: string;
  slug: string;
  visits: number;
  enquiries: number;
  /** Null — never invented — when there are no measured visits. */
  conversionPercent: number | null;
  periodVisits: number;
  priorVisits: number;
  /** Null when there is no prior-period baseline to compare against. */
  visitDeltaPercent: number | null;
  notableMove: "up" | "down" | null;
  provenance: string;
  link: string;
}

export type TopActionKind =
  | "enquiry_sla"
  | "new_enquiry"
  | "build_stalled"
  | "build_review"
  | "deal_stale";

/** One ranked recommendation: what, why, the action, and a link to the record. */
export interface TopAction {
  kind: TopActionKind;
  /** Deterministic ranking score — higher is more urgent. */
  score: number;
  what: string;
  why: string;
  recommendedAction: string;
  link: string;
  businessId: string;
}

export interface Briefing {
  generatedAt: string;
  enquiriesNeedingAttention: EnquiryAttention[];
  pipeline: PipelineSection;
  buildQueue: BuildQueueSection;
  accounts: AccountSummary[];
  topActions: TopAction[];
  /** True when there is no business data at all — an honest blank slate. */
  isEmpty: boolean;
}
