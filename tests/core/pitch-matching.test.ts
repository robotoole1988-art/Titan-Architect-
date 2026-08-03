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

  it("curated packs where they were written; sourced knowledge everywhere else", () => {
    // The knowledge base (ADR-067) closed the gap this suite used to pin:
    // 7 assignments reach a purpose-written pack, and the other 28 draw
    // sourced per-trade material — never a guess, never a substring.
    const CURATED: Record<string, string> = {
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
        CURATED[trade.id] ?? "knowledge",
      );
    }
  });

  it("no taxonomy trade falls to the general pack — and the source is named, not guessed", () => {
    // The old pin here held the number at 7-of-35 so the gap stayed
    // VISIBLE until knowledge was actually written (ADR-067). It has been:
    // every record is provenance-gated, so this improvement is written
    // knowledge, not a guess creeping back in. The general pack survives
    // for free-typed trades outside the taxonomy only.
    for (const trade of TRADE_TAXONOMY) {
      expect(resolveTradePitch(trade.id).matched, trade.id).not.toBe("general");
    }
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
