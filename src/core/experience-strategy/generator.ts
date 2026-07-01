/**
 * Experience Strategy Generator (v0.1).
 *
 * The first engine that produces real business value: it turns a business's
 * basic details into a complete, structured Experience Strategy document.
 *
 * v0.1 uses **mock data** — deterministic content derived from the request. No
 * AI, no website generation, no UI. The `ExperienceStrategyGenerator` interface
 * and the `ExperienceStrategyContext` type are defined so that later the Brain
 * can inject a real Experience Engine + Pipeline and populate strategies
 * automatically, without changing consumers.
 */

import type { ExperienceEngine } from "@/core/experience-engine";
import type { ExperiencePipeline } from "@/core/experience-pipeline";
import type {
  AiMediaBrief,
  AnimationStrategy,
  ConversionStrategy,
  ExperienceStrategy,
  ExperienceStrategyRequest,
  HeroConcept,
  InteractiveFeatures,
  MediaDirection,
  MobileStrategy,
  SeoStrategy,
  Storytelling,
  StrategyDocumentMeta,
  VisualDirection,
} from "./types";

/** The version of the Experience Strategy engine these interfaces implement. */
export const EXPERIENCE_STRATEGY_VERSION = "0.1";

/** The engine contract. The Brain will provide its own implementation later. */
export interface ExperienceStrategyGenerator {
  generate(request: ExperienceStrategyRequest): ExperienceStrategy;
}

/**
 * The backends a future, real generator consumes. The v0.1 mock does not use
 * these; the type documents how the Brain will wire the engine up later.
 */
export interface ExperienceStrategyContext {
  engine: ExperienceEngine;
  pipeline: ExperiencePipeline;
}

/** Resolves the active generator — swap the mock for a Brain-backed one later. */
export type ExperienceStrategyGeneratorProvider = () => ExperienceStrategyGenerator;

/**
 * Generate a complete Experience Strategy from a request, using mock logic that
 * tailors every section to the business name, trade, and location.
 */
