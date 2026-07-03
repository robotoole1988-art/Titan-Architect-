/**
 * DataForSEO adapter (ADR-025) — live Google Ads CPC behind the same
 * interface. SERVER-ONLY, activated exclusively by a server-side env key,
 * NEVER called in CI or by default. v1 honesty: live CPC is combined with the
 * seeded conversion/job-value assumptions, the provenance says exactly that,
 * and confidence can only be as strong as the weakest input.
 */

import "server-only";
import type {
  ConfidenceLevel,
  LocationFactor,
  MarketDataProvider,
  TradeBenchmark,
} from "./model";
import { matchLocationSeed, matchTradeSeed } from "./seeded-provider";
import { SEED_AS_OF } from "./seed-data";

/** Injectable transport so the adapter is contract-testable without the API. */
export type DataForSeoTransport = (
  path: string,
  body: unknown,
  authorization: string,
) => Promise<unknown>;

export interface DataForSeoConfig {
  /** "login:password" — held server-side only (DATAFORSEO_API_KEY). */
  apiKey: string;
  transport?: DataForSeoTransport;
}

const API_BASE = "https://api.dataforseo.com";
const SEARCH_VOLUME_PATH = "/v3/keywords_data/google_ads/search_volume/live";

const defaultTransport: DataForSeoTransport = async (path, body, authorization) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`DataForSEO error: HTTP ${response.status}`);
  }
  return response.json();
};

interface SearchVolumeResult {
  keyword?: string;
  cpc?: number | null;
  competition?: number | null;
  search_volume?: number | null;
}

function firstResult(payload: unknown): SearchVolumeResult | null {
  const tasks = (payload as { tasks?: Array<{ result?: SearchVolumeResult[] }> })
    ?.tasks;
  return tasks?.[0]?.result?.[0] ?? null;
}

const CONFIDENCE_RANK: Record<ConfidenceLevel, number> = {
  sourced: 2,
  partial: 1,
  estimated: 0,
};

/** The chain is only as strong as its weakest input. */
function weakest(a: ConfidenceLevel, b: ConfidenceLevel): ConfidenceLevel {
  return CONFIDENCE_RANK[a] <= CONFIDENCE_RANK[b] ? a : b;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export const DATAFORSEO_PROVIDER_NAME = "dataforseo";

/** Spread applied around a single live CPC to form a working range. */
const CPC_SPREAD = 0.3;

export function createDataForSeoMarketDataProvider(
  config: DataForSeoConfig,
): MarketDataProvider {
  const transport = config.transport ?? defaultTransport;
  const authorization = `Basic ${Buffer.from(config.apiKey).toString("base64")}`;

  return {
    name: DATAFORSEO_PROVIDER_NAME,

    async getBenchmark(trade: string): Promise<TradeBenchmark> {
      const seed = matchTradeSeed(trade);
      let liveCpc: number | null = null;
      try {
        const payload = await transport(
          SEARCH_VOLUME_PATH,
          [{ keywords: [seed.tradeLabel.toLowerCase()], location_name: "United Kingdom" }],
          authorization,
        );
        const result = firstResult(payload);
        liveCpc = typeof result?.cpc === "number" && result.cpc > 0 ? result.cpc : null;
      } catch {
        liveCpc = null; // degrade to the seeded benchmark below
      }

      if (liveCpc === null) {
        return {
          tradeKey: seed.tradeKey,
          tradeLabel: seed.tradeLabel,
          cpc: { ...seed.cpc },
          conversionRate: seed.conversionRate,
          jobValue: { ...seed.jobValue },
          confidence: weakest(seed.confidence, "partial"),
          sources: [
            ...seed.sources,
            "DataForSEO returned no data — seeded benchmark served.",
          ],
          asOf: SEED_AS_OF,
          provider: DATAFORSEO_PROVIDER_NAME,
        };
      }

      return {
        tradeKey: seed.tradeKey,
        tradeLabel: seed.tradeLabel,
        cpc: { low: liveCpc * (1 - CPC_SPREAD), high: liveCpc * (1 + CPC_SPREAD) },
        conversionRate: seed.conversionRate,
        jobValue: { ...seed.jobValue },
        confidence: weakest(seed.confidence, "partial"),
        sources: [
          `DataForSEO Google Ads live CPC (UK) — fetched ${todayIso()}.`,
          "Conversion-rate and job-value assumptions: TITAN seeded benchmarks v1 (2026-07-02).",
        ],
        asOf: todayIso(),
        provider: DATAFORSEO_PROVIDER_NAME,
      };
    },

    async getLocationFactor(location: string): Promise<LocationFactor> {
      // v1: location competition still comes from the seeded multiplier table
      // (cited); per-location live keyword pulls are engine v2.
      return matchLocationSeed(location);
    },
  };
}
