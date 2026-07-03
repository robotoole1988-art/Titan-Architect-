/**
 * Per-trade pitch intelligence (ADR-024). Deterministic keyword matching in
 * the spirit of the strategy generator's trade intelligence (ADR-020):
 * richly seeded for roofing, driveways, and plumbing & heating; sensible
 * defaults for everything else. Job values are INDICATIVE UK ranges — a sales
 * aid, never presented as measured data.
 */

export type TradePitchMatch =
  | "roofing"
  | "driveways"
  | "plumbing-heating"
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

const MATCHERS: Array<[TradePitchMatch, ReadonlyArray<string>, Omit<TradePitch, "tradeLabel">]> = [
  ["roofing", ["roof", "guttering", "fascia", "soffit", "chimney"], ROOFING],
  ["driveways", ["drive", "paving", "patio", "resin", "landscap", "block pav"], DRIVEWAYS],
  [
    "plumbing-heating",
    ["plumb", "heating", "boiler", "gas", "bathroom fit"],
    PLUMBING_HEATING,
  ],
];

/** Resolve the pitch pack for a trade. Deterministic; never empty. */
export function resolveTradePitch(trade: string): TradePitch {
  const tradeLower = trade.trim().toLowerCase();
  for (const [, keywords, pack] of MATCHERS) {
    if (keywords.some((keyword) => tradeLower.includes(keyword))) {
      return { ...pack, tradeLabel: trade.trim() };
    }
  }
  return { ...GENERAL, tradeLabel: trade.trim() };
}
