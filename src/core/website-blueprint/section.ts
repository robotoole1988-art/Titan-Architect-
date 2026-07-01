/**
 * Website Blueprint — the Section blueprint (interfaces only).
 *
 * Every section describes its purpose, priority, intended emotion, conversion
 * importance, content and component requirements, and its media/animation/
 * interaction/visibility/responsive behaviour — plus notes for future AI. It
 * does not describe markup.
 */

import type {
  BlueprintElement,
  BlueprintPriority,
  UserEmotion,
} from "./common";
import type {
  AnimationBlueprint,
  InteractionBlueprint,
  MediaBlueprint,
  ResponsiveBlueprint,
} from "./aspects";
import type { ComponentBlueprint } from "./components";

export interface SectionBlueprint extends BlueprintElement {
  /** Stable identifier/slug for the section. */
  identifier: string;
  purpose: string;
  priority: BlueprintPriority;
  expectedEmotion?: UserEmotion;
  /** 0..1 — how important this section is to conversion. */
  conversionImportance?: number;
  contentRequirements?: ReadonlyArray<string>;
  suggestedComponents?: ReadonlyArray<ComponentBlueprint>;
  animation?: AnimationBlueprint;
  media?: ReadonlyArray<MediaBlueprint>;
  interaction?: ReadonlyArray<InteractionBlueprint>;
  /** Rules for when this section is shown. */
  visibilityRules?: ReadonlyArray<string>;
  responsive?: ResponsiveBlueprint;
  /** Notes for future AI improvements. */
  futureAiNotes?: ReadonlyArray<string>;
}
