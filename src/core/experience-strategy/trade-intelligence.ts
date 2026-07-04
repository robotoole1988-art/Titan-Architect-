/**
 * Trade intelligence (v2).
 *
 * The strategic reasoning behind the Experience Strategy Generator. Given a
 * trade, it classifies the business into an *archetype* (how its customers buy)
 * and derives a resolved `TradeProfile` — a single, coherent strategic idea and
 * the trade-specific detail every section is built from.
 *
 * Deterministic. No AI, no data fetching, no side effects. This is where the
 * quality of thinking lives; the generator merely composes it into the output.
 */

/** How a trade's customers decide — the axis that changes the strategy most. */
export type TradeArchetype =
  | "emergency"
  | "project"
  | "premium"
  | "care"
  | "recurring"
  | "event"
  | "general";

/** A fully-resolved strategic profile for one business. */
export interface TradeProfile {
  archetype: TradeArchetype;
  buyingMode: string;
  /** The differentiation wedge — a sharp angle, not "trusted local". */
  positioning: string;
  /** One-line strategic thesis threaded through every section. */
  thesis: string;
  dominantEmotions: string[];
  primaryObjection: string;
  decisionTriggers: string[];
  isUrgent: boolean;
  hero: { headline: string; subheadline: string; visualConcept: string };
  primaryCta: string;
  secondaryCta: string;
  storyArc: string;
  /**
   * Customer-facing engagement steps (ADR-034). The storyArc is INTERNAL
   * framework language ("Dream → Doubt → …") and must never render as copy;
   * these are the real step names a homeowner reads on the page.
   */
  customerJourney: string[];
  keyMessages: string[];
  aesthetic: string;
  moodKeywords: string[];
  colourDirection: string[];
  typographyDirection: string;
  photographyStyle: string;
  videoStyle: string;
  shotList: string[];
  animationIntensity: "subtle" | "balanced" | "bold";
  animationSignatureMoments: string[];
  trustSignals: string[];
  accreditations: string[];
  interactiveTools: string[];
  /** SEO intent modifiers, e.g. "emergency", "cost", "ideas". */
  seoModifiers: string[];
  contentPillars: string[];
}

const ARCHETYPE_KEYWORDS: Array<[TradeArchetype, ReadonlyArray<string>]> = [
  // Order matters — most specific first.
  [
    "premium",
    ["interior design", "architect", "bespoke", "luxury", "high-end", "high end", "designer kitchen", "detailing", "swimming pool"],
  ],
  [
    "event",
    ["wedding", "photograph", "videograph", "cater", "event", "florist", "entertain", "dj"],
  ],
  [
    "care",
    ["dent", "physio", "chiro", "care home", "carer", "funeral", "optic", "clinic", "aesthetic", "cosmetic", "therap", "podiat", "vet", "hair", "beauty", "spa"],
  ],
  [
    "recurring",
    ["cleaning", "cleaner", "garden", "window clean", "maintenance", "lawn", "grounds", "waste"],
  ],
  [
    "emergency",
    // "emergency glazing"/"glazier" = boarding-up urgency; plain "glazing"
    // belongs to double-glazing PROJECT trades (v2 taxonomy expansion).
    ["plumb", "heating", "boiler", "gas", "electric", "locksmith", "drain", "emergency glazing", "glazier", "pest", "lock", "damp", "hvac", "air con"],
  ],
  [
    "project",
    ["kitchen", "bathroom", "extension", "roof", "landscap", "driveway", "paving", "plaster", "floor", "window", "glazing", "build", "joiner", "carpent", "paint", "decorat", "render", "loft", "conversion", "fencing", "brick", "tiling", "tiler", "scaffold", "conservator", "orangery", "tarmac", "surfacing", "artificial grass", "chimney", "fireplace", "stove"],
  ],
];

