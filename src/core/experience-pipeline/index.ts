/**
 * TITAN Experience Pipeline — public API.
 *
 * Interfaces only (no implementation, no data, no AI, no database, no UI).
 * The staged transformation of Business DNA into an Experience Blueprint.
 *
 * See docs/architecture/adr-013-experience-pipeline.md and
 * docs/prd/prd-002-experience-pipeline.md.
 */

export type {
  PipelineExtensions,
  StageId,
  StagePayload,
  StageMetadata,
  ValidationSeverity,
  ValidationIssue,
  ValidationResult,
  PipelineContext,
  PipelineStage,
} from "./common";

export type {
  // Stage 1
  BusinessIntakeInput,
  BusinessIntakeOutput,
  BusinessIntakeStage,
  // Stage 2
  IndustryDnaResolutionInput,
  IndustryDnaResolutionOutput,
  IndustryDnaResolutionStage,
  // Stage 3
  LocationIntelligenceInput,
  LocationIntelligenceOutput,
  LocationIntelligenceStage,
  // Stage 4
  BrandStrategyInput,
  BrandStrategyOutput,
  BrandStrategyStage,
  // Stage 5
  CompetitorProfile,
  CompetitorAnalysisInput,
  CompetitorAnalysisOutput,
  CompetitorAnalysisStage,
  // Stage 6
  CustomerPsychologyInput,
  CustomerPsychologyOutput,
  CustomerPsychologyStage,
  // Stage 7
  ExperienceBriefStageInput,
  ExperienceBriefStageOutput,
  ExperienceBriefStage,
  // Stage 8
  WebsiteStructureInput,
  WebsiteStructureOutput,
  WebsiteStructureStage,
  // Stage 9
  MediaStrategyInput,
  MediaStrategyOutput,
  MediaStrategyStage,
  // Stage 10
  AnimationStrategyInput,
  AnimationStrategyStageOutput,
  AnimationStrategyStage,
  // Stage 11
  SeoStrategyInput,
  SeoStrategyOutput,
  SeoStrategyStage,
  // Stage 12
  ConversionStrategyInput,
  ConversionStrategyOutput,
  ConversionStrategyStage,
  // Stage 13
  FinalExperienceBlueprintInput,
  FinalExperienceBlueprintOutput,
  FinalExperienceBlueprintStage,
} from "./stages";

export type {
  PipelineStageRegistry,
  ExperiencePipeline,
  ExperiencePipelineProvider,
} from "./experience-pipeline";

export {
  EXPERIENCE_PIPELINE_VERSION,
  PIPELINE_STAGE_ORDER,
} from "./experience-pipeline";
