/**
 * Command Centre — Decisions row mappers (ADR-057, wording per ADR-052).
 *
 * Two streams feed the row: Command Mode pending approvals (gold — the Brain
 * has prepared work and awaits the founder gate) and decision-engine
 * recommendations (gold for opportunity, amber for attention). Wording is
 * ALWAYS proposal-shaped: "I've prepared X — projected Y. Approve?" — never
 * "I have already done X". `isProposalShaped` is the guard the tests pin.
 */

import type { CommandCentreFacts } from "./facts";

export interface DecisionCard {
  key: string;
  /** APPROVE / OPPORTUNITY / ATTENTION — the small-caps eyebrow. */
  eyebrow: string;
  tone: "gold" | "amber";
  /** The proposal sentence — must satisfy isProposalShaped. */
  text: string;
  /** Verbatim preview lines (Command Mode) or evidence context. */
  detail: readonly string[];
  href: string;
  /** Present for Command Mode cards — wired to approve/decline actions. */
  requestId?: string;
  /** Present for recommendation cards — wired to accept/dismiss actions. */
  recommendationId?: string;
}

/**
 * The ADR-052 wording law as a predicate. A card's text passes when it is
 * proposal-shaped: it asks (ends with a question addressed to the founder)
 * and never claims completed unilateral work ("I have already…", "I've
 * increased…", "done."). Kept deliberately strict — a false negative is a
 * wording bug worth fixing, a false positive is a law breach.
 */
export function isProposalShaped(text: string): boolean {
  const claimsCompletedWork =
    /\bI(?:\s+ha(?:ve|d)|['’]ve)\s+(?:already\s+)?(?:increased|decreased|launched|published|sent|changed|deleted|created|spent|moved|executed|done)\b/i.test(
      text,
    ) || /\bI\s+(?:already\s+)?(?:increased|launched|published|sent|deleted|spent|executed)\b/i.test(text);
  const asks = /\?\s*$/.test(text.trim());
  return asks && !claimsCompletedWork;
}

/** Command Mode pending approval → gold card, preview lines verbatim. */
export function mapPendingDecisions(facts: CommandCentreFacts): DecisionCard[] {
  return facts.pendingDecisions.map((pending) => ({
    key: `cmd-${pending.requestId}`,
    eyebrow: "Approve",
    tone: "gold",
    text: `I've prepared: ${pending.title}. Approve?`,
    detail: pending.previewLines,
    href: "/brain",
    requestId: pending.requestId,
  }));
}

/** Decision-engine recommendation → gold (opportunity) or amber (risk). */
export function mapRecommendations(facts: CommandCentreFacts): DecisionCard[] {
  return facts.recommendations.slice(0, 3).map((rec) => ({
    key: `rec-${rec.id}`,
    eyebrow: rec.riskLevel === "high" || rec.urgency === "now" ? "Attention" : "Opportunity",
    tone: rec.riskLevel === "high" || rec.urgency === "now" ? "amber" : "gold",
    text: `${trimTerminal(rec.recommendedAction)} — ${trimTerminal(rec.expectedImpact)}. Shall I?`,
    detail: [rec.whatHappened],
    href: rec.link,
    recommendationId: rec.id,
  }));
}

export function buildDecisionCards(facts: CommandCentreFacts): DecisionCard[] {
  return [...mapPendingDecisions(facts), ...mapRecommendations(facts)];
}

/** The crafted absence for a clear queue — quiet, one line, no card. */
export const EMPTY_DECISIONS_LINE = "Nothing awaits your approval.";

function trimTerminal(text: string): string {
  return text.trim().replace(/[.!]+$/, "");
}