/** Classify a trade into its archetype by keyword. */
export function classifyArchetype(tradeLower: string): TradeArchetype {
  for (const [archetype, keywords] of ARCHETYPE_KEYWORDS) {
    if (keywords.some((keyword) => tradeLower.includes(keyword))) {
      return archetype;
    }
  }
  return "general";
}

/** Trade-specific accreditations (UK), where the trade is recognised. */
function accreditationsFor(tradeLower: string): string[] {
  const map: Array<[ReadonlyArray<string>, ReadonlyArray<string>]> = [
    [["plumb", "heating", "boiler", "gas"], ["Gas Safe registered", "CIPHE / WaterSafe"]],
    [["electric", "electrician"], ["NICEIC approved", "Part P certified"]],
    [["roof"], ["NFRC member", "CompetentRoofer"]],
    [["window", "glazing", "glazier"], ["FENSA / CERTASS registered"]],
    [["build", "extension", "brick", "render", "plaster"], ["FMB member", "TrustMark"]],
    [["dent"], ["GDC registered"]],
    [["physio", "chiro", "podiat", "therap"], ["HCPC / professional-body registered"]],
    [["landscap", "garden", "driveway", "paving"], ["APL / Marshalls-accredited installer"]],
  ];
  for (const [keywords, accreditations] of map) {
    if (keywords.some((keyword) => tradeLower.includes(keyword))) {
      return [...accreditations];
    }
  }
  return ["TrustMark", "Which? Trusted Trader"];
}

/**
 * Build the resolved strategic profile for a business. This is the heart of the
 * intelligence: one coherent thesis and archetype-specific reasoning.
 */
