/**
 * Experience Strategy — the document schema.
 *
 * The Experience Strategy is a structured strategy *document* for a trade
 * business. These are its ten sections plus request/meta types. Every section
 * extends {@link StrategySection} (a summary + rationale + open extensions bag),
 * so the document is readable and extensible.
 */

import type { IndustryDna } from "@/core/industry-dna";

export type StrategyExtensions = Record<string, unknown>;

/** Base for every strategy section. */
export interface StrategySection {
  /** One-line summary of this section's direction. */
  summary: string;
  /** The reasoning behind the direction. */
  rationale?: string;
  extensions?: StrategyExtensions;
}

/** 1. Visual Direction */
export interface VisualDirection extends StrategySection {
  aesthetic: string;
  moodKeywords: ReadonlyArray<string>;
  colourDirection: ReadonlyArray<string>;
  typographyDirection: string;
}

/** 2. Hero Concept */
export interface HeroConcept extends StrategySection {
  headline: string;
  subheadline: string;
  visualConcept: string;
  primaryCta: string;
}

/** 3. Storytelling */
export interface Storytelling extends StrategySection {
  narrativeArc: string;
  keyMessages: ReadonlyArray<string>;
  emotionalHooks: ReadonlyArray<string>;
}

/** 4. Animation Strategy */
export interface AnimationStrategy extends StrategySection {
  principles: ReadonlyArray<string>;
  signatureMoments: ReadonlyArray<string>;
  intensity: "subtle" | "balanced" | "bold";
}

/** 5. Interactive Features */
export interface InteractiveFeatures extends StrategySection {
  features: ReadonlyArray<string>;
}

/** 6. Media Direction */
export interface MediaDirection extends StrategySection {
  photographyStyle: string;
  videoStyle: string;
  threeDStyle?: string;
  shotList: ReadonlyArray<string>;
}

/** 7. Conversion Strategy */
export interface ConversionStrategy extends StrategySection {
  primaryCta: string;
  leadCaptureFlows: ReadonlyArray<string>;
  trustSignals: ReadonlyArray<string>;
}

/** 8. SEO Strategy */
export interface SeoStrategy extends StrategySection {
  primaryKeywords: ReadonlyArray<string>;
  localKeywords: ReadonlyArray<string>;
  schemaTypes: ReadonlyArray<string>;
  contentPillars: ReadonlyArray<string>;
}

/** 9. Mobile Strategy */
export interface MobileStrategy extends StrategySection {
  principles: ReadonlyArray<string>;
  performanceTargets: ReadonlyArray<string>;
}

/** 10. AI Media Brief — direction a future AI/Brain will use to generate media. */
export interface AiMediaBrief extends StrategySection {
  styleGuidance: string;
  imagePrompts: ReadonlyArray<string>;
  videoPrompts: ReadonlyArray<string>;
}

/** How a strategy was produced. */
export type StrategySource = "mock" | "pipeline" | "brain";

/** Document metadata. */
export interface StrategyDocumentMeta {
  businessName: string;
  trade: string;
  location: string;
  /** ISO-8601 generation timestamp. */
  generatedAt: string;
  version: string;
  source: StrategySource;
  extensions?: StrategyExtensions;
}

/** The input to the generator — the data about the business. */
export interface ExperienceStrategyRequest {
  businessName: string;
  trade: string;
  location: string;
  /** Optional full Industry DNA; a mock strategy is produced with or without it. */
  industryDna?: IndustryDna;
  extensions?: StrategyExtensions;
}

/** The generated Experience Strategy document — all ten sections. */
export interface ExperienceStrategy {
  meta: StrategyDocumentMeta;
  visualDirection: VisualDirection;
  heroConcept: HeroConcept;
  storytelling: Storytelling;
  animationStrategy: AnimationStrategy;
  interactiveFeatures: InteractiveFeatures;
  mediaDirection: MediaDirection;
  conversionStrategy: ConversionStrategy;
  seoStrategy: SeoStrategy;
  mobileStrategy: MobileStrategy;
  aiMediaBrief: AiMediaBrief;
  extensions?: StrategyExtensions;
}
