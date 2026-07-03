/**
 * The seeded benchmark dataset — imported from the founder's workbook
 * `TITAN-CPL-Benchmarks-v1.xlsx` (2 July 2026), sheets "Trade Benchmarks"
 * and "Assumptions". Source notes are kept verbatim as citations.
 *
 * Honesty notes carried over from the workbook:
 * - CPL cannot be looked up directly anywhere; every figure is an estimate
 *   built from real CPC data + assumed conversion rates.
 * - `estimated` rows had no direct published CPL study; figures are modelled
 *   from adjacent trades.
 * - Ireland is a separate market (google.ie, EUR); figures are GBP-equivalent.
 * - These numbers become accurate the moment TITAN runs real campaigns.
 */

import type { ConfidenceLevel, Range } from "./model";

export const SEED_AS_OF = "2026-07-02";

export interface SeedTradeBenchmark {
  tradeKey: string;
  tradeLabel: string;
  /** Match keywords (substring, lowercase). Order of entries matters. */
  keywords: ReadonlyArray<string>;
  cpc: Range;
  conversionRate: number;
  jobValue: Range;
  marketplaceLeadNote?: string;
  confidence: ConfidenceLevel;
  sources: string[];
}

/** Order = match precedence (most specific families first). */
export const TRADE_BENCHMARK_SEED: ReadonlyArray<SeedTradeBenchmark> = [
  {
    tradeKey: "boiler-installation",
    tradeLabel: "Boiler Installation",
    keywords: ["boiler"],
    cpc: { low: 3, high: 8 },
    conversionRate: 0.1,
    jobValue: { low: 2500, high: 4500 },
    marketplaceLeadNote: "Marketplace lead £20-40",
    confidence: "sourced",
    sources: [
      "CPC £3-8; winter raises CPCs. Longer sales cycle than emergency. (SMC UK; Searchlight Digital; Aimpro)",
    ],
  },
  {
    tradeKey: "ev-charger-installation",
    tradeLabel: "EV Charger Installation",
    keywords: ["ev charg", "ev-charg", "electric vehicle", "car charg", "evse"],
    cpc: { low: 1.5, high: 8 },
    conversionRate: 0.07,
    jobValue: { low: 700, high: 1400 },
    marketplaceLeadNote: "Marketplace lead £15-40",
    confidence: "sourced",
    sources: [
      "CPC £1.50-8, hot terms >£10 (Wired Media). Thin single-job margin — bundle with solar/battery.",
    ],
  },
  {
    tradeKey: "battery-storage",
    tradeLabel: "Battery Storage",
    keywords: ["battery"],
    cpc: { low: 1.5, high: 6 },
    conversionRate: 0.03,
    jobValue: { low: 4000, high: 10000 },
    marketplaceLeadNote: "Marketplace lead £40-120",
    confidence: "estimated",
    sources: [
      "Modelled from solar; slightly lower competition today, rising fast.",
    ],
  },
  {
    tradeKey: "solar-pv",
    tradeLabel: "Solar PV",
    keywords: ["solar"],
    cpc: { low: 1.5, high: 8 },
    conversionRate: 0.03,
    jobValue: { low: 6000, high: 12000 },
    marketplaceLeadNote: "Exclusive bought leads £50-150",
    confidence: "sourced",
    sources: [
      "Google Ads CPL £80-250; exclusive bought leads £50-150; shared £20-50 at 5-10% close. (Phantom Digital; SolarPVLeads; Wired Media)",
    ],
  },
  {
    tradeKey: "roofing",
    tradeLabel: "Roofing",
    keywords: ["roof", "guttering", "fascia", "soffit", "chimney"],
    cpc: { low: 3, high: 5 },
    conversionRate: 0.12,
    jobValue: { low: 500, high: 8000 },
    marketplaceLeadNote: "Marketplace lead £20-40",
    confidence: "sourced",
    sources: [
      "UK CPL £15-45 well-managed; ~£60 at launch; storms cut CPL to ~£15. (AmplifySME; OneBase Media; Searchlight Digital)",
    ],
  },
  {
    tradeKey: "tree-surgery",
    tradeLabel: "Tree Surgery",
    keywords: ["tree"],
    cpc: { low: 2, high: 5 },
    conversionRate: 0.1,
    jobValue: { low: 300, high: 2500 },
    marketplaceLeadNote: "Marketplace lead £10-25",
    confidence: "estimated",
    sources: [
      "Modelled from landscaping/emergency mix; storm demand spikes like roofing.",
    ],
  },
  {
    tradeKey: "scaffolding",
    tradeLabel: "Scaffolding",
    keywords: ["scaffold"],
    cpc: { low: 2, high: 6 },
    conversionRate: 0.09,
    jobValue: { low: 600, high: 3000 },
    marketplaceLeadNote: "Marketplace lead £10-30",
    confidence: "estimated",
    sources: [
      "B2B mix (builders) + domestic; modelled from adjacent construction trades.",
    ],
  },
  {
    tradeKey: "carpet-cleaning",
    tradeLabel: "Carpet Cleaning",
    keywords: ["carpet"],
    cpc: { low: 3, high: 10 },
    conversionRate: 0.2,
    jobValue: { low: 150, high: 300 },
    marketplaceLeadNote: "Marketplace lead £5-15",
    confidence: "sourced",
    sources: [
      "UK case: £51.92 CPL optimised to £14.24 'quotable lead'. (Heavyweight Digital; US CPC $5-25)",
    ],
  },
  {
    tradeKey: "exterior-cleaning",
    tradeLabel: "Exterior Cleaning (jet wash/render)",
    keywords: ["jet wash", "pressure wash", "render clean", "exterior clean", "gutter clean", "driveway clean"],
    cpc: { low: 1.5, high: 4 },
    conversionRate: 0.1,
    jobValue: { low: 150, high: 800 },
    marketplaceLeadNote: "Marketplace lead £5-20",
    confidence: "estimated",
    sources: [
      "Modelled from cleaning cluster; strong before/after visual trade.",
    ],
  },
  {
    tradeKey: "garage-clearance",
    tradeLabel: "Garage Clearance",
    keywords: ["garage clearance"],
    cpc: { low: 1.5, high: 5 },
    conversionRate: 0.15,
    jobValue: { low: 80, high: 300 },
    marketplaceLeadNote: "Marketplace lead £5-15",
    confidence: "estimated",
    sources: ["Modelled with house clearance."],
  },
  {
    tradeKey: "house-clearance",
    tradeLabel: "House Clearance",
    keywords: ["clearance", "house clear"],
    cpc: { low: 1.5, high: 5 },
    conversionRate: 0.15,
    jobValue: { low: 150, high: 600 },
    marketplaceLeadNote: "Marketplace lead £5-15",
    confidence: "partial",
    sources: [
      "Zapo runs Google Ads lead gen at scale in this vertical — proven demand channel.",
    ],
  },
  {
    tradeKey: "waste-removal",
    tradeLabel: "Waste Removal (man & van)",
    keywords: ["waste", "rubbish", "man and van", "man & van", "skip"],
    cpc: { low: 1.5, high: 5 },
    conversionRate: 0.15,
    jobValue: { low: 60, high: 400 },
    marketplaceLeadNote: "Marketplace lead £5-15",
    confidence: "partial",
    sources: [
      "Job £60-370 typical (national price guides); volume game, repeat trade + commercial accounts.",
    ],
  },
  {
    tradeKey: "mobile-mechanic",
    tradeLabel: "Mobile Mechanic",
    keywords: ["mobile mechanic"],
    cpc: { low: 2, high: 8 },
    conversionRate: 0.18,
    jobValue: { low: 100, high: 500 },
    marketplaceLeadNote: "Marketplace lead £5-15",
    confidence: "partial",
    sources: [
      "US CPC $2-10 proxy; target CPL <£40. High urgency = high conversion.",
    ],
  },
  {
    tradeKey: "garage-repairs",
    tradeLabel: "Garage — Clutch/Cambelt/Wetbelt",
    keywords: ["clutch", "cambelt", "wetbelt", "gearbox"],
    cpc: { low: 2, high: 8 },
    conversionRate: 0.15,
    jobValue: { low: 300, high: 1200 },
    marketplaceLeadNote: "Marketplace lead £5-15",
    confidence: "estimated",
    sources: [
      "Modelled from auto-repair benchmarks; wetbelt an emerging high-intent niche.",
    ],
  },
  {
    tradeKey: "mot-servicing",
    tradeLabel: "MOT & Servicing",
    keywords: ["mot", "servicing", "car service"],
    cpc: { low: 1, high: 4 },
    conversionRate: 0.15,
    jobValue: { low: 54, high: 300 },
    marketplaceLeadNote: "Marketplace lead £3-10",
    confidence: "estimated",
    sources: [
      "MOT capped £54.85 — loss-leader; servicing + repairs + retention are the economics.",
    ],
  },
  {
    tradeKey: "driveways-paving",
    tradeLabel: "Driveways & Paving",
    keywords: ["drive", "paving", "patio", "resin", "block pav"],
    cpc: { low: 4, high: 11 },
    conversionRate: 0.1,
    jobValue: { low: 3000, high: 10000 },
    marketplaceLeadNote: "Marketplace lead £15-40",
    confidence: "partial",
    sources: [
      "US CPC $5-15 proxy adjusted; premium pages convert 1-in-5 vs 1-in-30 average. (OneBase; LeadPronto)",
    ],
  },
  {
    tradeKey: "landscaping",
    tradeLabel: "Landscaping",
    keywords: ["landscap", "garden", "fencing", "turf"],
    cpc: { low: 2, high: 6 },
    conversionRate: 0.09,
    jobValue: { low: 1500, high: 20000 },
    marketplaceLeadNote: "Marketplace lead £10-35",
    confidence: "partial",
    sources: [
      "Adjacent to driveways; broad job-value range garden design to full builds.",
    ],
  },
  {
    tradeKey: "painting-decorating",
    tradeLabel: "Painting & Decorating",
    keywords: ["paint", "decorat"],
    cpc: { low: 1.5, high: 4 },
    conversionRate: 0.09,
    jobValue: { low: 300, high: 3000 },
    marketplaceLeadNote: "Marketplace lead £5-20",
    confidence: "estimated",
    sources: [
      "Lower CPC competition; modelled from home-improvement averages.",
    ],
  },
  {
    tradeKey: "plumbing-heating-emergency",
    tradeLabel: "Plumbing & Heating (emergency)",
    keywords: ["plumb", "heating", "gas", "drain", "leak"],
    cpc: { low: 4, high: 12 },
    conversionRate: 0.25,
    jobValue: { low: 150, high: 1500 },
    marketplaceLeadNote: "Marketplace lead £5-15",
    confidence: "sourced",
    sources: [
      "Emergency CPC £4-12; well-run CPL £15-35; agency norm £40-70/call. (SMC UK; Searchlight Digital; 5x)",
    ],
  },
  {
    tradeKey: "domestic-commercial-cleaning",
    tradeLabel: "Domestic/Commercial Cleaning",
    keywords: ["cleaning", "cleaner"],
    cpc: { low: 2, high: 6 },
    conversionRate: 0.1,
    jobValue: { low: 15, high: 25 },
    marketplaceLeadNote: "Marketplace lead £5-15",
    confidence: "partial",
    sources: [
      "US benchmark CPL $26-100. Job value is per-visit — recurring LTV is the real economics.",
    ],
  },
];

