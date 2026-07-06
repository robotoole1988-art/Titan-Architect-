/**
 * Mission Control thresholds + ranking weights (ADR-042).
 *
 * ONE place for every tunable in the briefing: the speed-to-lead SLA, what
 * counts as "stale", the account comparison window, and the weights that rank
 * "today's top actions". Deterministic-first — no reasoning, just playbooks —
 * so the founder can tune these as the surface earns its keep.
 */

export interface MissionControlWeights {
  /** An uncontacted enquiry past its SLA — the most urgent thing. */
  enquirySla: number;
  /** A fresh, uncontacted enquiry still inside the SLA (speed-to-lead). */
  newEnquiry: number;
  /** A build item that has not moved past its target. */
  buildStalled: number;
  /** A build item sitting in review, waiting on the founder's approval. */
  buildReview: number;
  /** A proposal that has gone stale with no movement. */
  dealStale: number;
}

export interface MissionControlThresholds {
  /** Speed-to-lead SLA: an uncontacted enquiry older than this has breached. */
  enquirySlaMinutes: number;
  /** A pipeline business with no stage movement in this many days is stale. */
  pipelineStaleDays: number;
  /** A `proposed` business stale this long is a deal needing a next action. */
  dealStaleDays: number;
  /** A build item not updated in this many days is stalled / past target. */
  buildStaleDays: number;
  /** The account comparison window: this period vs the one before it. */
  accountPeriodDays: number;
  /** A period-over-period visit move of at least this % is "notable". */
  notableMovePercent: number;
  /** How many actions the "today's top actions" shortlist holds. */
  topActionsLimit: number;
  weights: MissionControlWeights;
}

export const DEFAULT_THRESHOLDS: MissionControlThresholds = {
  enquirySlaMinutes: 60,
  pipelineStaleDays: 7,
  dealStaleDays: 7,
  buildStaleDays: 3,
  accountPeriodDays: 7,
  notableMovePercent: 25,
  topActionsLimit: 6,
  weights: {
    enquirySla: 900,
    newEnquiry: 400,
    buildStalled: 500,
    buildReview: 300,
    dealStale: 350,
  },
};
