import { describe, expect, it } from "vitest";
import { resolveIndustryDna } from "@/core/industry-dna";

/**
 * Track B content pins: big-ticket trades run on guarantees, deposit
 * protection and honest guide pricing — and several sit inside FCA
 * finance-promotion territory. The pins below are the claims the research
 * verified against primary sources; a regression is TITAN forgetting them.
 */

const CERTIFICATION_PINS: ReadonlyArray<[tradeId: string, scheme: string]> = [
  ["windows-doors", "FENSA"],
  ["conservatories", "FENSA"],
  ["swimming-pools", "SPATA"],
  ["ev-charger-installation", "OZEV"],
  ["battery-storage", "MCS"],
  ["builders-general", "FMB"],
  ["extensions-renovations", "FMB"],
];

describe("Track B — big-ticket considered purchases", () => {
  for (const [tradeId, scheme] of CERTIFICATION_PINS) {
    it(`${tradeId}: operations DNA names ${scheme}`, () => {
      const { matched, dna, tradeSections } = resolveIndustryDna(tradeId);
      expect(matched).toBe(tradeId);
      expect(tradeSections).toContain("operations");
      const text = (dna.operations.certifications ?? [])
        .map((entry) => `${entry.label} ${entry.description ?? ""}`)
        .join(" ");
      expect(text).toContain(scheme);
    });
  }

  it("battery-storage states the certification honestly — never 'legally required'", () => {
    const { dna } = resolveIndustryDna("battery-storage");
    const text = (dna.operations.certifications ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(text).toContain("Neither is a legal requirement");
  });

  it("the 0% VAT deadline carries its expiry date — urgency that auto-expires", () => {
    const { dna } = resolveIndustryDna("battery-storage");
    const triggers = dna.customerPsychology.buyingTriggers ?? [];
    const vat = triggers.find((entry) => entry.label.includes("0% VAT"));
    expect(vat?.description).toContain("31 Mar 2027");
  });

  it("EV grant knowledge encodes who is INELIGIBLE, not just who qualifies", () => {
    const { dna } = resolveIndustryDna("ev-charger-installation");
    const triggers = dna.customerPsychology.buyingTriggers ?? [];
    const grants = triggers.find((entry) => entry.label.includes("Grant"));
    expect(grants?.description).toContain("INELIGIBLE");
  });

  it("builders cost-per-m² banding stays verbatim", () => {
    const { dna } = resolveIndustryDna("builders-general");
    const pages = dna.website.landingPages ?? [];
    const guide = pages.find((entry) => entry.label.includes("cost-per-m²"));
    expect(guide?.value).toBe("£1,650–£4,200/m² banded");
  });

  it("swimming pools carry SPATASHIELD in pounds — the £50k objection-killer", () => {
    const { dna } = resolveIndustryDna("swimming-pools");
    const fears = dna.customerPsychology.fears ?? [];
    const text = fears.map((entry) => `${entry.label} ${entry.description ?? ""}`).join(" ");
    expect(text).toContain("£30k completion bond");
    expect(text).toContain("never imply cover not held");
  });
});
