/**
 * TITAN Experience Strategy Generator — public API.
 *
 * The first engine that produces real business value: it generates a structured
 * Experience Strategy document for a trade business. v0.2 is deterministic
 * trade intelligence — it classifies the business into an archetype (how its
 * customers buy) and derives every section from one strategic thesis. No AI,
 * no website generation, no UI. Designed so the Brain can inject a real
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

export type { TradeArchetype, TradeProfile } from "./trade-intelligence";
export { classifyArchetype, buildTradeProfile } from "./trade-intelligence";

export {
  EXPERIENCE_STRATEGY_VERSION,
  generateExperienceStrategy,
  mockExperienceStrategyGenerator,
} from "./generator";
