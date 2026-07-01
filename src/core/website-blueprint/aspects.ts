/**
 * Website Blueprint — cross-cutting aspect blueprints (interfaces only).
 *
 * These describe *requirements and behaviour* reused across pages, sections, and
 * components: media, animation, interaction, SEO, accessibility, responsive,
 * conversion, CTAs, lead capture, internal linking, and trust. Platform- and
 * implementation-independent — no HTML/CSS/framework, no assets.
 */

import type { BlueprintElement, BlueprintId, DeviceTarget } from "./common";

/** Media requirement/direction — describes the media, never the asset. */
export interface MediaBlueprint extends BlueprintElement {
  kind: "image" | "video" | "cinemagraph" | "3d" | "animation" | "icon";
  purpose?: string;
  direction?: string;
  /** Pointer to where a future Media Generator will produce the asset. */
  generationRef?: string;
}

/** Animation / motion requirement. */
export interface AnimationBlueprint extends BlueprintElement {
  principles?: ReadonlyArray<string>;
  /** e.g. "load", "scroll", "hover", "interaction". */
  trigger?: string;
  intensity?: "subtle" | "balanced" | "bold";
}

/** Interaction requirement (e.g. quote calculator, map, slider). */
export interface InteractionBlueprint extends BlueprintElement {
  type: string;
  behaviour?: string;
}

/** SEO requirement for a page or the whole site. */
export interface SeoBlueprint extends BlueprintElement {
  intent?: string;
  titleDirection?: string;
  metaDescriptionDirection?: string;
  headingsOutline?: ReadonlyArray<string>;
  targetKeywords?: ReadonlyArray<string>;
  schemaOpportunities?: ReadonlyArray<string>;
}

/** Accessibility requirement. */
export interface AccessibilityBlueprint extends BlueprintElement {
  /** WCAG level target, e.g. "AA". */
  wcagTarget?: string;
  requirements?: ReadonlyArray<string>;
}

/** Responsive requirement / behaviour. */
export interface ResponsiveBlueprint extends BlueprintElement {
  /** Priority order of devices (mobile-first by default). */
  deviceOrder?: ReadonlyArray<DeviceTarget>;
  behaviour?: ReadonlyArray<string>;
}

/** A call to action. */
export interface CallToActionBlueprint extends BlueprintElement {
  label: string;
  /** e.g. "call", "book", "quote". */
  intent?: string;
  destination?: string;
}

/** A lead-capture requirement (form/flow direction). */
export interface LeadCaptureBlueprint extends BlueprintElement {
  name?: string;
  fields?: ReadonlyArray<string>;
  steps?: ReadonlyArray<string>;
  objective?: string;
}

/** Conversion requirement for a page or section. */
export interface ConversionBlueprint extends BlueprintElement {
  primaryGoal?: string;
  ctas?: ReadonlyArray<CallToActionBlueprint>;
  leadCapture?: ReadonlyArray<LeadCaptureBlueprint>;
  principles?: ReadonlyArray<string>;
}

/** A single internal link requirement. */
export interface InternalLinkBlueprint extends BlueprintElement {
  toPageId?: BlueprintId;
  anchorText?: string;
  reason?: string;
}

/** Internal linking requirement for a page or the site. */
export interface InternalLinkingBlueprint extends BlueprintElement {
  links?: ReadonlyArray<InternalLinkBlueprint>;
}

/** A single trust signal. */
export interface TrustSignalBlueprint extends BlueprintElement {
  /** e.g. "reviews", "certification", "guarantee", "years-in-business". */
  type: string;
  label?: string;
}

/** Trust signals for a page or the site. */
export interface TrustSignalsBlueprint extends BlueprintElement {
  signals?: ReadonlyArray<TrustSignalBlueprint>;
}
