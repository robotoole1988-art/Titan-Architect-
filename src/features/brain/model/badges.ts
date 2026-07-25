/**
 * The exceptional-badge predicates (ADR-056 Decision 3) — pure, so the
 * normative table is testable and rolls out mechanically in M2. A badge is
 * a signal, not a decoration: these functions decide when one is earned.
 */

export type RecommendationBadge = "now" | "high-risk" | null;

/** Recommendation cards: NOW, or high risk when it isn't already now. */
export function recommendationBadge(
  urgency: string,
  riskLevel: string,
): RecommendationBadge {
  if (urgency === "now") return "now";
  if (riskLevel === "high") return "high-risk";
  return null;
}

/** Command history: only failure and partiality are signals. */
export function historyStatusBadged(status: string): boolean {
  return status === "failed" || status === "partial";
}

/** Health tiles: the dot marks a department needing the eye. */
export function healthDotVisible(scoreable: boolean, band: string): boolean {
  return scoreable && band !== "green";
}

/** Health trend: movement only — never a flat zero. */
export function trendVisible(
  trend: { delta: number; direction: string } | null | undefined,
): boolean {
  return Boolean(trend && trend.direction !== "flat" && trend.delta !== 0);
}

/** Ask answers: uncertainty is the signal; confidence is the default. */
export function confidenceBadged(confidence: string): boolean {
  return confidence !== "high";
}
