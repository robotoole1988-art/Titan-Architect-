/**
 * TITAN Pricing — public API (ADR-026).
 *
 * The catalogue of TITAN's sellable services (founder-editable placeholder
 * prices, clearly marked) and the Deal maths: ex-VAT stored, inc-VAT
 * computed; first payment = setup + MMF + ad spend; ongoing = MMF + ad spend.
 *
 * This is the ONLY surface other modules may import from.
 */

export {
  PRICING_CATALOGUE,
  UK_VAT_RATE,
  DEFAULT_LEAD_TARGET,
  getPricedService,
  defaultDealForPackage,
  deriveAdSpend,
  buildDeal,
  computeDeal,
} from "./pricing";
export type {
  PricedServiceId,
  PricedService,
  Deal,
  DealInputs,
  DealCplSource,
  DealComputed,
  DealDiscount,
} from "./pricing";
