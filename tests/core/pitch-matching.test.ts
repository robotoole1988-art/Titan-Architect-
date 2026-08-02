import { describe, expect, it } from "vitest";
import { resolveTradePitch } from "@/core/pitch-intelligence";
import { TRADE_TAXONOMY } from "@/core/trade-taxonomy";

/**
 * THE PITCH PANEL SHOWS THE RIGHT TRADE (ADR-066).
 *
 * `/crm/{id}` opens with a pitch panel the founder reads while on the phone
 * to a prospect: talking points, their pain points, scripted objection
 * handlers, indicative job values. It resolved the pack with a bare
 * `includes()`, so:
 *
 *   "damp-proofing".includes("roof")     -> true   (damp-p-ROOF-ing)
 *   "chimney-fireplaces".includes("chimney") -> true
 *
 * A damp specialist was pitched with storm-damage material, NFRC and
 * CompetentRoofer accreditations, and re-roof job values. A stove fitter the
 * same. Both are worse than saying nothing, because the founder reads them
 * aloud believing they are about this customer's business.
 *
 * Fourth appearance of one defect — inferring a fact from a substring.
 * ADR-059 (accreditations from a trade name), ADR-061 (roofing FAQs on a
 * damp-proofing site), ADR-062 (a CTA's behaviour from its label), this.
 */

describe("the substring trap", () => {
  it("damp-proofing is not roofing", () => {
    // The bug, named. p-ROOF-ing.
    expect(resolveTradePitch("damp-proofing").matched).not.toBe("roofing");
    expect(resolveTradePitch("Damp Proofing").matched).not.toBe("roofing");
    expect(resolveTradePitch("damp proofing & basement tanking").matched).not.toBe(
      "roofing",
    );
  });

  it("a chimney and fireplace fitter is not a roofer", () => {
    // HETAS and Part J, stoves and liners. Nothing to do with re-roofs.
    expect(resolveTradePitch("chimney-fireplaces").matched).not.toBe("roofing");
  });

  it("no accreditation reaches a trade that does not hold it", () => {
    // The concrete harm: the founder reading "NFRC, CompetentRoofer" off the
    // screen to somebody who is neither.
    for (const trade of ["damp-proofing", "chimney-fireplaces", "solicitors"]) {
      const pitch = resolveTradePitch(trade);
      const text = [...pitch.talkingPoints, ...pitch.painPoints].join(" ");
      expect(/NFRC|CompetentRoofer/i.test(text), trade).toBe(false);
    }
  });
});

describe("every taxonomy trade is decided, never guessed", () => {
  it("resolves by id lookup for all 35 trades — no matcher fall-through", () => {
    // A trade missing from the id map falls through to the free-text
    // matcher, which is exactly where the guessing happens. The way to prove
    // no id falls through is that a deliberately hostile label attached to
    // that id cannot change the answer.
    for (const trade of TRADE_TAXONOMY) {
      const byId = resolveTradePitch(trade.id);
      const shouty = resolveTradePitch(trade.id.toUpperCase());
      expect(shouty.matched, trade.id).toBe(byId.matched);
    }
  });

  it("only trades a pack was written for get a specific pack", () => {
    const SPECIFIC: Record<string, string> = {
      roofing: "roofing",
      "driveways-paving": "driveways",
      landscaping: "driveways",
      "tarmac-surfacing": "driveways",
      "artificial-grass": "driveways",
      "plumbing-heating-emergency": "plumbing-heating",
      "boiler-installation": "plumbing-heating",
    };
    for (const trade of TRADE_TAXONOMY) {
      expect(resolveTradePitch(trade.id).matched, trade.id).toBe(
        SPECIFIC[trade.id] ?? "general",
      );
    }
  });

  it("the coverage gap is visible, not hidden", () => {
    // 7 of 35 trades reach a purpose-written pack; the rest are honestly
    // general and the CRM says so. This number is the case for the trade
    // knowledge base — if it silently improved, that would be a guess
    // creeping back in rather than knowledge being written.
    const specific = TRADE_TAXONOMY.filter(
      (trade) => resolveTradePitch(trade.id).matched !== "general",
    ).length;
    expect(specific).toBe(7);
  });
});

describe("free-typed trades still get a sensible pack", () => {
  it("matches on whole words", () => {
    expect(resolveTradePitch("Roofing & Cladding").matched).toBe("roofing");
    expect(resolveTradePitch("block paving specialist").matched).toBe("driveways");
    expect(resolveTradePitch("Gas Safe boiler engineer").matched).toBe(
      "plumbing-heating",
    );
  });

  it("falls back to general rather than to something plausible-looking", () => {
    for (const trade of ["alpaca grooming", "drone surveying", ""]) {
      expect(resolveTradePitch(trade).matched, trade).toBe("general");
    }
  });

  it("keeps the label the founder typed", () => {
    expect(resolveTradePitch("  Damp Proofing  ").tradeLabel).toBe("Damp Proofing");
  });
});
