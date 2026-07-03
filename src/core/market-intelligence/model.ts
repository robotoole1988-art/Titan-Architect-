/**
 * Market Intelligence contracts (ADR-025).
 *
 * THE PROVENANCE RULE: no number leaves this module without its origin —
 * provider, confidence, as-of date, and sources travel with every benchmark
 * and estimate, and every UI that renders a number renders them too.
 */

/** A low/high money or rate range. */
export interface Range {
  low: number;
  high: number;
}

/**
 * Confidence of a benchmark, mirroring the founder's workbook flags:
 * sourced (published study), partial (proxy/adjacent data adjusted),
 * estimated (modelled from adjacent trades).
 */
export type ConfidenceLevel = "sourced" | "partial" | "estimated";

/** Human label for a confidence level. */
export function confidenceLabel(level: ConfidenceLevel): string {
  switch (level) {
    case "sourced":
      return "Sourced";
    case "partial":
      return "Partially sourced";
    case "estimated":
      return "Modelled";
  }
}

/** Per-trade benchmark data — the inputs to a CPL estimate. */
export interface TradeBenchmark {
  tradeKey: string;
  tradeLabel: string;
  /** Google Ads cost-per-click range (GBP). */
  cpc: Range;
  /** Assumed landing-page conversion rate (0..1). */
  conversionRate: number;
  /** Typical job value range (GBP). */
  jobValue: Range;
  /** Marketplace comparison, e.g. "Checkatrade £20-40/lead" — context only. */
  marketplaceLeadNote?: string;
  confidence: ConfidenceLevel;
  /** Citations — where these figures come from. Never empty. */
  sources: string[];
  /** ISO date the figures were compiled/fetched. */
  asOf: string;
  /** The provider that served this benchmark. */
  provider: string;
}

/** A resolved location competition factor. */
export interface LocationFactor {
  /** The multiplier table row that matched, e.g. "London". */
  label: string;
  /** Applied to the national CPL. */
  multiplier: number;
  /** False when the location was unrecognised and the national default used. */
  matched: boolean;
  rationale?: string;
}

/** One monthly-budget scenario. */
export interface BudgetScenario {
  monthlyBudget: number;
  /** Expected lead range at that budget (floored — conservative). */
  leads: Range;
}

export interface EstimateProvenance {
  provider: string;
  confidence: ConfidenceLevel;
  asOf: string;
  sources: string[];
  tradeKey: string;
  tradeLabel: string;
  locationLabel: string;
  locationMultiplier: number;
  locationMatched: boolean;
}

/** The full CPL estimate for a trade × location. */
export interface CplEstimate {
  cpl: { low: number; mid: number; high: number };
  jobValue: Range;
  budgetScenarios: BudgetScenario[];
  /** Mid CPL ÷ mid job value — pennies of acquisition per £ of work. */
  costPerPoundOfJobValue: number;
  provenance: EstimateProvenance;
}

/**
 * The provider seam (ADR-025): seeded benchmarks by default, live data
 * providers behind the same interface — the storage-adapter pattern again.
 */
export interface MarketDataProvider {
  readonly name: string;
  getBenchmark(trade: string): Promise<TradeBenchmark>;
  getLocationFactor(location: string): Promise<LocationFactor>;
}
