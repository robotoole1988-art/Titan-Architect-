/**
 * The campaign plan generator (ADR-031). Deterministic assembly — no AI:
 * taxonomy services × coverage areas × archetype intent → keywords;
 * strategy copy → RSA candidates (dropped, never truncated, when over
 * limit); the deal's own numbers → budget with working shown.
 */

import {
  classifyArchetype,
  generateExperienceStrategy,
  type TradeArchetype,
} from "@/core/experience-strategy";
import { getTradeDefinition, matchTradeId } from "@/core/trade-taxonomy";
import {
  RSA_LIMITS,
  type AdGroupPlan,
  type CampaignPlan,
  type CampaignPlanInput,
  type KeywordPlan,
  type RsaHeadline,
  type RsaPlan,
} from "./model";

/** Intent modifiers per archetype — how these customers actually search. */
const INTENT_MODIFIERS: Record<TradeArchetype, ReadonlyArray<string>> = {
  emergency: ["emergency", "24 hour", "urgent", "near me"],
  project: ["cost", "quote", "prices", "near me"],
  premium: ["cost", "quote", "ideas", "near me"],
  care: ["near me", "prices", "reviews"],
  recurring: ["near me", "cost", "local"],
  event: ["quote", "prices", "near me"],
  general: ["cost", "quote", "near me"],
};

/** Base negatives every trade wants; never bid on these. */
const BASE_NEGATIVES = [
  "jobs",
  "careers",
  "salary",
  "apprenticeship",
  "training",
  "courses",
  "course",
  "free",
  "diy",
  "how to",
  "wiki",
  "tools",
  "second hand",
  "youtube",
];

