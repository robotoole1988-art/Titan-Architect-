import { describe, expect, it } from "vitest";
import {
  PRICING_CATALOGUE,
  UK_VAT_RATE,
  computeDeal,
  defaultDealForPackage,
  getPricedService,
  type Deal,
} from "@/core/pricing";

describe("pricing catalogue (ADR-026)", () => {
  it("lists TITAN's six sellable services with placeholder prices", () => {
    expect(PRICING_CATALOGUE.map((service) => service.id)).toEqual([
      "lead_generation",
      "website_build",
      "seo_management",
      "gbp_management",
      "meta_ads_management",
      "ai_search_optimisation",
    ]);
    for (const service of PRICING_CATALOGUE) {
      expect(service.defaultSetupFee, service.id).toBeGreaterThanOrEqual(0);
      expect(service.defaultMonthlyFee, service.id).toBeGreaterThanOrEqual(0);
      expect(service.label.length).toBeGreaterThan(0);
    }
    expect(getPricedService("lead_generation")?.flagship).toBe(true);
  });

  it("pre-fills a deal from the catalogue", () => {
    const deal = defaultDealForPackage("lead_generation");
    const service = getPricedService("lead_generation")!;
    expect(deal.packageType).toBe("lead_generation");
    expect(deal.setupFee).toBe(service.defaultSetupFee);
    expect(deal.monthlyManagementFee).toBe(service.defaultMonthlyFee);
    expect(deal.monthlyAdSpend).toBeGreaterThan(0);
    expect(deal.includedServices).toContain("lead_generation");
    expect(deal.vatRate).toBe(UK_VAT_RATE);
  });
});

describe("computeDeal — the founder's phone-quote maths", () => {
  const deal: Deal = {
    packageType: "lead_generation",
    includedServices: ["lead_generation", "website_build"],
    setupFee: 1995,
    monthlyManagementFee: 499,
    monthlyAdSpend: 1000,
    vatRate: 0.2,
  };

  it("first payment = setup + MMF + ad spend; ongoing = MMF + ad spend (ex VAT)", () => {
    const computed = computeDeal(deal);
    expect(computed.firstPaymentExVat).toBe(3494);
    expect(computed.ongoingMonthlyExVat).toBe(1499);
  });

  it("computes inc-VAT at 20%, rounded to pennies", () => {
    const computed = computeDeal(deal);
    expect(computed.firstPaymentIncVat).toBe(4192.8);
    expect(computed.ongoingMonthlyIncVat).toBe(1798.8);
  });

  it("rounds awkward pennies correctly", () => {
    const computed = computeDeal({ ...deal, setupFee: 1000.33, monthlyAdSpend: 0.01 });
    // first ex = 1000.33 + 499 + 0.01 = 1499.34 → inc = 1799.208 → 1799.21
    expect(computed.firstPaymentExVat).toBe(1499.34);
    expect(computed.firstPaymentIncVat).toBe(1799.21);
  });

  it("handles zero ad spend (management-only deals)", () => {
    const computed = computeDeal({ ...deal, monthlyAdSpend: 0 });
    expect(computed.firstPaymentExVat).toBe(2494);
    expect(computed.ongoingMonthlyExVat).toBe(499);
  });
});
