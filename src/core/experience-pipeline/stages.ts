/**
 * Experience Pipeline — the thirteen stages (interfaces only).
 *
 * Each stage defines its own Input and Output payloads and a stage type
 * (a `PipelineStage<Input, Output>`), so any stage can be replaced independently
 * by another implementation of the same contract. Data flows down the list;
 * later stages consume earlier outputs. No implementation or data here.
 */

import type { IndustryDna } from "@/core/industry-dna";
import type {
  AnimationStrategy,
  CallToAction,
  ExperienceBlueprint,
  ExperienceBrief,
  ExperiencePage,
  LeadCaptureFlow,
  MediaDirection,
  SeoStructure,
} from "@/core/experience-engine";
import type { PipelineStage, StagePayload } from "./common";

/* 1. Business Intake ------------------------------------------------------ */

export interface BusinessIntakeInput extends StagePayload {
  businessName?: string;
  trade?: string;
  contact?: string;
  rawNotes?: string;
  sourceMaterials?: ReadonlyArray<string>;
}

export interface BusinessIntakeOutput extends StagePayload {
  businessName?: string;
  trade?: string;
  industryHint?: string;
  serviceAreaHint?: string;
  structuredFacts?: ReadonlyArray<string>;
}

export type BusinessIntakeStage = PipelineStage<
  BusinessIntakeInput,
  BusinessIntakeOutput
>;

/* 2. Industry DNA Resolution --------------------------------------------- */

export interface IndustryDnaResolutionInput extends StagePayload {
  intake: BusinessIntakeOutput;
}

export interface IndustryDnaResolutionOutput extends StagePayload {
  industryDna: IndustryDna;
  /** 0..1 confidence in the resolved DNA. */
  confidence?: number;
}

export type IndustryDnaResolutionStage = PipelineStage<
  IndustryDnaResolutionInput,
  IndustryDnaResolutionOutput
>;

/* 3. Location Intelligence ----------------------------------------------- */

export interface LocationIntelligenceInput extends StagePayload {
  industryDna: IndustryDna;
}

export interface LocationIntelligenceOutput extends StagePayload {
  primaryLocation?: string;
  serviceAreas?: ReadonlyArray<string>;
  demandSignals?: ReadonlyArray<string>;
  seasonality?: ReadonlyArray<string>;
}

export type LocationIntelligenceStage = PipelineStage<
  LocationIntelligenceInput,
  LocationIntelligenceOutput
>;

/* 4. Brand Strategy ------------------------------------------------------- */

export interface BrandStrategyInput extends StagePayload {
  industryDna: IndustryDna;
}

export interface BrandStrategyOutput extends StagePayload {
  positioning?: string;
  personality?: ReadonlyArray<string>;
  toneOfVoice?: ReadonlyArray<string>;
  differentiators?: ReadonlyArray<string>;
}

export type BrandStrategyStage = PipelineStage<
  BrandStrategyInput,
  BrandStrategyOutput
>;

/* 5. Competitor Analysis -------------------------------------------------- */

export interface CompetitorProfile extends StagePayload {
  name?: string;
  positioning?: string;
  strengths?: ReadonlyArray<string>;
  weaknesses?: ReadonlyArray<string>;
}

export interface CompetitorAnalysisInput extends StagePayload {
  industryDna: IndustryDna;
  location: LocationIntelligenceOutput;
}

export interface CompetitorAnalysisOutput extends StagePayload {
  competitors?: ReadonlyArray<CompetitorProfile>;
  marketGaps?: ReadonlyArray<string>;
  positioningOpportunities?: ReadonlyArray<string>;
}

export type CompetitorAnalysisStage = PipelineStage<
  CompetitorAnalysisInput,
  CompetitorAnalysisOutput
>;

/* 6. Customer Psychology -------------------------------------------------- */

export interface CustomerPsychologyInput extends StagePayload {
  industryDna: IndustryDna;
}

export interface CustomerPsychologyOutput extends StagePayload {
  motivations?: ReadonlyArray<string>;
  painPoints?: ReadonlyArray<string>;
  buyingTriggers?: ReadonlyArray<string>;
  objections?: ReadonlyArray<string>;
  trustFactors?: ReadonlyArray<string>;
}

