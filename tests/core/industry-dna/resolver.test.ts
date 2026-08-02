import { describe, expect, it } from "vitest";
import {
  DNA_SECTION_KEYS,
  industryDnaCoveredTradeIds,
  industryDnaGapTradeIds,
  resolveIndustryDna,
} from "@/core/industry-dna";
import { TRADE_TAXONOMY, getTradeDefinition } from "@/core/trade-taxonomy";

/**
 * The matching law (ADR-062/066): knowledge resolves by EXACT taxonomy id,
 * or by the taxonomy's own conservative matcher for free text — never by
 * substring logic local to this module. We have been bitten four times by
 * `"damp-proofing".includes("roof")`-class bugs; the knowledge base does
 * not become the fifth.
 */

describe("resolveIndustryDna — matching", () => {
  it("resolves an exact taxonomy id", () => {
    const resolved = resolveIndustryDna("damp-proofing");
    expect(resolved.matched).toBe("damp-proofing");
    expect(resolved.tradeSections.length).toBeGreaterThan(0);
  });

  it("damp-proofing NEVER resolves through 'roof' — the four-times bug", () => {
    const resolved = resolveIndustryDna("damp-proofing");
    expect(resolved.matched).toBe("damp-proofing");
    expect(resolved.matched).not.toBe("roofing");
  });

  it("resolves every covered trade by its taxonomy LABEL via the blessed matcher", () => {
    for (const id of industryDnaCoveredTradeIds()) {
      const definition = getTradeDefinition(id);
      expect(definition, `taxonomy definition for ${id}`).toBeTruthy();
      const resolved = resolveIndustryDna(definition!.label);
      expect(resolved.matched, `label "${definition!.label}"`).toBe(id);
    }
  });

  it("unknown trades fall back to platform knowledge, honestly labelled", () => {
    const resolved = resolveIndustryDna("underwater basket weaving");
    expect(resolved.matched).toBeNull();
    expect(resolved.tradeSections).toEqual([]);
    // Platform knowledge still serves — general truths, not trade claims.
    expect(
      resolved.dna.customerPsychology.trustFactors?.some((entry) =>
        entry.label.includes("Numbers beat logos"),
      ),
    ).toBe(true);
  });
});

describe("resolveIndustryDna — merge semantics", () => {
  it("platform fills the fields the trade record leaves undefined", () => {
    const resolved = resolveIndustryDna("plumbing-heating-emergency");
    // The plumbing record defines no website.trustSignals — the platform's
    // badge-registry law must show through.
    expect(
      resolved.dna.website.trustSignals?.some((entry) =>
        entry.label.includes("Badge registry"),
      ),
    ).toBe(true);
  });

  it("the trade record wins field-by-field, without list concatenation", () => {
    const resolved = resolveIndustryDna("plumbing-heating-emergency");
    const strategy = resolved.dna.website.conversionStrategy ?? [];
    // Trade-defined field: exactly the trade's entries, platform's not mixed in.
    expect(strategy.some((entry) => entry.label.includes("Hourly rate table"))).toBe(true);
    expect(strategy.some((entry) => entry.label.includes("Disclosure modules"))).toBe(false);
  });

  it("merged sections union their sources", () => {
    const resolved = resolveIndustryDna("plumbing-heating-emergency");
    const sources = (resolved.dna.website.extensions?.sources ?? []) as string[];
    expect(sources.some((source) => source.includes("Platform layer") || source.includes("Synthesis"))).toBe(true);
    expect(sources.some((source) => source.includes("Plumbing"))).toBe(true);
  });
});

describe("coverage bookkeeping", () => {
  it("covered + gap = the whole taxonomy, with no overlap", () => {
    const covered = new Set(industryDnaCoveredTradeIds());
    const gap = industryDnaGapTradeIds();
    expect(covered.size + gap.length).toBe(TRADE_TAXONOMY.length);
    for (const id of gap) expect(covered.has(id)).toBe(false);
  });

  it("every covered id is a real taxonomy id — no orphan knowledge", () => {
    const taxonomyIds = new Set(TRADE_TAXONOMY.map((trade) => trade.id));
    for (const id of industryDnaCoveredTradeIds()) {
      expect(taxonomyIds.has(id), `orphan DNA record "${id}"`).toBe(true);
    }
  });

  it("exposes the twelve section keys in specification order", () => {
    expect(DNA_SECTION_KEYS).toHaveLength(12);
    expect(DNA_SECTION_KEYS[0]).toBe("businessIdentity");
    expect(DNA_SECTION_KEYS[11]).toBe("aiBehaviour");
  });
});
