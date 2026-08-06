/**
 * Command Centre — the facts contract (ADR-057).
 *
 * The Command Centre reasons over one plain, pre-measured snapshot. Every
 * figure in it comes from a real query; the loader (api/load.ts) is the only
 * place that talks to the spine. Composers in this folder are pure functions
 * over this shape so every empty-state branch is unit-testable.
 */

import type { Briefing } from "@/core/mission-control";
import type { SituationAddress } from "@/core/mission-control";

/** One department's honest health, reduced to what the room renders. */
export interface DepartmentGlow {
  id: string;
  label: string;
  /** null = not yet scoreable (rendered dim, never faked). */
  band: "green" | "amber" | "red" | null;
  /** The honest reason when unscoreable, verbatim from the health engine. */
  note: string;
}

/** A pending founder decision, already proposal-shaped (ADR-052). */
export interface PendingDecisionFact {
  requestId: string;
  title: string;
  previewLines: readonly string[];
  tier: string;
  requestedAt: string;
}

/** A narrated recommendation from the decision engine (ADR-050). */
export interface RecommendationFact {
  id: string;
  whatHappened: string;
  recommendedAction: string;
  expectedImpact: string;
  urgency: string;
  riskLevel: string;
  link: string;
}

/** One learning-feed event the timeline may show. */
export interface TimelineFact {
  id: string;
  kind: string;
  occurredAt: string;
  summary: string;
  businessId?: string;
}

/** The whole measured world, as of `now`. */
export interface CommandCentreFacts {
  /** ISO-8601 — injected, never Date.now() (testability). */
  now: string;
  founderName: string;
  briefing: Briefing;
  address: SituationAddress;
  /** Businesses the Brain counts (internal/test rows already excluded). */
  bookSize: number;
  liveAccounts: number;
  /** Non-internal businesses created in the calendar month of `now`. */
  newThisMonth: number;
  /** Measured page views across all sites, all time (site_metrics beacons). */
  measuredVisitsAllTime: number;
  /** Measured page views in the 7 days before `now`. */
  measuredVisitsWeek: number;
  /** Publications currently serving (status "live") across the book. */
  liveSites: number;
  /** Enquiries captured across the book, all time (internal rows excluded). */
  enquiriesAllTime: number;
  /**
   * Revenue is structurally unmeasured today (no revenue table, no payments
   * integration). Stays null until a real measurement path exists — the UI
   * renders the crafted absence, never a zero pretending to be a reading.
   */
  revenue: null | { today: number; week: number; month: number };
  departments: readonly DepartmentGlow[];
  pendingDecisions: readonly PendingDecisionFact[];
  recommendations: readonly RecommendationFact[];
  timeline: readonly TimelineFact[];
}
