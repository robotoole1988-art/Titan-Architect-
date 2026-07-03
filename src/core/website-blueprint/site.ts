/**
 * Website Blueprint — site-level blueprints (interfaces only).
 *
 * Identity, information architecture, design-system references, and explicit
 * future-expansion points. References only — never tokens, assets, or markup.
 */

import type { BlueprintElement } from "./common";

/** Who the site is for and how it presents. */
export interface SiteIdentityBlueprint extends BlueprintElement {
  businessName?: string;
  trade?: string;
  location?: string;
  /** Coverage areas — each becomes an area landing page (ADR-028). */
  coverageAreas?: ReadonlyArray<string>;
  positioning?: string;
  voice?: ReadonlyArray<string>;
}

/** The high-level structure: which pages exist and how they relate. */
export interface InformationArchitectureBlueprint extends BlueprintElement {
  hierarchy?: ReadonlyArray<string>;
  pillars?: ReadonlyArray<string>;
}

/** References to the design system generators should use — not the tokens. */
export interface DesignSystemReferences extends BlueprintElement {
  /** e.g. "titan-dark". */
  themeRef?: string;
  typographyRef?: string;
  colourRef?: string;
  componentLibraryRef?: string;
}

/** A single place the architecture explicitly leaves room to grow. */
export interface FutureExpansionPoint extends BlueprintElement {
  area: string;
  note?: string;
}

/** The set of future-expansion points across the blueprint. */
export interface FutureExpansionPoints extends BlueprintElement {
  points?: ReadonlyArray<FutureExpansionPoint>;
}
