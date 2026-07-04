import { describe, expect, it } from "vitest";
import {
  LOCATION_MULTIPLIERS,
  TRADE_BENCHMARKS,
  createSeededMarketDataProvider,
} from "@/core/market-intelligence";
import { runMarketProviderContract } from "./provider-contract";

runMarketProviderContract("seeded", () => createSeededMarketDataProvider());

describe("seeded dataset integrity (TITAN-CPL-Benchmarks-v2)", () => {
  it("carries all thirty-five workbook trades verbatim", () => {
    const labels = TRADE_BENCHMARKS.map((benchmark) => benchmark.tradeLabel);
    expect(labels).toEqual([
      "Roofing",
      "Plumbing & Heating (emergency)",
      "Boiler Installation",
      "Driveways & Paving",
      "Landscaping",
      "Tree Surgery",
      "Solar PV",
      "Battery Storage",
      "EV Charger Installation",
      "Scaffolding",
      "Carpet Cleaning",
      "Domestic/Commercial Cleaning",
      "Exterior Cleaning (jet wash/render)",
      "Painting & Decorating",
      "Mobile Mechanic",
      "Garage — Clutch/Cambelt/Wetbelt",
      "MOT & Servicing",
      "House Clearance",
      "Garage Clearance",
      "Waste Removal (man & van)",
      "Electricians",
      "Builders (General)",
      "Extensions & Renovations",
      "Windows & Doors (Double Glazing)",
      "Conservatories",
      "Dentists (Private)",
      "Solicitors",
      "Car Detailing",
      "Brickwork",
      "Swimming Pools",
      "Tarmac & Surfacing",
      "Artificial Grass",
      "Chimney & Fireplaces",
      "Damp Proofing",
      "HVAC / Air Conditioning",
    ]);
  });

  it("every trade has valid ranges, a confidence flag, and citations", () => {
    for (const benchmark of TRADE_BENCHMARKS) {
      expect(benchmark.cpc.low, benchmark.tradeLabel).toBeGreaterThan(0);
      expect(benchmark.cpc.high, benchmark.tradeLabel).toBeGreaterThanOrEqual(
        benchmark.cpc.low,
      );
      expect(benchmark.conversionRate, benchmark.tradeLabel).toBeGreaterThan(0);
      expect(benchmark.jobValue.high, benchmark.tradeLabel).toBeGreaterThanOrEqual(
        benchmark.jobValue.low,
      );
      expect(["sourced", "partial", "estimated"]).toContain(benchmark.confidence);
      expect(benchmark.sources.length, benchmark.tradeLabel).toBeGreaterThan(0);
    }
  });

  it("carries the workbook's location multiplier table exactly", () => {
    const byKey = Object.fromEntries(
      LOCATION_MULTIPLIERS.map((entry) => [entry.label, entry.multiplier]),
    );
    expect(byKey["England — National"]).toBe(1);
    expect(byKey["London"]).toBe(1.35);
    expect(byKey["Birmingham"]).toBe(1.15);
    expect(byKey["Manchester"]).toBe(1.15);
    expect(byKey["Leeds"]).toBe(1.1);
    expect(byKey["England — Towns/Rural"]).toBe(0.85);
    expect(byKey["Scotland — National"]).toBe(0.95);
    expect(byKey["Glasgow"]).toBe(1.05);
    expect(byKey["Edinburgh"]).toBe(1.05);
    expect(byKey["Wales — National"]).toBe(0.9);
    expect(byKey["Cardiff"]).toBe(1);
    expect(byKey["N. Ireland — National"]).toBe(0.85);
    expect(byKey["Belfast"]).toBe(0.95);
    expect(byKey["Ireland — National (GBP eq.)"]).toBe(0.8);
    expect(byKey["Dublin (GBP eq.)"]).toBe(1);
  });

  it("accepts taxonomy ids directly — no fuzzy matching needed (ADR-026)", async () => {
    const provider = createSeededMarketDataProvider();
    expect((await provider.getBenchmark("driveways-paving")).tradeKey).toBe(
      "driveways-paving",
    );
    expect((await provider.getBenchmark("mot-servicing")).tradeKey).toBe(
      "mot-servicing",
    );
    expect((await provider.getBenchmark("garage-repairs")).tradeKey).toBe(
      "garage-repairs",
    );
  });

  it("matches trades by keyword (CRM trade strings resolve)", async () => {
    const provider = createSeededMarketDataProvider();
    expect((await provider.getBenchmark("Emergency Roofing & Drainage")).tradeKey).toBe(
      "roofing",
    );
    expect((await provider.getBenchmark("Driveways & Patios")).tradeKey).toBe(
      "driveways-paving",
    );
    expect((await provider.getBenchmark("Plumbing and Heating")).tradeKey).toBe(
      "plumbing-heating-emergency",
    );
    expect((await provider.getBenchmark("solar panel installation")).tradeKey).toBe(
      "solar-pv",
    );
  });

  it("resolves locations to the workbook's multipliers", async () => {
    const provider = createSeededMarketDataProvider();
    expect((await provider.getLocationFactor("London")).multiplier).toBe(1.35);
    expect((await provider.getLocationFactor("central Glasgow")).multiplier).toBe(1.05);
    expect((await provider.getLocationFactor("Cardiff")).multiplier).toBe(1);
    expect((await provider.getLocationFactor("rural Wales")).multiplier).toBe(0.9);
    // Unknown locations default to England — National, and say so.
    const unknown = await provider.getLocationFactor("Nether Wallop");
    expect(unknown.multiplier).toBe(1);
    expect(unknown.matched).toBe(false);
  });
});

describe("v2 workbook expansion (15 new trades)", () => {
  it("serves the new benchmarks with provenance", async () => {
    const provider = createSeededMarketDataProvider();
    const solicitors = await provider.getBenchmark("solicitors");
    expect(solicitors.cpc).toEqual({ low: 8, high: 20 });
    expect(solicitors.conversionRate).toBe(0.05);
    expect(solicitors.confidence).toBe("sourced");
    const dentists = await provider.getBenchmark("dentists-private");
    expect(dentists.jobValue).toEqual({ low: 100, high: 3000 });
    const hvac = await provider.getBenchmark("hvac-air-conditioning");
    expect(hvac.confidence).toBe("partial");
    expect(hvac.sources.join(" ")).toMatch(/heat pump|Searchlight/i);
  });
});
