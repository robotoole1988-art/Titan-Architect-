/**
 * The estimate maths, pinned against the founder's workbook fixtures
 * (TITAN-CPL-Benchmarks-v1: "CPL by Location" is national mid × multiplier —
 * our model must reproduce it).
 */

import { describe, expect, it } from "vitest";
import {
  createSeededMarketDataProvider,
  resolveCplEstimate,
} from "@/core/market-intelligence";

const provider = createSeededMarketDataProvider();

describe("estimateCpl (workbook fixtures)", () => {
  it("Roofing · England national: 25 / 33.33 / 41.67", async () => {
    const estimate = await resolveCplEstimate(provider, "Roofing", "England");
    expect(estimate.cpl.low).toBeCloseTo(25, 1);
    expect(estimate.cpl.mid).toBeCloseTo(33.33, 1);
    expect(estimate.cpl.high).toBeCloseTo(41.67, 1);
  });

  it("Roofing · London: mid 45 (×1.35)", async () => {
    const estimate = await resolveCplEstimate(provider, "Roofing", "London");
    expect(estimate.cpl.mid).toBeCloseTo(45, 1);
    expect(estimate.provenance.locationMultiplier).toBe(1.35);
  });

  it("Plumbing & Heating (emergency) · national: mid 32", async () => {
    const estimate = await resolveCplEstimate(
      provider,
      "Plumbing & Heating (emergency)",
      "England",
    );
    expect(estimate.cpl.mid).toBeCloseTo(32, 1);
  });

  it("Solar PV · Dublin: mid 158.33 (×1.0 GBP eq.)", async () => {
    const estimate = await resolveCplEstimate(provider, "Solar PV", "Dublin");
    expect(estimate.cpl.mid).toBeCloseTo(158.33, 1);
  });

  it("budget scenarios: £1,000 at Roofing national buys 24–40 leads", async () => {
    const estimate = await resolveCplEstimate(provider, "Roofing", "England");
    const scenario = estimate.budgetScenarios.find((s) => s.monthlyBudget === 1000);
    expect(scenario).toBeDefined();
    expect(scenario!.leads.low).toBe(24); // 1000 / 41.67, floored
    expect(scenario!.leads.high).toBe(40); // 1000 / 25
    const budgets = estimate.budgetScenarios.map((s) => s.monthlyBudget);
    expect(budgets).toEqual([500, 1000, 2000]);
  });

  it("margin story: cost per £ of job value from mids", async () => {
    const estimate = await resolveCplEstimate(provider, "Roofing", "England");
    // mid CPL 33.33 / mid job value (500+8000)/2 = 4250 → ~0.0078
    expect(estimate.costPerPoundOfJobValue).toBeCloseTo(33.3333 / 4250, 4);
    expect(estimate.jobValue.low).toBe(500);
    expect(estimate.jobValue.high).toBe(8000);
  });

  it("provenance travels with every estimate", async () => {
    const estimate = await resolveCplEstimate(provider, "Roofing", "London");
    expect(estimate.provenance.provider).toBe("seeded-benchmarks");
    expect(estimate.provenance.confidence).toBe("sourced");
    expect(estimate.provenance.asOf).toBe("2026-07-02");
    expect(estimate.provenance.sources.length).toBeGreaterThan(0);
    expect(estimate.provenance.locationLabel).toBe("London");
  });

  it("is deterministic", async () => {
    const a = await resolveCplEstimate(provider, "Tree Surgery", "Belfast");
    const b = await resolveCplEstimate(provider, "Tree Surgery", "Belfast");
    expect(a).toEqual(b);
  });
});
