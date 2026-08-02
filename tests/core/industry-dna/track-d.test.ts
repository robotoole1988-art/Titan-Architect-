import { describe, expect, it } from "vitest";
import { resolveIndustryDna } from "@/core/industry-dna";

/**
 * Track D content pins. The clearance trio's EA registration law and the
 * automotive trio's warranty expectation are the load-bearing claims; the
 * vetting honesty line (never claim enhanced DBS for domestic) is an
 * ADR-059 case in miniature.
 */

describe("Track D — booked van services", () => {
  it("the clearance trio all carry the EA waste-carrier law", () => {
    for (const tradeId of ["house-clearance", "garage-clearance", "waste-removal"]) {
      const { matched, dna } = resolveIndustryDna(tradeId);
      expect(matched).toBe(tradeId);
      const text = (dna.operations.certifications ?? [])
        .map((entry) => `${entry.label} ${entry.description ?? ""}`)
        .join(" ");
      expect(text, tradeId).toContain("EA upper-tier waste carrier");
      expect(text, tradeId).toContain("CBDU");
    }
  });

  it("the clearance trio warn on the householder duty of care with verbatim penalties", () => {
    const { dna } = resolveIndustryDna("house-clearance");
    const fears = (dna.customerPsychology.fears ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(fears).toContain("£600");
    expect(fears).toContain("S.C.R.A.P.");
  });

  it("the automotive trio all state the 12-month/12,000-mile warranty expectation", () => {
    for (const tradeId of ["mobile-mechanic", "garage-repairs", "mot-servicing"]) {
      const { matched, dna } = resolveIndustryDna(tradeId);
      expect(matched).toBe(tradeId);
      const trust = (dna.customerPsychology.trustFactors ?? [])
        .map((entry) => `${entry.label} ${entry.description ?? ""}`)
        .join(" ");
      expect(trust, tradeId).toContain("12-month/12,000-mile");
    }
  });

  it("cleaning vetting knowledge carries the honesty line: never claim enhanced DBS", () => {
    const { dna } = resolveIndustryDna("domestic-commercial-cleaning");
    const trust = (dna.customerPsychology.trustFactors ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(trust).toContain("never claim enhanced DBS");
  });

  it("carpet cleaning's calculator is a lead magnet with a guide-only label", () => {
    const { dna } = resolveIndustryDna("carpet-cleaning");
    const forms = (dna.website.forms ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(forms).toContain("guide only");
  });

  it("detailing scarcity is qualified as genuine — booking pressure obeys ADR-059", () => {
    const { dna } = resolveIndustryDna("car-detailing");
    const strategy = (dna.website.conversionStrategy ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(strategy).toContain("genuine scarcity");
  });
});
