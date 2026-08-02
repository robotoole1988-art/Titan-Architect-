import type { IndustryDna } from "../industry-dna";
import { sourced, vol1, vol3 } from "./sources";

/**
 * Track F — the four trades researched in Volume 1 (site-excellence
 * dossier) before the Volume 2 sweep existed: roofing, driveways, solar,
 * and private dentistry. Vol 1's own caveat: regulatory items are verified
 * against primary sources (GDC, CQC, ASA, MCS) and are non-negotiable.
 *
 * Two of these are the original demo trades — and dental/solar are where
 * the compliance-linter law was born: ASA runs AI ad monitoring, so a
 * non-compliant generated site WILL be caught.
 */

const SRC_ROOFING = sourced(vol1("Per-trade playbooks — Roofing / Emergency roofing & drainage"));
const SRC_DRIVEWAYS = sourced(vol1("Per-trade playbooks — Driveways & paving"));
const SRC_SOLAR = sourced(
  vol1("Per-trade playbooks — Solar & battery"),
  vol1("Compliance MUSTs — Solar"),
);
const SRC_DENTAL = sourced(
  vol1("Per-trade playbooks — Private dentistry (clinical template)"),
  vol1("Compliance MUSTs — Dental/clinical (GDC · CQC · ASA · MHRA)"),
);

