import type { IndustryDna } from "../industry-dna";
import { sourced, vol2 } from "./sources";

/**
 * Track D — booked van services.
 *
 * Bookable, price-transparent, often recurring. Three research sections
 * cover ten taxonomy ids: the clearance/waste trio share one body of law
 * (EA carrier registration, duty of care) and the automotive trio share
 * the reg-plate instant-price pattern — each id still gets its own record
 * with the emphasis the research gives it.
 */

const SRC_CARPET = sourced(vol2("Track D — Carpet & Upholstery Cleaning"));
const SRC_CLEANING = sourced(vol2("Track D — Domestic/Commercial Cleaning"));
const SRC_CLEARANCE = sourced(vol2("Track D — House/Garage Clearance + Waste Removal"));
const SRC_SCAFFOLDING = sourced(vol2("Track D — Scaffolding"));
const SRC_AUTO = sourced(vol2("Track D — Mobile Mechanic / Garage (Clutch/Cambelt/Wetbelt) / MOT & Servicing"));
const SRC_DETAILING = sourced(vol2("Track D — Car Detailing"));

/** The clearance/waste body of law, shared across the trio. */
const CLEARANCE_OPERATIONS = {
  certifications: [
    {
      label: "EA upper-tier waste carrier registration — NON-NEGOTIABLE",
      description:
        "Displayed as tier + full CBDU number + deep-link to the public register entry: 'check us — and check anyone else'. An optional scrap licence is a field, never claimed as required.",
    },
  ],
  extensions: SRC_CLEARANCE,
};

const CLEARANCE_PSYCHOLOGY = {
  fears: [
    {
      label: "Householder duty of care — they get fined, not just the cowboy",
      description:
        "Fly-tipped waste traces back to the householder: up to £600 fixed penalty, unlimited on conviction (S.C.R.A.P. code). Truthful fear positioning beside the quote CTA.",
    },
  ],
  trustFactors: [
    {
      label: "'Where your waste goes' transparency",
      description:
        "Real diversion percentage plus a waste transfer note on every job — the AnyJunk benchmark is '98% diverted from landfill' with an audit trail.",
    },
  ],
  extensions: SRC_CLEARANCE,
};

const CLEARANCE_WEBSITE = {
  forms: [
    {
      label: "Photo-quote via WhatsApp as the primary funnel",
      description: "Pricing by van-load fraction with a visual estimator.",
    },
  ],
  conversionStrategy: [
    {
      label: "Licence block in the footer + dedicated page with register deep-link",
    },
    {
      label: "Fly-tipping duty-of-care section beside the CTA",
    },
    {
      label: "Before/afters with load size + diversion outcome",
    },
  ],
  extensions: SRC_CLEARANCE,
};

