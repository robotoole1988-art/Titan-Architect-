/**
 * Industry DNA — shared primitives (interfaces only).
 *
 * No implementation, no data, no AI, no database, no UI. These building blocks
 * are what make every section extensible: an open `extensions` bag, an
 * extensible list-entry shape, and a base every section extends.
 */

/** Open bag for future, unmodelled attributes on any DNA structure. */
export type DnaExtensions = Record<string, unknown>;

/** A single, extensible entry within a DNA list. */
export interface DnaEntry {
  /** Human-readable label — the primary value of the entry. */
  label: string;
  /** Optional scalar value (e.g. a metric, price, or code). */
  value?: string | number;
  /** Optional longer description or guidance. */
  description?: string;
  /** Future-proofing: arbitrary structured detail for this entry. */
  extensions?: DnaExtensions;
}

/** The default shape for a DNA collection — a list of extensible entries. */
export type DnaList = ReadonlyArray<DnaEntry>;

/**
 * Base every DNA section extends. Provides shared optional metadata and an open
 * extension bag so a section can grow without a breaking change. Sections are
 * `interface`s, so they can also be widened via `extends` or declaration
 * merging.
 */
export interface DnaSection {
  /** Free-form notes about this section. */
  notes?: string;
  /** Future-proofing: attributes not yet modelled explicitly. */
  extensions?: DnaExtensions;
}

/** A monetary figure, as a point value and/or a range. */
export interface MonetaryAmount {
  /** ISO currency code, e.g. "GBP". */
  currency?: string;
  amount?: number;
  min?: number;
  max?: number;
  extensions?: DnaExtensions;
}

/** Whether the work is emergency, planned, or both. */
export type EmergencyOrPlanned = "emergency" | "planned" | "both";

/** The property market served. */
export type PropertyMarket = "residential" | "commercial" | "both";

/** Relative urgency of the customer's need. */
export type UrgencyLevel = "low" | "medium" | "high" | "critical";
