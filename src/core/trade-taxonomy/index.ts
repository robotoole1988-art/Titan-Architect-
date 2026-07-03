/**
 * TITAN Trade Taxonomy — public API (ADR-026).
 *
 * The canonical trade + services vocabulary: one id space shared with market
 * intelligence (tradeKeys) and mapped by pitch intelligence. Business Intake
 * and the CRM select from this taxonomy — no free-typed trades in the main
 * flows; free text remains possible but is flagged unclassified.
 *
 * This is the ONLY surface other modules may import from.
 */

export {
  TRADE_TAXONOMY,
  UNCLASSIFIED_TRADE_ID,
  getTradeDefinition,
  matchTradeId,
  tradeServices,
} from "./taxonomy";
export type { TradeDefinition, TradeId } from "./taxonomy";
