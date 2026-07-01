/**
 * Experience Engine — the public contract (interfaces only).
 *
 * This is the clean surface through which the platform turns a business's DNA
 * and guidance into a premium, conversion-focused Experience Blueprint.
 * Consumers depend on this contract, never on a concrete implementation (which
 * arrives later, behind its own ADR).
 *
 * Every method returns a Promise so a future implementation — rules-based,
 * template-based, or AI-assisted — can be asynchronous without changing this
 * contract. No implementation exists yet.
 */

import type { ExperienceBrief } from "./brief";
import type { ExperienceBlueprint, ExperiencePage } from "./blueprint";
import type { ExperiencePageType } from "./common";

/** The version of the Experience Engine contract these interfaces implement. */
export const EXPERIENCE_ENGINE_VERSION = "0.1" as const;

/** The TITAN Experience Engine contract. */
export interface ExperienceEngine {
  /** Produce a complete experience blueprint from a brief. */
  generate(brief: ExperienceBrief): Promise<ExperienceBlueprint>;
  /** Produce a single page's blueprint, for incremental generation. */
  generatePage(
    brief: ExperienceBrief,
    page: ExperiencePageType,
  ): Promise<ExperiencePage>;
}

/**
 * Supplies the active engine implementation. The concrete engine is wired in
 * later (a future ADR); consumers resolve it through this seam and never import
 * a concrete implementation directly.
 */
export type ExperienceEngineProvider = () => ExperienceEngine;