export function buildTradeProfile(
  business: string,
  trade: string,
  tradeLower: string,
  location: string,
): TradeProfile {
  const archetype = classifyArchetype(tradeLower);
  const accreditations = accreditationsFor(tradeLower);

  switch (archetype) {
    case "emergency":
      return {
        archetype,
        buyingMode:
          "Reactive and urgent — chosen in a moment of stress, usually on a phone.",
        positioning: `The ${tradeLower} ${location} can actually reach — real people, real response, no call-centre runaround.`,
        thesis: `Win the anxious, mobile-first moment: be the fastest, most human, most reassuring ${tradeLower} on the page.`,
        dominantEmotions: ["anxiety → relief", "reassurance", "regained control"],
        primaryObjection:
          "Will they actually turn up quickly — and not spring a surprise bill?",
        decisionTriggers: [
          "speed of response",
          "upfront, visible pricing",
          "genuine local reviews",
          "one-tap call",
        ],
        isUrgent: true,
        hero: {
          headline: `${location}'s most responsive ${tradeLower}`,
          subheadline: `${business} — we actually answer: fast response, upfront pricing, and the job done right the first time.`,
          visualConcept: `Calm-in-a-crisis: a real ${business} engineer answering and arriving fast in a recognisable ${location} setting, shot to reassure, not alarm.`,
        },
        primaryCta: "Call now",
        secondaryCta: "Get a fast quote",
        storyArc: `Panic (something has failed) → Relief (${business} answers, fast) → Certainty (a real person, a clear price) → Resolution (sorted and guaranteed).`,
        customerJourney: [
          "Your call answered by a real person",
          "A clear price before any work starts",
          "Rapid response and the problem made safe",
          "Fixed properly, tidied up and guaranteed",
        ],
        keyMessages: [
          "We answer — fast",
          "Upfront pricing, no nasty surprises",
          `Local ${location} team, not a call centre`,
          "Guaranteed workmanship",
        ],
        aesthetic: "Confident and reassuring, engineered for a stressed thumb",
        moodKeywords: ["reassuring", "fast", "human", "in-control", "local"],
        colourDirection: [
          "confident blue (calm authority)",
          "a warm high-visibility accent for the call button",
          "clean high-contrast for instant mobile clarity",
        ],
        typographyDirection:
          "Large, high-contrast, instantly legible — readable at arm's length in a hurry.",
        photographyStyle: `Real ${business} people answering the phone and arriving on-site in ${location} — competent and calm.`,
        videoStyle:
          "Short, steadying clips: the call answered, the van arriving, the problem solved.",
        shotList: [
          `${business} answering the phone, real and unstaged`,
          `${business} van/engineer arriving in a ${location} street`,
          "the fix in progress, close and competent",
          "a relieved, reassured customer",
        ],
        animationIntensity: "subtle",
        animationSignatureMoments: [
          "an always-visible, gently pulsing call button",
          "a live 'typical response time' that reassures",
          "fast, no-nonsense section reveals",
        ],
        trustSignals: [
          "response-time promise",
          "genuine recent reviews",
          "workmanship guarantee",
          ...accreditations,
        ],
        accreditations,
        interactiveTools: [
          "one-tap sticky call button",
          "instant callback request",
          `live ${location} service-area & response-time map`,
          "transparent price guide",
        ],
        seoModifiers: ["emergency", "near me", "24 hour", "same day", "cost"],
        contentPillars: [
          `emergency ${tradeLower} guides ("what to do when…")`,
          "transparent pricing",
          `${location} & surrounding-area pages`,
          "genuine reviews & case studies",
        ],
      };

    case "project":
      return {
        archetype,
        buyingMode:
          "Considered and high-value — researched and compared over days or weeks.",
        positioning: `A ${tradeLower} that treats your home like a showpiece, not a job — design-led, meticulous, finished properly.`,
        thesis: `Win the considered buyer: show the finished dream, prove the craft, then de-risk the decision.`,
        dominantEmotions: ["aspiration", "pride", "excitement", "fear of a botched job"],
        primaryObjection:
          "Will it look as good as I imagine — and will they finish it properly, on time and on budget?",
        decisionTriggers: [
          "a portfolio of finished work",
          "reviews and references",
          "a clear process and timeline",
          "guarantees",
        ],
        isUrgent: false,
        hero: {
          headline: `${location}'s finest ${tradeLower}, done properly`,
          subheadline: `${business} — design-led ${tradeLower} in ${location}, with a finish you'll be proud to show off.`,
          visualConcept: `A cinematic reveal of a stunning finished ${tradeLower} project, shot at true golden hour — warm, low sun raking the finished surface, long soft shadows — with a before/after that lands the transformation.`,
        },
        primaryCta: "Book a free design consultation",
        secondaryCta: "See recent projects",
        storyArc: `Dream (imagine the finished space) → Doubt (fear of choosing the wrong ${tradeLower}) → Guide (${business}'s proven process & portfolio) → Transformation (the finished result, guaranteed).`,
        customerJourney: [
          "A design consultation at your home",
          "A detailed written quote — itemised, no surprises",
          "Precision groundwork and preparation",
          "The finished result, walked through together",
        ],
        keyMessages: [
          "A finish worth showing off",
          "Design-led — not just fitted",
          "A clear process, no surprises",
          "Guaranteed workmanship",
        ],
        aesthetic: "Aspirational and crafted — let the work be the hero",
        moodKeywords: ["aspirational", "crafted", "premium", "transformational", "meticulous"],
        colourDirection: [
          "rich, warm neutrals (craft and warmth)",
          "a single refined accent (premium feel)",
          "generous whitespace so the work breathes",
        ],
        typographyDirection:
          "An elegant display face for headings paired with a clean, readable body — editorial, not shouty.",
        photographyStyle: `Magazine-quality photography of finished ${tradeLower} projects, plus before/after and craftsmanship close-ups.`,
        videoStyle:
          "A slow, cinematic project reveal — from empty space to finished transformation.",
        shotList: [
          "the hero finished project, styled and lit like a magazine",
          "a genuine before/after pairing",
          "craftsmanship close-ups (materials, detail)",
          "a delighted homeowner in the finished space",
        ],
        animationIntensity: "balanced",
        animationSignatureMoments: [
          "a scroll-driven before/after reveal",
          "portfolio pieces that rise gently into view",
          "a cinematic hero transition",
        ],
        trustSignals: [
          "a portfolio of finished projects",
          "reviews and references",
          "clear guarantees",
          ...accreditations,
        ],
        accreditations,
        interactiveTools: [
          "before/after slider",
          "filterable project gallery (by style)",
          "design-consultation booking",
          "guide-price estimator",
        ],
        seoModifiers: ["cost", "ideas", "near me", "quotes", "companies"],
        contentPillars: [
          "project galleries & case studies",
          `"cost of ${tradeLower}" guides`,
          "design inspiration",
          `${location} & area pages`,
        ],
      };

    case "premium":
      return {
        archetype,
        buyingMode:
          "Aspirational and relationship-led — bought on taste, pedigree, and confidence.",
        positioning: `Bespoke ${tradeLower} for people who refuse to compromise.`,
        thesis: `Sell taste and certainty: restraint, editorial polish, and proof of exceptional outcomes.`,
        dominantEmotions: ["aspiration", "status", "confidence", "delight"],
        primaryObjection:
          "Do they have the taste and pedigree to deliver something genuinely special?",
        decisionTriggers: [
          "an editorial-grade portfolio",
          "a signature style",
          "press, awards, or notable clients",
          "discretion and service",
        ],
        isUrgent: false,
        hero: {
          headline: `Bespoke ${tradeLower}, without compromise`,
          subheadline: `${business} — ${tradeLower} in ${location} for those who want something truly their own.`,
          visualConcept: `Editorial, art-directed imagery of signature work — expansive, restrained, unmistakably premium.`,
        },
        primaryCta: "Enquire",
        secondaryCta: "View the portfolio",
        storyArc: `Aspiration (a vision of something exceptional) → Trust (${business}'s signature and pedigree) → Collaboration (a considered, personal process) → Realisation (a result beyond expectation).`,
        customerJourney: [
          "A private consultation, at your convenience",
          "A considered proposal, crafted around your home",
          "Meticulous execution by our own team",
          "The reveal — finished to the last detail",
        ],
        keyMessages: [
          "A signature style, unmistakably yours",
          "Considered, personal, and precise",
          "Proof, not promises",
          "Service that anticipates",
        ],
        aesthetic: "Luxury and editorial — restraint over decoration",
        moodKeywords: ["luxury", "editorial", "restrained", "sophisticated", "timeless"],
        colourDirection: [
          "deep, muted tones (sophistication)",
          "a tonal or metallic accent (understated luxury)",
          "expansive negative space (editorial calm)",
        ],
        typographyDirection:
          "A refined high-contrast serif for display with an impeccable sans body — a design-press feel.",
        photographyStyle: `Art-directed, editorial photography of ${business}'s signature ${tradeLower} work.`,
        videoStyle: "Slow, elegant, film-like — atmosphere over information.",
        shotList: [
          "a signature project, art-directed",
          "material and detail studies",
          "the studio / craft in progress",
          "the finished result at golden hour",
        ],
        animationIntensity: "balanced",
        animationSignatureMoments: [
          "slow, refined parallax on hero imagery",
          "elegant fades between portfolio pieces",
          "restrained, precise micro-interactions",
        ],
        trustSignals: [
          "an editorial portfolio",
          "press / awards",
          "notable clients & testimonials",
          ...accreditations,
        ],
        accreditations,
        interactiveTools: [
          "immersive portfolio",
          "a lookbook / gallery",
          "a private enquiry form",
          "a considered process walkthrough",
        ],
        seoModifiers: ["luxury", "bespoke", "designer", "near me"],
        contentPillars: [
          "signature project stories",
          "the design philosophy / process",
          "press & recognition",
          `${location} & premium-area pages`,
        ],
      };

    case "care":
      return {
        archetype,
        buyingMode:
          "Trust-critical and personal — chosen on empathy as much as credentials.",
        positioning: `${trade} that treats you like a person, not a number — gentle, unhurried, and genuinely caring.`,
        thesis: `Lead with warmth and credibility; remove the fear and awkwardness before you sell anything.`,
        dominantEmotions: ["reassurance", "calm", "being cared for", "dignity"],
        primaryObjection:
          "Will I be judged, rushed, or hurt — can I trust them with something this personal?",
        decisionTriggers: [
          "real patient / client stories",
          "credentials and registration",
          "a gentle, welcoming tone",
          "clear, honest pricing",
        ],
        isUrgent: false,
        hero: {
          headline: `Gentle, expert ${tradeLower} in ${location}`,
          subheadline: `${business} — unhurried, welcoming care from a team you can genuinely trust.`,
          visualConcept: `Warm, human, softly-lit imagery of real people being cared for — calm and reassuring, never clinical.`,
        },
        primaryCta: "Book a consultation",
        secondaryCta: "Request a callback",
        storyArc: `Worry (a personal concern) → Welcome (a warm, unhurried first visit) → Care (expert, gentle treatment) → Confidence (relief and renewed trust).`,
        customerJourney: [
          "A warm, unhurried first visit",
          "A clear plan, explained properly",
          "Expert, gentle treatment",
          "Aftercare that checks in on you",
        ],
        keyMessages: [
          "Gentle, unhurried care",
          "Genuinely qualified and registered",
          "No judgement, ever",
          "Clear, honest pricing",
        ],
        aesthetic: "Warm, calm, and human — reassurance over clinical",
        moodKeywords: ["warm", "calm", "reassuring", "trusted", "human"],
        colourDirection: [
          "soft, warm neutrals (comfort)",
          "a calm, healthful accent (trust)",
          "plenty of light and breathing room",
        ],
        typographyDirection:
          "A friendly, humanist sans — approachable and highly legible for all ages.",
        photographyStyle: `Warm, authentic photography of the ${business} team and real, comfortable clients — no stock clinics.`,
        videoStyle: "Gentle, welcoming — a reassuring introduction to the team and the space.",
        shotList: [
          "a warm welcome at reception",
          "the team, approachable and real",
          "a calm, comfortable treatment space",
          "a reassured, smiling client",
        ],
        animationIntensity: "subtle",
        animationSignatureMoments: [
          "soft, calming fade-ins",
          "gentle reveals for team & testimonials",
          "no sudden or jarring motion",
        ],
        trustSignals: [
          "real client stories",
          "credentials & registration",
          "meet-the-team",
          ...accreditations,
        ],
        accreditations,
        interactiveTools: [
          "online appointment booking",
          "meet-the-team profiles",
          "patient / client stories",
          "a gentle, clear pricing guide",
        ],
        seoModifiers: ["near me", "reviews", "cost", "private"],
        contentPillars: [
          "reassuring 'what to expect' guides",
          "meet-the-team & credentials",
          "real client stories",
          `${location} & area pages`,
        ],
      };

    case "recurring":
      return {
        archetype,
        buyingMode:
          "Repeat and relationship-based — bought on reliability and ease.",
        positioning: `The ${tradeLower} you'll never have to think about again — reliable, consistent, and quietly excellent.`,
        thesis: `Sell effortless reliability: set-and-forget peace of mind, backed by proof of consistency.`,
        dominantEmotions: ["relief", "ease", "trust", "pride in a well-kept home"],
        primaryObjection:
          "Will they turn up every time — and actually do a good job, consistently?",
        decisionTriggers: [
          "consistency and reviews",
          "easy booking or a simple plan",
          "vetted, friendly staff",
          "flexible, transparent pricing",
        ],
        isUrgent: false,
        hero: {
          headline: `Effortless ${tradeLower} in ${location}`,
          subheadline: `${business} — reliable, consistent ${tradeLower} you can set and forget.`,
          visualConcept: `Bright, fresh imagery of pristine results and a friendly, vetted team — dependable and easy.`,
        },
        primaryCta: "Get a free quote",
        secondaryCta: "See our plans",
        storyArc: `Hassle (one more thing to manage) → Handover (${business} takes it off your plate) → Consistency (reliable, every time) → Peace of mind (never think about it again).`,
        customerJourney: [
          "A quick walkthrough and a fixed quote",
          "Your regular slot, booked in",
          "The same standard, every single visit",
          "Easy to pause, change or cancel",
        ],
        keyMessages: [
          "Reliable, every single time",
          "Vetted, friendly team",
          "Simple booking & flexible plans",
          "Consistently excellent results",
        ],
        aesthetic: "Fresh, friendly, and effortless",
        moodKeywords: ["fresh", "reliable", "friendly", "effortless", "consistent"],
        colourDirection: [
          "fresh, clean tones (spotless results)",
          "a friendly, energetic accent",
          "light, uncluttered layouts",
        ],
        typographyDirection:
          "A clean, friendly sans — simple, warm, and effortless to scan.",
        photographyStyle: `Bright, real photography of ${business}'s spotless results and a friendly, uniformed team in ${location}.`,
        videoStyle: "Upbeat and light — the ease of a reliable, recurring service.",
        shotList: [
          "a pristine 'after' result",
          "the friendly, vetted team at work",
          "an easy handover with a happy customer",
          "consistency over time",
        ],
        animationIntensity: "subtle",
        animationSignatureMoments: [
          "clean, cheerful reveals",
          "an easy, obvious booking flow",
          "light, friendly micro-interactions",
        ],
        trustSignals: [
          "consistent reviews over time",
          "vetted & insured staff",
          "satisfaction guarantee",
          ...accreditations,
        ],
        accreditations,
        interactiveTools: [
          "instant online quote",
          "a simple plan selector",
          `${location} service-area map`,
          "one-tap re-book",
        ],
        seoModifiers: ["near me", "prices", "regular", "reviews"],
        contentPillars: [
          "'how it works' & pricing",
          "before/after results",
          "reviews & consistency proof",
          `${location} & area pages`,
        ],
      };

    case "event":
      return {
        archetype,
        buyingMode:
          "Emotional and once-in-a-lifetime — bought on connection and portfolio.",
        positioning: `${trade} for the day you'll remember forever — warm, unobtrusive, and endlessly capable.`,
        thesis: `Sell the feeling and the memory; prove it with a portfolio that moves people and real couples' words.`,
        dominantEmotions: ["excitement", "love", "trust", "reassurance it will be perfect"],
        primaryObjection:
          "Will they 'get' us and capture the day perfectly — and is our date even free?",
        decisionTriggers: [
          "a portfolio that moves you",
          "real reviews and stories",
          "personality and connection",
          "availability for the date",
        ],
        isUrgent: false,
        hero: {
          headline: `${trade} for the day you'll never forget`,
          subheadline: `${business} — warm, unobtrusive ${tradeLower} in ${location} that captures the feeling, not just the moment.`,
          visualConcept: `An emotive, cinematic montage of real moments — warm, timeless, and genuinely moving.`,
        },
        primaryCta: "Check your date",
        secondaryCta: "See the portfolio",
        storyArc: `The dream day (imagine it perfectly) → The fear (what if it's not captured?) → The guide (${business}'s portfolio & warmth) → The memory (relived forever).`,
        customerJourney: [
          "A relaxed first chat about your day",
          "A tailored plan and transparent pricing",
          "The day itself, handled calmly",
          "Your memories, beautifully delivered",
        ],
        keyMessages: [
          "We capture the feeling, not just the moment",
          "Warm and unobtrusive on the day",
          "Real couples, real stories",
          "Your date, secured",
        ],
        aesthetic: "Romantic, warm, and timeless",
        moodKeywords: ["romantic", "warm", "timeless", "authentic", "joyful"],
        colourDirection: [
          "warm, soft tones (romance)",
          "an elegant, timeless accent",
          "imagery-led layouts that let moments breathe",
        ],
        typographyDirection:
          "An elegant display face with a warm, readable body — heartfelt, not corporate.",
        photographyStyle: `Emotive, natural photography of real ${tradeLower} moments — candid, warm, and beautifully lit.`,
        videoStyle: "A moving, cinematic highlight film — feeling over format.",
        shotList: [
          "an emotional candid moment",
          "the wider scene, beautifully composed",
          "genuine reactions and joy",
          "a timeless, framed final image",
        ],
        animationIntensity: "balanced",
        animationSignatureMoments: [
          "an emotive full-bleed hero montage",
          "gallery images that fade in like memories",
          "a warm, cinematic scroll",
        ],
        trustSignals: [
          "a moving portfolio",
          "real couples' reviews",
          "clear packages",
          ...accreditations,
        ],
        accreditations,
        interactiveTools: [
          "immersive portfolio galleries",
          "an availability / date checker",
          "real couples' stories",
          "a clear package explorer",
        ],
        seoModifiers: ["near me", "prices", "packages"],
        contentPillars: [
          "real weddings / events",
          "packages & what to expect",
          "genuine reviews",
          `${location} & venue pages`,
        ],
      };

    case "general":
    default:
      return {
        archetype: "general",
        buyingMode: "Considered local service — chosen on trust and proof.",
        positioning: `The ${tradeLower} that does what it says — and proves it.`,
        thesis: `Earn trust fast: lead with proof, clarity, and a confident, human tone.`,
        dominantEmotions: ["confidence", "reassurance", "local pride"],
        primaryObjection: "Can I trust them to do a good job at a fair price?",
        decisionTriggers: [
          "genuine reviews",
          "clear, upfront pricing",
          "accreditations",
          "easy contact",
        ],
        isUrgent: false,
        hero: {
          headline: `${location}'s ${tradeLower}, done right`,
          subheadline: `${business} — honest, reliable ${tradeLower} with a finish you can trust.`,
          visualConcept: `Confident, authentic imagery of ${business}'s real work and team in ${location}.`,
        },
        primaryCta: "Get a free quote",
        secondaryCta: "See our work",
        storyArc: `A need (the job to be done) → A guide (${business}, proven and local) → A simple plan → Sorted, and guaranteed.`,
        customerJourney: [
          "A quick call to understand the job",
          "A clear, fixed quote",
          "The work done properly, first time",
          "Tidied up, checked and guaranteed",
        ],
        keyMessages: [
          `Local ${tradeLower} you can trust`,
          "Clear, upfront pricing",
          "Proven by real reviews",
          "Guaranteed workmanship",
        ],
        aesthetic: "Premium, clean, and confidence-building",
        moodKeywords: ["trustworthy", "professional", "local", "clear", "confident"],
        colourDirection: [
          "deep, confident tones (authority)",
          "a warm accent (approachability)",
          "clean neutrals (clarity)",
        ],
        typographyDirection:
          "A strong, legible sans for headings with a highly readable body face.",
        photographyStyle: `Authentic, well-lit photography of genuine ${tradeLower} work and the ${business} team in ${location}.`,
        videoStyle: "Short, confident clips of real work and results.",
        shotList: [
          `${business} team on-site in ${location}`,
          "skilled work in progress",
          "a finished result to be proud of",
          "a satisfied local customer",
        ],
        animationIntensity: "balanced",
        animationSignatureMoments: [
          "a confident hero reveal",
          "reviews & trust badges rising into view",
          "smooth section transitions",
        ],
        trustSignals: [
          "genuine reviews",
          "clear guarantees",
          "years in business",
          ...accreditations,
        ],
        accreditations,
        interactiveTools: [
          "instant quote form",
          "a work / project gallery",
          `${location} service-area map`,
          "click-to-call on mobile",
        ],
        seoModifiers: ["near me", "cost", "reviews"],
        contentPillars: [
          `${tradeLower} services`,
          `${location} & area pages`,
          "frequently asked questions",
          "reviews & case studies",
        ],
      };
  }
}
