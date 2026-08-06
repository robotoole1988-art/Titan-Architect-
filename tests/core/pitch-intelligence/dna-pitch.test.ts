import { describe, expect, it } from "vitest";
import { deriveBudgetGuidance, resolveTradePitch } from "@/core/pitch-intelligence";
import { TRADE_TAXONOMY } from "@/core/trade-taxonomy";

/**
 * The pitch ladder's new rung: trades without a purpose-written pack draw
 * sourced material from the knowledge base (ADR-067) instead of the
 * general pack. Curated packs still win; unknown free text still falls to
 * general; and the substring law holds at this layer too — the knowledge
 * base resolves by exact id or the blessed matcher only (ADR-066).
 */

describe("knowledge-derived pitch material", () => {
  it("an uncurated trade pitches from its own knowledge — electricians get Part P and EICR, not platitudes", () => {
    const pitch = resolveTradePitch("electricians");
    expect(pitch.matched).toBe("knowledge");
    const talking = pitch.talkingPoints.join(" ");
    expect(talking).toContain("Part P");
    expect(JSON.stringify(pitch.averageJobValues)).toMatch(/£69–79|EICR/);
  });

  it("damp-proofing pitches PCA — and can never pitch NFRC (the four-times bug, pitch layer)", () => {
    const pitch = resolveTradePitch("damp-proofing");
    expect(pitch.matched).toBe("knowledge");
    const text = [...pitch.talkingPoints, ...pitch.painPoints].join(" ");
    expect(text).toContain("PCA");
    expect(/NFRC|CompetentRoofer/i.test(text)).toBe(false);
  });

  it("free text reaches knowledge through the blessed matcher only", () => {
    const pitch = resolveTradePitch("Damp Proofing");
    expect(pitch.matched).toBe("knowledge");
    expect(pitch.talkingPoints.join(" ")).toContain("PCA");
  });

  it("curated packs still win — roofing keeps its purpose-written pack", () => {
    expect(resolveTradePitch("roofing").matched).toBe("roofing");
    expect(resolveTradePitch("Emergency Roofing & Drainage").matched).toBe("roofing");
    expect(resolveTradePitch("plumbing-heating-emergency").matched).toBe(
      "plumbing-heating",
    );
  });

  it("objection handlers are never derived — the research wrote none, so none are invented", () => {
    const knowledge = resolveTradePitch("solicitors");
    const general = resolveTradePitch("Wedding Photography");
    expect(knowledge.matched).toBe("knowledge");
    expect(knowledge.objections).toEqual(general.objections);
  });

  it("unknown free text still falls to the general pack", () => {
    expect(resolveTradePitch("Wedding Photography").matched).toBe("general");
  });

  it("every taxonomy trade now pitches better than general", () => {
    for (const trade of TRADE_TAXONOMY) {
      const pitch = resolveTradePitch(trade.id);
      expect(pitch.matched, trade.id).not.toBe("general");
      expect(pitch.talkingPoints.length, trade.id).toBeGreaterThanOrEqual(2);
      expect(pitch.painPoints.length, trade.id).toBeGreaterThanOrEqual(2);
      expect(pitch.objections.length, trade.id).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("budget guidance — sourced lines, never computed numbers", () => {
  it("every taxonomy trade gets budget lines — the platform floor law reaches all 35", () => {
    // The merged record's field-level merge means a trade either wrote its
    // own budget research or inherits the Vol 3 platform floors. Either way
    // the founder is never on the phone with nothing sourced to say about
    // money.
    for (const trade of TRADE_TAXONOMY) {
      const guidance = deriveBudgetGuidance(trade.id);
      expect(guidance, trade.id).not.toBeNull();
      expect(guidance!.lines.length, trade.id).toBeGreaterThanOrEqual(1);
      expect(guidance!.tradeId, trade.id).toBe(trade.id);
    }
  });

  it("the lines carry the Vol 3 floor discipline, not invented arithmetic", () => {
    // Format-only law: the function may surface a sourced sentence
    // containing figures, but the figures exist verbatim in the knowledge
    // base. The sub-£500 refusal line is the canonical platform entry.
    const guidance = deriveBudgetGuidance("electricians");
    expect(guidance).not.toBeNull();
    expect(guidance!.lines.join(" ")).toMatch(/£500|CPL|10–15%/);
  });

  it("unknown free text is silent — no budget without a matched trade", () => {
    expect(deriveBudgetGuidance("alpaca grooming")).toBeNull();
    expect(deriveBudgetGuidance("")).toBeNull();
  });
});
