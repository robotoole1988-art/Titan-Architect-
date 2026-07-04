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

/** An approved generated asset, resolved for rendering (ADR-033). */
export interface ResolvedMediaAsset {
  url: string;
  modality: "image" | "video";
  width?: number;
  height?: number;
  posterUrl?: string;
  lqip?: string;
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
}
