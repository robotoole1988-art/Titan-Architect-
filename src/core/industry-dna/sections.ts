/**
 * Industry DNA — the twelve sections (interfaces only).
 *
 * Each section implements the TITAN Industry DNA v1.0 specification exactly and
 * extends {@link DnaSection}, so every section carries an `extensions` bag and
 * can be widened without a breaking change. All fields are optional so a DNA
 * profile can be populated incrementally; no data is defined here.
 */

import type {
  DnaList,
  DnaSection,
  EmergencyOrPlanned,
  MonetaryAmount,
  PropertyMarket,
  UrgencyLevel,
} from "./common";

/** 1. Business Identity DNA */
export interface BusinessIdentityDna extends DnaSection {
  trade?: string;
  industry?: string;
  businessType?: string;
  emergencyOrPlanned?: EmergencyOrPlanned;
  residentialOrCommercial?: PropertyMarket;
  serviceArea?: DnaList;
  averageJobValue?: MonetaryAmount;
  customerLifetimeValue?: MonetaryAmount;
  salesCycle?: string;
}

/** 2. Services DNA */
export interface ServicesDna extends DnaSection {
  serviceCategories?: DnaList;
  individualServices?: DnaList;
  upsells?: DnaList;
  crossSells?: DnaList;
  emergencyServices?: DnaList;
  premiumServices?: DnaList;
}

/** 3. Customer Psychology DNA */
export interface CustomerPsychologyDna extends DnaSection {
  customerMotivations?: DnaList;
  painPoints?: DnaList;
  buyingTriggers?: DnaList;
  fears?: DnaList;
  objections?: DnaList;
  trustFactors?: DnaList;
  decisionMakers?: DnaList;
  urgencyLevel?: UrgencyLevel;
}

/** 4. Website DNA */
export interface WebsiteDna extends DnaSection {
  siteStructure?: DnaList;
  landingPages?: DnaList;
  conversionStrategy?: DnaList;
  callsToAction?: DnaList;
  forms?: DnaList;
  images?: DnaList;
  video?: DnaList;
  animations?: DnaList;
  trustSignals?: DnaList;
}

/** 5. Search & SEO DNA */
export interface SearchSeoDna extends DnaSection {
  primaryKeywords?: DnaList;
  localSeo?: DnaList;
  googleBusinessProfile?: DnaList;
  contentStrategy?: DnaList;
  internalLinking?: DnaList;
  schema?: DnaList;
  faqStrategy?: DnaList;
  locationPages?: DnaList;
}

/** 6. Paid Advertising DNA */
export interface PaidAdvertisingDna extends DnaSection {
  googleAds?: DnaList;
  localServicesAds?: DnaList;
  metaAds?: DnaList;
  audiences?: DnaList;
  offers?: DnaList;
  creatives?: DnaList;
  budgetGuidance?: DnaList;
  seasonalCampaigns?: DnaList;
}

/** 7. Brand DNA */
export interface BrandDna extends DnaSection {
  brandPersonality?: DnaList;
  toneOfVoice?: DnaList;
  colourPalette?: DnaList;
  typography?: DnaList;
  photographyStyle?: DnaList;
  cinematicVideoStyle?: DnaList;
  threeDStyle?: DnaList;
  logoRules?: DnaList;
}

/** 8. Sales DNA */
export interface SalesDna extends DnaSection {
  leadQualification?: DnaList;
  phoneScripts?: DnaList;
  appointmentBooking?: DnaList;
  followUp?: DnaList;
  objectionHandling?: DnaList;
  closingStrategy?: DnaList;
  reviewRequests?: DnaList;
  referralStrategy?: DnaList;
}

/** 9. Market Intelligence DNA */
export interface MarketIntelligenceDna extends DnaSection {
  competitors?: DnaList;
  pricingPosition?: DnaList;
  localDemand?: DnaList;
  weatherImpact?: DnaList;
  seasonalTrends?: DnaList;
  economicFactors?: DnaList;
  housingTrends?: DnaList;
  industryTrends?: DnaList;
}

/** 10. Operations DNA */
export interface OperationsDna extends DnaSection {
  jobWorkflow?: DnaList;
  scheduling?: DnaList;
  teamStructure?: DnaList;
  vehicles?: DnaList;
  equipment?: DnaList;
  certifications?: DnaList;
  healthAndSafety?: DnaList;
  serviceGuarantees?: DnaList;
}

/** 11. Business Intelligence DNA */
export interface BusinessIntelligenceDna extends DnaSection {
  kpis?: DnaList;
  revenueMetrics?: DnaList;
  conversionMetrics?: DnaList;
  leadQuality?: DnaList;
  customerRetention?: DnaList;
  lifetimeValue?: DnaList;
  roiMetrics?: DnaList;
  aiRecommendations?: DnaList;
}

/** 12. AI Behaviour DNA */
export interface AiBehaviourDna extends DnaSection {
  aiPersonality?: DnaList;
  decisionRules?: DnaList;
  automationRules?: DnaList;
  confidenceScoring?: DnaList;
  escalationRules?: DnaList;
  learningStrategy?: DnaList;
  memoryStrategy?: DnaList;
  collaborationRules?: DnaList;
}