const TRADE_NEGATIVES: Record<string, ReadonlyArray<string>> = {
  "driveways-paving": ["grants", "slabs for sale", "calculator"],
  roofing: ["grants", "felt for sale", "materials"],
  landscaping: ["ideas only", "software", "magazine"],
  "plumbing-heating-emergency": ["college", "van", "merchants"],
  "solar-battery-ev": ["grants calculator", "diy kit"],
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function pounds(value: number): string {
  return `£${value.toLocaleString("en-GB", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function pageSlugPath(area: string): string {
  return `/${area
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
}

function urlFor(
  site: CampaignPlanInput["site"],
  area: string | undefined,
): string {
  const home = site.baseUrl.replace(/\/+$/, "");
  if (!area) return home;
  const path = pageSlugPath(area);
  const exists = site.pages.some((page) => page.path === path);
  return exists ? `${home}${path}` : home;
}

function keywordsFor(
  service: string,
  area: string | undefined,
  archetype: TradeArchetype,
): KeywordPlan[] {
  const base = service.toLowerCase();
  const suffix = area ? ` ${area.toLowerCase()}` : "";
  const texts = new Set<string>();
  texts.add(`${base}${suffix}`.trim());
  for (const modifier of INTENT_MODIFIERS[archetype]) {
    texts.add(`${base} ${modifier}${modifier === "near me" ? "" : suffix}`.trim());
  }
  const keywords: KeywordPlan[] = [];
  for (const text of texts) {
    keywords.push({ text, matchType: "phrase" });
    keywords.push({ text, matchType: "exact" });
  }
  return keywords;
}

/** Candidates in, LEGAL RSA out: over-limit lines are dropped, never cut. */
function assembleRsa(
  headlineCandidates: ReadonlyArray<string>,
  descriptionCandidates: ReadonlyArray<string>,
  service: string,
  area: string | undefined,
): RsaPlan {
  const headlines: RsaHeadline[] = [];
  const seen = new Set<string>();
  for (const candidate of headlineCandidates) {
    const text = candidate.trim();
    if (!text || text.length > RSA_LIMITS.headlineChars || seen.has(text)) continue;
    seen.add(text);
    headlines.push(
      headlines.length === 0 ? { text, pin: 1 } : { text },
    );
    if (headlines.length === RSA_LIMITS.maxHeadlines) break;
  }
  const descriptions: string[] = [];
  for (const candidate of descriptionCandidates) {
    const text = candidate.trim();
    if (!text || text.length > RSA_LIMITS.descriptionChars) continue;
    if (descriptions.includes(text)) continue;
    descriptions.push(text);
    if (descriptions.length === RSA_LIMITS.maxDescriptions) break;
  }
  return {
    headlines,
    descriptions,
    path1: service.toLowerCase().split(/\s+/)[0]?.slice(0, 15),
    ...(area ? { path2: pageSlugPath(area).slice(1, 16) } : {}),
  };
}

function buildAdGroup(
  input: CampaignPlanInput,
  service: string,
  area: string | undefined,
  archetype: TradeArchetype,
): AdGroupPlan {
  const place = area ?? input.business.location;
  // The area strategy localises copy exactly as the area pages do (ADR-028).
  const strategy = generateExperienceStrategy({
    businessName: input.business.name,
    trade: input.business.trade,
    location: place,
  });
  const headlineCandidates = [
    service,
    `${service} ${place}`,
    `${service} in ${place}`,
    input.business.name,
    strategy.conversionStrategy.primaryCta,
    ...strategy.storytelling.keyMessages,
    ...strategy.conversionStrategy.trustSignals,
    `Free ${place} Quotes`,
    `Local ${place} Specialists`,
  ];
  // First sentences of longer strategy copy still DERIVE (never mid-word
  // truncation); compact templates guarantee the RSA minimum is met.
  const firstSentence = (text: string): string =>
    text.split(/(?<=\.)\s/)[0] ?? text;
  const descriptionCandidates = [
    strategy.heroConcept.subheadline,
    firstSentence(strategy.heroConcept.subheadline),
    strategy.conversionStrategy.summary,
    firstSentence(strategy.conversionStrategy.summary),
    `${service} in ${place} by ${input.business.name}. ${strategy.conversionStrategy.primaryCta}.`,
    `${service} in ${place}. Free quotes, clear pricing, local team.`,
    `Trusted local specialists in ${place}. ${strategy.conversionStrategy.primaryCta} today.`,
    firstSentence(strategy.storytelling.summary),
  ];
  return {
    name: `${service} — ${place}`,
    service,
    ...(area ? { area } : {}),
    finalUrl: urlFor(input.site, area),
    keywords: keywordsFor(service, area, archetype),
    ads: [assembleRsa(headlineCandidates, descriptionCandidates, service, area)],
  };
}

/** TradeFlow v6's launch checklist, kept where sane, wired to this stack. */
function launchChecklist(): string[] {
  return [
    "Google Ads account access granted (MCC invited)",
    "Landing pages live and reviewed (published via TITAN)",
    "Landing pages mobile-tested — under 3s load",
    "Enquiry form tested — submission arrives in TITAN + notification received",
    "Click-to-call tested on mobile",
    "Conversion tracking set up — the enquiry form submit is the conversion event (ADR-030)",
    "Campaign structure imported from the plan CSVs (ad groups per service × area)",
    "All extensions added (callouts, sitelinks, call, location)",
    "Negative keyword list added at campaign level",
    "Location targeting matches the plan's coverage areas",
    "Daily budget set and confirmed against the deal's working",
    "Campaign reviewed and approved internally (the plan gate)",
    "Client notified campaign is live",
    "Day 1 check — ads showing, conversions tracking",
    "Week 1 review call booked with client",
  ];
}

export function generateCampaignPlan(input: CampaignPlanInput): CampaignPlan {
  const archetype = classifyArchetype(input.business.trade.toLowerCase());
  const tradeId = input.business.tradeId ?? matchTradeId(input.business.trade);
  const allServices =
    (tradeId && getTradeDefinition(tradeId)?.services) || [input.business.trade];
  // Focused account: the top services carry the spend; the long tail waits
  // for performance data.
  const services = allServices.slice(0, 4);
  const areas = [undefined, ...(input.business.coverageAreas ?? [])];

  const adGroups = areas.flatMap((area) =>
    services.map((service) => buildAdGroup(input, service, area, archetype)),
  );

  const monthly = round2(input.deal.monthlyAdSpend);
  const daily = round2(monthly / 30.4);

  return {
    campaigns: [
      {
        name: `${input.business.name} — Search — Lead Generation`,
        goal: "lead_generation",
        adGroups,
      },
    ],
    negatives: [
      ...new Set([...BASE_NEGATIVES, ...(TRADE_NEGATIVES[tradeId ?? ""] ?? [])]),
    ],
    locationTargeting: [
      input.business.location,
      ...(input.business.coverageAreas ?? []),
    ],
    budget: {
      leadTargetPerMonth: input.deal.leadTargetPerMonth,
      cplUsed: input.deal.cplUsed,
      cplSource: input.deal.cplSource,
      monthly,
      daily,
      working: `${input.deal.leadTargetPerMonth} leads × ${pounds(input.deal.cplUsed)} CPL = ${pounds(monthly)}/mo → ÷ 30.4 = ${pounds(daily)}/day`,
    },
    bidStrategy: {
      initial: "Maximise Clicks with a max CPC ceiling (start at ~½ the CPL)",
      switchAt:
        "Switch to Target CPA once the campaign has ~30 conversions of history",
      guidance:
        "Guidance, not law: hold the structure steady for the first 30 days; judge on cost per enquiry, not clicks.",
    },
    conversionEvent:
      "The enquiry form submit on the published site (Lead Flow v1, ADR-030) — already measured first-party by TITAN.",
    launchChecklist: launchChecklist(),
  };
}
