/**
 * The seeded provider — zero-setup default (ADR-025). Serves the founder's
 * benchmark workbook as typed data; deterministic keyword matching for trades
 * and locations in the spirit of the trade intelligence (ADR-020).
 */

import type {
  LocationFactor,
  MarketDataProvider,
  TradeBenchmark,
} from "./model";
import {
  DEFAULT_LOCATION_LABEL,
  GENERAL_FALLBACK,
  LOCATION_MULTIPLIER_SEED,
  SEED_AS_OF,
  TRADE_BENCHMARK_SEED,
  WORKBOOK_ORDER,
  type SeedTradeBenchmark,
} from "./seed-data";

export const SEEDED_PROVIDER_NAME = "seeded-benchmarks";

function toBenchmark(seed: SeedTradeBenchmark): TradeBenchmark {
  return {
    tradeKey: seed.tradeKey,
    tradeLabel: seed.tradeLabel,
    cpc: { ...seed.cpc },
    conversionRate: seed.conversionRate,
    jobValue: { ...seed.jobValue },
    ...(seed.marketplaceLeadNote
      ? { marketplaceLeadNote: seed.marketplaceLeadNote }
      : {}),
    confidence: seed.confidence,
    sources: [...seed.sources],
    asOf: SEED_AS_OF,
    provider: SEEDED_PROVIDER_NAME,
  };
}

/** Match a free-text trade to a seeded benchmark (fallback when none hits). */
export function matchTradeSeed(trade: string): SeedTradeBenchmark {
  const tradeLower = trade.trim().toLowerCase();
  for (const seed of TRADE_BENCHMARK_SEED) {
    if (seed.keywords.some((keyword) => tradeLower.includes(keyword))) {
      return seed;
    }
  }
  return GENERAL_FALLBACK;
}

/** Match a free-text location to the multiplier table (national default). */
export function matchLocationSeed(location: string): LocationFactor {
  const locationLower = location.trim().toLowerCase();
  for (const entry of LOCATION_MULTIPLIER_SEED) {
    if (entry.matchers.some((matcher) => locationLower.includes(matcher))) {
      return {
        label: entry.label,
        multiplier: entry.multiplier,
        matched: true,
        ...(entry.rationale ? { rationale: entry.rationale } : {}),
      };
    }
  }
  return {
    label: DEFAULT_LOCATION_LABEL,
    multiplier: 1,
    matched: false,
    rationale: "Location not recognised — England national baseline applied.",
  };
}

export function createSeededMarketDataProvider(): MarketDataProvider {
  return {
    name: SEEDED_PROVIDER_NAME,
    async getBenchmark(trade: string): Promise<TradeBenchmark> {
      return toBenchmark(matchTradeSeed(trade));
    },
    async getLocationFactor(location: string): Promise<LocationFactor> {
      return matchLocationSeed(location);
    },
  };
}

/** The full seeded dataset in the workbook's display order (for the UI). */
export const TRADE_BENCHMARKS: ReadonlyArray<TradeBenchmark> = WORKBOOK_ORDER.map(
  (key) => {
    const seed = TRADE_BENCHMARK_SEED.find((entry) => entry.tradeKey === key);
    if (!seed) throw new Error(`Seed dataset missing workbook trade "${key}"`);
    return toBenchmark(seed);
  },
);

/** The multiplier table (for the UI / tests). */
export const LOCATION_MULTIPLIERS = LOCATION_MULTIPLIER_SEED.map((entry) => ({
  label: entry.label,
  multiplier: entry.multiplier,
  rationale: entry.rationale,
}));
