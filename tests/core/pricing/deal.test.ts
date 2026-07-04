import { describe, expect, it } from "vitest";
import {
  PRICING_CATALOGUE,
  UK_VAT_RATE,
  buildDeal,
  computeDeal,
  defaultDealForPackage,
  deriveAdSpend,
  getPricedService,
  type Deal,
  type PricedServiceId,
} from "@/core/pricing";

describe("pricing catalogue (ADR-026)", () => {
  it("lists the sellable services + bundle tiers with recommended prices", () => {
    expect(PRICING_CATALOGUE.map((service) => service.id)).toEqual([
      "lead_generation",
      "website_build",
      "seo_management",
      "gbp_management",
      "lsa_management",
      "meta_ads_management",
      "ai_search_optimisation",
      "launch_bundle",
      "dominate_bundle",
      "titan_bundle",
    ]);
    for (const service of PRICING_CATALOGUE) {
      expect(service.recommendedSetupFee, service.id).toBeGreaterThanOrEqual(0);
      expect(service.recommendedMonthlyFee, service.id).toBeGreaterThanOrEqual(0);
    }
  });

  it("pre-fills a deal from the catalogue, ad spend DERIVED from lead target × CPL", () => {
    const deal = defaultDealForPackage("lead_generation", { cpl: 75 });
    const service = getPricedService("lead_generation")!;
    expect(deal.packageType).toBe("lead_generation");
    expect(deal.setupFee).toBe(service.recommendedSetupFee);
    expect(deal.monthlyManagementFee).toBe(service.recommendedMonthlyFee);
    expect(deal.leadTargetPerMonth).toBeGreaterThan(0);
    expect(deal.cplUsed).toBe(75);
    expect(deal.cplSource).toBe("estimate");
    expect(deal.monthlyAdSpend).toBe(
      deriveAdSpend(deal.leadTargetPerMonth, deal.cplUsed),
    );
    expect(deal.includedServices).toContain("lead_generation");
    expect(deal.vatRate).toBe(UK_VAT_RATE);
  });

  it("non-flagship packages start with no ad spend", () => {
    const deal = defaultDealForPackage("website_build", { cpl: 75 });
    expect(deal.leadTargetPerMonth).toBe(0);
    expect(deal.monthlyAdSpend).toBe(0);
  });
});

describe("derived ad spend (v1.1 addendum)", () => {
  it("shows the founder's example working: 50 leads × £40 CPL = £2,000/mo", () => {
    expect(deriveAdSpend(50, 40)).toBe(2000);
  });

  it("rounds derived spend to pennies", () => {
    expect(deriveAdSpend(33, 41.67)).toBe(1375.11);
  });

  it("buildDeal ALWAYS derives ad spend — a client cannot type over it", () => {
    const deal = buildDeal({
      packageType: "lead_generation",
      includedServices: ["lead_generation"],
      setupFee: 1995,
      monthlyManagementFee: 499,
      leadTargetPerMonth: 16,
      cplUsed: 75,
      cplSource: "estimate",
    });
    expect(deal.monthlyAdSpend).toBe(1200);
    expect(computeDeal(deal).ongoingMonthlyExVat).toBe(1699);
  });

  it("buildDeal rejects nonsense", () => {
    const base = {
      packageType: "lead_generation" as const,
      includedServices: ["lead_generation" as const],
      setupFee: 1995,
      monthlyManagementFee: 499,
      cplSource: "estimate" as const,
    };
    expect(() => buildDeal({ ...base, leadTargetPerMonth: -1, cplUsed: 75 })).toThrow();
    expect(() => buildDeal({ ...base, leadTargetPerMonth: 10, cplUsed: -5 })).toThrow();
  });
});

