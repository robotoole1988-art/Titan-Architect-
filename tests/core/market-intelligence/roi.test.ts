import { describe, expect, it } from "vitest";
import {
  computeRoi,
  defaultCloseRateForTrade,
} from "@/core/market-intelligence";

describe("close-rate defaults (assumptions, per trade archetype)", () => {
  it("gives urgent trades higher close rates than considered purchases", () => {
    const emergency = defaultCloseRateForTrade("Plumbing & Heating (emergency)");
    const considered = defaultCloseRateForTrade("Solar PV");
    expect(emergency).toBeGreaterThan(considered);
    expect(emergency).toBeGreaterThan(0);
    expect(emergency).toBeLessThanOrEqual(1);
  });

  it("always returns a usable default", () => {
    const rate = defaultCloseRateForTrade("Alpaca Shearing");
    expect(rate).toBeGreaterThan(0);
    expect(rate).toBeLessThanOrEqual(1);
  });
});

describe("computeRoi — fixtures", () => {
  const inputs = {
    closeRate: 0.25,
    customersPerMonth: 4,
    cpl: 45,
    averageJobValue: 4250,
    monthlyManagementFee: 499,
  };

  it("computes the founder's 4-jobs-a-month answer", () => {
    const roi = computeRoi(inputs);
    expect(roi.leadsNeededPerMonth).toBe(16); // 4 / 0.25
    expect(roi.requiredAdSpend).toBe(720); // 16 × 45
    expect(roi.totalMonthlyCost).toBe(1219); // 720 + 499
    expect(roi.expectedMonthlyRevenue).toBe(17000); // 4 × 4250
    expect(roi.roiMultiple).toBeCloseTo(17000 / 1219, 4);
    expect(roi.costPerCustomer).toBeCloseTo(1219 / 4, 2);
  });

  it("rounds leads UP — you cannot buy four-fifths of a lead", () => {
    const roi = computeRoi({ ...inputs, closeRate: 0.3 });
    expect(roi.leadsNeededPerMonth).toBe(14); // ceil(13.33)
  });

  it("works without a deal (MMF absent → ad spend only)", () => {
    const roi = computeRoi({ ...inputs, monthlyManagementFee: 0 });
    expect(roi.totalMonthlyCost).toBe(720);
    expect(roi.roiMultiple).toBeCloseTo(17000 / 720, 4);
  });

  it("guards nonsense inputs", () => {
    expect(() => computeRoi({ ...inputs, closeRate: 0 })).toThrow();
    expect(() => computeRoi({ ...inputs, cpl: -1 })).toThrow();
    expect(() => computeRoi({ ...inputs, customersPerMonth: 0 })).toThrow();
  });

  it("is deterministic", () => {
    expect(computeRoi(inputs)).toEqual(computeRoi(inputs));
  });
});
