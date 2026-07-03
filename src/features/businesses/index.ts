/**
 * Businesses — public API (ADR-023).
 *
 * The pipeline view over the Business Spine: every saved business and its
 * journey (Business → Strategy → Blueprint → Website → Marketing). The seed
 * of the command centre — read-mostly, not the full CRM.
 *
 * This is the ONLY surface other layers may import from.
 */

export { BusinessesPage } from "./components/businesses-page";
export { BusinessJourneyPage } from "./components/business-journey-page";