export const TRACK_D_DNA: Readonly<Record<string, IndustryDna>> = {
  "carpet-cleaning": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "both",
      extensions: SRC_CARPET,
    },
    services: {
      serviceCategories: [
        {
          label: "Named service tiers with inclusions",
          description: "Upholstery, rugs and mattresses priced per item.",
        },
      ],
      extensions: SRC_CARPET,
    },
    customerPsychology: {
      customerMotivations: [
        {
          label: "Problem-first buyers arrive via stains",
          description:
            "Stain-CLUSTER pages (pet urine family, red wine, coffee) catch motivated searches — each with an honesty section: 'can it be saved?'.",
        },
      ],
      objections: [
        {
          label: "Drying time and method — answered on the page",
        },
      ],
      extensions: SRC_CARPET,
    },
    website: {
      forms: [
        {
          label: "Quote calculator as lead magnet, not e-commerce",
          description:
            "Rooms + items + stairs → running total → 'email me this quote'. Minimum charge floor; labelled 'guide only'.",
        },
      ],
      landingPages: [
        {
          label: "Stain-cluster landers + commercial spur pages by property type",
        },
      ],
      extensions: SRC_CARPET,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {},
    operations: {
      certifications: [
        {
          label: "NCCA membership — insurance is a membership condition",
          description:
            "Hero chip + dedicated 'why an NCCA member' page + link to the member directory/ReferenceLine.",
        },
      ],
      extensions: SRC_CARPET,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "domestic-commercial-cleaning": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "both",
      extensions: SRC_CLEANING,
    },
    services: {
      serviceCategories: [
        {
          label: "Recurring domestic sold on the trio",
          description: "Same cleaner every visit + discounted regular rate + skip/cancel anytime.",
        },
        {
          label: "One-off deep/end-of-tenancy clean as the acquisition product",
          description: "Deep-clean and EOT pages feed the recurring upsell.",
        },
      ],
      extensions: SRC_CLEANING,
    },
    customerPsychology: {
      trustFactors: [
        {
          label: "The vetting formula, stated honestly",
          description:
            "'DBS-checked · reference-vetted · fully insured (£Xm)' with a 'how we vet' expandable — and never claim enhanced DBS for domestic work.",
        },
      ],
      extensions: SRC_CLEANING,
    },
    website: {
      siteStructure: [
        {
          label: "Split funnel at the hero",
          description: "Home = book online; business = site survey. Different buyers, different physics.",
        },
      ],
      conversionStrategy: [
        {
          label: "Numbered reclean guarantee",
          description: "'Free within 72 hours' — a written promise with a number in it.",
        },
        {
          label: "Commercial page as capability statement",
          description:
            "CHAS/SafeContractor/BICSc/ISO, insurance limits, sector case studies, site-survey CTA, keyholding + COSHH policy stated.",
        },
      ],
      extensions: SRC_CLEANING,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {},
    operations: {
      certifications: [
        {
          label: "CHAS / SafeContractor / BICSc / ISO for commercial",
          description: "The capability statement's spine, alongside stated insurance limits.",
        },
      ],
      extensions: SRC_CLEANING,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "house-clearance": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "residential",
      extensions: SRC_CLEARANCE,
    },
    services: {
      serviceCategories: [
        {
          label: "Distinct pages per clearance situation",
          description:
            "Probate/bereavement (discretion, valuables set aside, donation receipts), hoarder, garage, single-item, and a vs-skip comparison.",
        },
      ],
      extensions: SRC_CLEARANCE,
    },
    customerPsychology: CLEARANCE_PSYCHOLOGY,
    website: CLEARANCE_WEBSITE,
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {},
    operations: CLEARANCE_OPERATIONS,
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "garage-clearance": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "residential",
      extensions: SRC_CLEARANCE,
    },
    services: {
      serviceCategories: [
        {
          label: "Garage and single-item jobs priced by van-load fraction",
          description: "The visual estimator does the pre-qualification.",
        },
      ],
      extensions: SRC_CLEARANCE,
    },
    customerPsychology: CLEARANCE_PSYCHOLOGY,
    website: CLEARANCE_WEBSITE,
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {},
    operations: CLEARANCE_OPERATIONS,
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "waste-removal": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "both",
      extensions: SRC_CLEARANCE,
    },
    services: {
      serviceCategories: [
        {
          label: "Van-load waste removal vs skip — the comparison is the pitch",
          description: "A dedicated vs-skip page; pricing by van-load fraction with the visual estimator.",
        },
      ],
      extensions: SRC_CLEARANCE,
    },
    customerPsychology: CLEARANCE_PSYCHOLOGY,
    website: CLEARANCE_WEBSITE,
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {
      competitors: [
        {
          label: "AnyJunk",
          description: "The transparency benchmark: '98% diverted from landfill' with an audit trail.",
        },
      ],
      extensions: SRC_CLEARANCE,
    },
    operations: CLEARANCE_OPERATIONS,
    businessIntelligence: {},
    aiBehaviour: {},
  },

  scaffolding: {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "both",
      extensions: SRC_SCAFFOLDING,
    },
    services: {
      serviceCategories: [
        {
          label: "Dual-audience: domestic speed + tidiness, commercial sectors + compliance",
        },
      ],
      extensions: SRC_SCAFFOLDING,
    },
    customerPsychology: {
      trustFactors: [
        {
          label: "Buyers verify the compliance pack",
          description:
            "CISRS cards, TG20:21 sheets, SG4:22, RAMS, £10m PL, CHAS/SMAS/Constructionline; NASC is the premium signal with an explainer if held.",
        },
      ],
      extensions: SRC_SCAFFOLDING,
    },
    website: {
      trustSignals: [
        {
          label: "Compliance strip with downloadable proof",
          description: "'CISRS · TG20:21/SG4:22 · £10m PL' plus downloadable cert/sample RAMS. Genuine badges only.",
        },
      ],
      conversionStrategy: [
        {
          label: "Commercial: case-study led, not gallery led",
          description: "Project, scaffold type, duration, main contractor — what tender reviewers actually read.",
        },
        {
          label: "Domestic page answers the pricing model",
          description: "Weekly hire + erect/dismantle, duration, liability — the three questions before every call.",
        },
        {
          label: "Handover certificate + 7-day scafftag inspections stated",
        },
      ],
      forms: [
        {
          label: "Quote form with company + drawings upload",
        },
      ],
      extensions: SRC_SCAFFOLDING,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {},
    operations: {
      certifications: [
        {
          label: "CISRS / TG20:21 / SG4:22 / NASC",
          description:
            "The verification stack commercial buyers check; NASC is the premium tier. RAMS and £10m PL stated as figures.",
        },
      ],
      extensions: SRC_SCAFFOLDING,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "mobile-mechanic": {
    businessIdentity: {
      emergencyOrPlanned: "both",
      residentialOrCommercial: "residential",
      extensions: SRC_AUTO,
    },
    services: {
      serviceCategories: [
        {
          label: "'We come to you' + coverage checker",
          description: "The mobile differentiator, stated at the hero with the postcode check.",
        },
      ],
      individualServices: [
        {
          label: "Wetbelt/cambelt/clutch specialist pages",
          description:
            "The exploding wetbelt niche (Ford EcoBoost/PSA PureTech): symptom checklist, affected-models table with engine codes, honest interval advice, from-prices per model, 'failure costs 5–10x prevention'.",
        },
      ],
      extensions: SRC_AUTO,
    },
    customerPsychology: {
      trustFactors: [
        {
          label: "12-month/12,000-mile parts & labour warranty",
          description: "The consumer expectation set by the platforms — stated at every CTA.",
        },
      ],
      extensions: SRC_AUTO,
    },
    website: {
      forms: [
        {
          label: "Reg-plate lookup in the hero feeding a fixed-price menu",
          description:
            "The ClickMechanic/Fixter funnel: reg + postcode → instant fixed price (manufacturer repair times + regional labour) → book → pay after work.",
        },
      ],
      conversionStrategy: [
        {
          label: "All-in pricing language: 'no hidden extras'",
        },
        {
          label: "Pay-after-work + spread-the-cost",
        },
        {
          label: "Post-job verified review loop",
        },
      ],
      extensions: SRC_AUTO,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {
      competitors: [
        {
          label: "ClickMechanic / Fixter",
          description: "Defined the instant-fixed-price funnel the category is judged against.",
        },
      ],
      extensions: SRC_AUTO,
    },
    operations: {
      certifications: [
        {
          label: "The Motor Ombudsman — the only CTSI-approved code for service & repair",
          description: "Trust order: TMO > Good Garage Scheme > IMI > DVSA MOT station, each linked to its register.",
        },
      ],
      extensions: SRC_AUTO,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "garage-repairs": {
    businessIdentity: {
      emergencyOrPlanned: "both",
      residentialOrCommercial: "residential",
      extensions: SRC_AUTO,
    },
    services: {
      serviceCategories: [
        {
          label: "Collection & delivery / courtesy car",
          description: "The garage-side answer to mobile convenience.",
        },
      ],
      individualServices: [
        {
          label: "Wetbelt/cambelt/clutch specialist pages",
          description: "Same niche engine as mobile: symptoms, models table, intervals, from-prices, consequence framing.",
        },
      ],
      extensions: SRC_AUTO,
    },
    customerPsychology: {
      trustFactors: [
        {
          label: "12-month/12,000-mile parts & labour warranty at every CTA",
        },
      ],
      extensions: SRC_AUTO,
    },
    website: {
      forms: [
        {
          label: "Reg-plate lookup feeding the fixed-price menu",
        },
      ],
      conversionStrategy: [
        { label: "All-in pricing language: 'no hidden extras'" },
        { label: "Pay-after-work + spread-the-cost" },
      ],
      extensions: SRC_AUTO,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {},
    operations: {
      certifications: [
        {
          label: "The Motor Ombudsman + register-linked trust stack",
          description: "TMO > Good Garage Scheme > IMI > DVSA MOT station.",
        },
      ],
      extensions: SRC_AUTO,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "mot-servicing": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "residential",
      extensions: SRC_AUTO,
    },
    services: {
      serviceCategories: [
        {
          label: "MOT + servicing as reg-plate fixed-price commodities",
          description: "Instant price from the reg lookup; book online; pay after work.",
        },
      ],
      extensions: SRC_AUTO,
    },
    customerPsychology: {
      trustFactors: [
        {
          label: "DVSA-approved MOT station, linked to the register",
        },
        {
          label: "12-month/12,000-mile warranty expectation on repair work",
        },
      ],
      extensions: SRC_AUTO,
    },
    website: {
      forms: [
        {
          label: "Reg-plate lookup in the hero — the funnel IS the price",
        },
      ],
      conversionStrategy: [
        { label: "All-in pricing language: 'no hidden extras'" },
        { label: "Post-job verified review loop" },
      ],
      extensions: SRC_AUTO,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {},
    operations: {
      certifications: [
        {
          label: "DVSA MOT station status + TMO code",
          description: "Both linked to their public registers — numbers, not badges.",
        },
      ],
      extensions: SRC_AUTO,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "car-detailing": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "residential",
      extensions: SRC_DETAILING,
    },
    services: {
      serviceCategories: [
        {
          label: "Named package ladder",
          description:
            "Maintenance Valet → Enhancement → Correction → Ceramic → PPF, each with from-price + duration + inclusions.",
        },
      ],
      extensions: SRC_DETAILING,
    },
    customerPsychology: {
      trustFactors: [
        {
          label: "Installer accreditations are the trade's Gas Safe",
          description: "XPEL/Stek/Gtechniq approved-installer status, with manufacturer warranty lengths per package.",
        },
        {
          label: "Facility trust for £50k+ cars",
          description: "Indoor studio, insured, CCTV — stated as a block, because the car sleeps over.",
        },
      ],
      extensions: SRC_DETAILING,
    },
    website: {
      forms: [
        {
          label: "WhatsApp photo upload as the primary funnel",
          description: "With a condition caveat — the photo sets expectations both ways.",
        },
      ],
      conversionStrategy: [
        {
          label: "Image-first design with per-service and per-marque galleries",
        },
        {
          label: "Founder/tech personality + process films",
          description: "Founder-fronted video credibility — people buy the craftsman at this price.",
        },
        {
          label: "Deposit-to-book with a genuine scarcity calendar",
          description: "Scarcity only when real (ADR-059 applies to booking pressure too).",
        },
      ],
      extensions: SRC_DETAILING,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {},
    operations: {
      certifications: [
        {
          label: "XPEL / Stek / Gtechniq approved installer",
          description: "Manufacturer accreditations gate the warranty lengths offered per package.",
        },
      ],
      extensions: SRC_DETAILING,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },
};
