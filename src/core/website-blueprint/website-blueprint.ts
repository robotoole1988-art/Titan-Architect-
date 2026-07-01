/**
 * Website Blueprint — the master document (interfaces only).
 *
 * The complete, **platform-independent** architectural document for a website.
 * Every future generator (website, landing page, media, SEO, …) consumes it. It
 * describes WHAT to build and WHY — never HTML/CSS/React/Tailwind or any
 * framework, so the same blueprint can target React, Next.js, WordPress,
 * Shopify, Flutter, native mobile, or future frameworks without changing.
 */

import type { BlueprintElement } from "./common";
import type {
  AccessibilityBlueprint,
  ConversionBlueprint,
  InternalLinkingBlueprint,
  ResponsiveBlueprint,
  SeoBlueprint,
  TrustSignalsBlueprint,
} from "./aspects";
import type {
  FooterBlueprint,
  HeaderBlueprint,
  NavigationBlueprint,
} from "./components";
import type { PageCollectionBlueprint } from "./page";
import type {
  DesignSystemReferences,
  FutureExpansionPoints,
  InformationArchitectureBlueprint,
  SiteIdentityBlueprint,
} from "./site";

/** The version of the Website Blueprint schema these interfaces implement. */
export const WEBSITE_BLUEPRINT_VERSION = "0.1";

export interface WebsiteBlueprint extends BlueprintElement {
  version: string;
  identity: SiteIdentityBlueprint;
  informationArchitecture: InformationArchitectureBlueprint;
  navigation: NavigationBlueprint;
  header: HeaderBlueprint;
  footer: FooterBlueprint;
  pages: PageCollectionBlueprint;

  // Site-wide aspects
  seo?: SeoBlueprint;
  conversion?: ConversionBlueprint;
  trustSignals?: TrustSignalsBlueprint;
  internalLinking?: InternalLinkingBlueprint;
  accessibility?: AccessibilityBlueprint;
  responsive?: ResponsiveBlueprint;

  designSystem?: DesignSystemReferences;
  futureExpansion?: FutureExpansionPoints;
}
