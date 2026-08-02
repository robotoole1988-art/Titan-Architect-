import type { IndustryDna } from "../industry-dna";
import { sourced, vol2 } from "./sources";

/**
 * Track B — big-ticket considered purchases.
 *
 * Seven trades where the cycle is weeks-to-months and the sale runs on
 * guarantees, deposit protection and honest guide pricing. Finance-promotion
 * copy in these trades is FCA credit-broking territory — the platform
 * layer's finance gate (FRN → CONC 3 block, else stripped) applies with
 * full force here. Figures verbatim from the research; nothing invented.
 */

const SRC_WINDOWS = sourced(vol2("Track B — Windows & Doors (Double Glazing) + Conservatories"));
const SRC_CONSERVATORIES = SRC_WINDOWS;
const SRC_POOLS = sourced(vol2("Track B — Swimming Pools"));
const SRC_EV = sourced(vol2("Track B — EV Charger Installation"));
const SRC_BATTERY = sourced(vol2("Track B — Battery Storage (standalone)"));
const SRC_BUILDERS = sourced(vol2("Track B — Builders (General) + Extensions & Renovations"));
const SRC_EXTENSIONS = SRC_BUILDERS;

export const TRACK_B_DNA: Readonly<Record<string, IndustryDna>> = {
  "windows-doors": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "residential",
      extensions: SRC_WINDOWS,
    },
    services: {
      serviceCategories: [
        {
          label: "Replacement windows and doors with guide pricing",
          description: "'Windows from £X installed' — Everest-style upfront guide pricing beats opacity for local firms.",
        },
      ],
      extensions: SRC_WINDOWS,
    },
    customerPsychology: {
      fears: [
        {
          label: "House-sale risk from missing certificates",
          description:
            "Replacement windows legally require Building Regs compliance; frame FENSA/Certass around the sale: 'certificate lodged with the council automatically'.",
        },
        {
          label: "Deposit loss on a big-ticket order",
          description: "Deposit protection stated at the quote CTA; FENSA mandates approved IBG providers (QANW/HomePro).",
        },
      ],
      trustFactors: [
        {
          label: "Guarantee length is the headline differentiator",
          description: "10 vs 15 vs 20 years — years, coverage, transferability and IBG all stated in the guarantee hero.",
        },
      ],
      extensions: SRC_WINDOWS,
    },
    website: {
      forms: [
        {
          label: "Design wizard: style → material → size → postcode",
          description: "Labelled an estimate, with measure-up as explicit step 2. Dual route: instant estimate or free design appointment.",
        },
      ],
      trustSignals: [
        {
          label: "Compliance strip",
          description: "'FENSA/Certass — certificate lodged with the council automatically'.",
        },
      ],
      conversionStrategy: [
        {
          label: "Finance only with an FCA FRN",
          description: "Finance promotion is FCA credit-broking territory: CONC 3 representative example required; all finance copy gated on the FRN.",
        },
      ],
      extensions: SRC_WINDOWS,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {
      competitors: [
        { label: "Everest", description: "The upfront guide-pricing benchmark." },
      ],
      extensions: SRC_WINDOWS,
    },
    operations: {
      certifications: [
        {
          label: "FENSA or Certass — legal MUST for replacement windows",
          description:
            "Building Regs compliance route; the certificate is lodged automatically and the copy says so. FENSA mandates approved insurance-backed-guarantee providers (QANW/HomePro).",
        },
      ],
      serviceGuarantees: [
        {
          label: "Multi-year guarantee with IBG",
          description: "Years, coverage and transferability stated; insurance-backed so it survives the firm.",
        },
      ],
      extensions: SRC_WINDOWS,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  conservatories: {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "residential",
      extensions: SRC_CONSERVATORIES,
    },
    services: {
      serviceCategories: [
        {
          label: "Conservatories sold by style archetype",
          description: "Per-style price bands, not a single vague 'from' figure.",
        },
      ],
      extensions: SRC_CONSERVATORIES,
    },
    customerPsychology: {
      fears: [
        {
          label: "Deposit loss and compliance gaps",
          description: "Same physics as windows: deposit protection at quote CTA, compliance handled and stated.",
        },
      ],
      extensions: SRC_CONSERVATORIES,
    },
    website: {
      forms: [
        {
          label: "Instant quote engine: style → size → spec → estimate",
          description:
            "ConservatoryLand's volume pattern; locals approximate with a 3-step wizard. Dual route: instant estimate + free design appointment (including virtual).",
        },
      ],
      extensions: SRC_CONSERVATORIES,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {
      competitors: [
        { label: "ConservatoryLand", description: "The instant-quote-engine benchmark for the category." },
      ],
      extensions: SRC_CONSERVATORIES,
    },
    operations: {
      certifications: [
        {
          label: "FENSA/Certass where glazing rules apply",
          description: "The windows compliance strip carries over; certificates lodged automatically.",
        },
      ],
      extensions: SRC_CONSERVATORIES,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "swimming-pools": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "residential",
      averageJobValue: { currency: "GBP", min: 50000, max: 150000 },
      salesCycle: "6–18 month cycles — brochure-by-post capture exists because the decision is a season long.",
      extensions: SRC_POOLS,
    },
    services: {
      serviceCategories: [
        { label: "Design and build, sold by build type with honest cost bands" },
      ],
      extensions: SRC_POOLS,
    },
    customerPsychology: {
      fears: [
        {
          label: "The builder failing mid-project at £50k–150k",
          description:
            "SPATASHIELD is the objection-killer: £30k completion bond + £20k/3-year rectification warranty — explained in pounds, only claimable by full installer members (case law: never imply cover not held).",
        },
      ],
      extensions: SRC_POOLS,
    },
    website: {
      callsToAction: [
        {
          label: "Dual CTA ladder: brochure pack ↔ design consultation",
          description: "No instant-quote pretence at this ticket size.",
        },
      ],
      conversionStrategy: [
        {
          label: "Build-story case studies",
          description: "Challenges, timeline, drone footage; one named technical USP; warranty and running-cost transparency.",
        },
        {
          label: "Named testimonials only",
          description: "Named and photographed (Compass pattern) — anonymous praise is worthless at this price.",
        },
      ],
      extensions: SRC_POOLS,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {
      leadQualification: [
        {
          label: "Brochure-by-post as the long-cycle capture",
          description: "6–18 month cycles: the brochure request is the lead, nurtured to consultation.",
        },
      ],
      extensions: SRC_POOLS,
    },
    marketIntelligence: {
      competitors: [
        {
          label: "Compass Pools",
          description: "Benchmark: brochure capture, cost calculator, 20-yr warranty, named technology USP, press bar, named testimonials.",
        },
      ],
      extensions: SRC_POOLS,
    },
    operations: {
      certifications: [
        {
          label: "SPATA — the only industry body",
          description:
            "SPATASHIELD (£30k completion bond, £20k/3yr rectification) is carried by full installer members only; the badge and the claim are gated on membership grade.",
        },
      ],
      extensions: SRC_POOLS,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "ev-charger-installation": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "both",
      extensions: SRC_EV,
    },
    services: {
      serviceCategories: [
        {
          label: "Fixed installed price per charger model",
          value: "'from £382' anchoring (Smart Home Charge)",
        },
      ],
      extensions: SRC_EV,
    },
    customerPsychology: {
      buyingTriggers: [
        {
          label: "Grant eligibility — for the right audiences only",
          description:
            "Driveway homeowners are INELIGIBLE; flats/renters get 75% to £500 (to Mar 2027), landlords £500/socket. The OZEV-authorised installer claims it for the customer: 'we claim it for you'.",
        },
      ],
      extensions: SRC_EV,
    },
    website: {
      forms: [
        {
          label: "Photo-based remote survey funnel",
          description:
            "Fusebox + parking photos triage standard vs non-standard installs; same-day quote; no default site visits. Secondary CTA: scheduled callback.",
        },
      ],
      conversionStrategy: [
        {
          label: "Grant module targeted at flats/renters/landlords only",
          description: "Showing the grant to ineligible driveway homeowners is a broken promise — audience-gate the module.",
        },
        {
          label: "Finance only with a displayed FRN",
        },
      ],
      extensions: SRC_EV,
    },
    searchSeo: {
      contentStrategy: [
        {
          label: "Charger-review content hub as the SEO moat",
          description: "Charger comparison content (Smart Home Charge pattern) owns the research phase of the funnel.",
        },
      ],
      extensions: SRC_EV,
    },
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {
      competitors: [
        {
          label: "Smart Home Charge",
          description: "Benchmark: price anchoring, remote photo survey, same-day quote, review content hub.",
        },
      ],
      extensions: SRC_EV,
    },
    operations: {
      certifications: [
        {
          label: "NICEIC/NAPIT + OZEV authorisation",
          description:
            "OZEV authorisation is what lets the installer claim the grant for the customer; the charger itself must be on the OZEV approved list. Trust stack: scheme + OZEV + Trustpilot + warranty years.",
        },
      ],
      extensions: SRC_EV,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "battery-storage": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "residential",
      extensions: SRC_BATTERY,
    },
    services: {
      serviceCategories: [
        {
          label: "Per-brand price pages",
          description: "'Installed from £X' anchored to named products (Powerwall 3 etc.).",
        },
      ],
      extensions: SRC_BATTERY,
    },
    customerPsychology: {
      buyingTriggers: [
        {
          label: "0% VAT deadline — legitimate urgency",
          description:
            "0% VAT on home batteries (standalone included) until 31 Mar 2027. Banner copy auto-expires — urgency that stops being claimed the day it stops being true.",
        },
      ],
      extensions: SRC_BATTERY,
    },
    website: {
      forms: [
        {
          label: "Tariff-arbitrage payback calculator as primary capture",
          description: "Result emailed; savings always flagged as tariff-dependent estimates.",
        },
      ],
      conversionStrategy: [
        {
          label: "Certification honesty",
          description:
            "MCS is NOT legally required (it matters for export tariffs); Flexi-Orb is a credible alternative mandating insurance-backed warranties. One-line explainer, never 'legally required'.",
        },
        {
          label: "Case studies with the working shown",
          description: "kWh, tariff, before/after monthly bill, winter/summer split — measured, not promised.",
        },
      ],
      extensions: SRC_BATTERY,
    },
    searchSeo: {
      contentStrategy: [
        {
          label: "'Battery WITHOUT solar — is it worth it?' page",
          description: "The under-served query in the category; a dedicated page, not a paragraph.",
        },
      ],
      extensions: SRC_BATTERY,
    },
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {
      economicFactors: [
        {
          label: "0% VAT window to 31 Mar 2027",
          description: "The category's demand clock; copy and campaigns key off it and expire with it.",
        },
      ],
      extensions: SRC_BATTERY,
    },
    operations: {
      certifications: [
        {
          label: "MCS / Flexi-Orb — stated honestly",
          description:
            "Neither is a legal requirement for installation; MCS gates export tariffs, Flexi-Orb mandates insurance-backed warranties. The warranty stack (including cycles) is stated per product.",
        },
      ],
      extensions: SRC_BATTERY,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "builders-general": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "both",
      salesCycle: "Considered, plan-led; the site consultation is the conversion event.",
      extensions: SRC_BUILDERS,
    },
    services: {
      serviceCategories: [
        { label: "General building sold through project case studies with budget bands" },
      ],
      extensions: SRC_BUILDERS,
    },
    customerPsychology: {
      fears: [
        {
          label: "Planning and Building Regs anxiety — the top one",
          description: "'We handle planning & building control' stated explicitly, not implied.",
        },
        {
          label: "Staged payments and deposit risk",
          description: "Staged-payment transparency plus deposit/IBG protection stated.",
        },
      ],
      trustFactors: [
        {
          label: "FMB vetting mechanics, not just the logo",
          description:
            "FMB is genuinely vetted — 12+ months trading, credit checks, on-site inspection — and a TrustMark route. Say the mechanics.",
        },
      ],
      extensions: SRC_BUILDERS,
    },
    website: {
      landingPages: [
        {
          label: "Regional cost-per-m² guide page",
          value: "£1,650–£4,200/m² banded",
          description: "The #1 organic lead asset in the category, with mid-page capture.",
        },
      ],
      conversionStrategy: [
        {
          label: "Every project card: location, type, budget band, weeks",
          description: "Budget BANDS on case studies beat exact prices and beat no prices.",
        },
        {
          label: "Drone/timelapse on flagship case studies",
          description: "The highest-credibility proof in the category — one per flagship project.",
        },
      ],
      callsToAction: [{ label: "Free site consultation as the primary CTA" }],
      extensions: SRC_BUILDERS,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {
      pricingPosition: [
        {
          label: "Cost-per-m² banding",
          value: "£1,650–£4,200/m²",
          description: "Published as a regional guide, not hidden until quote.",
        },
      ],
      extensions: SRC_BUILDERS,
    },
    operations: {
      certifications: [
        {
          label: "FMB (vetted) / TrustMark route",
          description: "State the vetting mechanics: 12+ months trading, credit checks, on-site inspection.",
        },
      ],
      extensions: SRC_BUILDERS,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "extensions-renovations": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "residential",
      extensions: SRC_EXTENSIONS,
    },
    services: {
      serviceCategories: [
        {
          label: "Design-and-build with a productised journey",
          description: "Fixed price + structured timeline (Plus Rooms); productised journey pages (Simply Extend).",
        },
      ],
      extensions: SRC_EXTENSIONS,
    },
    customerPsychology: {
      fears: [
        {
          label: "Planning, Building Regs and open-ended cost",
          description: "Answered by the numbered journey with week counts and budget-banded case studies.",
        },
      ],
      extensions: SRC_EXTENSIONS,
    },
    website: {
      siteStructure: [
        {
          label: "Numbered build-journey page with week counts",
          description: "The design-and-build conversion engine: stages, durations, who does what.",
        },
      ],
      landingPages: [
        {
          label: "Cost-per-m² guide with mid-page capture",
          value: "£1,650–£4,200/m² banded",
        },
      ],
      conversionStrategy: [
        {
          label: "Budget bands on every case study",
          description: "Location, type, band, weeks — pre-qualification built into the portfolio.",
        },
      ],
      extensions: SRC_EXTENSIONS,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {
      competitors: [
        { label: "Plus Rooms", description: "Fixed price + structured timeline benchmark." },
        { label: "Simply Extend", description: "Productised journey-page benchmark." },
      ],
      extensions: SRC_EXTENSIONS,
    },
    operations: {
      certifications: [
        {
          label: "FMB/TrustMark as for general building",
          description: "Vetting mechanics stated; planning and building control handled and said so.",
        },
      ],
      extensions: SRC_EXTENSIONS,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },
};
