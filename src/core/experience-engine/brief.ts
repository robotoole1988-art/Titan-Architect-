/**
 * Experience Engine — the input brief (interfaces only).
 *
 * The brief is what the engine consumes to produce an experience. Its primary
 * input is the business's Industry DNA; the Brand DNA and Website DNA the engine
 * uses are the corresponding sections of that DNA (`.brand`, `.website`).
 */

import type { IndustryDna } from "@/core/industry-dna";
import type {
  ExperienceExtensions,
  ExperienceObjectiveType,
  ExperiencePageType,
} from "./common";

/** A single conversion objective driving the experience. */
export interface ExperienceObjective {
  type: ExperienceObjectiveType;
  /** Relative priority (higher = more important). */
  priority?: number;
  description?: string;
  extensions?: ExperienceExtensions;
}

/**
 * High-level creative and strategic direction — supplied by a human today, and
 * by the Brain later. This is the "AI guidance" input to the engine.
 */
export interface ExperienceGuidance {
  /** Free-form creative direction. */
  direction?: string;
  /** Hard constraints the experience must respect. */
  constraints?: ReadonlyArray<string>;
  /** Desired emotional tone (aligned with Brand DNA). */
  tone?: ReadonlyArray<string>;
  extensions?: ExperienceExtensions;
}

/**
 * The complete input to the Experience Engine. Brand DNA and Website DNA are
 * read from `industryDna.brand` and `industryDna.website`.
 */
export interface ExperienceBrief {
  industryDna: IndustryDna;
  objectives: ReadonlyArray<ExperienceObjective>;
  guidance?: ExperienceGuidance;
  /** Which page types to produce; defaults are engine-defined. */
  targetPages?: ReadonlyArray<ExperiencePageType>;
  extensions?: ExperienceExtensions;
}
