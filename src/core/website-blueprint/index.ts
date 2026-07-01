/**
 * TITAN Website Blueprint — public API.
 *
 * Interfaces only. No implementation, no rendering, no HTML/CSS/React/Tailwind,
 * no media, no AI, no database, no business logic. The Blueprint is the master,
 * platform-independent architectural document a website is built from — the
 * architect's drawings, produced before construction.
 *
 * See docs/architecture/adr-017-website-blueprint-engine.md and
 * docs/prd/prd-005-website-blueprint-engine.md.
 *
 * This is the ONLY surface other modules may import from.
 */

export type {
  BlueprintExtensions,
  BlueprintId,
  ConfidenceScore,
  SourceReference,
  BlueprintConfidence,
  BlueprintElement,
  BlueprintPriority,
  UserEmotion,
  DeviceTarget,
} from "./common";

export type {
  MediaBlueprint,
  AnimationBlueprint,
  InteractionBlueprint,
  SeoBlueprint,
  AccessibilityBlueprint,
  ResponsiveBlueprint,
  CallToActionBlueprint,
  LeadCaptureBlueprint,
  ConversionBlueprint,
  InternalLinkBlueprint,
  InternalLinkingBlueprint,
  TrustSignalBlueprint,
  TrustSignalsBlueprint,
} from "./aspects";

export type {
  ComponentBlueprint,
  HeroBlueprint,
  TestimonialBlueprint,
  TestimonialsBlueprint,
  FaqItemBlueprint,
  FaqBlueprint,
  NavigationItemBlueprint,
  NavigationBlueprint,
  HeaderBlueprint,
  FooterBlueprint,
} from "./components";

export type { SectionBlueprint } from "./section";

export type {
  PageType,
  PageBlueprint,
  PageCollectionBlueprint,
} from "./page";

export type {
  SiteIdentityBlueprint,
  InformationArchitectureBlueprint,
  DesignSystemReferences,
  FutureExpansionPoint,
  FutureExpansionPoints,
} from "./site";

export type { WebsiteBlueprint } from "./website-blueprint";
export { WEBSITE_BLUEPRINT_VERSION } from "./website-blueprint";

export type {
  WebsiteBlueprintRequest,
  WebsiteBlueprintDependencies,
  WebsiteBlueprintEngine,
  WebsiteBlueprintEngineProvider,
} from "./engine";
