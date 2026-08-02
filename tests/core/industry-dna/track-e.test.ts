import { describe, expect, it } from "vitest";
import { resolveIndustryDna, industryDnaGapTradeIds } from "@/core/industry-dna";

/**
 * Track E pins — the SRA rules are the strictest MUSTs in the product, and
 * the coverage bookkeeping pin below is the whole-knowledge-base state: the
 * gap list names exactly the trades still unauthored, and shrinks as they
 * land. If a trade is added to the taxonomy without knowledge, this test
 * makes the silence visible instead of silent.
 */

describe("Track E — solicitors", () => {
  it("resolves with the live-badge law — a static SRA badge is non-compliant", () => {
    const { matched, dna } = resolveIndustryDna("solicitors");
    expect(matched).toBe("solicitors");
    const trust = (dna.website.trustSignals ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(trust).toContain("live Yoshki embed");
    expect(trust).toContain("NON-COMPLIANT");
    expect(trust).toContain("CLC");
  });

  it("price calculators carry the zero contact-gating rule", () => {
    const { dna } = resolveIndustryDna("solicitors");
    const strategy = (dna.website.conversionStrategy ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(strategy).toContain("ZERO contact-gating");
  });

  it("the pre-publish SRA lint is an automation rule, publish-blocking", () => {
    const { dna } = resolveIndustryDna("solicitors");
    const rules = (dna.aiBehaviour.automationRules ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(rules).toContain("publish blocked");
  });
});

describe("knowledge-base coverage state", () => {
  it("EVERY taxonomy trade has a knowledge record — the gap is closed and stays closed", () => {
    // A trade added to the taxonomy without knowledge fails here loudly,
    // instead of silently falling back to platform-only DNA.
    expect([...industryDnaGapTradeIds()]).toEqual([]);
  });
});
