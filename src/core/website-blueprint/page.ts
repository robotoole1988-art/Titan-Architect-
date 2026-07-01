/**
 * Website Blueprint — the Page blueprint and Page Collection (interfaces only).
 *
 * Every page describes its purpose, audience, conversion goal, SEO intent, URL,
 * its sections and their order, and all of its cross-cutting requirements — plus
 * notes for future AI. Platform-independent; no markup.
 */

import type { BlueprintElement, BlueprintId } from "./common";
import type { SectionBlueprint } from "./section";
import type {
  AccessibilityBlueprint,
  AnimationBlueprint,
  ConversionBlueprint,
  InteractionBlueprint,
  InternalLinkingBlueprint,
  LeadCaptureBlueprint,
  MediaBlueprint,
  ResponsiveBlueprint,
  SeoBlueprint,
  TrustSignalsBlueprint,
} from "./aspects";

/** The kind of page (open — home, landing, service, location, about, contact, …). */
export type PageType = string;

export interface PageBlueprint extends BlueprintElement {
  name: string;
  type: PageType;
  purpose: string;
  targetAudience?: string;
  primaryConversionGoal?: string;
  seoIntent?: string;
  /** Suggested URL path, e.g. "/services/boiler-repair". */
  suggestedUrl?: string;
  /** The page's sections. Array order is the default section order. */
  sections: ReadonlyArray<SectionBlueprint>;
  /** Explicit section order by id, when it differs from array order. */
  sectionOrder?: ReadonlyArray<BlueprintId>;
  media?: ReadonlyArray<MediaBlueprint>;
  animation?: ReadonlyArray<AnimationBlueprint>;
  interactiveElements?: ReadonlyArray<InteractionBlueprint>;
  leadCapture?: ReadonlyArray<LeadCaptureBlueprint>;
  trustElements?: TrustSignalsBlueprint;
  internalLinks?: InternalLinkingBlueprint;
  schemaOpportunities?: ReadonlyArray<string>;
  accessibility?: AccessibilityBlueprint;
  responsive?: ResponsiveBlueprint;
  conversion?: ConversionBlueprint;
  seo?: SeoBlueprint;
  /** Notes for future AI improvements. */
  futureAiNotes?: ReadonlyArray<string>;
}

/** The set of pages that make up the site. */
export interface PageCollectionBlueprint extends BlueprintElement {
  pages: ReadonlyArray<PageBlueprint>;
}