export function generateExperienceStrategy(
  request: ExperienceStrategyRequest,
): ExperienceStrategy {
  const business = request.businessName.trim();
  const trade = request.trade.trim();
  const location = request.location.trim();
  const tradeLower = trade.toLowerCase();

  const meta: StrategyDocumentMeta = {
    businessName: business,
    trade,
    location,
    generatedAt: new Date().toISOString(),
    version: EXPERIENCE_STRATEGY_VERSION,
    source: "mock",
  };

  const visualDirection: VisualDirection = {
    summary: `A premium, trustworthy visual identity for ${business} — a ${trade} serving ${location}.`,
    rationale: `Trade customers in ${location} choose on trust and credibility, so the visual direction leads with professionalism and reassurance.`,
    aesthetic: "Premium, clean, and confidence-building",
    moodKeywords: ["trustworthy", "premium", "local", "reliable", "modern"],
    colourDirection: [
      "deep navy (authority)",
      "warm accent (approachability)",
      "clean neutrals (clarity)",
    ],
    typographyDirection:
      "A strong, legible sans-serif for headings paired with a highly readable body face.",
  };

  const heroConcept: HeroConcept = {
    summary: `A cinematic hero positioning ${business} as the go-to ${trade} in ${location}.`,
    headline: `${location}'s trusted ${tradeLower}`,
    subheadline: `${business} — fast, reliable ${tradeLower} work, done right the first time.`,
    visualConcept: `Full-bleed cinematic footage of ${tradeLower} work in a recognisable ${location} setting, with a calm, confident overlay.`,
    primaryCta: "Get a free quote",
  };

  const storytelling: Storytelling = {
    summary: `Position ${business} as the local expert who removes stress and delivers certainty.`,
    narrativeArc: `Problem (something has gone wrong) → Guide (${business}, the trusted local ${tradeLower}) → Plan (simple and fast) → Success (sorted and guaranteed).`,
    keyMessages: [
      `Local ${tradeLower} you can trust`,
      "Fast response",
      "Upfront, honest pricing",
      "Guaranteed workmanship",
    ],
    emotionalHooks: ["relief", "confidence", "local pride"],
  };

  const animationStrategy: AnimationStrategy = {
    summary: "Purposeful, premium motion that guides attention without distraction.",
    principles: [
      "reveal-on-scroll",
      "subtle parallax in the hero",
      "micro-interactions on calls to action",
    ],
    signatureMoments: [
      "cinematic hero reveal",
      "animated trust badges",
      "smooth section transitions",
    ],
    intensity: "balanced",
  };

  const interactiveFeatures: InteractiveFeatures = {
    summary: `Interactive tools that turn ${location} visitors into enquiries for ${business}.`,
    features: [
      "instant quote estimator",
      `${location} service-area map`,
      "before/after project slider",
      "click-to-call on mobile",
    ],
  };

  const mediaDirection: MediaDirection = {
    summary: `Authentic, high-quality media that proves ${business}'s craft.`,
    photographyStyle: `Real, well-lit photography of genuine ${tradeLower} jobs and the team on-site in ${location}.`,
    videoStyle:
      "Short, cinematic clips of work in progress and finished results, with natural sound.",
    threeDStyle:
      "Restrained 3D accents only where they clarify a service — never gimmicky.",
    shotList: [
      `${business} team arriving on-site`,
      "close-up of skilled work in progress",
      "satisfied customer with the finished job",
      `recognisable ${location} landmarks for local context`,
    ],
  };

  const conversionStrategy: ConversionStrategy = {
    summary: "Make enquiring effortless and reduce perceived risk at every step.",
    primaryCta: "Get a free quote",
    leadCaptureFlows: [
      "sticky header call button",
      "short 3-field quote form",
      "callback request",
    ],
    trustSignals: [
      "verified reviews",
      "trade certifications",
      "workmanship guarantee",
      "years in business",
    ],
  };

  const seoStrategy: SeoStrategy = {
    summary: `Own local search for ${tradeLower} in ${location}.`,
    primaryKeywords: [
      `${tradeLower} ${location}`,
      `${tradeLower} near me`,
      `emergency ${tradeLower} ${location}`,
    ],
    localKeywords: [
      `${tradeLower} in ${location}`,
      `best ${tradeLower} ${location}`,
      `${location} ${tradeLower} services`,
    ],
    schemaTypes: ["LocalBusiness", "Service", "FAQPage", "Review"],
    contentPillars: [
      `${trade} services`,
      `${location} location pages`,
      "frequently asked questions",
      "project case studies",
    ],
  };

  const mobileStrategy: MobileStrategy = {
    summary: "Mobile-first, because most trade enquiries come from phones.",
    principles: [
      "thumb-friendly calls to action",
      "click-to-call always visible",
      "fast-loading hero",
      "short forms",
    ],
    performanceTargets: [
      "largest contentful paint under 2.5s on 4G",
      "instant tap response",
      "no cumulative layout shift",
    ],
  };

  const aiMediaBrief: AiMediaBrief = {
    summary: `A brief the Brain/AI will later use to generate media for ${business}. (Not generated by AI here.)`,
    styleGuidance: `Premium, authentic, and local to ${location}: natural light, real ${tradeLower} contexts, a trustworthy tone, and no stock-photo clichés.`,
    imagePrompts: [
      `A ${business} professional carrying out ${tradeLower} work on-site in ${location}, natural daylight, premium documentary style`,
      `Clean finished ${tradeLower} work, close-up, shallow depth of field, warm and reassuring`,
    ],
    videoPrompts: [
      `Cinematic 10-second clip of ${business}'s team completing a ${tradeLower} job in ${location}, calm and reassuring tone`,
    ],
  };

  return {
    meta,
    visualDirection,
    heroConcept,
    storytelling,
    animationStrategy,
    interactiveFeatures,
    mediaDirection,
    conversionStrategy,
    seoStrategy,
    mobileStrategy,
    aiMediaBrief,
  };
}

/** The v0.1 mock generator — a ready-to-use `ExperienceStrategyGenerator`. */
export const mockExperienceStrategyGenerator: ExperienceStrategyGenerator = {
  generate: (request) => generateExperienceStrategy(request),
};
