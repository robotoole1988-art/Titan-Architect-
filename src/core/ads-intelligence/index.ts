/**
 * Ads Intelligence — public API (ADR-031). Deterministic Google Ads
 * campaign build sheets: generator, validator, Editor-compatible exports.
 */

export type {
  AdGroupPlan,
  CampaignBudget,
  CampaignPlan,
  CampaignPlanInput,
  CampaignStructurePlan,
  KeywordMatchType,
  KeywordPlan,
  RsaHeadline,
  RsaPlan,
} from "./model";
export { RSA_LIMITS } from "./model";
export { generateCampaignPlan } from "./generator";
export { validateCampaignPlan } from "./validator";
export type { CampaignPlanValidation } from "./validator";
export { buildCampaignCsvs } from "./export";
export type { CampaignCsvs } from "./export";
