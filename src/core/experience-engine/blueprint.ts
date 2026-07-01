/**
 * Experience Engine — the output blueprint (interfaces only).
 *
 * The Experience Blueprint is the structured *specification* of a premium,
 * cinematic, conversion-focused digital experience. It describes the experience;
 * it is not the built website. Every structure is extensible.
 */

import type {
  DeviceTarget,
  ExperienceMeta,
  ExperiencePageType,
  MediaKind,
} from "./common";

/** Art direction for a single media asset (guidance, not the asset itself). */
export interface MediaAssetDirection extends ExperienceMeta {
  kind: MediaKind;
  purpose?: string;
  /** Style, mood, and subject guidance. */
  direction?: string;
}

/** Overall media direction: photography, cinematic video, and 3D. */
export interface MediaDirection extends ExperienceMeta {
  assets?: ReadonlyArray<MediaAssetDirection>;
  photographyStyle?: string;
  videoStyle?: string;
  threeDStyle?: string;
}

/** Motion and animation strategy for the experience. */
export interface AnimationStrategy extends ExperienceMeta {
  /** Named motion principles, e.g. "reveal-on-scroll", "parallax". */
  principles?: ReadonlyArray<string>;
  /** Signature cinematic moments (hero reveals, transitions). */
  signatureMoments?: ReadonlyArray<string>;
  /** Overall motion intensity. */
  intensity?: "subtle" | "balanced" | "bold";
}

/** 3D / interactive experience direction. */
export interface InteractionDirection extends ExperienceMeta {
  /** Interactive or 3D concepts to include. */
  concepts?: ReadonlyArray<string>;
  /** How prominently 3D is used. */
  threeD?: "none" | "accent" | "immersive";
}

/** A call to action. */
export interface CallToAction extends ExperienceMeta {
  label?: string;
  /** Intent, e.g. "book", "call", "quote". */
  intent?: string;
}

/** An immersive hero section specification. */
export interface HeroDirection extends ExperienceMeta {
  /** Direction/placeholder — not final copy. */
  headline?: string;
  subheadline?: string;
  media?: MediaAssetDirection;
  callToAction?: CallToAction;
  /** Cinematic treatment guidance. */
  cinematicTreatment?: string;
}

/** A lead-capture flow (form / step-sequence direction). */
export interface LeadCaptureFlow extends ExperienceMeta {
  name?: string;
  steps?: ReadonlyArray<string>;
  fields?: ReadonlyArray<string>;
  /** The objective this flow serves. */
  objective?: string;
}

/** SEO-ready structural direction for a page or the whole site. */
export interface SeoStructure extends ExperienceMeta {
  titleDirection?: string;
  metaDescriptionDirection?: string;
  headings?: ReadonlyArray<string>;
  targetKeywords?: ReadonlyArray<string>;
  schemaTypes?: ReadonlyArray<string>;
  internalLinks?: ReadonlyArray<string>;
}

/** Responsive / mobile-first strategy. */
export interface ResponsiveStrategy extends ExperienceMeta {
  /** Device targets in priority order (mobile-first by default). */
  deviceOrder?: ReadonlyArray<DeviceTarget>;
  breakpoints?: ReadonlyArray<string>;
  mobileConsiderations?: ReadonlyArray<string>;
}

/** A content section within a page. */
export interface ExperienceSection extends ExperienceMeta {
  /** Section type, e.g. "hero", "services", "testimonials", "cta". */
  type: string;
  heading?: string;
  media?: MediaAssetDirection;
  callToAction?: CallToAction;
}

/** A single page in the experience. */
export interface ExperiencePage extends ExperienceMeta {
  type: ExperiencePageType;
  /** URL path direction, e.g. "/services/boiler-repair". */
  path?: string;
  hero?: HeroDirection;
  sections?: ReadonlyArray<ExperienceSection>;
  seo?: SeoStructure;
  leadCapture?: ReadonlyArray<LeadCaptureFlow>;
}

/**
 * The Experience Blueprint — the complete, structured specification the engine
 * produces from an {@link ExperienceBrief}. Composes pages with site-wide media,
 * animation, interaction, SEO, lead-capture, and responsive direction.
 */
export interface ExperienceBlueprint extends ExperienceMeta {
  pages: ReadonlyArray<ExperiencePage>;
  mediaDirection?: MediaDirection;
  animationStrategy?: AnimationStrategy;
  interaction?: InteractionDirection;
  seo?: SeoStructure;
  leadCapture?: ReadonlyArray<LeadCaptureFlow>;
  responsive?: ResponsiveStrategy;
}
