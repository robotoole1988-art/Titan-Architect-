/**
 * TITAN pricing catalogue + Deal maths (ADR-026).
 *
 * ⚠️ FOUNDER-EDITABLE PLACEHOLDERS: every default price below is a starting
 * value for the founder to refine — nothing here is market-tested pricing.
 * The Deal Builder pre-fills from this catalogue; every figure is overridable
 * per deal. Prices are stored EX-VAT; inc-VAT is computed, never stored.
 */

export const UK_VAT_RATE = 0.2;

export type PricedServiceId =
  | "lead_generation"
  | "website_build"
  | "seo_management"
  | "gbp_management"
  | "meta_ads_management"
  | "ai_search_optimisation";

export interface PricedService {
  id: PricedServiceId;
  label: string;
  description: string;
  /** PLACEHOLDER — founder-editable (ex VAT, GBP). */
  defaultSetupFee: number;
  /** PLACEHOLDER — founder-editable (ex VAT, GBP, per month). */
  defaultMonthlyFee: number;
  /** The flagship carries the setup + MMF + ad-spend model. */
  flagship?: boolean;
}

export const PRICING_CATALOGUE: ReadonlyArray<PricedService> = [
  {
    id: "lead_generation",
    label: "Lead Generation",
    description:
      "The flagship: cinematic landing experience + managed Google Ads. Setup + monthly management + client ad spend.",
    defaultSetupFee: 1995,
    defaultMonthlyFee: 499,
    flagship: true,
  },
  {
    id: "website_build",
    label: "Website Build",
    description: "Full cinematic website from the TITAN blueprint pipeline.",
    defaultSetupFee: 2995,
    defaultMonthlyFee: 49,
  },
  {
    id: "seo_management",
    label: "SEO Management",
    description: "Local SEO: content pillars, technical health, rankings.",
    defaultSetupFee: 495,
    defaultMonthlyFee: 399,
  },
  {
    id: "gbp_management",
    label: "GBP Management",
    description: "Google Business Profile: posts, reviews, Q&A, photos.",
    defaultSetupFee: 295,
    defaultMonthlyFee: 149,
  },
  {
    id: "meta_ads_management",
    label: "Meta Ads Management",
    description: "Facebook/Instagram demand generation and retargeting.",
    defaultSetupFee: 495,
    defaultMonthlyFee: 349,
  },
  {
    id: "ai_search_optimisation",
    label: "AI Search Optimisation",
    description: "Visibility in AI answers (SGE, assistants, LLM search).",
    defaultSetupFee: 395,
    defaultMonthlyFee: 249,
  },
];

const CATALOGUE_BY_ID = new Map(PRICING_CATALOGUE.map((s) => [s.id, s]));

export function getPricedService(id: PricedServiceId): PricedService | undefined {
  return CATALOGUE_BY_ID.get(id);
}

/** A deal's stored shape (the versioned artifact payload). All ex-VAT GBP. */
export interface Deal {
  packageType: PricedServiceId;
  includedServices: PricedServiceId[];
  setupFee: number;
  monthlyManagementFee: number;
  monthlyAdSpend: number;
  vatRate: number;
  notes?: string;
}

/** PLACEHOLDER default monthly ad spend for new deals — founder-editable. */
export const DEFAULT_MONTHLY_AD_SPEND = 1000;

/** Pre-fill a deal from the catalogue (every value overridable). */
export function defaultDealForPackage(packageType: PricedServiceId): Deal {
  const service = CATALOGUE_BY_ID.get(packageType);
  if (!service) throw new Error(`Unknown package "${packageType}"`);
  return {
    packageType,
    includedServices: [packageType],
    setupFee: service.defaultSetupFee,
    monthlyManagementFee: service.defaultMonthlyFee,
    monthlyAdSpend: service.flagship ? DEFAULT_MONTHLY_AD_SPEND : 0,
    vatRate: UK_VAT_RATE,
  };
}

/** Round to pennies (banker-free, plain half-up on the wire format). */
function pennies(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface DealComputed {
  /** setup + MMF + ad spend. */
  firstPaymentExVat: number;
  firstPaymentIncVat: number;
  /** MMF + ad spend. */
  ongoingMonthlyExVat: number;
  ongoingMonthlyIncVat: number;
  vatRate: number;
}

/** The phone-quote maths. Deterministic; 2dp. */
export function computeDeal(deal: Deal): DealComputed {
  const firstEx = pennies(
    deal.setupFee + deal.monthlyManagementFee + deal.monthlyAdSpend,
  );
  const ongoingEx = pennies(deal.monthlyManagementFee + deal.monthlyAdSpend);
  return {
    firstPaymentExVat: firstEx,
    firstPaymentIncVat: pennies(firstEx * (1 + deal.vatRate)),
    ongoingMonthlyExVat: ongoingEx,
    ongoingMonthlyIncVat: pennies(ongoingEx * (1 + deal.vatRate)),
    vatRate: deal.vatRate,
  };
}
