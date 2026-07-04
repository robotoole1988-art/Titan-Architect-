/**
 * Renderer contracts: what a primitive component receives, the component map,
 * and the renderPage options. The blueprint is the entire input (ADR-022).
 */

import type { ComponentType } from "react";
import type { SectionBlueprint, WebsiteBlueprint } from "@/core/website-blueprint";
import type { SlotMap } from "./slots";

/** Present only on PUBLISHED sites: wires forms to real enquiry capture. */
export interface ServingContext {
  publicationId: string;
  slug: string;
}

/**
 * The drawing vs the building (ADR-034). "preview" is the architect's
 * drawing — annotations and media briefs visible. "public" is the customer's
 * building — zero internal scaffolding, ever; empty states express honesty
 * as ABSENCE (sections collapse rather than render skeletal).
 */
export type RenderMode = "preview" | "public";

/** Real business contact data for public chrome (from the Business record). */
export interface RenderContact {
  phone?: string;
  email?: string;
}

/** An approved generated asset, resolved for rendering (ADR-033/036). */
export interface ResolvedMediaAsset {
  url: string;
  modality: "image" | "video";
  width?: number;
  height?: number;
  posterUrl?: string;
  lqip?: string;
  /** Video only (ADR-036): clip length in seconds. */
  durationSeconds?: number;
}

/** Everything a primitive component may draw from. */
export interface PrimitiveSectionProps {
  section: SectionBlueprint;
  /** The variant the blueprint selected (extensions.variant). */
  variant: string;
  /** Parsed content slots — the only source of business copy. */
  slots: SlotMap;
  /** The whole blueprint, for cross-cutting context (identity, conversion). */
  blueprint: WebsiteBlueprint;
  /** Set when serving a live publication (ADR-027); absent in previews. */
  serving?: ServingContext;
  /** APPROVED media by slotRef (ADR-033); slots without one stay honest frames. */
  mediaAssets?: Readonly<Record<string, ResolvedMediaAsset>>;
  /** The render mode (ADR-034). Public pages carry zero scaffolding. */
  mode: RenderMode;
}

export type PrimitiveComponent = ComponentType<PrimitiveSectionProps>;

/** Registry primitive id → the hand-crafted component that realises it. */
export type PrimitiveComponentMap = Readonly<Record<string, PrimitiveComponent>>;

/** What to do when a section's primitive has no component mapping. */
export type UnmappedPrimitiveBehaviour = "throw" | "skip";

/** One resolved navigation link (page collection, ADR-028). */
export interface SiteNavLink {
  pageId: string;
  label: string;
  href: string;
  active: boolean;
}

export interface RenderPageOptions {
  /** Override the component map (tests, future partial renderers). */
  map?: PrimitiveComponentMap;
  /** Which page of the collection to render (default: the first/homepage). */
  pageId?: string;
  /**
   * Resolve a page's href for navigation links. Defaults to the page's
   * suggestedUrl — correct for hostname serving; slug serving and previews
   * pass their own resolver (ADR-028).
   */
  pageHref?: (pageId: string, suggestedUrl: string) => string;
  /** Defaults by NODE_ENV: throw in development, skip (+warn) in production. */
  onUnmapped?: UnmappedPrimitiveBehaviour;
  /** Live-publication context — enables real enquiry capture (ADR-027). */
  serving?: ServingContext;
  /** Approved media map (ADR-033). */
  media?: Readonly<Record<string, ResolvedMediaAsset>>;
  /** Render mode (ADR-034). Defaults to "preview" — the architect's drawing. */
  mode?: RenderMode;
  /** Real contact data for public chrome (from the Business record). */
  contact?: RenderContact;
}
