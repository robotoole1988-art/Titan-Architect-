/**
 * Experience Strategy Generator (v2 intelligence).
 *
 * Turns a business's basic details into a complete, structured Experience
 * Strategy document. Deterministic — no AI, no website generation, no UI.
 *
 * The strategic *thinking* lives in `trade-intelligence.ts`: it classifies the
 * business into an archetype (how its customers buy) and derives a single,
 * coherent `TradeProfile`. This generator composes that profile into the
 * existing `ExperienceStrategy` shape — so the public contract is unchanged and
 * every consumer (e.g. Experience Studio) benefits automatically.
 *
 * The `ExperienceStrategyContext` type is defined so the Brain can later inject
 * a real Experience Engine + Pipeline without changing consumers.
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
import { buildTradeProfile } from "./trade-intelligence";

/** The version of the Experience Strategy engine these interfaces implement. */
export const EXPERIENCE_STRATEGY_VERSION = "0.2";

/** The engine contract. The Brain will provide its own implementation later. */
export interface ExperienceStrategyGenerator {
  generate(request: ExperienceStrategyRequest): ExperienceStrategy;
}

/**
 * The backends a future, real generator consumes. The mock does not use these;
 * the type documents how the Brain will wire the engine up later.
 */
export interface ExperienceStrategyContext {
  engine: ExperienceEngine;
  pipeline: ExperiencePipeline;
}

/** Resolves the active generator — swap the mock for a Brain-backed one later. */
export type ExperienceStrategyGeneratorProvider = () => ExperienceStrategyGenerator;

/** SEO modifiers that read naturally as a prefix rather than a suffix. */
const PREFIX_MODIFIERS = new Set([
  "emergency",
  "24 hour",
  "same day",
  "luxury",
  "bespoke",
  "designer",
  "private",
  "regular",
]);

function buildKeywords(
  tradeLower: string,
  location: string,
  modifiers: ReadonlyArray<string>,
): string[] {
  const base = [`${tradeLower} ${location}`, `${tradeLower} near me`];
  const extra = modifiers
    .filter((modifier) => modifier !== "near me")
    .map((modifier) =>
      PREFIX_MODIFIERS.has(modifier)
        ? `${modifier} ${tradeLower} ${location}`
        : `${tradeLower} ${modifier} ${location}`,
    );
  return [...new Set([...base, ...extra])].slice(0, 5);
}

const ANIMATION_PRINCIPLES: Record<
  "subtle" | "balanced" | "bold",
  string[]
> = {
  subtle: [
    "restraint over spectacle — motion must never delay the primary action",
    "gentle reveal-on-scroll to build trust",
    "purposeful micro-interactions only",
  ],
  balanced: [
    "reveal-on-scroll to pace the story",
    "one cinematic hero moment",
    "purposeful micro-interactions on calls to action",
  ],
  bold: [
    "confident, cinematic motion",
    "scroll-driven storytelling",
    "signature interactive moments",
  ],
};

/**
 * Generate a complete Experience Strategy for a business — every section a
 * different expression of one strategic thesis, tailored to the trade.
 */
