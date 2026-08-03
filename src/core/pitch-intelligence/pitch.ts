/**
 * Per-trade pitch intelligence (ADR-024). Deterministic: richly seeded packs
 * for roofing, driveways, and plumbing & heating; knowledge-base-derived
 * material for every other taxonomy trade (ADR-067); the general pack as the
 * final floor. Job values are INDICATIVE UK ranges — a sales aid, never
 * presented as measured data.
 */

import { deriveDnaPitch } from "./dna-pitch";

export type TradePitchMatch =
  | "roofing"
  | "driveways"
  | "plumbing-heating"
  /** Derived from the trade knowledge base (ADR-067) — sourced, per-trade. */
  | "knowledge"
  | "general";

export interface ObjectionHandler {
  objection: string;
  response: string;
}

export interface JobValue {
  job: string;
  /** Indicative UK range, e.g. "£5,000 – £12,000". */
  typicalRange: string;
}

export interface TradePitch {
  matched: TradePitchMatch;
  tradeLabel: string;
  talkingPoints: string[];
  painPoints: string[];
  objections: ObjectionHandler[];
  averageJobValues: JobValue[];
}

const ROOFING: Omit<TradePitch, "tradeLabel"> = {
  matched: "roofing",
  talkingPoints: [
    "Storm damage is a search spike you can own — being findable within the hour is worth a season of work.",
    "Roofing buyers fear cowboys more than cost: accreditation (NFRC, CompetentRoofer) up front closes the trust gap.",
    "Drone or photo surveys shared with the quote make you the only roofer the customer actually understood.",
    "Insurance-backed guarantees justify a premium — most competitors never mention theirs.",
    "Before/after photography is the portfolio: one documented re-roof outsells any promise.",
  ],
  painPoints: [
    "Feast-and-famine demand: storms flood the phone, quiet months starve it.",
    "Quote-and-vanish customers comparing five roofers on price alone.",
    "Reputation drag from the industry's rogue-trader image.",
    "Weather-blocked schedules wrecking committed timelines.",
  ],
  objections: [
    {
      objection: "Another roofer quoted a lot less.",
      response:
        "Ask what the quote includes: scaffold, membrane, disposal, guarantee. Cheap roofing quotes usually price a repair, not a roof — and a failed roof costs twice.",
    },
    {
      objection: "The insurance will handle it.",
      response:
        "Perfect — we work with insurers daily and document everything for the claim. You choose the roofer; the insurer pays the bill.",
    },
    {
      objection: "We'll wait until it gets worse.",
      response:
        "Water always wins: a £300 repair today is a £3,000 ceiling and joist job after one wet winter. A free survey tells you exactly where it stands.",
    },
  ],
  averageJobValues: [
    { job: "Roof repair (slipped tiles, flashing, leaks)", typicalRange: "£150 – £600" },
    { job: "Flat roof replacement (garage/extension)", typicalRange: "£1,500 – £4,000" },
    { job: "Full pitched re-roof (3-bed semi)", typicalRange: "£5,000 – £12,000" },
    { job: "Fascias, soffits & guttering", typicalRange: "£1,200 – £3,500" },
  ],
};

const DRIVEWAYS: Omit<TradePitch, "tradeLabel"> = {
  matched: "driveways",
  talkingPoints: [
    "Driveways are bought with the eyes: a filterable photo gallery does the selling before you arrive.",
    "Kerb appeal maths lands well — a driveway is one of the few home improvements neighbours see every day.",
    "Sealed, guaranteed work separates you from the leaflet-drop layers who disappear after winter.",
    "Design visits with samples (block, resin, gravel) convert far better than phone quotes.",
    "Every finished job is a showroom on that street — signage and a photo pack multiply referrals.",
  ],
  painPoints: [
    "Competing against uninsured crews quoting half price door-to-door.",
    "Big-ticket decisions stall: homeowners sit on quotes for months.",
    "Weather windows compress the whole season's schedule.",
    "One subsidence callback can erase a job's margin.",
  ],
  objections: [
    {
      objection: "A leaflet through the door quoted half your price.",
      response:
        "Ask them to name their sub-base depth and show insurance. A driveway is groundworks — the surface is the cheap part, and re-doing a sunk drive costs more than doing it once.",
    },
    {
      objection: "We might move house in a few years.",
      response:
        "Even better: agents consistently list kerb appeal among the highest-return improvements — a tired drive costs more off the asking price than a new one costs to lay.",
    },
    {
      objection: "We'll think about it after summer.",
      response:
        "Autumn booking means winter install — weather risk and delays. Locking a summer slot now fixes the price and the date.",
    },
  ],
  averageJobValues: [
    { job: "Resin-bound driveway (2-car)", typicalRange: "£2,500 – £7,000" },
    { job: "Block paving driveway (2-car)", typicalRange: "£3,000 – £8,000" },
    { job: "Patio (30–40 m²)", typicalRange: "£2,000 – £6,000" },
    { job: "Dropped kerb + widening", typicalRange: "£1,000 – £3,000" },
  ],
};