/** Fallback for trades outside the workbook — modelled, and says so. */
export const GENERAL_FALLBACK: SeedTradeBenchmark = {
  tradeKey: "general-home-services",
  tradeLabel: "General home services (modelled)",
  keywords: [],
  cpc: { low: 2, high: 6 },
  conversionRate: 0.08,
  jobValue: { low: 150, high: 2500 },
  confidence: "estimated",
  sources: [
    "Modelled from home-services averages: WordStream/LocaliQ 2025 — home improvement CPC ~$7.85, CPL ~$91; UK all-industry avg CPC £2.32-3.65.",
  ],
};

/**
 * The workbook display order (Trade Benchmarks sheet) — match precedence
 * above is intentionally different (most specific families first).
 */
export const WORKBOOK_ORDER: ReadonlyArray<string> = [
  "roofing",
  "plumbing-heating-emergency",
  "boiler-installation",
  "driveways-paving",
  "landscaping",
  "tree-surgery",
  "solar-pv",
  "battery-storage",
  "ev-charger-installation",
  "scaffolding",
  "carpet-cleaning",
  "domestic-commercial-cleaning",
  "exterior-cleaning",
  "painting-decorating",
  "mobile-mechanic",
  "garage-repairs",
  "mot-servicing",
  "house-clearance",
  "garage-clearance",
  "waste-removal",
];

