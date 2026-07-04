/**
 * TITAN pricing catalogue + Deal maths (ADR-026, revised).
 *
 * Catalogue prices are RECOMMENDATIONS and act as SOFT FLOORS: the Deal
 * Builder pre-fills them, raising is frictionless, lowering below the
 * recommendation requires a discount reason and is recorded on the deal
 * (enforced HERE — buildDeal is the only lawful constructor, so the floor
 * holds server-side). ⚠️ FOUNDER PLACEHOLDERS: values are starting points
 * for the founder to tune — not market-tested pricing. Ex-VAT stored;
 * inc-VAT computed, never stored. Ad spend is untouched by any of this —
 * derived, locked (v1.1 addendum).
 */

export const UK_VAT_RATE = 0.2;

export type PricedServiceId =
  | "lead_generation"
  | "website_build"
  | "seo_management"
  | "gbp_management"
  | "lsa_management"
  | "meta_ads_management"
  | "ai_search_optimisation"
  | "launch_bundle"
  | "dominate_bundle"
  | "titan_bundle";

export interface PricedService {
  id: PricedServiceId;
  label: string;
  description: string;
  /** RECOMMENDED price — the soft floor (ex VAT, GBP). Founder-tunable. */
  recommendedSetupFee: number;
  /** RECOMMENDED price — the soft floor (ex VAT, GBP, per month). */
  recommendedMonthlyFee: number;
  /** Carries the setup + MMF + ad-spend model (lead target applies). */
  flagship?: boolean;
  /** Bundle tiers list their parts and price below the sum (spec'd). */
  bundle?: boolean;
  includedServices?: PricedServiceId[];
}

export const PRICING_CATALOGUE: ReadonlyArray<PricedService> = [
  {
    id: "lead_generation",
    label: "Lead Generation",
    description:
      "The flagship: cinematic landing experience + managed Google Ads. Setup + monthly management + client ad spend.",
    recommendedSetupFee: 495,
    recommendedMonthlyFee: 395,
    flagship: true,
  },
  {
    id: "website_build",
    label: "Website Build",
    description: "Full cinematic website from the TITAN blueprint pipeline.",
    recommendedSetupFee: 2995,
    recommendedMonthlyFee: 49,
  },
  {
    id: "seo_management",
    label: "SEO Management",
    description: "Local SEO: content pillars, technical health, rankings.",
    recommendedSetupFee: 495,
    recommendedMonthlyFee: 295,
  },
  {
    id: "gbp_management",
    label: "GBP Management",
    description: "Google Business Profile: posts, reviews, Q&A, photos.",
    recommendedSetupFee: 295,
    recommendedMonthlyFee: 145,
  },
  {
    id: "lsa_management",
    label: "LSA Management",
    description: "Google Local Services Ads: profile, leads, dispute hygiene.",
    recommendedSetupFee: 295,
    recommendedMonthlyFee: 125,
  },
  {
    id: "meta_ads_management",
    label: "Meta Ads Management",
    description: "Facebook/Instagram demand generation and retargeting.",
    recommendedSetupFee: 495,
    recommendedMonthlyFee: 295,
  },
  {
    id: "ai_search_optimisation",
    label: "AI Search Optimisation",
    description: "Visibility in AI answers (SGE, assistants, LLM search).",
    recommendedSetupFee: 395,
    recommendedMonthlyFee: 195,
  },
  // ---- Bundle tiers: priced BELOW the sum of parts, by design. ----
  {
    id: "launch_bundle",
    label: "Launch",
    description:
      "Get live and getting leads: cinematic site + managed Google Ads lead generation + GBP.",
    recommendedSetupFee: 995, // placeholder — founder to tune
    recommendedMonthlyFee: 495, // placeholder — below the £589 sum of parts
    flagship: true,
    bundle: true,
    includedServices: ["website_build", "lead_generation", "gbp_management"],
  },
  {
    id: "dominate_bundle",
    label: "Dominate",
    description:
      "Own the local map and the rankings: Launch + SEO + LSA + area landing pages.",
    recommendedSetupFee: 1495, // placeholder — founder to tune
    recommendedMonthlyFee: 645, // spec'd — below the £1,009 sum of parts
    flagship: true,
    bundle: true,
    includedServices: [
      "website_build",
      "lead_generation",
      "gbp_management",
      "seo_management",
      "lsa_management",
    ],
  },
  {
    id: "titan_bundle",
    label: "TITAN",
    description:
      "Everything, everywhere they search: Dominate + Meta Ads + AI Search.",
    recommendedSetupFee: 1995, // placeholder — founder to tune
    recommendedMonthlyFee: 945, // spec'd — below the £1,499 sum of parts
    flagship: true,
    bundle: true,
    includedServices: [
      "website_build",
      "lead_generation",
      "gbp_management",
      "seo_management",
      "lsa_management",
      "meta_ads_management",
      "ai_search_optimisation",
    ],
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
/** One recorded price cut below the recommendation (internal only). */
export interface DealDiscount {
  item: "setupFee" | "monthlyManagementFee";
  recommended: number;
  actual: number;
  /** recommended − actual (positive). */
  delta: number;
  reason: string;
}

export interface Deal {
  packageType: PricedServiceId;
  includedServices: PricedServiceId[];
  setupFee: number;
  monthlyManagementFee: number;
  /** The catalogue recommendation at build time (the soft floor). */
  recommendedSetupFee?: number;
  recommendedMonthlyFee?: number;
  /** Present only when a price was cut below the recommendation. */
  discounts?: DealDiscount[];
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

export type DealInputs = Omit<
  Deal,
  "monthlyAdSpend" | "vatRate" | "recommendedSetupFee" | "recommendedMonthlyFee" | "discounts"
> & {
  vatRate?: number;
  /** Required when any price is set BELOW its recommendation (soft floor). */
  discountReason?: string;
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
  // SOFT FLOOR (server-side — the save action re-derives through here):
  // raising is free; lowering below the recommendation needs a reason.
  const service = CATALOGUE_BY_ID.get(inputs.packageType)!;
  const reason = inputs.discountReason?.trim() ?? "";
  const discounts: DealDiscount[] = [];
  const floors: Array<[DealDiscount["item"], number, number]> = [
    ["setupFee", service.recommendedSetupFee, inputs.setupFee],
    ["monthlyManagementFee", service.recommendedMonthlyFee, inputs.monthlyManagementFee],
  ];
  for (const [item, recommended, actual] of floors) {
    if (actual < recommended) {
      if (!reason) {
        throw new Error(
          `${item} (£${actual}) is below the recommended £${recommended} — a discount reason is required.`,
        );
      }
      discounts.push({
        item,
        recommended,
        actual,
        delta: pennies(recommended - actual),
        reason,
      });
    }
  }

  return {
    packageType: inputs.packageType,
    includedServices: inputs.includedServices,
    setupFee: inputs.setupFee,
    monthlyManagementFee: inputs.monthlyManagementFee,
    recommendedSetupFee: service.recommendedSetupFee,
    recommendedMonthlyFee: service.recommendedMonthlyFee,
    ...(discounts.length > 0 ? { discounts } : {}),
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
    includedServices: service.includedServices ?? [packageType],
    setupFee: service.recommendedSetupFee,
    monthlyManagementFee: service.recommendedMonthlyFee,
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