const PLUMBING_HEATING: Omit<TradePitch, "tradeLabel"> = {
  matched: "plumbing-heating",
  talkingPoints: [
    "Emergency search is winner-takes-all: the plumber who answers gets the job — response time IS the product.",
    "Gas Safe registration isn't a nicety, it's the first filter customers apply — lead with it everywhere.",
    "Boiler installs are the margin: emergency callouts are the front door to a £3k install and a service plan.",
    "Service plans turn one-off fixes into recurring revenue and a defensible customer base.",
    "Upfront, fixed pricing kills the industry's biggest objection before it's raised.",
  ],
  painPoints: [
    "Nights-and-weekends callout load burning the team out.",
    "Price-shopping customers ringing five numbers from the same search.",
    "No-heat winter spikes the diary can't absorb.",
    "Chasing invoices for emergency work done at 2am.",
  ],
  objections: [
    {
      objection: "British Gas quoted me a service plan already.",
      response:
        "And you'll be one of a million customers in their queue. Same Gas Safe cover, a local engineer who knows your system, and a call answered by a person — usually for less.",
    },
    {
      objection: "The boiler still works, why replace it?",
      response:
        "A 12-year-old boiler runs at ~75% efficiency against 92%+ new — on today's gas prices the replacement part-funds itself, and it fails on the coldest week, not a convenient one.",
    },
    {
      objection: "How do I know the callout won't spiral in cost?",
      response:
        "Fixed callout, quoted before work starts, no overtime surprises — it's written on the confirmation you get before we arrive.",
    },
  ],
  averageJobValues: [
    { job: "Emergency callout (leak, no heating)", typicalRange: "£80 – £150" },
    { job: "Boiler service", typicalRange: "£80 – £120" },
    { job: "Boiler replacement (combi)", typicalRange: "£2,000 – £4,000" },
    { job: "Bathroom plumbing refit", typicalRange: "£1,500 – £5,000" },
  ],
};

const GENERAL: Omit<TradePitch, "tradeLabel"> = {
  matched: "general",
  talkingPoints: [
    "Local trades win on trust signals: reviews, accreditations, and real photos beat any slogan.",
    "Answering enquiries within the hour is the single biggest conversion lever in local services.",
    "A premium web presence lets a good trade charge what the work is actually worth.",
  ],
  painPoints: [
    "Invisible against bigger-spending competitors in local search.",
    "Enquiries arriving while on the tools — and going cold by evening.",
    "Price-only shoppers who never saw the quality signals.",
  ],
  objections: [
    {
      objection: "I get enough work from word of mouth.",
      response:
        "Word of mouth is the proof — a strong online presence is the amplifier. Every referral now checks you out online before calling; the site's job is to not lose them.",
    },
    {
      objection: "I tried marketing before and it didn't work.",
      response:
        "Most trade marketing fails because it's generic. This is built from how YOUR customers actually buy — and you'll see every lead and where it came from.",
    },
    {
      objection: "It's too expensive right now.",
      response:
        "One additional average job a month typically covers it. The question is the value of the jobs currently going to whoever ranks above you.",
    },
  ],
  averageJobValues: [
    { job: "Typical local-trade job value", typicalRange: "£150 – £2,500" },
  ],
};

/**
 * Free-text fallback, for trades typed by hand rather than chosen from the
 * taxonomy. ANCHORED — `\b` on every word, never a bare `includes()`.
 *
 * The unanchored version of this list is why a **damp-proofing** lead used to
 * open the founder's screen showing roofing talking points, roofing objection
 * scripts, NFRC and CompetentRoofer accreditations, and re-roof job values:
 * `"damp-proofing".includes("roof")` is true, because the word is
 * damp-p-ROOF-ing. `"chimney-fireplaces"` matched too, and a stove fitter is
 * not a roofer.
 *
 * This is the fourth appearance of one defect: inferring a fact from a
 * substring. ADR-059 grew accreditations out of a trade name; ADR-061 put
 * roofing FAQs on a damp-proofing site; ADR-062 read a CTA's behaviour off its
 * label. Both `faq-content.ts` and `trade-intelligence.ts` carry comments
 * warning about this exact string. This file never got the fix.
 */
