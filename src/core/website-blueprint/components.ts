/**
 * Website Blueprint — component blueprints (interfaces only).
 *
 * Abstract, platform-independent descriptions of components and named structures
 * (hero, header, footer, navigation, testimonials, FAQ). No React/HTML/CSS.
 */

import type { BlueprintElement, BlueprintId } from "./common";
import type {
  AnimationBlueprint,
  CallToActionBlueprint,
  InteractionBlueprint,
  MediaBlueprint,
} from "./aspects";

/**
 * A component the future generators will realise. Platform-independent: it names
 * an abstract component *type* and its requirements, never a framework component.
 */
export interface ComponentBlueprint extends BlueprintElement {
  /** Abstract type, e.g. "feature-grid", "testimonial-carousel", "pricing-table". */
  type: string;
  purpose?: string;
  contentRequirements?: ReadonlyArray<string>;
  media?: ReadonlyArray<MediaBlueprint>;
  animation?: AnimationBlueprint;
  interaction?: InteractionBlueprint;
  cta?: CallToActionBlueprint;
}

/** The hero. */
export interface HeroBlueprint extends BlueprintElement {
  headlineDirection?: string;
  subheadlineDirection?: string;
  media?: MediaBlueprint;
  cta?: CallToActionBlueprint;
  animation?: AnimationBlueprint;
  cinematicTreatment?: string;
}

/** A single testimonial requirement. */
export interface TestimonialBlueprint extends BlueprintElement {
  attribution?: string;
  themeDirection?: string;
}

/** Testimonials section. */
export interface TestimonialsBlueprint extends BlueprintElement {
  items?: ReadonlyArray<TestimonialBlueprint>;
  layoutDirection?: string;
}

/** A single FAQ item requirement. */
export interface FaqItemBlueprint extends BlueprintElement {
  questionDirection: string;
  answerDirection?: string;
}

/** FAQ section. */
export interface FaqBlueprint extends BlueprintElement {
  items?: ReadonlyArray<FaqItemBlueprint>;
}

/** A navigation item (may nest). */
export interface NavigationItemBlueprint extends BlueprintElement {
  label: string;
  toPageId?: BlueprintId;
  children?: ReadonlyArray<NavigationItemBlueprint>;
}

/** Site navigation. */
export interface NavigationBlueprint extends BlueprintElement {
  items: ReadonlyArray<NavigationItemBlueprint>;
}

/** The header. */
export interface HeaderBlueprint extends BlueprintElement {
  navigationId?: BlueprintId;
  cta?: CallToActionBlueprint;
  contents?: ReadonlyArray<string>;
}

/** The footer. */
export interface FooterBlueprint extends BlueprintElement {
  navigationId?: BlueprintId;
  contents?: ReadonlyArray<string>;
  legal?: ReadonlyArray<string>;
}
