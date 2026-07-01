/**
 * TITAN Experience Engine — public API.
 *
 * Interfaces only (no implementation, no data, no AI, no database, no UI).
 * This is the ONLY surface other modules may import from. It defines the
 * contract for turning Industry DNA + guidance into a premium, cinematic,
 * conversion-focused Experience Blueprint.
 *
 * See docs/architecture/adr-012-experience-engine.md and docs/prd/prd-001-experience-engine.md.
 */

export type {
  ExperienceExtensions,
  ExperienceMeta,
  ExperiencePageType,
  ExperienceObjectiveType,
  DeviceTarget,
  MediaKind,
} from "./common";

export type {
  ExperienceBrief,
  ExperienceObjective,
  ExperienceGuidance,
} from "./brief";

export type {
  ExperienceBlueprint,
  ExperiencePage,
  ExperienceSection,
  HeroDirection,
  CallToAction,
  MediaDirection,
  MediaAssetDirection,
  AnimationStrategy,
  InteractionDirection,
  SeoStructure,
  LeadCaptureFlow,
  ResponsiveStrategy,
} from "./blueprint";

export type {
  ExperienceEngine,
  ExperienceEngineProvider,
} from "./experience-engine";

export { EXPERIENCE_ENGINE_VERSION } from "./experience-engine";
