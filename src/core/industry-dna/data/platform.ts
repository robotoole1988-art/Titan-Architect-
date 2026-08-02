import type { IndustryDna } from "../industry-dna";
import { sourced, vol2, vol3 } from "./sources";

/**
 * The platform layer: knowledge that holds across all ~35 trades.
 *
 * Per-trade records override or extend these fields (field-level merge in
 * the resolver, trade wins). Sections with no cross-trade research stay
 * empty — honest absence beats invented fullness (ADR-034), and that
 * includes knowledge. Paid advertising is deliberately empty here until the
 * Vol 3 acquisition research is mined in its own pass.
 */
export const PLATFORM_DNA: IndustryDna = {
  businessIdentity: {},

  services: {},

  customerPsychology: {
    trustFactors: [
      {
        label: "Numbers beat logos",
        description:
          "Licence numbers on the homepage, insurance stated in £m, Companies House and VAT numbers in the footer, register deep-links with 'check us — and check anyone else' copy. Verifiable facts outperform badge walls in every trade researched.",
      },
      {
        label: "Rogue-trader counter-positioning",
        description:
          "'We never cold-call. Written quotes only.' plus duty-of-care education. A family-wide lever (tarmac, tree surgery, clearance, roofing) almost no incumbent uses explicitly.",
      },
    ],
    extensions: sourced(vol2("Synthesis"), vol2("Platform layer")),
  },

  website: {
    trustSignals: [
      {
        label: "Badge registry, not badge images",
        description:
          "Every accreditation renders from data: scheme, membership number, expiry, official artwork or dynamic embed, register deep-link. Auto-removal on lapse. Falsely displaying a scheme logo breaches the Consumer Protection from Unfair Trading Regulations 2008.",
      },
      {
        label: "Unclaimed written guarantees",
        description:
          "Recurring free differentiator: a written workmanship/regrowth/installation guarantee block, per trade, where almost no incumbent states one.",
      },
    ],
    forms: [
      {
        label: "Three quote-module archetypes",
        description:
          "Calculator/lead-capture (rooms, van-load fraction, savings, wizards) · reg-plate/instant fixed price (automotive) · photo-quote via WhatsApp/upload (clearance, detailing, damp, emergency roofing). Configured per trade, built once.",
      },
    ],
    conversionStrategy: [
      {
        label: "Disclosure modules double as conversion features",
        description:
          "Regulated content (price transparency, licence numbers, compliance strips) is simultaneously the highest-converting content — build disclosures as calculators and fee tables, not boilerplate.",
      },
    ],
    extensions: sourced(vol2("Synthesis"), vol2("Platform layer")),
  },

  searchSeo: {
    googleBusinessProfile: [
      {
        label: "Primary category is the #1 local ranking factor",
        description:
          "Each trade ships a recommended GBP primary category (the most specific money keyword) plus up to 9 secondaries, re-audited every 6 months. Seasonal switching where the trade's demand flips (HVAC).",
      },
      {
        label: "GBP services measurably rank; posts and Q&A do not",
        description:
          "Fill services exhaustively (predefined first) from the trade taxonomy — tested effects within 24–72h. Posts average ~0.5% CTR and moved zero rankings in a controlled 441-keyword test: sell them as conversion assets, never as ranking work. Photo geotagging is a confirmed myth — Google strips EXIF.",
      },
      {
        label: "SAB discipline: the highest-suspension vertical",
        description:
          "Never keyword-stuff the business name (the #1 suspension trigger, and DMCC-adjacent misrepresentation). Batch edits; show an address only for a genuinely staffed, signed premises; define honest service areas (≤ ~2-hour radius). Prep the video-verification evidence pack (signage, van, tools) before Google asks.",
      },
      {
        label: "Quarterly spam sweep as a productised service",
        description:
          "Locksmiths, garage doors and plumbing are the worst-hit categories for fake listings; removing 2–3 spam listings above a client is a ranking improvement no optimisation could buy. Suggest-an-edit for name violations, the Business Redressal Complaint Form for fraud.",
      },
      {
        label: "UTM every GBP surface from day one",
        description: "Website, appointment and post links tagged distinctly, kept stable — otherwise GBP traffic pollutes 'google / organic' in analytics.",
      },
    ],
    localSeo: [
      {
        label: "Review velocity is a ranking input, not a vanity metric",
        description:
          "8,186-business study: monthly velocity mattered more than lifetime count; rankings 'fell off a cliff' after an 18-day gap. Crossing ~10 reviews gives a measurable Maps bump. Reviews with text beat star-only; keywords in review text power justifications — invite the mention, never script the review.",
      },
      {
        label: "Citations are one-time hygiene, revalued as AI-answer presence",
        description:
          "Core stack + UK trade directories + Bing Places, then STOP — no monthly citation retainers. Citations carry 13% weight for answer-engine visibility, and Bing Places is ChatGPT's local backend: the cheapest GEO win nobody does.",
      },
      {
        label: "The quarterly local-link play",
        description:
          "One sponsorship (sports club/charity), one supplier/accreditation link (manufacturer installer pages, register presence), one chamber/BID membership, one local press mention. Links are 24% of local organic.",
      },
    ],
    contentStrategy: [
      {
        label: "Every trade gets a money cluster — cost guide + 4–6 sibling intents",
        description:
          "Cost queries fire AI Overviews 92% of the time: real number in the first 100 words, UK price-range table, factor-by-factor drivers, named tradesperson author with verifiable credentials, visible update date. Cluster depth beats blog frequency.",
      },
      {
        label: "Scaled-content abuse is TITAN's existential platform risk",
        description:
          "35 trades × N towns × one template is the exact fingerprint Google's March 2024 spam policy names — sites lost 90%+ visibility. No page ships without ≥30–40% client-unique substance (real jobs, local reviews, regional pricing); template similarity is tracked as a fleet health metric. The area-page near-copy gate is this law at generation time.",
      },
      {
        label: "AI visibility for a local trade has exactly three levers",
        description:
          "(a) rank organically, (b) be present with reviews on the directories LLMs retrieve (Checkatrade, Trustpilot, Which?, MyBuilder, Yell, Facebook — and Bing Places), (c) accumulate branded web mentions (0.664 correlation vs 0.218 for backlinks). There is no fourth secret; get clients into 'best X in town' listicles — 60% of local AIO citations are third-party pages.",
      },
    ],
    schema: [
      {
        label: "Schema is for rich results and entities — never sold as an AI-citation lever",
        description:
          "Every controlled study found null or slightly negative effect of JSON-LD on AI citations (Ahrefs: −4.6% vs matched controls); retrieval position dominates. TITAN ships schema for rich-result eligibility and entity disambiguation, and promises nothing else. llms.txt: harmless, zero evidenced return, promise nothing.",
      },
    ],
    locationPages: [
      {
        label: "Location-page uniqueness modules",
        description:
          "Reviews, staff, jobs and service-area data injected per town — the proven anti-doorway pattern. TITAN's area-page near-copy gate enforces the same law at generation time.",
      },
    ],
    extensions: sourced(
      vol2("Synthesis"),
      vol2("Platform layer"),
      vol3("1. GEO / AI Search Optimization (2025–26)"),
      vol3("2. Local Organic Beyond Basics"),
      vol3("3. Content Strategy for Trades (post-HCU)"),
      vol3("5. GBP Advanced"),
    ),
  },

  paidAdvertising: {
    localServicesAds: [
      {
        label: "UK LSAs are live nationwide for home services; roughly two-thirds of TITAN's trades are eligible",
        description:
          "Dental, solar, garages and solicitors-outside-London have no UK LSA route and rely on Search. Professional Services (solicitors, estate agents) are a Greater London pilot only.",
      },
      {
        label: "'Google Verified' replaced Google Guaranteed on 20 Oct 2025 — the money-back guarantee is DISCONTINUED",
        description:
          "Never sell the old guarantee. UK verification: entity checks, public liability insurance, licence verification (e.g. Gas Safe), a verified GBP (mandatory since Nov 2024), background checks. Takes 3–4 weeks; insurance and licences re-verify annually or the badge auto-revokes. Run Search as the bridge while the badge is pending.",
      },
      {
        label: "Pay-per-lead economics",
        value: "UK £10–£30/lead typical · US benchmark $39–$71 by trade · ~6–7% of spend returns as credits",
        description:
          "Since mid-2024 disputes are automated credits — and 'job type not serviced'/'geo not serviced' are NO LONGER credited, so job types and postcode areas must be configured surgically at setup. Submit lead feedback on every lead.",
      },
      {
        label: "Responsiveness is a ranking factor — missed calls are a ranking penalty",
        description:
          "Google's own factors: bid, lead-conversion likelihood, responsiveness, review rating/count/response time, photo quality, verification. Enable message + booking leads for night/weekend reach; bundle call answering.",
      },
      {
        label: "API mechanics: manage yes, onboard no",
        description:
          "LSA campaigns are mutable via the Google Ads API (status, budget, bidding, schedule, geo, service types) and leads are readable (LocalServicesLead, LeadConversation) with ProvideLeadFeedback() — but campaigns cannot be created via API; onboarding is CSV/UI, up to 100 providers per CSV under an MCC.",
      },
    ],
    googleAds: [
      {
        label: "Structure law: one campaign per service line, 3–5 themed ad groups, never SKAGs",
        description:
          "Smart Bidding needs ~30–50 conversions/campaign/month to exit learning — micro-segmentation starves it. 5–15 keywords per ad group, exact + phrase, dedicated landing page per ad group; broad match only once negatives and conversion volume exist.",
      },
      {
        label: "Bidding ladder",
        description:
          "Max Clicks (<30 days) → tCPA/Max Conversions (30–90 days) → value-based with daily offline conversion import from the CRM. Small budgets consolidate campaigns to reach learning volume.",
      },
      {
        label: "Call ads sunset — build RSAs with call assets only",
        value: "new call ads blocked from Feb 2026 · existing stop serving Feb 2027",
        description: "Announced 3 Oct 2025. Every ad group needs at least one RSA with call assets before the cutoff.",
      },
      {
        label: "Master negative list, applied account-level at day 0",
        description:
          "Five categories: jobs/careers, DIY/how-to, education/training, budget signals, research platforms — plus per-trade product/parts negatives (screwfix, toolstation, brand + 'manual'/'error code'). Mature accounts carry 150–400 negatives; weekly search-term review for the first 90 days.",
      },
      {
        label: "CPL guardrail",
        value: "target CPL ≤ 10–15% of the trade's average job value, assuming ~1-in-3 lead→job",
        description: "The sanity check applied at onboarding and in every budget recommendation.",
      },
      {
        label: "Certification badges in ad copy",
        description: "Gas Safe / NICEIC / TrustMark in headlines and snippets measurably lift CTR and Quality Score — rendered from verified data only, like everywhere else in TITAN.",
      },
    ],
    metaAds: [
      {
        label: "Meta works in a strict hierarchy of trade families",
        description:
          "Visual transformation trades (driveways, artificial grass, landscaping, exterior cleaning): Meta can be PRIMARY. Big-ticket considered (roofing, solar, windows): strong, but lead-quality management is the whole game. Professional (dental, legal): offer-led + social proof, Google still primary. Emergency trades: skip — nobody scrolls Instagram with a burst pipe.",
      },
      {
        label: "The 2026 client stack",
        description:
          "One Leads campaign, one broad ad set inside town + 8–10 mile geo, 6+ town-named creatives (before/after, founder-to-camera) refreshed on fatigue, Higher-intent instant form with 2 conditional qualifiers and autofill off, sub-60-second automated SMS/WhatsApp response, lead stages fed back via CAPI. Never the Traffic objective.",
      },
      {
        label: "Meta CPL expectation vs Google",
        value: "~30–60% of Google CPL in the same trade; lead→job at roughly half",
        description: "Price the channel on cost-per-booked-job, never CPL. Set expectations off the planning table ±50%.",
      },
      {
        label: "The finance-offer trap",
        description:
          "'0% finance'/BNPL copy — endemic in driveways, windows, solar, dental — triggers Meta's Financial Products category: forced 18–65+ all-genders, no lookalikes, 15-mile minimum radius, no postcode targeting. The ad builder must auto-flag finance copy or keep finance messaging off Meta entirely. Never dodge the declaration — account bans.",
      },
      {
        label: "Radius reality",
        description:
          "Radii under ~5 miles get auction-penalised (3–5x CPM, delivery caps). Default: town/city list + 8–10 mile radius; never a 1–3 mile pin.",
      },
    ],
    budgetGuidance: [
      {
        label: "Trade-tiered Google minimums — refuse sub-£500/month",
        value: "emergency £600–£1,000 · considered home improvement £1,000–£1,500 · professional £1,500–£2,000+",
        description:
          "Sanity checks at onboarding: budget ÷ trade CPC must yield ≥150–200 clicks/month, and implied CPL must clear the 10–15%-of-job-value rule. Sub-£500 cannot buy enough clicks to learn.",
      },
      {
        label: "Meta floors",
        value: "start £15–35/day · scale £50–100/day · decline big-ticket Meta below £15/day",
        description:
          "Most small clients live permanently in Learning Limited (20–50% higher CPA) — accept it, never restart campaigns, scale in 20–30% steps every 3–5 days, judge on 30-day cost-per-booked-job.",
      },
      {
        label: "Geo default: 10–15 mile radius on Search, 'presence in' setting; expand ring-by-ring only after impression share >80%",
      },
    ],
    seasonalCampaigns: [
      {
        label: "Google seasonality adjustments are for ≤14-day shocks only",
        description:
          "A cold-snap boiler surge or post-storm roofing spike — never whole seasons; Smart Bidding self-adapts to gradual shifts. Budget (not bid) planning: heating Oct–Feb, roofing post-storm + spring, driveways/landscaping Mar–Sep.",
      },
      {
        label: "Meta spring window",
        description:
          "UK Meta CPL collapses ~69% into March — the cheapest inventory lands exactly as outdoor-trade demand wakes. Ramp outdoor trades late Feb–March; storm-trigger templates for roofers (+~50% engagement in a 6–72h window).",
      },
    ],
    audiences: [
      {
        label: "Broad + creative-as-targeting is the doctrine",
        description:
          "Broad within geo beats lookalike stacking post-Andromeda; light shaping via homeowner-proxy suggestions only. Two evergreen retargeting pools at launch: site visitors 30d + form-abandoners 14d (the cheapest high-intent audience a trade has), served testimonial creative on ~10–15% of budget.",
      },
    ],
    creatives: [
      {
        label: "Before/after with specifics is the apex format",
        description:
          "Town name + price/time anchor on every ad ('this driveway, £X, 3 days'). Raw 15–30s on-the-job footage and founder-led video outperform polish 2–3x. Hook diversity beats variant diversity; refresh on fatigue signals (CPM up, results flat 7 days), not calendar.",
      },
      {
        label: "PMax is not a default — it is a gated exception",
        description:
          "Documented CPL mirage: £12/lead that converts at 0.3% vs Search's £28 at 4.7%. Default = no PMax for trade clients; sequence LSA + Search first. Hard gates before any test: offline conversion import live, spend >£2k/month, brand exclusions, negatives applied, URL expansion off. Judge on revenue-qualified CPL from the CRM only.",
      },
    ],
    extensions: sourced(
      vol3("1. LOCAL SERVICES ADS (LSAs) IN THE UK, 2025–26"),
      vol3("2. GOOGLE SEARCH ADS FOR TRADES"),
      vol3("3. PERFORMANCE MAX FOR LOCAL LEAD-GEN"),
      vol3("5. BUDGET STRATEGY FOR SMALL TRADES"),
      vol3("6. WHAT THE BEST TRADE-PPC OPERATORS PUBLISH (NUMBERS)"),
      vol3("Part IV — Meta ads"),
    ),
  },

  brand: {},

  sales: {
    reviewRequests: [
      {
        label: "Ask everyone, every job, no filtering — hard-coded",
        description:
          "SMS on completion (tradesperson still on the doorstep is the highest-conversion moment) → direct Google review link → email nudge at 24–48h → one reminder. No sentiment pre-screen routing negatives away: gating is illegal under the DMCC Act, not merely against Google policy.",
      },
      {
        label: "Never incentivise Google reviews",
        description:
          "Unlabelled incentives breach the DMCC Act; Google policy bans incentivised reviews entirely. No prize draws, no '£10 off for a review' — across all 35 trades.",
      },
      {
        label: "Velocity beats totals",
        description:
          "Steady drip (4–15+/month by trade competitiveness), never burst-then-silence — rankings measurably fall after an ~18-day gap, and 22% of consumers only trust reviews from the last two weeks. Response SLA ≤1 week, 100% coverage.",
      },
      {
        label: "Then diversify to the AI-citation surface",
        description:
          "Once Google velocity holds, route asks to Checkatrade, Trustpilot, Facebook, Which? Trusted Traders — the directories LLMs actually quote — with unconditional asks only.",
      },
    ],
    extensions: sourced(vol3("4. Reviews Engine (Acquisition + UK Law)"), vol3("1. GEO / AI Search Optimization (2025–26)")),
  },

  marketIntelligence: {
    seasonalTrends: [
      {
        label: "Season-flip module",
        description:
          "One module, per-trade copy packs: spring surge vs winter counter-pitch. HVAC even swaps its GBP primary category by season.",
      },
    ],
    extensions: sourced(vol2("Synthesis")),
  },

  operations: {},

  businessIntelligence: {},

  aiBehaviour: {
    automationRules: [
      {
        label: "Compliance linter at publish",
        description:
          "Machine-checkable per-trade legal MUSTs; no site publishes with a failed MUST. The SRA lint (live badge, SRA number, complaints page, complete price fields) is the template.",
      },
      {
        label: "Finance-promotion gate",
        description:
          "Built once, applies to windows, batteries, EV, pools, boilers and dental alike: FCA FRN present → CONC 3 representative example auto-inserted; absent → all monthly-payment copy stripped.",
      },
      {
        label: "DMCC reviews-compliance layer — TITAN is a publisher with its own duties",
        description:
          "The DMCC Act (in force 6 April 2025) bans fake and concealed-incentive reviews, review gating and cherry-picking, with CMA fines up to 10% of global turnover — and TITAN, displaying reviews and operating the ask-funnel, likely carries publisher/facilitator duties itself. Required: written fake-review policy, proactive detection and flagging, takedown process, audit trail. Sold honestly as the CMA-compliant reviews engine.",
      },
      {
        label: "Meta finance-copy firewall",
        description:
          "Any ad copy mentioning finance/credit/monthly payments auto-flags the campaign into Meta's Financial Products category (with its 15-mile/no-narrowing consequences explained) — or finance messaging stays off Meta entirely. The declaration is never dodged.",
      },
    ],
    extensions: sourced(
      vol2("Platform layer"),
      vol3("4. Reviews Engine (Acquisition + UK Law)"),
      vol3("Part IV — Meta ads"),
    ),
  },
};
