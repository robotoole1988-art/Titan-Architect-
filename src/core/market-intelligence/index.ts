/**
 * TITAN Market Intelligence — public API (ADR-025).
 *
 * Per-trade, per-location lead economics: the founder's benchmark workbook as
 * typed seed data today, live providers behind the same interface tomorrow.
 * THE PROVENANCE RULE: every number carries provider, confidence, as-of date,
 * and sources — and every UI that shows the number shows them.
 *
 * This is the ONLY surface other modules may import from.
 */

export { confidenceLabel } from "./model";
export type {
  Range,
  ConfidenceLevel,
  TradeBenchmark,
  LocationFactor,
  BudgetScenario,
  EstimateProvenance,
  CplEstimate,
  MarketDataProvider,
} from "./model";

export {
  createSeededMarketDataProvider,
  SEEDED_PROVIDER_NAME,
  TRADE_BENCHMARKS,
  LOCATION_MULTIPLIERS,
} from "./seeded-provider";

// NOTE: the DataForSEO adapter is deliberately NOT re-exported here — it is
// `server-only`, and this index must stay importable from client components
// (the ROI calculator computes live in the browser). Server code reaches it
// through resolveMarketDataProvider; its contract tests import the module
// directly.

export { estimateCpl, resolveCplEstimate, BUDGET_SCENARIOS } from "./estimate";

export { computeRoi, defaultCloseRateForTrade } from "./roi";
export type { RoiInputs, RoiResult } from "./roi";

export { WORKBOOK_ORDER } from "./seed-data";

export {
  resolveMarketDataBackend,
  resolveMarketDataProvider,
} from "./provider";
export type { MarketDataBackend } from "./provider";