export function generateExperienceStrategy(
  request: ExperienceStrategyRequest,
): ExperienceStrategy {
  const business = request.businessName.trim();
  const trade = request.trade.trim();
  const location = request.location.trim();
  const tradeLower = trade.toLowerCase();

  const profile = buildTradeProfile(business, trade, tradeLower, location);

  const meta: StrategyDocumentMeta = {
    businessName: business,
    trade,
    location,
    generatedAt: new Date().toISOString(),
    version: EXPERIENCE_STRATEGY_VERSION,
    source: "mock",
  };

  const visualDirection: VisualDirection = {
    summary: `${profile.positioning}`,
    rationale: `Buying mode: ${profile.buyingMode} ${profile.thesis}`,
    aesthetic: profile.aesthetic,
    moodKeywords: profile.moodKeywords,
    colourDirection: profile.colourDirection,
    typographyDirection: profile.typographyDirection,
  };

  const heroConcept: HeroConcept = {
    summary: `The hero leads with the positioning — ${profile.positioning}`,
    rationale: `It must answer the visitor's real objection in seconds: "${profile.primaryObjection}"`,
    headline: profile.hero.headline,
    subheadline: profile.hero.subheadline,
    visualConcept: profile.hero.visualConcept,
    primaryCta: profile.primaryCta,
  };

  const storytelling: Storytelling = {
    summary: profile.thesis,
    narrativeArc: profile.storyArc,
    keyMessages: profile.keyMessages,
    emotionalHooks: profile.dominantEmotions,
  };

  const animationStrategy: AnimationStrategy = {
    summary: `Motion tuned to a ${profile.buyingMode.toLowerCase()} — purposeful, never decorative.`,
    principles: ANIMATION_PRINCIPLES[profile.animationIntensity],
    signatureMoments: profile.animationSignatureMoments,
    intensity: profile.animationIntensity,
  };

  const interactiveFeatures: InteractiveFeatures = {
    summary: `Interactive tools chosen for this trade's decision triggers: ${profile.decisionTriggers.join(", ")}.`,
    features: profile.interactiveTools,
  };

  const mediaDirection: MediaDirection = {
    summary: `Media that proves ${business}'s credibility to a customer who buys on: ${profile.decisionTriggers[0]}.`,
    photographyStyle: profile.photographyStyle,
    videoStyle: profile.videoStyle,
    threeDStyle:
      profile.archetype === "premium" || profile.archetype === "project"
        ? "Tasteful 3D to let customers explore materials, finishes, or the finished space — never gimmicky."
        : "Restrained 3D accents only where they genuinely clarify a service.",
    shotList: profile.shotList,
  };

  const conversionStrategy: ConversionStrategy = {
    summary: `Remove the one objection that blocks the sale — "${profile.primaryObjection}" — and make the next step effortless.`,
    primaryCta: profile.primaryCta,
    leadCaptureFlows: [
      `a sticky "${profile.primaryCta}" action`,
      `a secondary "${profile.secondaryCta}" path for researchers`,
      "a short, low-friction lead form",
      "a callback request",
    ],
    trustSignals: profile.trustSignals,
  };

  const seoStrategy: SeoStrategy = {
    summary: `Own local ${tradeLower} search in ${location} with intent that matches how these customers actually search.`,
    primaryKeywords: buildKeywords(tradeLower, location, profile.seoModifiers),
    localKeywords: [
      `${tradeLower} in ${location}`,
      `best ${tradeLower} ${location}`,
      `${location} ${tradeLower}`,
    ],
    schemaTypes: ["LocalBusiness", "Service", "FAQPage", "Review"],
    contentPillars: profile.contentPillars,
  };

  const mobileStrategy: MobileStrategy = {
    summary: profile.isUrgent
      ? "Mobile-first and call-first — most enquiries arrive on a phone, in the moment."
      : "Mobile-first — most research and enquiries happen on a phone.",
    principles: profile.isUrgent
      ? [
          "click-to-call always visible and one-tap",
          "thumb-friendly actions, instantly",
          "a fast-loading, reassuring hero",
          "minimal forms",
        ]
      : [
          "thumb-friendly calls to action",
          "a fast-loading hero",
          "short, low-friction forms",
          "a sticky primary call to action",
        ],
    performanceTargets: [
      "largest contentful paint under 2.5s on 4G",
      "instant tap response",
      "no cumulative layout shift",
    ],
  };

  const aiMediaBrief: AiMediaBrief = {
    summary: `A brief the Brain/AI will later use to generate media for ${business}. (Not generated by AI here.)`,
    styleGuidance: `${profile.aesthetic}. Mood: ${profile.moodKeywords.join(", ")}. ${profile.photographyStyle} No stock-photo clichés.`,
    imagePrompts: [
      `${profile.shotList[0]} — for ${business}, a ${tradeLower} in ${location}. ${profile.aesthetic}, natural light, premium documentary style.`,
      `${profile.shotList[1]} — ${profile.moodKeywords.slice(0, 2).join(" and ")}, shallow depth of field.`,
    ],
    videoPrompts: [
      `${profile.videoStyle} A 10-second piece for ${business} in ${location} — tone: ${profile.moodKeywords[0]}.`,
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

/** The mock generator — a ready-to-use `ExperienceStrategyGenerator`. */
export const mockExperienceStrategyGenerator: ExperienceStrategyGenerator = {
  generate: (request) => generateExperienceStrategy(request),
};
