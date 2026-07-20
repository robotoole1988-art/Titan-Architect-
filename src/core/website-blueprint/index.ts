/**
 * TITAN Website Blueprint — public API.
 *
 * The Blueprint is the master, platform-independent architectural document a
 * website is built from — the architect's drawings, produced before
 * construction. No rendering, no HTML/CSS/React/Tailwind, no media, no AI, no
 * database.
 *
 * Alongside the contracts this module now ships the first real engine: the
 * Section Primitive Registry (the typed catalogue of composable sections), the
 * deterministic blueprint builder (strategy → homepage blueprint), and the
 * validator that enforces the registry (ADR-021).
 *
 * See docs/architecture/adr-017-website-blueprint-engine.md,
 * docs/architecture/adr-021-section-primitive-registry.md, and
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

export type {
  PrimitiveAspects,
  SectionPrimitive,
  PrimitiveRegistry,
} from "./registry";
export { SECTION_PRIMITIVE_REGISTRY, getSectionPrimitive } from "./registry";

export type { BlueprintValidationResult } from "./validator";
export { validateBlueprint } from "./validator";

export { buildWebsiteBlueprint, createWebsiteBlueprintEngine, pageSlug } from "./builder";
export { resolveFaqBank } from "./faq-content";
export type { FaqBank, TradeFaq } from "./faq-content";

export type { JsonLdObject, PageJsonLdOptions } from "./schema";
export { buildPageJsonLd } from "./schema";