export const TRACK_F_DNA: Readonly<Record<string, IndustryDna>> = {
  roofing: {
    businessIdentity: {
      emergencyOrPlanned: "both",
      residentialOrCommercial: "both",
      extensions: SRC_ROOFING,
    },
    services: {
      emergencyServices: [
        {
          label: "Emergency roofing as a distress purchase",
          description:
            "Dedicated emergency landing page, call-first layout, '24/7 … in {Town}' with a response promise ONLY if operationally true — tiered presets: 'on-site within 2 hours' / 'same-day' / 'answered in 60 seconds'.",
        },
      ],
      individualServices: [
        {
          label: "Storm-damage & insurance-claim module",
          description: "A proven US differentiator whose UK analogue is underserved.",
        },
      ],
      extensions: SRC_ROOFING,
    },
    customerPsychology: {
      urgencyLevel: "critical",
      customerMotivations: [
        {
          label: "'We answer' beats 'we're the best'",
          description:
            "62% of calls to small firms go unanswered; 67% of unanswered callers dial a competitor. The trust strip says: 'Speak to a real person, not voicemail.'",
        },
      ],
      extensions: SRC_ROOFING,
    },
    website: {
      landingPages: [
        {
          label: "Dedicated emergency lander, call-first, red/amber accents",
          description: "Van and crew photos; the response promise rendered only when true.",
        },
      ],
      callsToAction: [
        {
          label: "Secondary emergency CTA: 'Send photos of the damage'",
          description: "Photo-attach form for triage while the phone lane stays primary.",
        },
      ],
      images: [
        {
          label: "Drone/aerial portfolio shots",
          description: "The differentiator in a trade judged from the ground; before/after sliders with identical angles.",
        },
      ],
      trustSignals: [
        {
          label: "Trust stack as text above the fold",
          description:
            "NFRC / TrustMark / CompetentRoofer + Insurance-Backed Guarantee — rendered from verified membership data only, never asserted (the unpublished demos claimed NFRC for businesses that did not exist; never again).",
        },
      ],
      extensions: SRC_ROOFING,
    },
    searchSeo: {},
    paidAdvertising: {
      googleAds: [
        {
          label: "UK benchmark — with the category's health warning",
          value: "CPL £35–£80 (jobs £500–£5,000+) · US roofing CVR ~3.7%, the worst in home services",
          description:
            "Roofing CPL is meaningless without lead-quality classification — repair vs re-roof leads differ 10x in value under one number. Offline conversion import and lead scoring are essential, not optional.",
        },
      ],
      metaAds: [
        {
          label: "Strong on Meta with quality controls",
          value: "benchmark ~$30 CPL, healthy range $25–60",
          description:
            "Storm-reactive is the one emergency play that works on Meta: post-storm roof-repair ads see ~50% higher engagement in a 6–72h window. Calls objective is a legitimate B-test for the 55+ homeowner skew.",
        },
      ],
      extensions: sourced(
        vol3("2. GOOGLE SEARCH ADS FOR TRADES"),
        vol3("6. WHAT THE BEST TRADE-PPC OPERATORS PUBLISH (NUMBERS)"),
        vol3("Part IV — Meta ads"),
      ),
    },
    brand: {},
    sales: {},
    marketIntelligence: {},
    operations: {
      certifications: [
        {
          label: "NFRC / TrustMark / CompetentRoofer — gated on verified membership",
          description: "Stated as text with an insurance-backed guarantee; badge registry rules apply in full.",
        },
      ],
      extensions: SRC_ROOFING,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "driveways-paving": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "residential",
      extensions: SRC_DRIVEWAYS,
    },
    services: {
      serviceCategories: [
        {
          label: "Material cards: block / resin / tarmac",
          description: "The structure runs hero → filterable gallery → material cards → process timeline → FAQs → survey CTA.",
        },
      ],
      extensions: SRC_DRIVEWAYS,
    },
    customerPsychology: {
      trustFactors: [
        {
          label: "'Show the boring bits' — the premium signal",
          description:
            "Sub-base, drainage and SuDS-compliance photos read as premium; no UK competitor does this systematically. Genuine white space.",
        },
      ],
      extensions: SRC_DRIVEWAYS,
    },
    website: {
      siteStructure: [
        {
          label: "Process timeline as a first-class section",
          description: "Dig-out, sub-base, drainage — the work the customer never sees is the work that sells.",
        },
      ],
      conversionStrategy: [
        {
          label: "Before/after slider with a caption schema",
          description:
            "{problem, solution, material/spec, duration, town} — every project tagged to a town and embedded in that town's service-area page.",
        },
        {
          label: "Multi-step quote wizard with finance framing",
          description: "'From £X/month' where finance is real (FCA gate applies).",
        },
      ],
      extensions: SRC_DRIVEWAYS,
    },
    searchSeo: {
      locationPages: [
        {
          label: "Town-tagged project photos feed the area pages",
          description: "The caption schema is what makes each area page provably local.",
        },
      ],
      extensions: SRC_DRIVEWAYS,
    },
    paidAdvertising: {
      googleAds: [
        {
          label: "UK benchmark",
          value: "CPL £25–£60 (jobs £1,500–£8,000)",
        },
      ],
      metaAds: [
        {
          label: "Visual-transformation trade: Meta can be the PRIMARY channel",
          value: "planning CPL £20–£40",
          description:
            "Before/after carousel + timelapse + drone finish shot, town-named, price-anchored ('driveways from £4,500' repels bad fits by design). Finance copy stays off Meta or triggers the Financial Products category.",
        },
      ],
      extensions: sourced(
        vol3("2. GOOGLE SEARCH ADS FOR TRADES"),
        vol3("Part IV — Meta ads"),
      ),
    },
    brand: {},
    sales: {},
    marketIntelligence: {},
    operations: {
      certifications: [
        {
          label: "Marshalls / Brett approved-installer badges",
          description: "Manufacturer schemes are the trust anchor in an unlicensed trade — verified before rendered.",
        },
      ],
      extensions: SRC_DRIVEWAYS,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "solar-pv": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "residential",
      extensions: SRC_SOLAR,
    },
    services: {
      serviceCategories: [
        {
          label: "Solar and battery sold on measured outcomes",
          description:
            "Case studies with REAL numbers: kWp, cost, annual kWh, £ saved, bill before/after, payback years, CO₂ — 'actual results, not projections'.",
        },
      ],
      extensions: SRC_SOLAR,
    },
    customerPsychology: {
      trustFactors: [
        {
          label: "Warranty as the headline differentiator",
          description: "The 20-year workmanship pattern leads; certification bar beneath it.",
        },
      ],
      extensions: SRC_SOLAR,
    },
    website: {
      forms: [
        {
          label: "Savings calculator as the primary CTA",
          description:
            "Interactive calculators convert 15–25% vs 3–5% static forms. Rules: ask monthly bill in £ (not kWh), one question per screen, show a ±15–20% range BEFORE asking for contact details, booking widget on the results screen.",
        },
      ],
      conversionStrategy: [
        {
          label: "Finance pages carry FCA-compliant representative APR examples",
        },
      ],
      trustSignals: [
        {
          label: "Certification bar — MUST level",
          description: "MCS + RECC/HIES + TrustMark + NICEIC/NAPIT, each rendered from verified data.",
        },
      ],
      extensions: SRC_SOLAR,
    },
    searchSeo: {},
    paidAdvertising: {
      googleAds: [
        {
          label: "Search-only on Google — no UK solar LSA category exists",
        },
      ],
      metaAds: [
        {
          label: "Facebook still dominates UK solar lead gen",
          value: "CPL £20–£80 · a worked case: 6:1 ROI at £50 CPL",
          description:
            "Winning angles: ROI calculators, neighbourhood social proof ('12 installs in {town}' — only when true), grant/deadline urgency where real. Savings figures are always tariff-dependent estimates, never promises (the honesty law outranks the ad angle).",
        },
      ],
      extensions: sourced(
        vol3("1. LOCAL SERVICES ADS (LSAs) IN THE UK, 2025–26"),
        vol3("Part IV — Meta ads"),
      ),
    },
    brand: {},
    sales: {},
    marketIntelligence: {},
    operations: {
      certifications: [
        {
          label: "MCS — mark only with a VERIFIED MCS number; misuse is enforced",
          description: "Plus RECC/HIES consumer-code membership; the compliance linter blocks publish on a failed MUST.",
        },
      ],
      extensions: SRC_SOLAR,
    },
    businessIntelligence: {},
    aiBehaviour: {
      automationRules: [
        {
          label: "Solar template runs MUST-level lint at publish",
          description: "MCS number verified before the mark renders; finance copy requires the FCA representative example.",
        },
      ],
      extensions: SRC_SOLAR,
    },
  },

  "dentists-private": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "residential",
      extensions: SRC_DENTAL,
    },
    services: {
      serviceCategories: [
        {
          label: "One page per revenue treatment",
          description:
            "Problem → process → price-from + monthly finance → FAQs → gallery → treatment-specific booking, which converts ~60% better than generic booking.",
        },
      ],
      extensions: SRC_DENTAL,
    },
    customerPsychology: {
      customerMotivations: [
        {
          label: "Patients book online, out of hours",
          description: "72% prefer online booking; 40% of bookings happen out-of-hours; reminder automation cuts no-shows 35–40%.",
        },
      ],
      extensions: SRC_DENTAL,
    },
    website: {
      siteStructure: [
        {
          label: "Sticky phone + 'Book Online', ≤3 clicks to booking from anywhere",
        },
        {
          label: "Patient language in the nav",
          description: "'Straighten Your Teeth', not 'Orthodontics'.",
        },
      ],
      conversionStrategy: [
        {
          label: "Fees page is a GDC expectation, not a growth hack",
          description: "Full price list, plan-vs-PAYG comparison, 0% finance (Tabeo-style), membership plan.",
        },
        {
          label: "Smile gallery is consent-gated",
          description:
            "Signed dated consent, unmanipulated images, identical conditions, originals retained, 'results vary'.",
        },
      ],
      extensions: SRC_DENTAL,
    },
    searchSeo: {},
    paidAdvertising: {
      googleAds: [
        {
          label: "The priciest clicks in the portfolio — no UK LSA route",
          description:
            "Dental clicks run highest of all verticals (US benchmark CPC $9.78, CPL $76.71); forms and booking flows over calls, enhanced conversions for leads, strict negatives.",
        },
      ],
      metaAds: [
        {
          label: "Meta for cosmetic offers; Google captures the high-ticket search",
          value: "£8–£35 CPL cosmetic · £250–£450 per BOOKED implant/Invisalign patient",
          description:
            "Judge on cost per booked patient, never CPL. Social proof IS the campaign — testimonial video, review cards, practitioner-to-camera — all inside the GDC/ASA consent and claims rules.",
        },
      ],
      extensions: sourced(
        vol3("2. GOOGLE SEARCH ADS FOR TRADES"),
        vol3("Part IV — Meta ads"),
      ),
    },
    brand: {},
    sales: {},
    marketIntelligence: {},
    operations: {
      certifications: [
        {
          label: "GDC + CQC — the clinical MUST stack",
          description:
            "'Regulated by the GDC' with the gdc-uk.org link; per clinician: full registered name, GDC number, qualifications + country obtained. CQC rating displayed via the official widget within 21 days of rating, always linking the CQC profile.",
        },
      ],
      extensions: SRC_DENTAL,
    },
    businessIntelligence: {},
    aiBehaviour: {
      automationRules: [
        {
          label: "Clinical lint — hard blocks, not warnings",
          description:
            "'Specialist' titles only if on the GDC specialist list; best/expert/finest/leading banned without proof; POM brand names (e.g. 'Botox') hard-blocked in public copy (MHRA law); testimonials genuine + evidenced + consented, never substantiating efficacy claims.",
        },
      ],
      extensions: SRC_DENTAL,
    },
  },
};
