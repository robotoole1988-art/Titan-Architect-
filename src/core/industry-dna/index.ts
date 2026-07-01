/**
 * TITAN Industry DNA — public API.
 *
 * Interfaces only (no implementation, no data, no AI, no database, no UI).
 * This is the ONLY surface other modules may import from. Every future engine
 * (Website, Ads, SEO, Brain, …) reads a trade business from these contracts.
 *
 * See docs/architecture/adr-011-industry-dna.md.
 */

export type {
  DnaExtensions,
  DnaEntry,
  DnaList,
  DnaSection,
  MonetaryAmount,
  EmergencyOrPlanned,
  PropertyMarket,
  UrgencyLevel,
} from "./common";

export type {
  BusinessIdentityDna,
  ServicesDna,
  CustomerPsychologyDna,
  WebsiteDna,
  SearchSeoDna,
  PaidAdvertisingDna,
  BrandDna,
  SalesDna,
  MarketIntelligenceDna,
  OperationsDna,
  BusinessIntelligenceDna,
  AiBehaviourDna,
} from "./sections";

export type { IndustryDna } from "./industry-dna";
export { INDUSTRY_DNA_VERSION } from "./industry-dna";
