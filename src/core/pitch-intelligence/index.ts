/**
 * TITAN Pitch Intelligence — public API (ADR-024).
 *
 * Deterministic per-trade sales knowledge for the CRM: talking points, pain
 * points, objection handlers, and indicative UK job values. The seed of
 * Industry DNA surfacing in the CRM — a typed knowledge module today, fed by
 * the Knowledge Kernel later. No AI, no data fetching.
 *
 * This is the ONLY surface other modules may import from.
 */

export { resolveTradePitch } from "./pitch";
export type {
  TradePitch,
  TradePitchMatch,
  ObjectionHandler,
  JobValue,
} from "./pitch";
