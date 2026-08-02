import { describe, expect, it } from "vitest";
import { resolveIndustryDna } from "@/core/industry-dna";

/**
 * Vol 3 pins — the paid-acquisition and SEO/GEO law book. These are the
 * claims with dates and legal weight: the DMCC review law, the call-ads
 * sunset, the LSA badge change, the PMax gate, and the honesty stances
 * (schema is not a GEO lever; gating is illegal, not just against policy).
 * Every one is the kind of fact that silently rots — the pins make rot loud.
 */

// Platform knowledge is visible through any trade; use one with no
// trade-level paidAdvertising override for the platform fields.
const platform = () => resolveIndustryDna("damp-proofing").dna;

describe("Vol 3 — paid acquisition law book (platform layer)", () => {
  it("LSA knowledge carries the Google Verified change and its date", () => {
    const text = (platform().paidAdvertising.localServicesAds ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(text).toContain("20 Oct 2025");
    expect(text).toContain("DISCONTINUED");
    expect(text).toContain("3–4 weeks");
  });

  it("call-ads sunset dates are pinned — RSAs with call assets only", () => {
    const entry = (platform().paidAdvertising.googleAds ?? []).find((item) =>
      item.label.includes("Call ads sunset"),
    );
    expect(String(entry?.value)).toContain("Feb 2026");
    expect(String(entry?.value)).toContain("Feb 2027");
  });

  it("the CPL guardrail is the 10–15% of job value rule", () => {
    const entry = (platform().paidAdvertising.googleAds ?? []).find((item) =>
      item.label.includes("CPL guardrail"),
    );
    expect(String(entry?.value)).toContain("10–15%");
  });

  it("PMax is a gated exception with the mirage documented", () => {
    const text = (platform().paidAdvertising.creatives ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(text).toContain("0.3%");
    expect(text).toContain(">£2k/month");
  });

  it("Meta knowledge names the finance-category trap", () => {
    const text = (platform().paidAdvertising.metaAds ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(text).toContain("Financial Products");
    expect(text).toContain("15-mile");
  });
});

describe("Vol 3 — reviews law and GEO honesty (platform layer)", () => {
  it("DMCC: gating is ILLEGAL with the in-force date and fine scale pinned", () => {
    const rules = (platform().aiBehaviour.automationRules ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(rules).toContain("6 April 2025");
    expect(rules).toContain("10% of global turnover");
    const asks = (platform().sales.reviewRequests ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(asks).toContain("illegal under the DMCC Act");
    expect(asks).toContain("Never incentivise");
  });

  it("schema honesty: rich results yes, AI-citation lever no", () => {
    const text = (platform().searchSeo.schema ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(text).toContain("never sold as an AI-citation lever");
    expect(text).toContain("promises nothing");
  });

  it("GEO has exactly three levers and Bing Places is named", () => {
    const text = (platform().searchSeo.contentStrategy ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(text).toContain("no fourth secret");
    const local = (platform().searchSeo.localSeo ?? [])
      .map((entry) => `${entry.label} ${entry.description ?? ""}`)
      .join(" ");
    expect(local).toContain("Bing Places");
  });
});

describe("Vol 3 — per-trade acquisition postures", () => {
  it("emergency plumbing is LSA-first; solar and dental have no UK LSA route", () => {
    const plumbing = resolveIndustryDna("plumbing-heating-emergency").dna;
    expect(
      (plumbing.paidAdvertising.localServicesAds ?? []).some((entry) =>
        entry.label.includes("LSA-first"),
      ),
    ).toBe(true);
    const solar = resolveIndustryDna("solar-pv").dna;
    expect(
      (solar.paidAdvertising.googleAds ?? []).some((entry) =>
        entry.label.includes("no UK solar LSA"),
      ),
    ).toBe(true);
    const dental = resolveIndustryDna("dentists-private").dna;
    expect(
      (dental.paidAdvertising.googleAds ?? []).some((entry) =>
        entry.label.includes("no UK LSA route"),
      ),
    ).toBe(true);
  });

  it("roofing carries the lead-quality health warning with verbatim numbers", () => {
    const roofing = resolveIndustryDna("roofing").dna;
    const text = (roofing.paidAdvertising.googleAds ?? [])
      .map((entry) => `${entry.label} ${String(entry.value ?? "")} ${entry.description ?? ""}`)
      .join(" ");
    expect(text).toContain("£35–£80");
    expect(text).toContain("differ 10x");
  });

  it("dental Meta economics are priced per booked patient, not per lead", () => {
    const dental = resolveIndustryDna("dentists-private").dna;
    const text = (dental.paidAdvertising.metaAds ?? [])
      .map((entry) => `${entry.label} ${String(entry.value ?? "")} ${entry.description ?? ""}`)
      .join(" ");
    expect(text).toContain("£250–£450");
    expect(text).toContain("never CPL");
  });
});
