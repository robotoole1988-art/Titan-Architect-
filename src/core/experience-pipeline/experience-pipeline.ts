/**
 * Experience Pipeline — the pipeline contract (interfaces only).
 *
 * Composes the thirteen stages. Because each stage is typed to its own
 * `PipelineStage` contract, any single stage can be replaced independently by
 * another implementation without affecting the others. No implementation here.
 */

import type { PipelineContext, StageId } from "./common";
import type {
  AnimationStrategyStage,
  BrandStrategyStage,
  BusinessIntakeInput,
  BusinessIntakeStage,
  CompetitorAnalysisStage,
  ConversionStrategyStage,
  CustomerPsychologyStage,
  ExperienceBriefStage,
  FinalExperienceBlueprintOutput,
  FinalExperienceBlueprintStage,
  IndustryDnaResolutionStage,
  LocationIntelligenceStage,
  MediaStrategyStage,
  SeoStrategyStage,
  WebsiteStructureStage,
} from "./stages";

/** The version of the Experience Pipeline contract these interfaces implement. */
export const EXPERIENCE_PIPELINE_VERSION = "0.1" as const;

/** Canonical execution order of the pipeline stages. */
export const PIPELINE_STAGE_ORDER: ReadonlyArray<StageId> = [
  "business-intake",
  "industry-dna-resolution",
  "location-intelligence",
  "brand-strategy",
  "competitor-analysis",
  "customer-psychology",
  "experience-brief",
  "website-structure",
  "media-strategy",
  "animation-strategy",
  "seo-strategy",
  "conversion-strategy",
  "final-experience-blueprint",
];

/**
 * The set of stages that make up the pipeline. Each is independently
 * replaceable: swap the value for another implementation of the same stage
 * contract and the rest of the pipeline is unaffected.
 */
export interface PipelineStageRegistry {
  businessIntake: BusinessIntakeStage;
  industryDnaResolution: IndustryDnaResolutionStage;
  locationIntelligence: LocationIntelligenceStage;
  brandStrategy: BrandStrategyStage;
  competitorAnalysis: CompetitorAnalysisStage;
  customerPsychology: CustomerPsychologyStage;
  experienceBrief: ExperienceBriefStage;
  websiteStructure: WebsiteStructureStage;
  mediaStrategy: MediaStrategyStage;
  animationStrategy: AnimationStrategyStage;
  seoStrategy: SeoStrategyStage;
  conversionStrategy: ConversionStrategyStage;
  finalExperienceBlueprint: FinalExperienceBlueprintStage;
}

/**
 * The TITAN Experience Pipeline: transforms raw business intake into a final
 * Experience Blueprint through thirteen replaceable stages.
 */
export interface ExperiencePipeline {
  readonly stages: PipelineStageRegistry;
  /** Run the whole pipeline, from raw intake to the final blueprint. */
  run(
    input: BusinessIntakeInput,
    context: PipelineContext,
  ): Promise<FinalExperienceBlueprintOutput>;
}

/**
 * Supplies the active pipeline implementation. The concrete pipeline is wired in
 * later (a future ADR); consumers resolve it through this seam.
 */
export type ExperiencePipelineProvider = () => ExperiencePipeline;
