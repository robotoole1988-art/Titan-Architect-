/**
 * Knowledge Kernel — the six DNA record contracts.
 *
 * Interfaces only. Each DNA kind extends {@link DnaRecord} (system metadata)
 * and adds its own domain fields. These shapes are deliberately lean and are
 * expected to evolve; they are the contract, not the implementation.
 */

import type { DnaRecord } from "./common";

/** A trade / industry vertical (e.g. plumbing, roofing, electrical). */
export interface TradeDna extends DnaRecord {
  kind: "trade";
  /** Canonical slug, e.g. "plumbing". */
  slug: string;
  /** Services offered within this trade. */
  services: ReadonlyArray<string>;
  /** Domain terminology / keywords customers use. */
  vocabulary: ReadonlyArray<string>;
  /** Typical demand pattern across the year. */
  seasonality?: ReadonlyArray<string>;
  /** Regulatory or certification considerations. */
  compliance?: ReadonlyArray<string>;
}

/** A geographic market (city, region, postcode area). */
export interface LocationDna extends DnaRecord {
  kind: "location";
  /** e.g. "Manchester", a region, or a postcode area. */
  area: string;
  country?: string;
  /** Free-form demographic descriptors. */
  demographics?: ReadonlyArray<string>;
  /** Notable market characteristics for this area. */
  marketNotes?: ReadonlyArray<string>;
}

/** A brand's identity. */
export interface BrandDna extends DnaRecord {
  kind: "brand";
  /** Positioning statement. */
  positioning?: string;
  /** Tone-of-voice descriptors. */
  voice: ReadonlyArray<string>;
  /** Core values / promises. */
  values: ReadonlyArray<string>;
  /** References to visual identity assets (ids/urls only — not the assets). */
  visualIdentity?: ReadonlyArray<string>;
}

/** A customer segment or persona. */
export interface CustomerDna extends DnaRecord {
  kind: "customer";
  /** Segment or persona name. */
  segment: string;
  needs: ReadonlyArray<string>;
  painPoints: ReadonlyArray<string>;
  /** Channels this customer is reachable through. */
  channels?: ReadonlyArray<string>;
}

/** A competitor in the market. */
export interface CompetitorDna extends DnaRecord {
  kind: "competitor";
  /** Competitor's positioning. */
  positioning?: string;
  strengths: ReadonlyArray<string>;
  weaknesses: ReadonlyArray<string>;
  /** Channels the competitor is active on. */
  channels?: ReadonlyArray<string>;
}

/** Marketing knowledge: channels, messaging, and observed patterns. */
export interface MarketingDna extends DnaRecord {
  kind: "marketing";
  /** Channels in play (e.g. "google-ads", "seo", "meta"). */
  channels: ReadonlyArray<string>;
  /** Recurring messaging themes that resonate. */
  messaging: ReadonlyArray<string>;
  /** Observed performance patterns (reserved; no metrics engine yet). */
  performanceNotes?: ReadonlyArray<string>;
}

/**
 * The authoritative map from DNA kind to its record type. This is the single
 * place that ties a `DnaKind` to its concrete contract, enabling type-safe,
 * per-kind access across the kernel's public interface.
 */
export interface DnaByKind {
  trade: TradeDna;
  location: LocationDna;
  brand: BrandDna;
  customer: CustomerDna;
  competitor: CompetitorDna;
  marketing: MarketingDna;
}

/** Resolves a DNA kind to its record type, e.g. `DnaOf<"trade">` is `TradeDna`. */
export type DnaOf<K extends keyof DnaByKind> = DnaByKind[K];
