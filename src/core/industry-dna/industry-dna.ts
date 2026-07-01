/**
 * Industry DNA — the composed root schema (interfaces only).
 */

import type { DnaExtensions } from "./common";
import type {
  AiBehaviourDna,
  BrandDna,
  BusinessIdentityDna,
  BusinessIntelligenceDna,
  CustomerPsychologyDna,
  MarketIntelligenceDna,
  OperationsDna,
  PaidAdvertisingDna,
  SalesDna,
  SearchSeoDna,
  ServicesDna,
  WebsiteDna,
} from "./sections";

/** The specification version these interfaces implement. */
export const INDUSTRY_DNA_VERSION = "1.0" as const;

/**
 * TITAN Industry DNA v1.0 — the complete, structured "genome" of a UK trade
 * business, composed of its twelve sections. Interfaces only; extensible at
 * every level (each section and the root carry an `extensions` bag).
 */
export interface IndustryDna {
  businessIdentity: BusinessIdentityDna;
  services: ServicesDna;
  customerPsychology: CustomerPsychologyDna;
  website: WebsiteDna;
  searchSeo: SearchSeoDna;
  paidAdvertising: PaidAdvertisingDna;
  brand: BrandDna;
  sales: SalesDna;
  marketIntelligence: MarketIntelligenceDna;
  operations: OperationsDna;
  businessIntelligence: BusinessIntelligenceDna;
  aiBehaviour: AiBehaviourDna;
  /** Future-proofing at the top level. */
  extensions?: DnaExtensions;
}
