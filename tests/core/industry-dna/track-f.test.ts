import { describe, expect, it } from "vitest";
import { resolveIndustryDna } from "@/core/industry-dna";

/**
 * Track F pins — the Vol 1 trades, including the two original demo trades
 * and the two clinical/regulated templates where the compliance linter was
 * born. The dental POM hard-block and the roofing never-again note are the
 * knowledge base remembering the product's own history.
 */

describe("Track F — the Vol 1 trades", () => {
  it("roofing: response promises render only when operationally true", () => {
    const { matched, dna } = resolveIndustryDna("roofing");
    expect(matched).toBe("roofing");
    const emergency = (dna.services.emergencyServices ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(emergency).toContain("ONLY if operationally true");
  });

  it("roofing: the trust stack is gated on verified membership — the demo-site lesson", () => {
    const { dna } = resolveIndustryDna("roofing");
    const trust = (dna.website.trustSignals ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(trust).toContain("verified membership");
    expect(trust).toContain("never again");
  });

  it("driveways: 'show the boring bits' is the premium signal", () => {
    const { matched, dna } = resolveIndustryDna("driveways-paving");
    expect(matched).toBe("driveways-paving");
    const trust = (dna.customerPsychology.trustFactors ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(trust).toContain("SuDS");
  });

  it("solar: the calculator shows a range BEFORE asking for contact details", () => {
    const { matched, dna } = resolveIndustryDna("solar-pv");
    expect(matched).toBe("solar-pv");
    const forms = (dna.website.forms ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(forms).toContain("BEFORE asking for contact details");
  });

  it("solar: MCS renders only with a verified number", () => {
    const { dna } = resolveIndustryDna("solar-pv");
    const certifications = (dna.operations.certifications ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(certifications).toContain("VERIFIED MCS number");
  });

  it("dental: the clinical lint hard-blocks POM brand names and unearned titles", () => {
    const { matched, dna } = resolveIndustryDna("dentists-private");
    expect(matched).toBe("dentists-private");
    const rules = (dna.aiBehaviour.automationRules ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(rules).toContain("hard-blocked");
    expect(rules).toContain("GDC specialist list");
  });

  it("dental: GDC and CQC display duties are operations knowledge", () => {
    const { dna } = resolveIndustryDna("dentists-private");
    const certifications = (dna.operations.certifications ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(certifications).toContain("GDC number");
    expect(certifications).toContain("21 days");
  });
});
