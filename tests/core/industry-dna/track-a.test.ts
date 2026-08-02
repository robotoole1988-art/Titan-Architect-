import { describe, expect, it } from "vitest";
import { resolveIndustryDna } from "@/core/industry-dna";

/**
 * Track A content pins: the compliance trades carry their legal MUSTs.
 *
 * These are the facts the CRM will put in front of the founder mid-pitch
 * and the generator will gate pages on — each one is pinned to the scheme
 * the research verified against primary sources. A regression here is not
 * a style bug; it is TITAN forgetting the law.
 */

const CERTIFICATION_PINS: ReadonlyArray<[tradeId: string, scheme: string]> = [
  ["plumbing-heating-emergency", "Gas Safe"],
  ["boiler-installation", "Gas Safe"],
  ["hvac-air-conditioning", "F-Gas"],
  ["electricians", "Part P"],
  ["damp-proofing", "PCA"],
  ["chimney-fireplaces", "HETAS"],
];

describe("Track A — emergency & compliance trades", () => {
  for (const [tradeId, scheme] of CERTIFICATION_PINS) {
    it(`${tradeId}: operations DNA carries the ${scheme} requirement`, () => {
      const { matched, dna, tradeSections } = resolveIndustryDna(tradeId);
      expect(matched).toBe(tradeId);
      expect(tradeSections).toContain("operations");
      const certifications = dna.operations.certifications ?? [];
      const text = certifications
        .map((entry) => `${entry.label} ${entry.description ?? ""}`)
        .join(" ");
      expect(text).toContain(scheme);
    });
  }

  it("every Track A trade populates the conversion-critical sections", () => {
    for (const [tradeId] of CERTIFICATION_PINS) {
      const { tradeSections } = resolveIndustryDna(tradeId);
      for (const required of ["services", "customerPsychology", "website", "operations"] as const) {
        expect(tradeSections, `${tradeId} missing ${required}`).toContain(required);
      }
    }
  });

  it("no Track A trade invents business-intelligence knowledge — no research, no content", () => {
    for (const [tradeId] of CERTIFICATION_PINS) {
      const { tradeSections } = resolveIndustryDna(tradeId);
      expect(tradeSections).not.toContain("businessIntelligence");
    }
  });

  it("price figures stay verbatim from the research — EICR banding spot-check", () => {
    const { dna } = resolveIndustryDna("electricians");
    const services = dna.services.individualServices ?? [];
    const eicr = services.find((entry) => entry.label.includes("EICR"));
    expect(eicr?.value).toBe("'from £69–79' banded by bedrooms");
  });
});