export type CustomerPsychologyStage = PipelineStage<
  CustomerPsychologyInput,
  CustomerPsychologyOutput
>;

/* 7. Experience Brief ----------------------------------------------------- */

export interface ExperienceBriefStageInput extends StagePayload {
  industryDna: IndustryDna;
  brandStrategy: BrandStrategyOutput;
  competitorAnalysis: CompetitorAnalysisOutput;
  customerPsychology: CustomerPsychologyOutput;
  locationIntelligence: LocationIntelligenceOutput;
}

export interface ExperienceBriefStageOutput extends StagePayload {
  /** The Experience Engine brief this pipeline produces. */
  brief: ExperienceBrief;
}

export type ExperienceBriefStage = PipelineStage<
  ExperienceBriefStageInput,
  ExperienceBriefStageOutput
>;

/* 8. Website Structure ---------------------------------------------------- */

export interface WebsiteStructureInput extends StagePayload {
  brief: ExperienceBrief;
}

export interface WebsiteStructureOutput extends StagePayload {
  pages: ReadonlyArray<ExperiencePage>;
  siteMap?: ReadonlyArray<string>;
}

export type WebsiteStructureStage = PipelineStage<
  WebsiteStructureInput,
  WebsiteStructureOutput
>;

/* 9. Media Strategy ------------------------------------------------------- */

export interface MediaStrategyInput extends StagePayload {
  brief: ExperienceBrief;
  structure: WebsiteStructureOutput;
}

export interface MediaStrategyOutput extends StagePayload {
  mediaDirection: MediaDirection;
}

export type MediaStrategyStage = PipelineStage<
  MediaStrategyInput,
  MediaStrategyOutput
>;

/* 10. Animation Strategy -------------------------------------------------- */

export interface AnimationStrategyInput extends StagePayload {
  brief: ExperienceBrief;
  structure: WebsiteStructureOutput;
}

export interface AnimationStrategyStageOutput extends StagePayload {
  animationStrategy: AnimationStrategy;
}

export type AnimationStrategyStage = PipelineStage<
  AnimationStrategyInput,
  AnimationStrategyStageOutput
>;

/* 11. SEO Strategy -------------------------------------------------------- */

export interface SeoStrategyInput extends StagePayload {
  brief: ExperienceBrief;
  structure: WebsiteStructureOutput;
}

export interface SeoStrategyOutput extends StagePayload {
  seo: SeoStructure;
  keywordClusters?: ReadonlyArray<string>;
}

export type SeoStrategyStage = PipelineStage<SeoStrategyInput, SeoStrategyOutput>;

/* 12. Conversion Strategy ------------------------------------------------- */

export interface ConversionStrategyInput extends StagePayload {
  brief: ExperienceBrief;
  structure: WebsiteStructureOutput;
}

export interface ConversionStrategyOutput extends StagePayload {
  leadCaptureFlows?: ReadonlyArray<LeadCaptureFlow>;
  primaryCtas?: ReadonlyArray<CallToAction>;
  conversionPrinciples?: ReadonlyArray<string>;
}

export type ConversionStrategyStage = PipelineStage<
  ConversionStrategyInput,
  ConversionStrategyOutput
>;

/* 13. Final Experience Blueprint ------------------------------------------ */

export interface FinalExperienceBlueprintInput extends StagePayload {
  brief: ExperienceBrief;
  structure: WebsiteStructureOutput;
  media: MediaStrategyOutput;
  animation: AnimationStrategyStageOutput;
  seo: SeoStrategyOutput;
  conversion: ConversionStrategyOutput;
}

export interface FinalExperienceBlueprintOutput extends StagePayload {
  /** The assembled Experience Engine blueprint — the pipeline's final output. */
  blueprint: ExperienceBlueprint;
}

export type FinalExperienceBlueprintStage = PipelineStage<
  FinalExperienceBlueprintInput,
  FinalExperienceBlueprintOutput
>;
