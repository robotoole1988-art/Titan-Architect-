import { describe, expect, it } from "vitest";
import { resolveIndustryDna } from "@/core/industry-dna";

/**
 * Track C content pins: low-regulation trades where trust is built from
 * verifiable proof and the anti-rogue counter-position. The pins protect
 * the claims that do the selling — and the honesty stances that make them
 * safe to sell.
 */

const TRACK_C_IDS = [
  "landscaping",
  "tree-surgery",
  "artificial-grass",
  "tarmac-surfacing",
  "brickwork",
  "exterior-cleaning",
  "painting-decorating",
] as const;

describe("Track C — outdoor / visual transformation trades", () => {
  it("every Track C trade resolves with website knowledge populated", () => {
    for (const tradeId of TRACK_C_IDS) {
      const { matched, tradeSections } = resolveIndustryDna(tradeId);
      expect(matched).toBe(tradeId);
      expect(tradeSections, `${tradeId} missing website`).toContain("website");
    }
  });

  it("tarmac carries the anti-rogue block as a mandatory element", () => {
    const { dna } = resolveIndustryDna("tarmac-surfacing");
    const text = [
      ...(dna.website.conversionStrategy ?? []),
      ...(dna.customerPsychology.fears ?? []),
    ]
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(text).toContain("anti-rogue");
    expect(text).toContain("leftover tarmac");
  });

  it("tree surgery states credentials as numbers, not badges", () => {
    const { dna } = resolveIndustryDna("tree-surgery");
    const trust = (dna.customerPsychology.trustFactors ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(trust).toContain("ArbAC");
    expect(trust).toContain("NPTC");
  });

  it("exterior cleaning ships the regrowth guarantee with its honest window", () => {
    const { dna } = resolveIndustryDna("exterior-cleaning");
    const guarantees = (dna.operations.serviceGuarantees ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(guarantees).toContain("re-treat");
    expect(guarantees).toContain("2–4 years");
  });

  it("painting anchors spraying against replacement with verbatim figures", () => {
    const { dna } = resolveIndustryDna("painting-decorating");
    const premium = (dna.services.premiumServices ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(premium).toContain("£1.5–7k");
    expect(premium).toContain("£12–25k");
  });

  it("landscaping guide pricing stays as project bands, never day rates", () => {
    const { dna } = resolveIndustryDna("landscaping");
    const strategy = (dna.website.conversionStrategy ?? [])
      .map((entry) => `${entry.label} ${String(entry.value ?? "")}`)
      .join(" ");
    expect(strategy).toContain("never day rates");
    expect(strategy).toContain("£80–100/m²");
  });
});
