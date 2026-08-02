/**
 * TITAN Industry DNA — public API.
 *
 * The schema (twelve sections, ADR-011) AND the knowledge base that fills
 * it: per-trade records distilled from the research dossiers, a platform
 * layer for cross-trade truths, and an exact-id resolver. Every engine
 * (Website, Ads, SEO, Brain, …) reads a trade business from these contracts.
 *
 * Knowledge laws: sections are sourced or silent (provenance gate in
 * tests); matching is exact-id or the taxonomy's own matcher, never local
 * substring logic (ADR-062/066).
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

export {
  DNA_SECTION_KEYS,
  resolveIndustryDna,
  sectionHasContent,
  industryDnaCoveredTradeIds,
  industryDnaGapTradeIds,
} from "./resolver";
export type { DnaSectionKey, ResolvedIndustryDna } from "./resolver";
export { RESEARCH_DOCS } from "./data/sources";
