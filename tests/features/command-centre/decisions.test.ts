/**
 * ADR-052 wording law, pinned for the Command Centre's Decisions row:
 * proposal-shaped always — "I've prepared X — projected Y. Approve?" —
 * never "I have already done X".
 */

import { describe, expect, it } from "vitest";
import {
  buildDecisionCards,
  EMPTY_DECISIONS_LINE,
  isProposalShaped,
  mapPendingDecisions,
  mapRecommendations,
} from "@/features/command-centre/model/decisions";
import { makeFacts } from "./fixture";

describe("decision wording is always proposal-shaped (ADR-052)", () => {
  it("accepts the canonical proposal sentence", () => {
    expect(
      isProposalShaped(
        "I've prepared a £250 increase — projected +£4,800 this week. Approve?",
      ),
    ).toBe(true);
  });

  it("rejects claims of completed unilateral work", () => {
    expect(isProposalShaped("I have already increased the Google budget by £250?")).toBe(false);
    expect(isProposalShaped("I've launched the campaign. Approve?")).toBe(false);
    expect(isProposalShaped("I increased the budget — projected +£4,800. Approve?")).toBe(false);
  });

  it("rejects statements that do not ask", () => {
    expect(isProposalShaped("A budget increase is ready.")).toBe(false);
  });

  it("maps pending commands to gold cards whose text passes the guard", () => {
    const cards = mapPendingDecisions(
      makeFacts({
        pendingDecisions: [
          {
            requestId: "req-1",
            title: "a £250 budget increase for Bournemouth roofing",
            previewLines: ["Google Ads daily budget: £30 → £38"],
            tier: "approval_required",
            requestedAt: "2026-07-26T09:00:00.000Z",
          },
        ],
      }),
    );
    expect(cards).toHaveLength(1);
    expect(cards[0].tone).toBe("gold");
    expect(cards[0].eyebrow).toBe("Approve");
    expect(cards[0].text).toBe(
      "I've prepared: a £250 budget increase for Bournemouth roofing. Approve?",
    );
    expect(isProposalShaped(cards[0].text)).toBe(true);
    expect(cards[0].detail).toEqual(["Google Ads daily budget: £30 → £38"]);
  });

  it("maps recommendations to gold opportunity or amber attention", () => {
    const cards = mapRecommendations(
      makeFacts({
        recommendations: [
          {
            id: "rec-1",
            whatHappened: "Five customers have no review requests out.",
            recommendedAction: "Request Google reviews from 5 customers",
            expectedImpact: "likely local-visibility lift within weeks",
            urgency: "soon",
            riskLevel: "low",
            link: "/crm",
          },
          {
            id: "rec-2",
            whatHappened: "An enquiry is ageing past SLA.",
            recommendedAction: "Reply to the Summit enquiry",
            expectedImpact: "keeps speed-to-lead inside the promise",
            urgency: "now",
            riskLevel: "high",
            link: "/crm",
          },
        ],
      }),
    );
    expect(cards[0].tone).toBe("gold");
    expect(cards[0].eyebrow).toBe("Opportunity");
    expect(cards[1].tone).toBe("amber");
    expect(cards[1].eyebrow).toBe("Attention");
    for (const card of cards) {
      expect(isProposalShaped(card.text)).toBe(true);
    }
  });

  it("renders the crafted absence when the queue is clear", () => {
    expect(buildDecisionCards(makeFacts())).toHaveLength(0);
    expect(EMPTY_DECISIONS_LINE).toBe("Nothing awaits your approval.");
  });
});
