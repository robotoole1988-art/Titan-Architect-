import type { IndustryDna } from "../industry-dna";
import { sourced, vol2 } from "./sources";

/**
 * Track C — outdoor / visual transformation trades.
 *
 * Little licensing, so trust is built from proof: before/afters, named
 * credentials as verifiable numbers, written guarantees nobody else states,
 * and the anti-rogue pledge. The rogue-trader counter-positioning from the
 * platform layer bites hardest here — tarmac is the canonical scam trade.
 */

const SRC_LANDSCAPING = sourced(vol2("Track C — Landscaping (design & build)"));
const SRC_TREES = sourced(vol2("Track C — Tree Surgery"));
const SRC_GRASS = sourced(vol2("Track C — Artificial Grass"));
const SRC_TARMAC = sourced(vol2("Track C — Tarmac & Surfacing"));
const SRC_BRICKWORK = sourced(vol2("Track C — Brickwork"));
const SRC_EXTERIOR = sourced(vol2("Track C — Exterior Cleaning (jet wash / render / roof / softwash)"));
const SRC_PAINTING = sourced(vol2("Track C — Painting & Decorating"));

export const TRACK_C_DNA: Readonly<Record<string, IndustryDna>> = {
  landscaping: {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "residential",
      salesCycle:
        "Winter is the design phase ('ready by spring, last-season rates'); spring is scarcity. Design fees run 15–20%.",
      extensions: SRC_LANDSCAPING,
    },
    services: {
      serviceCategories: [
        {
          label: "One positioning: design & build OR build-only — never both",
          description: "A named 5–6 step Design & Build journey page anchors the offer.",
        },
      ],
      individualServices: [
        {
          label: "Element pages: patio / turf / decking / fencing",
          description: "Per-m² prices, each linking up to the full design & build offer.",
        },
      ],
      extensions: SRC_LANDSCAPING,
    },
    customerPsychology: {
      trustFactors: [
        {
          label: "Trust hierarchy: awards > manufacturer guarantee > BALI/APL > insurance",
          description:
            "Marshalls Register / Bradstone Assured carry a 10-yr product+workmanship guarantee — a manufacturer-backed promise homeowners rate above association badges.",
        },
        {
          label: "3D renders as risk-removal",
          description: "'See your garden before we build it' — the forward-looking twin of before/after.",
        },
      ],
      extensions: SRC_LANDSCAPING,
    },
    website: {
      conversionStrategy: [
        {
          label: "Case studies with budget BANDS",
          description: "Nobody in the category does this — a pre-qualification edge.",
        },
        {
          label: "Mandatory 3D-render section",
          description: "Render-vs-finished pairs prove the promise was kept.",
        },
        {
          label: "Guide pricing as project bands, never day rates",
          value: "~£80–100/m² whole-garden",
        },
      ],
      trustSignals: [
        {
          label: "Trust stack with a benefit sentence per badge",
          description: "Plus the licensed-waste-carrier line — a legal fact that doubles as a differentiator.",
        },
      ],
      extensions: SRC_LANDSCAPING,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {
      seasonalTrends: [
        {
          label: "Winter design / spring scarcity flip",
          description: "'Ready by spring, last-season rates' in winter; booked-out scarcity in spring.",
        },
      ],
      pricingPosition: [
        { label: "Whole-garden project bands", value: "~£80–100/m²; design fees 15–20%" },
      ],
      extensions: SRC_LANDSCAPING,
    },
    operations: {
      certifications: [
        {
          label: "Marshalls Register / Bradstone Assured; BALI/APL",
          description:
            "Manufacturer-approved installer schemes carry the 10-yr product+workmanship guarantee; association badges rank below them in homeowner trust.",
        },
      ],
      extensions: SRC_LANDSCAPING,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "tree-surgery": {
    businessIdentity: {
      emergencyOrPlanned: "both",
      residentialOrCommercial: "both",
      extensions: SRC_TREES,
    },
    services: {
      emergencyServices: [
        {
          label: "24/7 storm work",
          description: "Hero-level October–February; auto-elevated emergency channel in those months.",
        },
      ],
      individualServices: [
        {
          label: "TPO / conservation-area applications",
          description:
            "'We do the council application' is a real differentiator; the page carries timelines and the penalty warning.",
        },
      ],
      extensions: SRC_TREES,
    },
    customerPsychology: {
      trustFactors: [
        {
          label: "Credentials as verifiable facts",
          description:
            "ArbAC licence NUMBER on the homepage (Thor's Trees pattern), NPTC codes, '£5m public liability' as a figure, waste-carrier number — mirroring exactly what councils and police tell homeowners to verify.",
        },
      ],
      objections: [
        {
          label: "The four pre-call objections answered on the homepage FAQ",
          description: "Price, mess, safety, permissions — answered before the call so the call converts.",
        },
      ],
      extensions: SRC_TREES,
    },
    website: {
      trustSignals: [
        {
          label: "'Check our credentials' block — numbers, not badges",
        },
        {
          label: "Anti-rogue pledge",
          description: "'We never cold-call. Written quotes only.' plus a red-flags page.",
        },
        {
          label: "'Established 19XX' + review volume in the metrics band",
        },
      ],
      siteStructure: [
        { label: "Mandatory TPO/conservation page with timelines + penalty warning" },
        { label: "Domestic/commercial toggle" },
      ],
      conversionStrategy: [
        {
          label: "Small/medium/large guide bands with free site-visit caveats",
        },
      ],
      extensions: SRC_TREES,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {
      seasonalTrends: [
        { label: "Storm season", description: "24/7 emergency work peaks October–February." },
      ],
      extensions: SRC_TREES,
    },
    operations: {
      certifications: [
        {
          label: "ArbAC + NPTC — displayed as numbers",
          description:
            "Licence number on the homepage, NPTC codes listed, insurance stated in £m, waste-carrier number shown — the verification trail homeowners are told to follow.",
        },
      ],
      extensions: SRC_TREES,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "artificial-grass": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "residential",
      extensions: SRC_GRASS,
    },
    services: {
      serviceCategories: [
        {
          label: "3-tier named product table",
          description:
            "Budget / Family / Premium-Pet with pile height and supply £/m² — pets and kids as named PRODUCTS, not bullets, with a dedicated pet page.",
        },
      ],
      extensions: SRC_GRASS,
    },
    customerPsychology: {
      trustFactors: [
        {
          label: "Manufacturer-led trust — no industry body exists",
          description:
            "Approved-installer status + 10-yr product warranty + awards and brand-client logos; trust row is client logos + Trustpilot, not certification badges.",
        },
      ],
      extensions: SRC_GRASS,
    },
    website: {
      callsToAction: [
        {
          label: "Persistent FREE Samples CTA — header + sticky bar",
          description: "The signature two-rung funnel: FREE Samples → FREE Survey.",
        },
      ],
      conversionStrategy: [
        {
          label: "Sub-base cutaway diagram — mandatory",
          description: "The price justification: what's under the grass is what you're paying for.",
        },
        {
          label: "Paired warranty badges",
          description: "Product warranty AND installation warranty, shown together.",
        },
        {
          label: "Installed pricing",
          value: "£45–80/m²",
        },
      ],
      extensions: SRC_GRASS,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {
      pricingPosition: [{ label: "Installed range", value: "£45–80/m²" }],
      extensions: SRC_GRASS,
    },
    operations: {
      serviceGuarantees: [
        {
          label: "10-yr product warranty + installation warranty",
          description: "Manufacturer product warranty paired with the installer's own — both stated.",
        },
      ],
      extensions: SRC_GRASS,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "tarmac-surfacing": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "both",
      extensions: SRC_TARMAC,
    },
    services: {
      serviceCategories: [
        {
          label: "Dual-audience nav: Driveways | Car Parks | Line Marking",
          description: "Separate CTAs — Free Quote for homeowners, Site Visit/Tender Pack for commercial.",
        },
      ],
      extensions: SRC_TARMAC,
    },
    customerPsychology: {
      fears: [
        {
          label: "The 'leftover tarmac' scam — the canonical rogue-trader trade",
          description:
            "The anti-rogue block is the highest-leverage element on every driveway page: never cold-call, no leftover-tarmac deals, company + VAT numbers, £Xm insured.",
        },
      ],
      trustFactors: [
        {
          label: "Insurance value as the headline number",
          description: "'£10m AXA PL' pattern — no consumer accreditation exists, so the substitute is a verifiable figure plus Companies House/VAT footer permanence signals and a landline.",
        },
      ],
      extensions: SRC_TARMAC,
    },
    website: {
      conversionStrategy: [
        {
          label: "Mandatory anti-rogue block on every driveway page",
        },
        {
          label: "Depth/spec cutaway diagram",
          description: "Scams skip the sub-base; the diagram is proof of what's quoted.",
        },
        {
          label: "Band + worked examples, never a rate card",
        },
      ],
      trustSignals: [
        {
          label: "Commercial page: CHAS badges + fleet/plant photo slot",
          description: "CHAS/Constructionline + fleet photos are near-absent sector-wide — free wins.",
        },
      ],
      extensions: SRC_TARMAC,
    },
    searchSeo: {
      contentStrategy: [
        {
          label: "Auto-generate the 'rogue tarmac gangs' article",
          description: "Trust and SEO in one asset — the education piece the sector never writes.",
        },
      ],
      extensions: SRC_TARMAC,
    },
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {},
    operations: {
      certifications: [
        {
          label: "CHAS / Constructionline for commercial credibility",
          description: "No consumer accreditation exists; commercial buyers verify compliance schemes instead.",
        },
      ],
      extensions: SRC_TARMAC,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  brickwork: {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "residential",
      extensions: SRC_BRICKWORK,
    },
    services: {
      serviceCategories: [
        {
          label: "Three tones: garden walls / repointing / structural",
          description: "Structural is price-on-survey; 'from' job prices are all-in elsewhere.",
        },
      ],
      individualServices: [
        {
          label: "'Pointing Styles' module with 5 named profiles",
          description:
            "Weather-struck, flush, tuck and friends with close-up photos — naming the craft signals the expertise.",
        },
      ],
      extensions: SRC_BRICKWORK,
    },
    customerPsychology: {
      trustFactors: [
        {
          label: "Proof, not badges",
          description:
            "'Est. 19XX' + reviews + 'fully insured'; heritage niche runs on SPAB language and craftsman lineage.",
        },
      ],
      extensions: SRC_BRICKWORK,
    },
    website: {
      conversionStrategy: [
        {
          label: "Mortar & brick matching as the pre-quote ritual",
          description: "A named section: the match is the craft, and showing the ritual converts.",
        },
        {
          label: "Geo-captioned before/afters cross-linked to service-area pages",
        },
        {
          label: "Heritage sub-identity if lime-capable",
          description: "'Never cement on pre-1919 walls' — a line that instantly sorts the craftsmen from the cowboys.",
        },
      ],
      extensions: SRC_BRICKWORK,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {},
    operations: {
      serviceGuarantees: [
        {
          label: "10-yr written workmanship guarantee — auto-inserted",
          description: "Nobody in the category states one; the free differentiator.",
        },
      ],
      extensions: SRC_BRICKWORK,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "exterior-cleaning": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "both",
      extensions: SRC_EXTERIOR,
    },
    services: {
      serviceCategories: [
        {
          label: "Page per surface with method mapping",
          description: "Driveways, render, roofs, softwash — each surface gets its method and its badge hierarchy.",
        },
      ],
      upsells: [
        {
          label: "Driveway ladder: clean → re-sand → seal",
        },
      ],
      extensions: SRC_EXTERIOR,
    },
    customerPsychology: {
      trustFactors: [
        {
          label: "'We NEVER pressure wash render/roofs' — the authority play",
          description:
            "SoftWash certification + COSHH/HSE-approved-biocide language is compliance AND marketing in a fragmented, low-regulation trade.",
        },
      ],
      extensions: SRC_EXTERIOR,
    },
    website: {
      conversionStrategy: [
        {
          label: "Transformation-first hero",
          description: "The before/after IS the hero, labelled as such.",
        },
        {
          label: "Mandatory education block: why we never jet wash roofs & render",
        },
        {
          label: "Size-banded fixed prices or instant calculator",
        },
      ],
      extensions: SRC_EXTERIOR,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {
      seasonalTrends: [
        {
          label: "Spring moss removal / autumn pre-winter biocide",
          description: "Plus re-treat reminders — the recurring-revenue seam in a one-off trade.",
        },
      ],
      extensions: SRC_EXTERIOR,
    },
    operations: {
      certifications: [
        {
          label: "SoftWash certification; render-manufacturer approval",
          description:
            "K-Rend/Weber approval is the render niche's best badge; COSHH/HSE-approved-biocide language carries the compliance weight.",
        },
      ],
      serviceGuarantees: [
        {
          label: "Written regrowth guarantee — ship by default",
          description:
            "'Moss-free 3 years or we re-treat free' — biocide lasts 2–4 years and the guarantee is almost universally unclaimed.",
        },
      ],
      extensions: SRC_EXTERIOR,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },

  "painting-decorating": {
    businessIdentity: {
      emergencyOrPlanned: "planned",
      residentialOrCommercial: "both",
      extensions: SRC_PAINTING,
    },
    services: {
      serviceCategories: [
        { label: "Domestic/commercial split" },
      ],
      premiumServices: [
        {
          label: "Kitchen/uPVC spraying — standalone high-margin niche",
          description:
            "Anchored against REPLACEMENT: respray £1.5–7k vs £12–25k new kitchen ('70% saving'), sample door first, 10-yr coating guarantee, separate form.",
        },
      ],
      extensions: SRC_PAINTING,
    },
    customerPsychology: {
      trustFactors: [
        {
          label: "In-home trust protocol — a market-wide gap",
          description: "DBS, uniforms, dust sheets, daily tidy: the 'Living In Your Home' block as default.",
        },
      ],
      extensions: SRC_PAINTING,
    },
    website: {
      conversionStrategy: [
        {
          label: "Dulux Select translated into benefit words — never an empty badge slot",
          description:
            "On-site assessment + 2-yr AkzoNobel-backed guarantee; where not held, the business's own written guarantee stands in.",
        },
        {
          label: "Per-room fixed guide prices, never bare day rates",
        },
        {
          label: "Season-switch hero",
          description: "Exterior February–August, interior September–January.",
        },
        {
          label: "Portfolio as styled case studies",
          description: "Prep shots included, products named — the craft is in the preparation.",
        },
      ],
      extensions: SRC_PAINTING,
    },
    searchSeo: {},
    paidAdvertising: {},
    brand: {},
    sales: {},
    marketIntelligence: {
      seasonalTrends: [
        {
          label: "Exterior/interior season flip",
          description: "Exterior Feb–Aug, interior Sep–Jan — the hero follows the calendar.",
        },
      ],
      extensions: SRC_PAINTING,
    },
    operations: {
      certifications: [
        {
          label: "Dulux Select — the strongest mark in the trade",
          description: "On-site assessment plus a 2-year AkzoNobel-backed guarantee; always translated, never just a logo.",
        },
      ],
      extensions: SRC_PAINTING,
    },
    businessIntelligence: {},
    aiBehaviour: {},
  },
};
