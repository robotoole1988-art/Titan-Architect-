/**
 * The ROI calculator model (ADR-026). Pure, deterministic maths answering the
 * founder's phone question: "what does N jobs a month cost, and what does it
 * return?" Close-rate defaults are ASSUMPTIONS keyed off the trade archetype
 * (urgent trades close more of their leads) — every input is editable in the
 * UI and overrides are labelled "founder input".
 */

import { classifyArchetype, type TradeArchetype } from "@/core/experience-strategy";

/** Assumed lead→customer close rates per archetype. Founder-editable live. */
const CLOSE_RATE_BY_ARCHETYPE: Record<TradeArchetype, number> = {
  emergency: 0.4,
  care: 0.35,
  recurring: 0.35,
  general: 0.3,
  // Certified installs — considered, credentials-led (ADR-044). Solar/EV/battery
  // drop further via CONSIDERED_PURCHASE_TRADES.
  technical: 0.3,
  project: 0.25,
  event: 0.25,
  premium: 0.2,
};

/** Considered purchases (long sales cycles) close lower still. */
const CONSIDERED_PURCHASE_TRADES = ["solar", "battery", "ev charg"];

export function defaultCloseRateForTrade(trade: string): number {
  const lower = trade.toLowerCase();
  if (CONSIDERED_PURCHASE_TRADES.some((keyword) => lower.includes(keyword))) {
    return 0.15;
  }
  return CLOSE_RATE_BY_ARCHETYPE[classifyArchetype(lower)];
}

export interface RoiInputs {
  /** Lead → customer close rate (0..1]. */
  closeRate: number;
  customersPerMonth: number;
  /** Cost per lead (GBP). */
  cpl: number;
  averageJobValue: number;
  /** From the business's deal; 0 when no deal exists. */
  monthlyManagementFee: number;
}

export interface RoiResult {
  leadsNeededPerMonth: number;
  requiredAdSpend: number;
  totalMonthlyCost: number;
  expectedMonthlyRevenue: number;
  roiMultiple: number;
  costPerCustomer: number;
}

export function computeRoi(inputs: RoiInputs): RoiResult {
  if (inputs.closeRate <= 0 || inputs.closeRate > 1) {
    throw new Error("closeRate must be in (0, 1]");
  }
  if (inputs.customersPerMonth <= 0) {
    throw new Error("customersPerMonth must be positive");
  }
  if (inputs.cpl <= 0) throw new Error("cpl must be positive");
  if (inputs.averageJobValue < 0 || inputs.monthlyManagementFee < 0) {
    throw new Error("values must not be negative");
  }

  // You cannot buy a fraction of a lead — round up (epsilon absorbs floats).
  const leadsNeededPerMonth = Math.ceil(
    inputs.customersPerMonth / inputs.closeRate - 1e-9,
  );
  const requiredAdSpend = leadsNeededPerMonth * inputs.cpl;
  const totalMonthlyCost = requiredAdSpend + inputs.monthlyManagementFee;
  const expectedMonthlyRevenue =
    inputs.customersPerMonth * inputs.averageJobValue;

  return {
    leadsNeededPerMonth,
    requiredAdSpend,
    totalMonthlyCost,
    expectedMonthlyRevenue,
    roiMultiple: expectedMonthlyRevenue / totalMonthlyCost,
    costPerCustomer: totalMonthlyCost / inputs.customersPerMonth,
  };
}
