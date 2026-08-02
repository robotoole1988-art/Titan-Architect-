import type { IndustryDna } from "../industry-dna";
import { sourced, vol2, vol3 } from "./sources";

/**
 * Track E — solicitors: the heaviest-regulated vertical TITAN serves.
 *
 * The SRA Transparency Rules make price publication a LEGAL requirement
 * for in-scope services, enforced by rolling web sweeps with fines to
 * £25,000 without tribunal. This is the trade where the platform's
 * compliance-linter law came from: the pre-publish "SRA lint" blocks
 * publication on any failed MUST.
 */

const SRC_SOLICITORS = sourced(vol2("Track E — Solicitors (heaviest-regulated vertical)"));

export const TRACK_E_DNA: Readonly<Record<string, IndustryDna>> = {
  solicitors: {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "both",
      extensions: SRC_SOLICITORS,
    },
    services: {
      serviceCategories: [
        {
          label: "SRA price-publication scope — a structured schema, not free text",
          description:
            "Prices MUST be published for: residential conveyancing, uncontested probate, immigration (ex-asylum), motoring offences (magistrates), employment tribunal claims (claimant + defending for businesses), debt recovery ≤£100k, business licensing.",
        },
      ],
      extensions: SRC_SOLICITORS,
    },
    customerPsychology: {
      trustFactors: [
        {
          label: "People hire people",
          description:
            "Real solicitor photos and bios; CQS (near-mandatory for conveyancing — lender panels), Lexcel, Resolution; ReviewSolicitors + Google.",
        },
      ],
      extensions: SRC_SOLICITORS,
    },
    website: {
      siteStructure: [
        {
          label: "Homepage segments visitors into 2–4 matter paths",
          description: "The Maples pattern: route by matter, not by firm structure.",
        },
        {
          label: "Complaints page linked footer-wide",
          description: "Firm procedure + Legal Ombudsman (8-week rule) + SRA route.",
        },
      ],
      conversionStrategy: [
        {
          label: "Each price page carries the full mandated fields",
          description:
            "Total/range + charging basis, itemised disbursements, VAT as % or £, who does the work + supervisor (qualifications/experience), included/excluded services, key stages + timescales. Prominent, signposted, easy to find.",
        },
        {
          label: "Quote calculators output a figure with ZERO contact-gating",
          description: "Gating the number behind a form is a breach, not a growth hack.",
        },
        {
          label: "Fixed-fee-led presentation",
          description:
            "Average law-site conversion is ~3.4%; fixed fees + instant calculators turn the compliance burden into the differentiator.",
        },
        {
          label: "Triple CTA + free initial consultation default",
          description: "Phone / form / callback, plus live chat where staffed.",
        },
      ],
      trustSignals: [
        {
          label: "The LIVE SRA digital badge — never a static copy",
          description:
            "Mandatory since Nov 2019: the live Yoshki embed registered via mySRA; a static image is NON-COMPLIANT. Footer strip: 'Authorised and regulated by the Solicitors Regulation Authority — SRA No. X'. Detect the regulator first: CLC firms get the CLC Secure Badge instead — the wrong badge is itself a breach.",
        },
      ],
      extensions: SRC_SOLICITORS,
    },
    searchSeo: {},
    paidAdvertising: {
      googleAds: [
        {
          label: "UK benchmark",
          value: "CPC £8.25 average — among the highest of TITAN's verticals",
          description:
            "Long cycles, forms over calls, enhanced conversions for leads, and strict negatives (job-seekers, students, 'free advice').",
        },
      ],
      localServicesAds: [
        {
          label: "No UK LSA outside London",
          description:
            "Professional Services LSAs (16 legal specialties) are a Greater London pilot only — everywhere else, solicitors are Search-only.",
        },
      ],
      metaAds: [
        {
          label: "Meta works for PLANNABLE matters only",
          description:
            "Wills, conveyancing, family — not distress matters. Social proof is the campaign: testimonial video, review cards, practitioner-to-camera.",
        },
      ],
      extensions: sourced(
        vol3("2. GOOGLE SEARCH ADS FOR TRADES"),
        vol3("1. LOCAL SERVICES ADS (LSAs) IN THE UK, 2025–26"),
        vol3("Part IV — Meta ads"),
      ),
    },
    brand: {},
    sales: {},
    marketIntelligence: {
      industryTrends: [
        {
          label: "SRA enforcement is active, not theoretical",
          description: "Rolling SRA web sweeps; fines to £25,000 without tribunal.",
        },
      ],
      extensions: SRC_SOLICITORS,
    },
    operations: {
      certifications: [
        {
          label: "SRA regulation — with the regulator detected before the badge renders",
          description:
            "SRA number in the footer strip; CQS for conveyancing (lender panels), Lexcel, Resolution as the quality marks buyers check.",
        },
      ],
      extensions: SRC_SOLICITORS,
    },
    businessIntelligence: {},
    aiBehaviour: {
      automationRules: [
        {
          label: "Pre-publish SRA lint — publish blocked on failure",
          description:
            "Machine checks: badge live + SRA number present + complaints page + complete price-page fields. The template for every trade's compliance linter.",
        },
      ],
      extensions: SRC_SOLICITORS,
    },
  },
};
