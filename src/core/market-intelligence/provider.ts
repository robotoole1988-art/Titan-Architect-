/**
 * Provider resolution (ADR-025) — the storage-adapter pattern again: seeded
 * benchmarks by default (zero setup), DataForSEO only when the server-side
 * env key is present. Providers are stateless and cheap; no caching needed.
 */

import type { MarketDataProvider } from "./model";
import { createSeededMarketDataProvider } from "./seeded-provider";

export type MarketDataBackend = "seeded" | "dataforseo";

type EnvShape = Partial<Record<string, string>>;

export function resolveMarketDataBackend(
  env: EnvShape = process.env as EnvShape,
): MarketDataBackend {
  return env.DATAFORSEO_API_KEY ? "dataforseo" : "seeded";
}

/** Server-side callers only when DataForSEO is active (`server-only` guards it). */
export async function resolveMarketDataProvider(): Promise<MarketDataProvider> {
  if (resolveMarketDataBackend() === "dataforseo") {
    const { createDataForSeoMarketDataProvider } = await import(
      "./dataforseo-provider"
    );
    return createDataForSeoMarketDataProvider({
      apiKey: process.env.DATAFORSEO_API_KEY!,
    });
  }
  return createSeededMarketDataProvider();
}