describe("computeDeal — the founder's phone-quote maths", () => {
  const deal: Deal = {
    packageType: "lead_generation",
    includedServices: ["lead_generation", "website_build"],
    setupFee: 1995,
    monthlyManagementFee: 499,
    leadTargetPerMonth: 25,
    cplUsed: 40,
    cplSource: "estimate",
    monthlyAdSpend: 1000, // 25 × £40
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

describe("recommended prices + soft floors (change: pricing recommendations)", () => {
  it("sets the founder's recommended defaults", () => {
    const expectations: Array<[string, number]> = [
      ["seo_management", 295],
      ["gbp_management", 145],
      ["lsa_management", 125],
      ["meta_ads_management", 295],
      ["ai_search_optimisation", 195],
    ];
    for (const [id, monthly] of expectations) {
      expect(
        getPricedService(id as PricedServiceId)?.recommendedMonthlyFee,
        id,
      ).toBe(monthly);
    }
    const flagship = getPricedService("lead_generation")!;
    expect(flagship.recommendedSetupFee).toBe(495);
    expect(flagship.recommendedMonthlyFee).toBe(395);
  });

  it("offers three bundle tiers, each priced below the sum of parts", () => {
    const tiers: Array<[PricedServiceId, number | null]> = [
      ["launch_bundle", null],
      ["dominate_bundle", 645],
      ["titan_bundle", 945],
    ];
    for (const [id, specMonthly] of tiers) {
      const bundle = getPricedService(id);
      expect(bundle, id).toBeDefined();
      expect(bundle!.bundle).toBe(true);
      expect(bundle!.includedServices!.length).toBeGreaterThanOrEqual(3);
      if (specMonthly !== null) {
        expect(bundle!.recommendedMonthlyFee, id).toBe(specMonthly);
      }
      const partsMonthly = bundle!.includedServices!.reduce(
        (sum, part) => sum + getPricedService(part)!.recommendedMonthlyFee,
        0,
      );
      expect(bundle!.recommendedMonthlyFee, `${id} vs parts`).toBeLessThan(partsMonthly);
    }
    // Tier composition: Dominate ⊃ Launch, TITAN ⊃ Dominate (+ Meta + AI).
    const launch = getPricedService("launch_bundle")!.includedServices!;
    const dominate = getPricedService("dominate_bundle")!.includedServices!;
    const titan = getPricedService("titan_bundle")!.includedServices!;
    expect(launch).toContain("gbp_management");
    for (const part of launch) expect(dominate).toContain(part);
    expect(dominate).toContain("seo_management");
    expect(dominate).toContain("lsa_management");
    for (const part of dominate) expect(titan).toContain(part);
    expect(titan).toContain("meta_ads_management");
    expect(titan).toContain("ai_search_optimisation");
  });

  it("REJECTS lowering below the recommendation without a reason (server-side floor)", () => {
    expect(() =>
      buildDeal({
        packageType: "lead_generation",
        includedServices: ["lead_generation"],
        setupFee: 200, // below the recommended 495
        monthlyManagementFee: 395,
        leadTargetPerMonth: 20,
        cplUsed: 40,
        cplSource: "estimate",
      }),
    ).toThrow(/discount reason/i);
    expect(() =>
      buildDeal({
        packageType: "lead_generation",
        includedServices: ["lead_generation"],
        setupFee: 495,
        monthlyManagementFee: 300, // below recommended 395
        leadTargetPerMonth: 20,
        cplUsed: 40,
        cplSource: "estimate",
        discountReason: "   ", // whitespace is not a reason
      }),
    ).toThrow(/discount reason/i);
  });

  it("records the discount (item, delta, reason) when a reason is given", () => {
    const deal = buildDeal({
      packageType: "lead_generation",
      includedServices: ["lead_generation"],
      setupFee: 295,
      monthlyManagementFee: 345,
      leadTargetPerMonth: 20,
      cplUsed: 40,
      cplSource: "estimate",
      discountReason: "Friends-and-family launch client",
    });
    expect(deal.recommendedSetupFee).toBe(495);
    expect(deal.recommendedMonthlyFee).toBe(395);
    expect(deal.discounts).toHaveLength(2);
    const setup = deal.discounts!.find((d) => d.item === "setupFee")!;
    expect(setup.recommended).toBe(495);
    expect(setup.actual).toBe(295);
    expect(setup.delta).toBe(200);
    expect(setup.reason).toBe("Friends-and-family launch client");
    const mmf = deal.discounts!.find((d) => d.item === "monthlyManagementFee")!;
    expect(mmf.delta).toBe(50);
  });

  it("raising above the recommendation passes freely, no discount metadata", () => {
    const deal = buildDeal({
      packageType: "lead_generation",
      includedServices: ["lead_generation"],
      setupFee: 995, // raised — no friction
      monthlyManagementFee: 495,
      leadTargetPerMonth: 20,
      cplUsed: 40,
      cplSource: "estimate",
    });
    expect(deal.discounts ?? []).toEqual([]);
    expect(deal.setupFee).toBe(995);
  });

  it("customer summary stays two clean numbers — discounts never surface there", () => {
    const deal = buildDeal({
      packageType: "lead_generation",
      includedServices: ["lead_generation"],
      setupFee: 295,
      monthlyManagementFee: 345,
      leadTargetPerMonth: 20,
      cplUsed: 40,
      cplSource: "estimate",
      discountReason: "Launch client",
    });
    const computed = computeDeal(deal);
    // The summary consumes ONLY the computed figures — same shape as ever.
    expect(Object.keys(computed).sort()).toEqual([
      "firstPaymentExVat",
      "firstPaymentIncVat",
      "ongoingMonthlyExVat",
      "ongoingMonthlyIncVat",
      "vatRate",
    ]);
    expect(computed.firstPaymentExVat).toBe(295 + 345 + 800);
  });
});
