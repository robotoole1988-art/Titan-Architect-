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

/** Where the deal's CPL figure came from (ADR-025 provenance for humans). */
export type DealCplSource = "estimate" | "founder";

/**
 * A deal's stored shape (the versioned artifact payload). All ex-VAT GBP.
 *
 * v1.1 ADDENDUM: `monthlyAdSpend` is DERIVED — lead target × CPL — never a
 * free input. Construct deals through {@link buildDeal}; the save action
 * re-derives server-side, so a client cannot type over it.
 */
export interface Deal {
  packageType: PricedServiceId;
  includedServices: PricedServiceId[];
  setupFee: number;
  monthlyManagementFee: number;
  /** The customer's lead target per month — the founder's input. */
  leadTargetPerMonth: number;
  /** CPL used for derivation (estimate pre-fill or founder override). */
  cplUsed: number;
  cplSource: DealCplSource;
  /** DERIVED: leadTargetPerMonth × cplUsed (pennies). */
  monthlyAdSpend: number;
  vatRate: number;
  notes?: string;
}

/** Round to pennies (banker-free, plain half-up on the wire format). */
function pennies(value: number): number {
  return Math.round(value * 100) / 100;
}

/** The one way ad spend comes into being: lead target × CPL. */
export function deriveAdSpend(leadTargetPerMonth: number, cpl: number): number {
  return pennies(leadTargetPerMonth * cpl);
}

/** PLACEHOLDER default lead target for new flagship deals — founder-editable. */
export const DEFAULT_LEAD_TARGET = 20;

export type DealInputs = Omit<Deal, "monthlyAdSpend" | "vatRate"> & {
  vatRate?: number;
};

/** Construct a Deal with the ad spend derived — the only lawful constructor. */
export function buildDeal(inputs: DealInputs): Deal {
  if (!CATALOGUE_BY_ID.has(inputs.packageType)) {
    throw new Error(`Unknown package "${inputs.packageType}"`);
  }
  for (const [label, value] of [
    ["setupFee", inputs.setupFee],
    ["monthlyManagementFee", inputs.monthlyManagementFee],
    ["leadTargetPerMonth", inputs.leadTargetPerMonth],
    ["cplUsed", inputs.cplUsed],
  ] as const) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${label} must be a non-negative number`);
    }
  }
  return {
    packageType: inputs.packageType,
    includedServices: inputs.includedServices,
    setupFee: inputs.setupFee,
    monthlyManagementFee: inputs.monthlyManagementFee,
    leadTargetPerMonth: inputs.leadTargetPerMonth,
    cplUsed: inputs.cplUsed,
    cplSource: inputs.cplSource,
    monthlyAdSpend: deriveAdSpend(inputs.leadTargetPerMonth, inputs.cplUsed),
    vatRate: inputs.vatRate ?? UK_VAT_RATE,
    ...(inputs.notes ? { notes: inputs.notes } : {}),
  };
}

/** Pre-fill a deal from the catalogue (fees overridable; ad spend derived). */
export function defaultDealForPackage(
  packageType: PricedServiceId,
  context: { cpl: number },
): Deal {
  const service = CATALOGUE_BY_ID.get(packageType);
  if (!service) throw new Error(`Unknown package "${packageType}"`);
  return buildDeal({
    packageType,
    includedServices: [packageType],
    setupFee: service.defaultSetupFee,
    monthlyManagementFee: service.defaultMonthlyFee,
    leadTargetPerMonth: service.flagship ? DEFAULT_LEAD_TARGET : 0,
    cplUsed: context.cpl,
    cplSource: "estimate",
  });
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
