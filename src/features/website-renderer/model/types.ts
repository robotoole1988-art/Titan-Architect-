/**
 * Renderer contracts: what a primitive component receives, the component map,
 * and the renderPage options. The blueprint is the entire input (ADR-022).
 */

import type { ComponentType } from "react";
import type { SectionBlueprint, WebsiteBlueprint } from "@/core/website-blueprint";
import type { SlotMap } from "./slots";

/** Everything a primitive component may draw from. */
export interface PrimitiveSectionProps {
  section: SectionBlueprint;
  /** The variant the blueprint selected (extensions.variant). */
  variant: string;
  /** Parsed content slots — the only source of business copy. */
  slots: SlotMap;
  /** The whole blueprint, for cross-cutting context (identity, conversion). */
  blueprint: WebsiteBlueprint;
}

export type PrimitiveComponent = ComponentType<PrimitiveSectionProps>;

/** Registry primitive id → the hand-crafted component that realises it. */
export type PrimitiveComponentMap = Readonly<Record<string, PrimitiveComponent>>;

/** What to do when a section's primitive has no component mapping. */
export type UnmappedPrimitiveBehaviour = "throw" | "skip";

export interface RenderPageOptions {
  /** Override the component map (tests, future partial renderers). */
  map?: PrimitiveComponentMap;
  /** Defaults by NODE_ENV: throw in development, skip (+warn) in production. */
  onUnmapped?: UnmappedPrimitiveBehaviour;
}