export interface SeedLocationMultiplier {
  label: string;
  multiplier: number;
  /** Match keywords (substring, lowercase). Table order = precedence. */
  matchers: ReadonlyArray<string>;
  rationale?: string;
}

/**
 * The Assumptions sheet, verbatim multipliers. Matcher order: cities first,
 * N. Ireland before Ireland, countries before the towns/rural bucket.
 */
export const LOCATION_MULTIPLIER_SEED: ReadonlyArray<SeedLocationMultiplier> = [
  { label: "London", multiplier: 1.35, matchers: ["london"], rationale: "London carries the UK's highest ad competition (+35%)." },
  { label: "Birmingham", multiplier: 1.15, matchers: ["birmingham"], rationale: "Big-city premium +10-15%." },
  { label: "Manchester", multiplier: 1.15, matchers: ["manchester"], rationale: "Big-city premium +10-15%." },
  { label: "Leeds", multiplier: 1.1, matchers: ["leeds"], rationale: "Big-city premium." },
  { label: "Glasgow", multiplier: 1.05, matchers: ["glasgow"] },
  { label: "Edinburgh", multiplier: 1.05, matchers: ["edinburgh"] },
  { label: "Cardiff", multiplier: 1, matchers: ["cardiff"] },
  { label: "Belfast", multiplier: 0.95, matchers: ["belfast"] },
  { label: "Dublin (GBP eq.)", multiplier: 1, matchers: ["dublin"], rationale: "Dublin carries a premium to Irish national; Irish CPCs average materially lower than UK (EUR, GBP-equivalent shown)." },
  { label: "N. Ireland — National", multiplier: 0.85, matchers: ["northern ireland", "n. ireland", "n ireland", "derry", "londonderry", "lisburn"] },
  { label: "Ireland — National (GBP eq.)", multiplier: 0.8, matchers: ["ireland", "cork", "galway", "limerick", "eire", "éire"], rationale: "Ireland search CPCs average EUR1-2 — materially cheaper." },
  { label: "Scotland — National", multiplier: 0.95, matchers: ["scotland", "aberdeen", "dundee", "inverness", "stirling"], rationale: "Scotland/Wales/NI slightly below England national competition." },
  { label: "Wales — National", multiplier: 0.9, matchers: ["wales", "swansea", "newport", "wrexham"] },
  { label: "England — Towns/Rural", multiplier: 0.85, matchers: ["rural", "village", "town"], rationale: "Towns/rural typically -15% vs national." },
  { label: "England — National", multiplier: 1, matchers: ["england", "uk", "united kingdom", "national"], rationale: "The baseline the multipliers scale." },
];

/** The default when nothing matches: England — National, flagged unmatched. */
export const DEFAULT_LOCATION_LABEL = "England — National";
