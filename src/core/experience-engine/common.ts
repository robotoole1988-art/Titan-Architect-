/**
 * Experience Engine — shared primitives (interfaces only).
 *
 * No implementation, no data, no AI, no database, no UI. These primitives keep
 * every part of the engine's contract extensible: an open `extensions` bag,
 * a shared meta base, and the closed classification unions.
 */

/** Open bag for future, unmodelled attributes on any experience structure. */
export type ExperienceExtensions = Record<string, unknown>;

/**
 * Base every experience structure extends — shared optional metadata plus an
 * open extension bag, so any part can grow without a breaking change. These are
 * `interface`s, so they can also be widened via `extends` or declaration merging.
 */
export interface ExperienceMeta {
  /** Free-form notes about this structure. */
  notes?: string;
  /** Future-proofing: attributes not yet modelled explicitly. */
  extensions?: ExperienceExtensions;
}

/** The kinds of page the engine can produce. */
export type ExperiencePageType =
  | "home"
  | "landing"
  | "service"
  | "location"
  | "about"
  | "contact";

/** The conversion objectives an experience can be optimised for. */
export type ExperienceObjectiveType =
  | "lead-capture"
  | "phone-call"
  | "booking"
  | "quote-request"
  | "brand-awareness"
  | "sale";

/** Device targets, in the order they are prioritised (mobile-first by default). */
export type DeviceTarget = "mobile" | "tablet" | "desktop";

/** The kinds of media the experience may direct (art direction, not assets). */
export type MediaKind =
  | "image"
  | "video"
  | "cinemagraph"
  | "3d"
  | "animation";
