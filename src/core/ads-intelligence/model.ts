/**
 * Ads Intelligence (ADR-031) — the campaign plan model.
 *
 * A campaign plan is a versioned artifact: the complete, executable design
 * of a Google Ads Search campaign, assembled deterministically from
 * intelligence TITAN already holds. Execution stays manual (v1) — the plan
 * is the build sheet a human imports and launches.
 */

export type KeywordMatchType = "phrase" | "exact";

export interface KeywordPlan {
  text: string;
  matchType: KeywordMatchType;
}

export interface RsaHeadline {
  text: string;
  /** Google pin position suggestion (1–3); unset = unpinned. */
  pin?: 1 | 2 | 3;
}

export interface RsaPlan {
  headlines: RsaHeadline[];
  descriptions: string[];
  path1?: string;
  path2?: string;
}

export interface AdGroupPlan {
  name: string;
  service: string;
  /** Coverage area this group targets; unset = the core/homepage group. */
  area?: string;
  finalUrl: string;
  keywords: KeywordPlan[];
  ads: RsaPlan[];
}

export interface CampaignStructurePlan {
  name: string;
  goal: "lead_generation";
  adGroups: AdGroupPlan[];
}

export interface CampaignBudget {
  leadTargetPerMonth: number;
  cplUsed: number;
  cplSource: string;
  /** £/month — the deal's derived ad spend (shared-CPL rule, ADR-026). */
  monthly: number;
  /** £/day — monthly ÷ 30.4, rounded to pennies. */
  daily: number;
  /** The working, shown verbatim: "50 leads × £40 CPL = £2,000/mo …". */
  working: string;
}

export interface CampaignPlan {
  campaigns: CampaignStructurePlan[];
  negatives: string[];
  locationTargeting: string[];
  budget: CampaignBudget;
  bidStrategy: {
    initial: string;
    switchAt: string;
    guidance: string;
  };
  /** What counts as a conversion — wired to the real stack (ADR-030). */
  conversionEvent: string;
  launchChecklist: string[];
}

export interface CampaignPlanInput {
  business: {
    name: string;
    trade: string;
    tradeId?: string;
    location: string;
    coverageAreas?: ReadonlyArray<string>;
  };
  deal: {
    leadTargetPerMonth: number;
    cplUsed: number;
    cplSource: string;
    monthlyAdSpend: number;
  };
  site: {
    baseUrl: string;
    pages: ReadonlyArray<{ path: string; name: string }>;
  };
}

/** Google Ads RSA limits — validated hard, never silently truncated. */
export const RSA_LIMITS = {
  headlineChars: 30,
  descriptionChars: 90,
  maxHeadlines: 15,
  maxDescriptions: 4,
  minHeadlines: 3,
  minDescriptions: 2,
} as const;
