import type { IndustryDna } from "../industry-dna";
import { sourced, vol2 } from "./sources";

/**
 * Track A — emergency and compliance-led home trades.
 *
 * Six trades where the law does the selling: certification is both a legal
 * MUST and the highest-converting content. Every figure below is stated in
 * the research; nothing is rounded, extrapolated or invented (ADR-059
 * applied to knowledge). Sections without research stay empty.
 */

const SRC_PLUMBING = sourced(vol2("Track A — Plumbing & Heating (emergency)"));
const SRC_BOILER = sourced(vol2("Track A — Boiler Installation"));
const SRC_HVAC = sourced(vol2("Track A — HVAC / Air Conditioning"));
const SRC_ELECTRICIANS = sourced(vol2("Track A — Electricians"));
const SRC_DAMP = sourced(vol2("Track A — Damp Proofing"));
const SRC_CHIMNEY = sourced(vol2("Track A — Chimney & Fireplaces"));

export const TRACK_A_DNA: Readonly<Record<string, IndustryDna>> = {
  "plumbing-heating-emergency": {
    businessIdentity: {
      emergencyOrPlanned: "both",
      residentialOrCommercial: "both",
      salesCycle:
        "Emergency: minutes — the fastest credible responder wins the call. Planned work follows a normal quote cycle.",
      extensions: SRC_PLUMBING,
    },
    services: {
      serviceCategories: [
        { label: "Emergency plumbing (call-only lane)" },
        { label: "Planned plumbing and heating work (form allowed)" },
        { label: "Gas work — Gas Safe registered engineers only" },
      ],
      emergencyServices: [
        {
          label: "Emergency call-out",
          description:
            "Priced hourly with a call-out band, never fixed repair prices — published rate tables by time band (standard/evening/weekend).",
        },
      ],
      extensions: SRC_PLUMBING,
    },
    customerPsychology: {
      urgencyLevel: "critical",
      customerMotivations: [
        {
          label: "Speed above all in an emergency",
          description:
            "The market is a speed-proof arms race: '1 hour response' (Pimlico), 'no call-out charge, pay only for time on site' (Aspect).",
        },
      ],
      fears: [
        {
          label: "Unregistered gas work",
          description:
            "Gas work requires Gas Safe registration; the register is how customers are told to check. The registration number is the trust anchor.",
        },
      ],
      extensions: SRC_PLUMBING,
    },
    website: {
      siteStructure: [
        {
          label: "Emergency vs Planned IA split",
          description:
            "Two lanes with different conversion physics: Emergency is call-only; Planned allows forms. Never mix the funnels.",
        },
        {
          label: "/emergency-plumber-{town} pages",
          description: "A separate emergency lander per coverage town.",
        },
      ],
      conversionStrategy: [
        {
          label: "Emergency hero variant with response promise",
          description:
            "Only promise what the business actually delivers — response claims are verifiable facts under ADR-059.",
        },
        {
          label: "Hourly rate table, never fixed repair prices",
          value: "£40–60/hr standard · £100–120 emergency call-out",
          description:
            "Published rate tables by time band are the market's honesty pattern; fixed repair prices misprice unseen work.",
        },
        {
          label: "Stopcock first-steps micro-content on emergency pages",
          description:
            "Helping the caller stop the water before you arrive converts and builds trust in one stroke.",
        },
      ],
      extensions: SRC_PLUMBING,
    },
    searchSeo: {
      locationPages: [
        {
          label: "Emergency landers per town",
          description: "/emergency-plumber-{town} alongside the standard area pages.",
        },
      ],
      extensions: SRC_PLUMBING,
    },
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {
      competitors: [
        { label: "Pimlico", description: "Sets the response-time benchmark ('1 hour response')." },
        {
          label: "Aspect",
          description: "Sets the pricing-honesty benchmark ('no call-out charge, pay only for time on site').",
        },
      ],
      pricingPosition: [
        {
          label: "Hourly rates",
          value: "£40–60/hr · £100–120 emergency call-out",
          description: "Published by time band: standard / evening / weekend.",
        },
      ],
      extensions: SRC_PLUMBING,
    },
    operations: {
      certifications: [
        {
          label: "Gas Safe registration — legal MUST for gas work",
          description:
            "Displaying the logo unregistered is a criminal offence (£1,500 fine precedent). Official logo files only, minimum 12mm, registration number recommended beneath. Gas pages and logo are gated on a verified Gas Safe number; the logo is never recreated.",
        },
      ],
      extensions: SRC_PLUMBING,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "boiler-installation": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "residential",
      salesCycle:
        "1–4 week consideration cycle — the save/email-my-quote step exists because the decision is slept on.",
      extensions: SRC_BOILER,
    },
    services: {
      serviceCategories: [
        {
          label: "Three fixed package tiers",
          description: "'From £X,XXX installed', never price-on-application.",
        },
      ],
      extensions: SRC_BOILER,
    },
    customerPsychology: {
      urgencyLevel: "high",
      fears: [
        {
          label: "Warranty invalidation",
          description:
            "Benchmark commissioning validates the warranty; missing paperwork voids it. 'Warranty registered for you' answers the fear directly.",
        },
      ],
      trustFactors: [
        {
          label: "Installer tier gates the warranty claim",
          description:
            "Worcester Accredited / Vaillant Advance / Baxi Approved → up to 10 years; Glow-worm to 15. Never claim a 10-year guarantee without the verified tier — the warranty figure is data-driven, not copy.",
        },
      ],
      extensions: SRC_BOILER,
    },
    website: {
      forms: [
        {
          label: "Quote-engine multi-step form",
          description:
            "8–12 click-only questions → postcode → instant fixed prices for 3–4 tiers. No salesperson, no phone call. Where auto-pricing isn't possible, end with 'fixed quote within 2 hours'.",
        },
        {
          label: "Save/email-my-quote step",
          description: "Captures the 1–4 week consideration cycle instead of losing it.",
        },
      ],
      trustSignals: [
        {
          label: "Compliance strip",
          description: "'Gas Safe {number} · Benchmark commissioned · warranty registered for you'.",
        },
      ],
      conversionStrategy: [
        {
          label: "Finance module only if real",
          description: "0% finance is a conversion lever only when the business actually offers it (FCA gate applies).",
        },
      ],
      extensions: SRC_BOILER,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {
      competitors: [
        {
          label: "BOXT / Heatable",
          description:
            "Defined the category: click-only survey → instant fixed tiers → 0% finance → next-day install.",
        },
      ],
      extensions: SRC_BOILER,
    },
    operations: {
      certifications: [
        {
          label: "Gas Safe registration — legal MUST",
          description: "As for all gas work; the compliance strip renders from the verified number.",
        },
        {
          label: "Benchmark commissioning",
          description: "Validates the manufacturer warranty; stated on the site as a process fact.",
        },
      ],
      serviceGuarantees: [
        {
          label: "Warranty length from verified installer tier",
          description:
            "Up to 10 years (Worcester/Vaillant/Baxi tiers), 15 (Glow-worm) — rendered from data, never asserted in copy.",
        },
      ],
      extensions: SRC_BOILER,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "hvac-air-conditioning": {
    businessIdentity: {
      emergencyOrPlanned: "both",
      residentialOrCommercial: "both",
      extensions: SRC_HVAC,
    },
    services: {
      serviceCategories: [
        {
          label: "Year-round climate: cooling AND efficient heating",
          description:
            "Dual-season repositioning kills the summer-only demand curve — never sell cooling alone.",
        },
      ],
      extensions: SRC_HVAC,
    },
    customerPsychology: {
      customerMotivations: [
        {
          label: "Benefits beyond temperature",
          description: "Filtration/allergies, dehumidification, quiet operation (dB) — chip-level benefits on page.",
        },
      ],
      extensions: SRC_HVAC,
    },
    website: {
      conversionStrategy: [
        {
          label: "Fixed-price kW/room-size tiers",
          value: "'from £37/month' pattern (SelectAir/Heatable)",
          description: "Room-size price tiers with free-survey confirmation; monthly finance framing only where real.",
        },
      ],
      trustSignals: [
        {
          label: "REFCOM/F-Gas number in the trust strip",
          description: "Rendered from the verified number as a required field.",
        },
      ],
      extensions: SRC_HVAC,
    },
    searchSeo: {
      contentStrategy: [
        {
          label: "Summer + winter content pair per page",
          description: "Dual-intent SEO: every service page answers both seasons.",
        },
      ],
      googleBusinessProfile: [
        {
          label: "Seasonal GBP primary-category swap",
          description: "HVAC swaps its GBP primary category by season — the platform's season-flip module at its most literal.",
        },
      ],
      extensions: SRC_HVAC,
    },
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {
      seasonalTrends: [
        {
          label: "Dual-season demand curve",
          description: "'Cool in summer, efficient heating in winter' is the master pattern for flattening it.",
        },
      ],
      extensions: SRC_HVAC,
    },
    operations: {
      certifications: [
        {
          label: "F-Gas company certification — legal MUST for split-system work",
          description: "REFCOM is the dominant, verifiable scheme; the number is a required field rendered in the trust strip.",
        },
      ],
      extensions: SRC_HVAC,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  electricians: {
    businessIdentity: {
      emergencyOrPlanned: "both",
      residentialOrCommercial: "both",
      extensions: SRC_ELECTRICIANS,
    },
    services: {
      serviceCategories: [
        {
          label: "Three-lane IA: Emergency / Certificates / Installations",
          description:
            "Emergency is hourly and call-only; Certificates are a fixed-price menu booked online; Installations get a survey.",
        },
      ],
      individualServices: [
        {
          label: "EICR — the demand engine",
          value: "'from £69–79' banded by bedrooms",
          description:
            "Landlord EICRs are mandatory every 5 years (fines to £30,000). Sold as a fixed-price commodity with same-day certificate.",
        },
        {
          label: "Fuseboard replacement",
          value: "£450–800 guide",
          description: "The second fixed-price lander.",
        },
      ],
      extensions: SRC_ELECTRICIANS,
    },
    customerPsychology: {
      buyingTriggers: [
        {
          label: "Landlord compliance deadline",
          description: "The 5-year EICR cycle plus £30,000 fine exposure is the urgency that converts.",
        },
      ],
      trustFactors: [
        {
          label: "'Check our registration' against the public register",
          description: "Scheme logos are licensed to current members only; the register link is the proof.",
        },
      ],
      extensions: SRC_ELECTRICIANS,
    },
    website: {
      siteStructure: [
        {
          label: "/eicr-{town} landlord page — always generated",
          description:
            "Bedroom-banded fixed prices, £30k-fine urgency, landlord-pack bundle.",
        },
        {
          label: "/fuseboard-replacement-{town} — always generated",
        },
      ],
      conversionStrategy: [
        {
          label: "Every page states the paperwork issued",
          description: "EICR, EIC, Minor Works certificate — the document is the product.",
        },
      ],
      trustSignals: [{ label: "'Part P registered' chip with scheme + number" }],
      extensions: SRC_ELECTRICIANS,
    },
    searchSeo: {
      locationPages: [
        {
          label: "Certificate landers per town",
          description: "/eicr-{town} and /fuseboard-replacement-{town} alongside standard area pages.",
        },
      ],
      extensions: SRC_ELECTRICIANS,
    },
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {
      pricingPosition: [
        {
          label: "EICR fixed-price banding",
          value: "'from £69–79' by bedrooms; fuseboard £450–800 guide",
        },
      ],
      extensions: SRC_ELECTRICIANS,
    },
    operations: {
      certifications: [
        {
          label: "Part P via Competent Person Scheme — legal MUST for notifiable domestic work",
          description:
            "Self-certified via NICEIC/NAPIT membership. Logos licensed to current members only; link 'check our registration' to the scheme's public register.",
        },
      ],
      extensions: SRC_ELECTRICIANS,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "damp-proofing": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "residential",
      salesCycle:
        "Survey-first, universally: book a survey → written report → itemised quote. Treatments are never priced online.",
      extensions: SRC_DAMP,
    },
    services: {
      serviceCategories: [
        {
          label: "Symptom-led service architecture",
          description:
            "Rising damp / penetrating damp / condensation & mould / dry rot / woodworm — pages organised by what the customer sees, not by treatment name.",
        },
      ],
      individualServices: [
        {
          label: "Two survey products",
          description:
            "Free homeowner survey vs paid pre-purchase Damp & Timber Report — lenders require PCA reports for mortgage retentions.",
        },
      ],
      extensions: SRC_DAMP,
    },
    customerPsychology: {
      fears: [
        {
          label: "The firm disappearing after treatment",
          description:
            "Answered with the insurance-backed guarantee: 'protects you if we cease trading' (GPI).",
        },
      ],
      decisionMakers: [
        {
          label: "Lenders force the timetable in purchases",
          description: "Mortgage retentions pending a PCA report make the surveyor the gatekeeper.",
        },
      ],
      extensions: SRC_DAMP,
    },
    website: {
      callsToAction: [
        {
          label: "Primary CTA is always 'Book a survey'",
          description:
            "Optionally incentivised (Peter Cox pattern: online-booking discount). Photo upload field on the form for remote triage.",
        },
      ],
      conversionStrategy: [
        {
          label: "Never price treatments online",
          description: "A 3-step survey → report → itemised quote graphic sets the expectation instead.",
        },
        {
          label: "Symptom-tree pages with photo diagnosis cues",
        },
      ],
      extensions: SRC_DAMP,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {
      competitors: [
        { label: "Peter Cox", description: "Book-online survey with £25 discount." },
        {
          label: "Timberwise",
          description: "Free homeowner survey vs paid pre-purchase Damp & Timber Report split.",
        },
      ],
      extensions: SRC_DAMP,
    },
    operations: {
      certifications: [
        {
          label: "PCA membership — the industry standard (no licence exists)",
          description:
            "CSRT/CSSW-qualified surveyors; the PCA chip is gated on verified membership. Lenders require PCA reports for retentions.",
        },
      ],
      serviceGuarantees: [
        {
          label: "N-year written guarantee + insurance-backed guarantee",
          description: "IBG via GPI: 'protects you if we cease trading' — stated in those terms.",
        },
      ],
      extensions: SRC_DAMP,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "chimney-fireplaces": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "residential",
      extensions: SRC_CHIMNEY,
    },
    services: {
      serviceCategories: [
        {
          label: "Two lanes, two funnels",
          description:
            "Sweeping: fixed price per flue, instant online booking. Stove installation: gallery + free survey. Different economics, different pages.",
        },
      ],
      extensions: SRC_CHIMNEY,
    },
    customerPsychology: {
      buyingTriggers: [
        {
          label: "The insurer requires the certificate",
          description:
            "Insurers require annual sweeping certificates from recognised bodies — the certificate IS the product; sweep pages lead with the insurance angle and same-day digital certificate.",
        },
      ],
      extensions: SRC_CHIMNEY,
    },
    website: {
      conversionStrategy: [
        {
          label: "Sweep lane: fixed price per flue, instant booking, certificate-led",
        },
        {
          label: "Smoke-control-area note auto-inserted by town",
          description: "Smoke-control areas need DEFRA-exempt stoves — the note renders from location data.",
        },
        {
          label: "Seasonal 'beat the autumn rush' banner, May–August",
        },
      ],
      extensions: SRC_CHIMNEY,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {
      followUp: [
        {
          label: "Annual-reminder capture",
          description: "The retention engine: the yearly certificate makes the customer recurring by nature.",
        },
      ],
      extensions: SRC_CHIMNEY,
    },
    marketIntelligence: {
      seasonalTrends: [
        {
          label: "Autumn rush",
          description: "Demand peaks pre-winter; May–August is the counter-season sell.",
        },
      ],
      extensions: SRC_CHIMNEY,
    },
    operations: {
      certifications: [
        {
          label: "HETAS — stove installs are notifiable (Part J)",
          description:
            "HETAS installers self-certify ('no council fees' is the customer-facing benefit). The HETAS chip is gated on verified membership.",
        },
        {
          label: "Sweeping certification bodies",
          description:
            "Guild / ICS / APICS / NACS / HETAS — insurers require annual certificates from a recognised body.",
        },
      ],
      extensions: SRC_CHIMNEY,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },
};
