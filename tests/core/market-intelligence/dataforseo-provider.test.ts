/**
 * DataForSEO adapter — contract-tested against a MOCKED transport (ADR-025).
 * Never calls the live API in tests or CI; the live path activates only via
 * the server-side env key.
 */

import { describe, expect, it, vi } from "vitest";
import { createDataForSeoMarketDataProvider } from "@/core/market-intelligence/dataforseo-provider";
import { runMarketProviderContract } from "./provider-contract";

/** A canned DataForSEO google_ads search_volume response. */
function cannedResponse(cpc: number) {
  return {
    tasks: [
      {
        result: [
          {
            keyword: "roofing london",
            cpc,
            competition: 0.72,
            search_volume: 1900,
          },
        ],
      },
    ],
  };
}

function mockTransport(cpc = 4.2) {
  return vi.fn(async () => cannedResponse(cpc));
}

function makeProvider(cpc?: number) {
  return createDataForSeoMarketDataProvider({
    apiKey: "login:password",
    transport: mockTransport(cpc),
  });
}

runMarketProviderContract("dataforseo (mocked transport)", () => makeProvider());

describe("dataforseo adapter specifics", () => {
  it("derives the CPC range from live data and says where the rest came from", async () => {
    const provider = makeProvider(5);
    const benchmark = await provider.getBenchmark("Roofing");
    expect(benchmark.provider).toBe("dataforseo");
    expect(benchmark.cpc.low).toBeCloseTo(5 * 0.7, 5);
    expect(benchmark.cpc.high).toBeCloseTo(5 * 1.3, 5);
    // Conversion assumptions still come from the seeded benchmarks — cited.
    expect(benchmark.sources.join(" ")).toMatch(/DataForSEO/i);
    expect(benchmark.sources.join(" ")).toMatch(/seeded|benchmark/i);
  });

  it("falls back to the seeded benchmark when the API yields nothing", async () => {
    const provider = createDataForSeoMarketDataProvider({
      apiKey: "login:password",
      transport: vi.fn(async () => ({ tasks: [] })),
    });
    const benchmark = await provider.getBenchmark("Roofing");
    expect(benchmark.cpc.low).toBeGreaterThan(0);
    expect(benchmark.confidence).not.toBe("sourced"); // degraded honestly
  });
});
