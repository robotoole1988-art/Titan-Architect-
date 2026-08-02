import type { IndustryDna } from "../industry-dna";
import { sourced, vol2 } from "./sources";

/**
 * The platform layer: knowledge that holds across all ~35 trades.
 *
 * Per-trade records override or extend these fields (field-level merge in
 * the resolver, trade wins). Sections with no cross-trade research stay
 * empty — honest absence beats invented fullness (ADR-034), and that
 * includes knowledge. Paid advertising is deliberately empty here until the
 * Vol 3 acquisition research is mined in its own pass.
 */
export const PLATFORM_DNA: IndustryDna = {
  businessIdentity: {},

  services: {},

  customerPsychology: {
    trustFactors: [
      {
        label: "Numbers beat logos",
        description:
          "Licence numbers on the homepage, insurance stated in £m, Companies House and VAT numbers in the footer, register deep-links with 'check us — and check anyone else' copy. Verifiable facts outperform badge walls in every trade researched.",
      },
      {
        label: "Rogue-trader counter-positioning",
        description:
          "'We never cold-call. Written quotes only.' plus duty-of-care education. A family-wide lever (tarmac, tree surgery, clearance, roofing) almost no incumbent uses explicitly.",
      },
    ],
    extensions: sourced(vol2("Synthesis"), vol2("Platform layer")),
  },

  website: {
    trustSignals: [
      {
        label: "Badge registry, not badge images",
        description:
          "Every accreditation renders from data: scheme, membership number, expiry, official artwork or dynamic embed, register deep-link. Auto-removal on lapse. Falsely displaying a scheme logo breaches the Consumer Protection from Unfair Trading Regulations 2008.",
      },
      {
        label: "Unclaimed written guarantees",
        description:
          "Recurring free differentiator: a written workmanship/regrowth/installation guarantee block, per trade, where almost no incumbent states one.",
      },
    ],
    forms: [
      {
        label: "Three quote-module archetypes",
        description:
          "Calculator/lead-capture (rooms, van-load fraction, savings, wizards) · reg-plate/instant fixed price (automotive) · photo-quote via WhatsApp/upload (clearance, detailing, damp, emergency roofing). Configured per trade, built once.",
      },
    ],
    conversionStrategy: [
      {
        label: "Disclosure modules double as conversion features",
        description:
          "Regulated content (price transparency, licence numbers, compliance strips) is simultaneously the highest-converting content — build disclosures as calculators and fee tables, not boilerplate.",
      },
    ],
    extensions: sourced(vol2("Synthesis"), vol2("Platform layer")),
  },

  searchSeo: {
    googleBusinessProfile: [
      {
        label: "Primary category is the #1 local ranking factor",
        description:
          "Each trade ships a recommended GBP primary category (the most specific money keyword) plus up to 9 secondaries, re-audited every 6 months. Seasonal switching where the trade's demand flips (HVAC).",
      },
    ],
    locationPages: [
      {
        label: "Location-page uniqueness modules",
        description:
          "Reviews, staff, jobs and service-area data injected per town — the proven anti-doorway pattern. TITAN's area-page near-copy gate enforces the same law at generation time.",
      },
    ],
    extensions: sourced(vol2("Synthesis"), vol2("Platform layer")),
  },

  // Vol 3 (Google paid acquisition, Meta) not yet mined — empty until it is.
  paidAdvertising: {},

  brand: {},

  sales: {},

  marketIntelligence: {
    seasonalTrends: [
      {
        label: "Season-flip module",
        description:
          "One module, per-trade copy packs: spring surge vs winter counter-pitch. HVAC even swaps its GBP primary category by season.",
      },
    ],
    extensions: sourced(vol2("Synthesis")),
  },

  operations: {},

  businessIntelligence: {},

  aiBehaviour: {
    automationRules: [
      {
        label: "Compliance linter at publish",
        description:
          "Machine-checkable per-trade legal MUSTs; no site publishes with a failed MUST. The SRA lint (live badge, SRA number, complaints page, complete price fields) is the template.",
      },
      {
        label: "Finance-promotion gate",
        description:
          "Built once, applies to windows, batteries, EV, pools, boilers and dental alike: FCA FRN present → CONC 3 representative example auto-inserted; absent → all monthly-payment copy stripped.",
      },
    ],
    extensions: sourced(vol2("Platform layer")),
  },
};