const MATCHERS: Array<[TradePitchMatch, RegExp, Omit<TradePitch, "tradeLabel">]> = [
  ["roofing", /\broof|\bguttering|\bfascia|\bsoffit/i, ROOFING],
  ["driveways", /\bdrivew|\bpaving|\bpatio|\bresin|\blandscap|\bblock pav|\btarmac/i, DRIVEWAYS],
  ["plumbing-heating", /\bplumb|\bheating|\bboiler|\bgas safe|\bbathroom fit/i, PLUMBING_HEATING],
];

/**
 * Taxonomy id → pitch pack. EVERY id in the taxonomy is listed, including the
 * ones that get the general pack, because an id absent from this map falls
 * through to the free-text matcher — and inference is what went wrong.
 * A trade is assigned a specific pack only where the pack's talking points,
 * objections and job values genuinely describe that business: a chimney and
 * fireplace fitter works to HETAS and Part J and sells stoves, so roofing's
 * storm-damage material is worse than nothing to hand a founder mid-call.
 *
 * 4 of 35 trades have a pack written for them. The other 31 get the general
 * one, honestly labelled in the CRM — which is the size of the gap the trade
 * knowledge base is being built to close.
 */
const PACK_BY_TAXONOMY_ID: Record<string, Omit<TradePitch, "tradeLabel">> = {
  // ── Purpose-written packs ────────────────────────────────────────────
  roofing: ROOFING,
  "driveways-paving": DRIVEWAYS,
  landscaping: DRIVEWAYS,
  "plumbing-heating-emergency": PLUMBING_HEATING,
  "boiler-installation": PLUMBING_HEATING,

  // ── Explicitly general. Listed so no id can fall through to a guess. ──
  "solar-pv": GENERAL,
  "battery-storage": GENERAL,
  "ev-charger-installation": GENERAL,
  electricians: GENERAL,
  "hvac-air-conditioning": GENERAL,
  scaffolding: GENERAL,
  "painting-decorating": GENERAL,
  "builders-general": GENERAL,
  "extensions-renovations": GENERAL,
  "windows-doors": GENERAL,
  conservatories: GENERAL,
  brickwork: GENERAL,
  "tarmac-surfacing": DRIVEWAYS,
  "artificial-grass": DRIVEWAYS,
  "chimney-fireplaces": GENERAL,
  "damp-proofing": GENERAL,
  "tree-surgery": GENERAL,
  "carpet-cleaning": GENERAL,
  "domestic-commercial-cleaning": GENERAL,
  "exterior-cleaning": GENERAL,
  "waste-removal": GENERAL,
  "house-clearance": GENERAL,
  "garage-clearance": GENERAL,
  "mobile-mechanic": GENERAL,
  "garage-repairs": GENERAL,
  "mot-servicing": GENERAL,
  "car-detailing": GENERAL,
  "swimming-pools": GENERAL,
  "dentists-private": GENERAL,
  solicitors: GENERAL,
};

/**
 * Resolve the pitch pack for a trade (taxonomy id or free text).
 *
 * The ladder, in honesty order:
 * 1. A purpose-written pack (the four curated ones) — richest, wins always.
 * 2. Material derived from the trade knowledge base (ADR-067) — sourced
 *    per-trade lines for the trades no pack was written for. Objection
 *    handlers stay general (the research wrote none, so none are invented);
 *    pain points and job values fall back to general where the record is
 *    thin.
 * 3. The anchored free-text matchers, then the general pack.
 */
export function resolveTradePitch(trade: string): TradePitch {
  const tradeLabel = trade.trim();
  const tradeLower = tradeLabel.toLowerCase();

  const byId = PACK_BY_TAXONOMY_ID[tradeLower];
  if (byId && byId !== GENERAL) return { ...byId, tradeLabel };

  // Lowercased so a shouted taxonomy id ("MOBILE-MECHANIC") resolves the
  // same as its canonical form — the knowledge base's exact-id check is
  // case-sensitive by design, and case must never change the answer here.
  const derived = deriveDnaPitch(tradeLower);
  if (derived) {
    // A free-text trade can resolve to an id that HAS a curated pack
    // ("Plumbing and Heating" → plumbing-heating-emergency): curated wins.
    const curated = PACK_BY_TAXONOMY_ID[derived.tradeId];
    if (curated && curated !== GENERAL) return { ...curated, tradeLabel };
    return {
      matched: "knowledge",
      tradeLabel,
      talkingPoints: derived.talkingPoints,
      painPoints: derived.painPoints ?? GENERAL.painPoints,
      objections: GENERAL.objections,
      averageJobValues: derived.averageJobValues ?? GENERAL.averageJobValues,
    };
  }

  if (byId) return { ...byId, tradeLabel };
  for (const [, pattern, pack] of MATCHERS) {
    if (pattern.test(tradeLower)) {
      return { ...pack, tradeLabel };
    }
  }
  return { ...GENERAL, tradeLabel };
}
