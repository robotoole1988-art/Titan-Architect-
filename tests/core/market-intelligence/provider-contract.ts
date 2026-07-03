/**
 * MarketDataProvider CONTRACT (ADR-025): one suite, every adapter. Any
 * provider that passes may serve numbers to the UI — which is why the
 * contract insists on complete provenance: no number without its origin.
 */

import { describe, expect, it } from "vitest";
import type { MarketDataProvider } from "@/core/market-intelligence";

const CONFIDENCE_LEVELS = ["sourced", "partial", "estimated"];

export function runMarketProviderContract(
  adapterName: string,
  makeProvider: () => MarketDataProvider,
): void {
  describe(`market provider contract · ${adapterName}`, () => {
    it("returns a complete, plausible benchmark for a known trade", async () => {
      const provider = makeProvider();
      const benchmark = await provider.getBenchmark("Roofing");
      expect(benchmark.cpc.low).toBeGreaterThan(0);
      expect(benchmark.cpc.high).toBeGreaterThanOrEqual(benchmark.cpc.low);
      expect(benchmark.conversionRate).toBeGreaterThan(0);
      expect(benchmark.conversionRate).toBeLessThanOrEqual(1);
      expect(benchmark.jobValue.low).toBeGreaterThan(0);
      expect(benchmark.jobValue.high).toBeGreaterThanOrEqual(benchmark.jobValue.low);
    });

    it("never serves a number without provenance", async () => {
      const provider = makeProvider();
      const benchmark = await provider.getBenchmark("Roofing");
      expect(benchmark.provider).toBe(provider.name);
      expect(CONFIDENCE_LEVELS).toContain(benchmark.confidence);
      expect(benchmark.sources.length).toBeGreaterThan(0);
      expect(benchmark.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("yields an estimate for ANY trade — unknown trades fall back, honestly", async () => {
      const provider = makeProvider();
      const benchmark = await provider.getBenchmark("Alpaca Shearing");
      expect(benchmark.cpc.low).toBeGreaterThan(0);
      expect(benchmark.confidence).toBe("estimated");
      expect(benchmark.sources.length).toBeGreaterThan(0);
    });

    it("resolves a location factor for any location", async () => {
      const provider = makeProvider();
      for (const location of ["London", "Nether Wallop"]) {
        const factor = await provider.getLocationFactor(location);
        expect(factor.multiplier).toBeGreaterThan(0);
        expect(factor.label.length).toBeGreaterThan(0);
      }
    });
  });
}
