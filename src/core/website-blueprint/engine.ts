/**
 * Website Blueprint Engine — the transform contract (interfaces only).
 *
 * Transforms an approved Experience Strategy into a platform-independent Website
 * Blueprint. Interfaces only: no implementation, no rendering, no generation, no
 * AI. Promise-returning so a future implementation can be async.
 *
 * Dependency inversion: the engine depends on **abstractions, never concrete
 * implementations**, and never couples tightly. Its primary input is the
 * Experience Strategy; the injected dependencies provide additional context and
 * coordination.
 */

import type { ExperienceStrategy } from "@/core/experience-strategy";
import type { IndustryDna } from "@/core/industry-dna";
import type { KnowledgeReader } from "@/core/knowledge-kernel";
import type { ExperienceEngine } from "@/core/experience-engine";
import type { ExperiencePipeline } from "@/core/experience-pipeline";
import type { BrainOrchestrator } from "@/core/brain-orchestrator";
import type { BlueprintExtensions } from "./common";
import type { WebsiteBlueprint } from "./website-blueprint";

/** The input to the engine: the approved Experience Strategy (+ optional context). */
export interface WebsiteBlueprintRequest {
  strategy: ExperienceStrategy;
  /** Coverage areas (ADR-028): one unique landing page is built per area. */
  coverageAreas?: ReadonlyArray<string>;
  industryDna?: IndustryDna;
  extensions?: BlueprintExtensions;
}

/**
 * The abstractions the engine may be wired with (dependency inversion). All are
 * interfaces — never concrete implementations — and optional, so the engine
 * stays loosely coupled.
 */
export interface WebsiteBlueprintDependencies {
  readonly knowledge?: KnowledgeReader;
  readonly experienceEngine?: ExperienceEngine;
  readonly experiencePipeline?: ExperiencePipeline;
  readonly brain?: BrainOrchestrator;
}

/**
 * The Website Blueprint Engine: Experience Strategy → Website Blueprint.
 */
export interface WebsiteBlueprintEngine {
  build(request: WebsiteBlueprintRequest): Promise<WebsiteBlueprint>;
}

/** Resolves the active engine — swappable, so it stays replaceable. */
export type WebsiteBlueprintEngineProvider = () => WebsiteBlueprintEngine;
