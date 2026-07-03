/**
 * Market — public API (ADR-025).
 *
 * The lead-economics explorer over core/market-intelligence, plus the shared
 * estimate card other features may embed (the CRM pitch panel does).
 *
 * This is the ONLY surface other layers may import from.
 */

export { MarketExplorerPage } from "./components/market-explorer-page";
export { EstimateCard, ProvenanceFooter } from "./components/estimate-card";
