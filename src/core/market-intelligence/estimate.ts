/**
 * The CPL estimate model (ADR-025). Pure, deterministic maths — the workbook
 * formula: CPL = CPC ÷ conversion rate, scaled by the location multiplier.
 * Nothing computed is persisted; the dataset is the source of truth and
 * estimates are cheap.
 */

import type {
  BudgetScenario,
  CplEstimate,
  LocationFactor,
  MarketDataProvider,
  TradeBenchmark,
} from "./model";

/** The explorer's standard monthly budget scenarios (GBP). */
export const BUDGET_SCENARIOS = [500, 1000, 2000] as const;

export function estimateCpl(
  benchmark: TradeBenchmark,
  factor: LocationFactor,
): CplEstimate {
  const low = (benchmark.cpc.low / benchmark.conversionRate) * factor.multiplier;
  const high = (benchmark.cpc.high / benchmark.conversionRate) * factor.multiplier;
  const mid = (low + high) / 2;

  // Floored — a conservative "at least this many" range. The epsilon absorbs
  // float error on exact divisions (1000 / 41.666…7 must count as 24).
  const wholeLeads = (budget: number, cpl: number) =>
    Math.floor(budget / cpl + 1e-9);
  const budgetScenarios: BudgetScenario[] = BUDGET_SCENARIOS.map(
    (monthlyBudget) => ({
      monthlyBudget,
      leads: {
        low: wholeLeads(monthlyBudget, high),
        high: wholeLeads(monthlyBudget, low),
      },
    }),
  );

  const jobValueMid = (benchmark.jobValue.low + benchmark.jobValue.high) / 2;

  return {
    cpl: { low, mid, high },
    jobValue: { ...benchmark.jobValue },
    budgetScenarios,
    costPerPoundOfJobValue: mid / jobValueMid,
    provenance: {
      provider: benchmark.provider,
      confidence: benchmark.confidence,
      asOf: benchmark.asOf,
      sources: [...benchmark.sources],
      tradeKey: benchmark.tradeKey,
      tradeLabel: benchmark.tradeLabel,
      locationLabel: factor.label,
      locationMultiplier: factor.multiplier,
      locationMatched: factor.matched,
    },
  };
}

/** Resolve trade + location through a provider and estimate. */
export async function resolveCplEstimate(
  provider: MarketDataProvider,
  trade: string,
  location: string,
): Promise<CplEstimate> {
  const [benchmark, factor] = await Promise.all([
    provider.getBenchmark(trade),
    provider.getLocationFactor(location),
  ]);
  return estimateCpl(benchmark, factor);
}
