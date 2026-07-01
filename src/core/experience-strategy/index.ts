/**
 * TITAN Experience Strategy Generator — public API.
 *
 * The first engine that produces real business value: it generates a structured
 * Experience Strategy document for a trade business. v0.1 uses mock data — no
 * AI, no website generation, no UI. Designed so the Brain can inject a real
 * Experience Engine + Pipeline later without changing consumers.
 *
 * This is the ONLY surface other modules may import from.
 */

export type {
  StrategyExtensions,
  StrategySection,
  VisualDirection,
  HeroConcept,
  Storytelling,
  AnimationStrategy,
  InteractiveFeatures,
  MediaDirection,
  ConversionStrategy,
  SeoStrategy,
  MobileStrategy,
  AiMediaBrief,
  StrategySource,
  StrategyDocumentMeta,
  ExperienceStrategyRequest,
  ExperienceStrategy,
} from "./types";

export type {
  ExperienceStrategyGenerator,
  ExperienceStrategyContext,
  ExperienceStrategyGeneratorProvider,
} from "./generator";

export {
  EXPERIENCE_STRATEGY_VERSION,
  generateExperienceStrategy,
  mockExperienceStrategyGenerator,
} from "./generator";
