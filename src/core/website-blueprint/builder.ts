/**
 * Website Blueprint Builder — the first real `WebsiteBlueprintEngine`.
 *
 * Deterministic: Experience Strategy in → Website Blueprint out (homepage
 * only). No AI, no rendering, no side effects, no clocks — the same strategy
 * always produces the same blueprint.
 *
 * The trade archetype drives the structure: each archetype has a fixed,
 * deliberate sequence of section primitives from the registry (ADR-021).
 * Content slots are populated from the strategy's thesis and copy direction;
 * animation/interaction/media aspects are derived from each primitive's
 * declared capabilities and the strategy's animation and interaction strategy.
 * Prose fields (purpose, headline direction, cinematic treatment) are richly
 * populated as direction and explainability — never as the composition
 * mechanism.
 */

import {
  classifyArchetype,
  generateExperienceStrategy,
  type ExperienceStrategy,
  type TradeArchetype,
} from "@/core/experience-strategy";
import { getTradeDefinition, matchTradeId } from "@/core/trade-taxonomy";
import type {
  AnimationBlueprint,
  CallToActionBlueprint,
  InteractionBlueprint,
  MediaBlueprint,
} from "./aspects";
import type { BlueprintConfidence } from "./common";
import type { ComponentBlueprint } from "./components";
import type {
  WebsiteBlueprintDependencies,
  WebsiteBlueprintEngine,
  WebsiteBlueprintRequest,
} from "./engine";
import type { PageBlueprint } from "./page";
import {
  SECTION_PRIMITIVE_REGISTRY,
  type SectionPrimitive,
} from "./registry";
import { resolveFaqBank } from "./faq-content";
import type { BlueprintPriority } from "./common";
import type { SectionBlueprint } from "./section";
import type { WebsiteBlueprint } from "./website-blueprint";
import { WEBSITE_BLUEPRINT_VERSION } from "./website-blueprint";

/** One planned section: a registered primitive + one of its legal variants. */
interface SectionPlan {
  readonly primitive: string;
  readonly variant: string;
}

/**
 * The structural decision per archetype — which primitives, in which order,
 * with which variant. Emergency leads with conversion/trust; premium and
 * project lead with cinematic story and portfolio proof; care opens gently
 * with progressive disclosure.
 */
const ARCHETYPE_SEQUENCES: Record<TradeArchetype, ReadonlyArray<SectionPlan>> = {
  emergency: [
    { primitive: "hero.rapid-response", variant: "call-first" },
    { primitive: "conversion.emergency-cta", variant: "sticky-call-bar" },
    { primitive: "trust.review-wall", variant: "spotlight" },
    { primitive: "proof.credential-band", variant: "badge-row" },
    { primitive: "services.interactive-explorer", variant: "card-grid" },
    { primitive: "location.service-area", variant: "map-focus" },
    { primitive: "process.journey-map", variant: "numbered-steps" },
    { primitive: "faq.reassurance-accordion", variant: "accordion" },
    { primitive: "conversion.lead-capture", variant: "callback-request" },
  ],
  project: [
    { primitive: "hero.cinematic-reveal", variant: "full-bleed" },
    { primitive: "story.transformation-arc", variant: "scroll-narrative" },
    { primitive: "proof.portfolio-showcase", variant: "before-after-reveal" },
    { primitive: "services.interactive-explorer", variant: "tabbed" },
    { primitive: "process.journey-map", variant: "timeline" },
    { primitive: "trust.review-wall", variant: "carousel" },
    { primitive: "proof.credential-band", variant: "inline-strip" },
    { primitive: "faq.reassurance-accordion", variant: "two-column" },
    { primitive: "conversion.lead-capture", variant: "multi-step" },
  ],
  premium: [
    { primitive: "hero.cinematic-reveal", variant: "video-backdrop" },
    { primitive: "story.transformation-arc", variant: "chaptered" },
    { primitive: "proof.portfolio-showcase", variant: "cinematic-carousel" },
    { primitive: "gallery.immersive-grid", variant: "full-bleed-slider" },
    { primitive: "process.journey-map", variant: "timeline" },
    { primitive: "trust.review-wall", variant: "spotlight" },
    { primitive: "conversion.lead-capture", variant: "consultation-booking" },
  ],
  care: [
    { primitive: "hero.cinematic-reveal", variant: "split-editorial" },
    { primitive: "story.gentle-welcome", variant: "soft-intro" },
    { primitive: "trust.team-introduction", variant: "portrait-grid" },
    { primitive: "proof.credential-band", variant: "badge-row" },
    { primitive: "services.interactive-explorer", variant: "guided-accordion" },
    { primitive: "trust.review-wall", variant: "carousel" },
    { primitive: "faq.reassurance-accordion", variant: "accordion" },
    { primitive: "conversion.lead-capture", variant: "consultation-booking" },
  ],
  // Skilled / energy-tech installers (ADR-044) — capability-led: lead with the
  // certifications, make the offer explorable, show the clean install process
  // and real workmanship, then a fixed-quote flow.
  technical: [
    { primitive: "hero.cinematic-reveal", variant: "split-editorial" },
    { primitive: "proof.credential-band", variant: "badge-row" },
    { primitive: "services.interactive-explorer", variant: "card-grid" },
    { primitive: "process.journey-map", variant: "numbered-steps" },
    { primitive: "proof.portfolio-showcase", variant: "filterable-grid" },
    { primitive: "trust.review-wall", variant: "carousel" },
    { primitive: "location.service-area", variant: "map-focus" },
    { primitive: "faq.reassurance-accordion", variant: "accordion" },
    { primitive: "conversion.lead-capture", variant: "multi-step" },
  ],
  recurring: [
    { primitive: "hero.cinematic-reveal", variant: "full-bleed" },
    { primitive: "services.interactive-explorer", variant: "card-grid" },
    { primitive: "process.journey-map", variant: "numbered-steps" },
    { primitive: "trust.review-wall", variant: "masonry" },
    { primitive: "location.service-area", variant: "area-list" },
    { primitive: "proof.credential-band", variant: "inline-strip" },
    { primitive: "faq.reassurance-accordion", variant: "accordion" },
    { primitive: "conversion.lead-capture", variant: "short-form" },
  ],
  event: [
    { primitive: "hero.cinematic-reveal", variant: "video-backdrop" },
    { primitive: "gallery.immersive-grid", variant: "masonry" },
    { primitive: "story.transformation-arc", variant: "scroll-narrative" },
    { primitive: "trust.review-wall", variant: "spotlight" },
    { primitive: "proof.portfolio-showcase", variant: "cinematic-carousel" },
    { primitive: "faq.reassurance-accordion", variant: "two-column" },
    { primitive: "conversion.lead-capture", variant: "multi-step" },
  ],
  general: [
    { primitive: "hero.cinematic-reveal", variant: "full-bleed" },
    { primitive: "proof.credential-band", variant: "badge-row" },
    { primitive: "services.interactive-explorer", variant: "card-grid" },
    { primitive: "trust.review-wall", variant: "carousel" },
    { primitive: "proof.portfolio-showcase", variant: "filterable-grid" },
    { primitive: "location.service-area", variant: "map-focus" },
    { primitive: "process.journey-map", variant: "numbered-steps" },
    { primitive: "faq.reassurance-accordion", variant: "accordion" },
    { primitive: "conversion.lead-capture", variant: "short-form" },
  ],
};

/** Family of a primitive id — the namespace before the dot. */
function familyOf(primitiveId: string): string {
  return primitiveId.split(".")[0];
}

function confidenceFor(
  primitive: SectionPrimitive,
  archetype: TradeArchetype,
  reasoningRef: string,
): BlueprintConfidence {
  const affinity = primitive.archetypeAffinities.includes(archetype);
  return {
    score: affinity ? 0.9 : 0.7,
    reasoningRef,
    sources: [
      { source: "experience-strategy", detail: `archetype: ${archetype}` },
      { source: "primitive-registry", detail: primitive.id },
    ],
  };
}

function strategyConfidence(reasoningRef: string): BlueprintConfidence {
  return {
    score: 0.85,
    reasoningRef,
    sources: [{ source: "experience-strategy" }],
  };
}

/** Deterministic CTA intent from its label. */
function ctaIntent(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes("call")) return "call";
  if (lower.includes("book") || lower.includes("consultation")) return "book";
  if (lower.includes("enquir")) return "enquire";
  if (lower.includes("date")) return "check-availability";
  return "quote";
}

/** Populate a primitive's required content slots from the strategy. */
function contentFor(
  primitiveId: string,
  strategy: ExperienceStrategy,
): ReadonlyArray<string> {
  const { meta, heroConcept, storytelling, conversionStrategy, mediaDirection, seoStrategy, mobileStrategy } = strategy;
  const trade = meta.trade.toLowerCase();
  // Stored strategy artifacts from before ADR-034 lack customerJourney —
  // fall back to the general-archetype steps rather than leaking arc names.
  const customerJourney =
    storytelling.customerJourney && storytelling.customerJourney.length > 0
      ? storytelling.customerJourney
      : [
          "A quick call to understand the job",
          "A clear, fixed quote",
          "The work done properly, first time",
          "Tidied up, checked and guaranteed",
        ];

  switch (primitiveId) {
    case "hero.cinematic-reveal":
      return [
        `headline: ${heroConcept.headline}`,
        `subheadline: ${heroConcept.subheadline}`,
        `primary-cta: ${heroConcept.primaryCta}`,
        `backdrop-direction: ${heroConcept.visualConcept}`,
      ];
    case "hero.rapid-response":
      return [
        `headline: ${heroConcept.headline}`,
        `subheadline: ${heroConcept.subheadline}`,
        `primary-cta: ${heroConcept.primaryCta}`,
        `response-promise: Lead with the response promise — ${conversionStrategy.trustSignals[0]} — stated plainly, above the fold.`,
      ];
    case "story.transformation-arc":
      // narrative-arc stays as INTERNAL rationale; the renderer draws visible
      // copy only from arc-headline + journey-steps (ADR-034).
      return [
        `narrative-arc: ${storytelling.narrativeArc}`,
        `arc-headline: ${storytelling.keyMessages[0]}`,
        `journey-steps: ${customerJourney.join(" · ")}`,
        `key-messages: ${storytelling.keyMessages.join(" · ")}`,
      ];
    case "story.gentle-welcome":
      // Real, customer-facing reassurance points come from the strategy's key
      // messages (gentle care, qualified & registered, no judgement, honest
      // pricing) — warm copy, never internal direction.
      return [
        `headline: A warm welcome to ${meta.businessName}`,
        `welcome-message: ${storytelling.summary}`,
        `reassurances: ${storytelling.keyMessages.join(" · ")}`,
      ];
    case "proof.credential-band":
      return [`credentials: ${conversionStrategy.trustSignals.join(" · ")}`];
    case "proof.portfolio-showcase":
      return [
        `portfolio-direction: ${mediaDirection.photographyStyle}`,
        `captions-direction: Caption each piece with the outcome, not the task — reinforce "${storytelling.keyMessages[0]}".`,
      ];
    case "services.interactive-explorer": {
      // The explorable offer is the trade's REAL services/surfaces from the
      // canonical taxonomy (ADR-026/029) — what customers actually choose
      // between — falling back to the SEO pillars for unclassified trades.
      const tradeId = matchTradeId(meta.trade);
      const services = (tradeId && getTradeDefinition(tradeId)?.services) || [];
      const anchors =
        services.length >= 2 ? services : seoStrategy.contentPillars;
      return [
        `services: The core ${trade} services in ${meta.location}, organised around the surfaces and services customers choose: ${anchors.join(" · ")}.`,
        `service-explainers: Explain each service through the key messages — ${storytelling.keyMessages.join(" · ")}.`,
      ];
    }
    case "conversion.emergency-cta":
      return [
        `cta-label: ${conversionStrategy.primaryCta}`,
        `reassurance: ${conversionStrategy.summary}`,
      ];
    case "conversion.lead-capture":
      return [
        `objective: ${conversionStrategy.summary}`,
        `fields: ${conversionStrategy.leadCaptureFlows.join(" · ")}`,
        `cta-label: ${conversionStrategy.primaryCta}`,
      ];
    case "trust.review-wall":
      return [
        `review-themes: Curate reviews that echo the key messages — ${storytelling.keyMessages.join(" · ")}.`,
        `attribution-direction: Real, named customers in and around ${meta.location} — recent, specific, verifiable.`,
      ];
    case "trust.team-introduction": {
      // Honest by construction: portraits are art-directed slots that only
      // populate from REAL approved team media; the credibility substance is
      // the REAL accreditations (GDC, HCPC…), NOT the broader trust signals the
      // credential-band already shows — so the two never duplicate (ADR-043).
      // Fall back to trust signals for strategy artifacts saved before ADR-043.
      const accreditations =
        conversionStrategy.accreditations && conversionStrategy.accreditations.length > 0
          ? conversionStrategy.accreditations
          : conversionStrategy.trustSignals;
      return [
        `headline: The people behind ${meta.businessName}`,
        `intro: Qualified, registered, and genuinely on your side — the team who will look after you.`,
        `team-direction: ${mediaDirection.photographyStyle}`,
        `credentials: ${accreditations.join(" · ")}`,
      ];
    }
    case "location.service-area":
      return [
        `coverage: ${meta.location} and surrounding areas — anchor the local terms: ${seoStrategy.localKeywords.join(", ")}.`,
        `response-notes: ${mobileStrategy.summary}`,
      ];
    case "process.journey-map":
      // Real customer step names — arc metadata is never copy (ADR-034).
      return [
        `steps: ${customerJourney.join(" · ")}`,
        `steps-headline: How it works — from first call to finished ${trade}`,
        `guarantees: Close each step with proof: ${conversionStrategy.trustSignals.join(" · ")}.`,
      ];
    case "faq.reassurance-accordion": {
      // Real, researched Q&A from the trade bank (ADR-047) rides the `qa:`
      // channel the renderer + FAQPage JSON-LD already consume. No bank →
      // no qa slots → the honest ADR-034 collapse.
      const bank = resolveFaqBank({ trade: meta.trade });
      return [
        `questions-direction: Answer the objection behind "${conversionStrategy.summary}" and the questions implied by: ${seoStrategy.contentPillars.join(" · ")}.`,
        ...(bank?.qas.map((qa) => `qa: ${qa.question} | ${qa.answer}`) ?? []),
      ];
    }
    case "gallery.immersive-grid":
      return [
        `gallery-direction: ${mediaDirection.photographyStyle} Shot priorities: ${mediaDirection.shotList.join(" · ")}.`,
      ];
    case "legal.privacy-policy":
      // Crafted UK-GDPR baseline, parameterised with the business's real
      // details (ADR-045). The controller CONTACT is supplied at serve time
      // from the Business record; this slot is the honest fallback.
      return [
        `controller: ${meta.businessName}${meta.location ? `, ${meta.location}` : ""} is the data controller for the information you submit through this site.`,
        `collected: Your name, phone number, and email address — only what you enter in the enquiry form. Nothing is collected in the background.`,
        `purpose: To respond to your enquiry and provide the ${trade} service you asked about. Your details are not sold, and are not used for anything else.`,
        `lawful-basis: Legitimate interests — responding to an enquiry you started — and, where you opt in, your consent.`,
        `retention: Enquiry details are kept only as long as needed to handle your request and for a reasonable follow-up period, then securely deleted.`,
        `rights: access · rectification · erasure · restriction · objection · data portability · complaint to the ICO (ico.org.uk)`,
        `contact: To ask a question or exercise any of your rights, contact ${meta.businessName} using the details on this site.`,
        `cookies: This site sets no tracking cookies and uses no third-party trackers. Visits are measured first-party as anonymous daily totals only — never per person.`,
        `processor: This website is operated on behalf of ${meta.businessName} by TITAN, which acts as a data processor under ${meta.businessName}'s instructions.`,
      ];
    case "legal.legal-notice":
      return [
        `identity: ${meta.businessName} — ${meta.trade} in ${meta.location}.`,
        `service-terms: These terms cover use of this website and any enquiry you send through it. The specifics of any work — scope, price, and timing — are agreed with you separately in writing before it begins.`,
        `liability: ${meta.businessName} takes care to keep this site accurate but is not liable for indirect or consequential loss arising from its use. Nothing here limits any liability that cannot be limited by law, including for death or personal injury caused by negligence.`,
        `governing-law: These terms are governed by the law of England & Wales, and the courts of England & Wales have exclusive jurisdiction.`,
        `contact: For anything about these terms, contact ${meta.businessName} using the details on this site.`,
      ];
    default:
      return [];
  }
}

/** Rich, per-family purpose prose — direction and explainability. */
function purposeFor(
  primitive: SectionPrimitive,
  strategy: ExperienceStrategy,
): string {
  const thesis = strategy.storytelling.summary;
  switch (familyOf(primitive.id)) {
    case "hero":
      return `${primitive.description} It must land the strategy's thesis — ${thesis} — and answer the visitor's first question before a single scroll.`;
    case "story":
      return `${primitive.description} It paces the emotional journey (${strategy.storytelling.emotionalHooks.join(" → ")}) so the visitor feels understood before being sold to.`;
    case "proof":
      return `${primitive.description} It converts the strategy's claims into evidence the visitor can verify.`;
    case "services":
      return `${primitive.description} It turns "${strategy.interactiveFeatures.summary}" into an explorable offer.`;
    case "conversion":
      return `${primitive.description} ${strategy.conversionStrategy.summary}`;
    case "trust":
      return `${primitive.description} It answers the visitor's real objection with proof, in their own words.`;
    case "location":
      return `${primitive.description} It grounds ${strategy.meta.businessName} unmistakably in ${strategy.meta.location}.`;
    case "process":
      return `${primitive.description} It removes the fear of the unknown from the decision.`;
    case "faq":
      return `${primitive.description} It resolves the last objections standing between interest and action.`;
    case "gallery":
      return `${primitive.description} The work is the argument; this section lets it speak uninterrupted.`;
    default:
      return primitive.description;
  }
}

const PRIORITY_BY_FAMILY: Record<string, BlueprintPriority> = {
  hero: "critical",
  conversion: "critical",
  trust: "high",
  proof: "high",
  services: "high",
  story: "medium",
  process: "medium",
  location: "medium",
  faq: "medium",
  gallery: "medium",
};

const CONVERSION_IMPORTANCE_BY_FAMILY: Record<string, number> = {
  hero: 0.9,
  conversion: 1,
  trust: 0.7,
  proof: 0.7,
  services: 0.6,
  story: 0.5,
  process: 0.4,
  location: 0.4,
  faq: 0.5,
  gallery: 0.5,
};

const INTERACTION_TYPE_BY_PRIMITIVE: Record<string, string> = {
  "hero.rapid-response": "one-tap-call",
  "conversion.emergency-cta": "sticky-call",
  "conversion.lead-capture": "lead-form",
  "services.interactive-explorer": "service-explorer",
  "trust.review-wall": "review-browser",
  "location.service-area": "service-area-map",
  "faq.reassurance-accordion": "disclosure-accordion",
  "proof.portfolio-showcase": "gallery-filter",
  "gallery.immersive-grid": "immersive-lightbox",
};

function expectedEmotionFor(
  primitive: SectionPrimitive,
  strategy: ExperienceStrategy,
): string {
  const hooks = strategy.storytelling.emotionalHooks;
  switch (familyOf(primitive.id)) {
    case "hero":
    case "story":
      return hooks[0];
    case "trust":
    case "proof":
      return hooks[1] ?? hooks[0];
    case "conversion":
      return hooks[hooks.length - 1];
    default:
      return hooks[0];
  }
}

function buildAnimation(
  sectionId: string,
  primitive: SectionPrimitive,
  strategy: ExperienceStrategy,
  archetype: TradeArchetype,
): AnimationBlueprint | undefined {
  if (!primitive.aspects.animation) return undefined;
  return {
    id: `${sectionId}.animation`,
    confidence: confidenceFor(
      primitive,
      archetype,
      "Animation aspect derived from the primitive's declared capability and the strategy's animation strategy.",
    ),
    principles: strategy.animationStrategy.principles,
    trigger: familyOf(primitive.id) === "hero" ? "load" : "scroll",
    intensity: strategy.animationStrategy.intensity,
  };
}

function buildInteractions(
  sectionId: string,
  primitive: SectionPrimitive,
  strategy: ExperienceStrategy,
  archetype: TradeArchetype,
): ReadonlyArray<InteractionBlueprint> | undefined {
  if (!primitive.aspects.interaction) return undefined;
  return [
    {
      id: `${sectionId}.interaction`,
      confidence: confidenceFor(
        primitive,
        archetype,
        "Interaction aspect derived from the primitive's declared capability and the strategy's interactive features.",
      ),
      type: INTERACTION_TYPE_BY_PRIMITIVE[primitive.id] ?? "explorer",
      behaviour: strategy.interactiveFeatures.summary,
    },
  ];
}

function buildMedia(
  sectionId: string,
  primitive: SectionPrimitive,
  variant: string,
  strategy: ExperienceStrategy,
  archetype: TradeArchetype,
): ReadonlyArray<MediaBlueprint> | undefined {
  if (!primitive.aspects.media) return undefined;
  return [
    {
      id: `${sectionId}.media`,
      confidence: confidenceFor(
        primitive,
        archetype,
        "Media aspect derived from the primitive's declared capability and the strategy's media direction.",
      ),
      kind: variant.includes("video") ? "video" : "image",
      purpose: `Primary media for the ${primitive.name} section.`,
      direction: strategy.mediaDirection.photographyStyle,
      generationRef: `media/${sectionId}`,
    },
  ];
}

function buildCta(
  sectionId: string,
  strategy: ExperienceStrategy,
): CallToActionBlueprint {
  const label = strategy.conversionStrategy.primaryCta;
  return {
    id: `${sectionId}.cta`,
    confidence: strategyConfidence(
      "Primary call to action taken directly from the conversion strategy.",
    ),
    label,
    intent: ctaIntent(label),
  };
}

function buildSection(
  plan: SectionPlan,
  index: number,
  strategy: ExperienceStrategy,
  archetype: TradeArchetype,
  pageId = "home",
): SectionBlueprint {
  const primitive = SECTION_PRIMITIVE_REGISTRY[plan.primitive];
  if (!primitive) {
    throw new Error(
      `Archetype sequence references unregistered primitive "${plan.primitive}"`,
    );
  }

  const sectionId = `${pageId}.${String(index + 1).padStart(2, "0")}.${primitive.id}`;
  const family = familyOf(primitive.id);
  const isHero = family === "hero";
  const needsCta = isHero || family === "conversion";

  const component: ComponentBlueprint = {
    id: `${sectionId}.component`,
    type: primitive.id,
    confidence: confidenceFor(
      primitive,
      archetype,
      `The Renderer composes the hand-crafted "${primitive.name}" primitive (variant: ${plan.variant}) 1:1 from this id.`,
    ),
    purpose: purposeFor(primitive, strategy),
    contentRequirements: contentFor(primitive.id, strategy),
    ...(needsCta ? { cta: buildCta(sectionId, strategy) } : {}),
    extensions: { primitive: primitive.id, variant: plan.variant },
  };

  return {
    id: sectionId,
    identifier: primitive.id,
    confidence: confidenceFor(
      primitive,
      archetype,
      `Chosen because the "${archetype}" archetype buys this way; ${primitive.name} answers that buying mode at position ${index + 1}.`,
    ),
    purpose: purposeFor(primitive, strategy),
    priority: PRIORITY_BY_FAMILY[family] ?? "medium",
    expectedEmotion: expectedEmotionFor(primitive, strategy),
    conversionImportance: CONVERSION_IMPORTANCE_BY_FAMILY[family] ?? 0.4,
    contentRequirements: contentFor(primitive.id, strategy),
    suggestedComponents: [component],
    animation: buildAnimation(sectionId, primitive, strategy, archetype),
    interaction: buildInteractions(sectionId, primitive, strategy, archetype),
    media: buildMedia(sectionId, primitive, plan.variant, strategy, archetype),
    futureAiNotes: [
      `A future Brain may re-rank this section or swap its variant (legal variants: ${primitive.variants.join(", ")}) based on live performance.`,
    ],
    extensions: {
      primitive: primitive.id,
      variant: plan.variant,
      ...(isHero
        ? {
            headlineDirection: `${strategy.heroConcept.headline} — spoken in the strategy's voice: ${strategy.visualDirection.moodKeywords.join(", ")}.`,
            cinematicTreatment: strategy.heroConcept.visualConcept,
          }
        : {}),
    },
  };
}

/** URL-safe slug for a page (areas). Never emits leading/trailing hyphens. */
export function pageSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * A legal variant for a primitive, rotated deterministically by `shift` and
 * (when possible) avoiding `avoid` — structural variety across area pages.
 */
function rotatedVariant(
  primitiveId: string,
  avoid: string | undefined,
  shift: number,
): string {
  const variants = SECTION_PRIMITIVE_REGISTRY[primitiveId].variants;
  const pool = avoid && variants.length > 1
    ? variants.filter((variant) => variant !== avoid)
    : variants;
  return pool[shift % pool.length];
}

/**
 * The area-page sequence (ADR-028): landing-page intent, conversion-forward —
 * localised hero, trust, services, area coverage, area FAQ, strong capture.
 * Deliberately NOT the homepage sequence (anti-doorway policy), and variants
 * rotate per area so no two area pages share an identical structure signature.
 */
function areaSequence(
  archetype: TradeArchetype,
  areaIndex: number,
): ReadonlyArray<SectionPlan> {
  const home = ARCHETYPE_SEQUENCES[archetype];
  const homeHero = home[0];
  const homeCapture = home.find((plan) => plan.primitive === "conversion.lead-capture");
  return [
    {
      primitive: homeHero.primitive,
      variant: rotatedVariant(homeHero.primitive, homeHero.variant, areaIndex),
    },
    {
      primitive: "trust.review-wall",
      variant: rotatedVariant("trust.review-wall", undefined, areaIndex),
    },
    {
      primitive: "services.interactive-explorer",
      variant: rotatedVariant("services.interactive-explorer", undefined, areaIndex + 1),
    },
    {
      primitive: "location.service-area",
      variant: rotatedVariant("location.service-area", undefined, areaIndex),
    },
    {
      primitive: "faq.reassurance-accordion",
      variant: rotatedVariant("faq.reassurance-accordion", undefined, areaIndex),
    },
    { primitive: "conversion.lead-capture", variant: homeCapture?.variant ?? "short-form" },
  ];
}

/** Replace (or append) one "slot: direction" entry. */
function withSlot(
  requirements: ReadonlyArray<string>,
  slot: string,
  direction: string,
): ReadonlyArray<string> {
  const entry = `${slot}: ${direction}`;
  const index = requirements.findIndex((req) => req.startsWith(`${slot}:`));
  if (index === -1) return [...requirements, entry];
  return requirements.map((req, i) => (i === index ? entry : req));
}

/**
 * Localise an area section's slots (ADR-028): the area name is woven into the
 * headline and FAQ; trust gains an explicit, honest area-proof brief.
 */
function localiseAreaSection(
  section: SectionBlueprint,
  primitiveId: string,
  area: string,
  strategy: ExperienceStrategy,
): SectionBlueprint {
  let requirements = section.contentRequirements ?? [];
  if (familyOf(primitiveId) === "hero") {
    const headline =
      requirements
        .find((req) => req.startsWith("headline:"))
        ?.slice("headline:".length)
        .trim() ?? "";
    if (!headline.includes(area)) {
      requirements = withSlot(requirements, "headline", `${headline} — ${area}`);
    }
  }
  if (primitiveId === "faq.reassurance-accordion") {
    requirements = withSlot(
      requirements,
      "questions-direction",
      `The questions ${area} customers actually ask before choosing ${strategy.meta.trade.toLowerCase()} — answer the objection behind "${strategy.conversionStrategy.summary}" with ${area}-specific answers: ${strategy.seoStrategy.contentPillars.join(" · ")}.`,
    );
  }
  if (primitiveId === "trust.review-wall") {
    requirements = [
      ...requirements,
      `area-proof: Real jobs and reviews from ${area} — populate from verified ${area} work when it exists; until then this slot is an explicit empty-state brief, never fabricated.`,
    ];
  }
  if (primitiveId === "location.service-area") {
    // The radar must ground the visitor in THEIR area (area-page bug fix):
    // centre/label the page's area; the renderer shows the base as a
    // secondary "based in …" point. Coverage heading re-anchors to match.
    requirements = withSlot(requirements, "focus-place", area);
    requirements = withSlot(
      requirements,
      "coverage",
      `${area} and surrounding areas — anchor the local terms: ${strategy.seoStrategy.localKeywords.join(", ")}.`,
    );
  }
  return {
    ...section,
    contentRequirements: requirements,
    suggestedComponents: section.suggestedComponents?.map((component) => ({
      ...component,
      contentRequirements: requirements,
    })),
  };
}

/**
 * One area landing page. The strategy is REGENERATED with the area as its
 * location, so headlines, local keywords, and coverage copy are genuinely
 * localised — then slots are explicitly area-woven on top.
 */
function buildAreaPage(
  area: string,
  areaIndex: number,
  base: ExperienceStrategy,
  archetype: TradeArchetype,
): PageBlueprint {
  const slug = pageSlug(area);
  const pageId = `area.${slug}`;
  const areaStrategy = generateExperienceStrategy({
    businessName: base.meta.businessName,
    trade: base.meta.trade,
    location: area,
  });
  const sections = areaSequence(archetype, areaIndex).map((plan, index) =>
    localiseAreaSection(
      buildSection(plan, index, areaStrategy, archetype, pageId),
      plan.primitive,
      area,
      areaStrategy,
    ),
  );
  const subheadline = areaStrategy.heroConcept.subheadline;

  return {
    id: pageId,
    confidence: strategyConfidence(
      `Area landing page for ${area} — conversion-forward landing sequence, localised strategy (anti-doorway policy, ADR-028).`,
    ),
    name: area,
    type: "landing",
    purpose: `Land ${base.meta.businessName} as THE ${base.meta.trade.toLowerCase()} choice in ${area}: locally credible, one clear next step.`,
    targetAudience: `${area} customers searching for ${base.meta.trade.toLowerCase()} near them.`,
    primaryConversionGoal: areaStrategy.conversionStrategy.primaryCta,
    seoIntent: `Own local search for ${base.meta.trade.toLowerCase()} in ${area}.`,
    suggestedUrl: `/${slug}`,
    sections,
    internalLinks: {
      id: `${pageId}.links`,
      confidence: strategyConfidence("Area pages link home; home links every area."),
      links: [
        {
          id: `${pageId}.links.home`,
          confidence: strategyConfidence("Breadcrumb anchor."),
          toPageId: "home",
          anchorText: base.meta.businessName,
          reason: "Every area page anchors back to the homepage (breadcrumb).",
        },
      ],
    },
    seo: {
      id: `${pageId}.seo`,
      confidence: strategyConfidence(
        "Area-page SEO derived from the area-localised strategy.",
      ),
      intent: `Local landing page for ${area}.`,
      titleDirection: `${base.meta.businessName} — ${base.meta.trade} in ${area}`,
      metaDescriptionDirection: subheadline.includes(area)
        ? subheadline
        : `${subheadline} Serving ${area}.`,
      targetKeywords: areaStrategy.seoStrategy.localKeywords,
      headingsOutline: sections.map((section) => section.identifier),
      schemaOpportunities: ["LocalBusiness", "Service", "FAQPage", "BreadcrumbList"],
    },
    extensions: { area, areaSlug: slug },
  };
}

/**
 * The anti-doorway gate (ADR-028): the generator REFUSES to emit area pages
 * that copy the homepage structure or read as near-copies of each other.
 */
function enforceAreaDifferentiation(
  home: PageBlueprint,
  areas: ReadonlyArray<PageBlueprint>,
): void {
  const homeSequence = home.sections.map((section) => section.identifier).join("|");
  const seen = new Map<string, string>();
  for (const page of areas) {
    const sequence = page.sections.map((section) => section.identifier).join("|");
    if (sequence === homeSequence) {
      throw new Error(
        `Anti-doorway policy (ADR-028): area page "${page.name}" copies the homepage structure.`,
      );
    }
    const slots = page.sections
      .flatMap((section) => section.contentRequirements ?? [])
      .join("\n");
    const clash = seen.get(slots);
    if (clash) {
      throw new Error(
        `Anti-doorway policy (ADR-028): area pages "${clash}" and "${page.name}" are near-copies.`,
      );
    }
    seen.set(slots, page.name);
  }
}

/**
 * Signature-moment selection (ADR-032, the SIGNATURE-MOMENTS.md laws):
 * ONE per site — the homepage hero, the opening act. Catalogue ids only;
 * trades without a crafted moment get none. Each moment is also gated to
 * the archetypes whose ATMOSPHERE it was designed for — a storm morph over
 * a golden-hour sky would break Act I ("every moment tells the trade's
 * story"). The renderer holds the craft; a future Experience Engine
 * parameterises this SAME catalogue.
 */
const SIGNATURE_MOMENT_BY_TRADE: Record<
  string,
  { moment: string; archetypes: ReadonlyArray<TradeArchetype> }
> = {
  roofing: { moment: "storm-cloud-new-roof", archetypes: ["emergency"] },
  "driveways-paving": {
    moment: "gravel-to-resin",
    archetypes: ["project", "premium"],
  },
};

/**
 * A legal page (ADR-045) — Privacy or Terms — composed of the crafted legal
 * primitive, populated from the business's real details. Universal: built for
 * every site, indexable, in the sitemap; kept OUT of the header nav (footer
 * only) and out of the anti-doorway check (which guards area pages).
 */
function buildLegalPage(
  kind: "privacy" | "terms",
  strategy: ExperienceStrategy,
  archetype: TradeArchetype,
): PageBlueprint {
  const { meta } = strategy;
  const primitiveId =
    kind === "privacy" ? "legal.privacy-policy" : "legal.legal-notice";
  const pageId = `legal.${kind}`;
  const title = kind === "privacy" ? "Privacy Policy" : "Terms & Legal Notice";
  const section = buildSection(
    { primitive: primitiveId, variant: "standard" },
    0,
    strategy,
    archetype,
    pageId,
  );
  const description =
    kind === "privacy"
      ? `How ${meta.businessName} handles the details you submit through this site, and your rights.`
      : `The terms of using ${meta.businessName}'s website, and the governing law (England & Wales).`;
  return {
    id: pageId,
    confidence: strategyConfidence(
      `${title} — a crafted UK legal baseline populated from ${meta.businessName}'s real details (ADR-045).`,
    ),
    name: title,
    type: "legal",
    purpose: `The site's ${title.toLowerCase()} — legally required for a UK site that collects enquiries.`,
    targetAudience: `Visitors and regulators checking how ${meta.businessName} handles data and the site's terms.`,
    primaryConversionGoal: "Understand how their data is handled and the terms of use.",
    seoIntent: `${title} for ${meta.businessName}.`,
    suggestedUrl: `/${kind}`,
    sections: [section],
    seo: {
      id: `${pageId}.seo`,
      confidence: strategyConfidence(
        "Legal-page SEO — indexable and honest; no keyword targeting.",
      ),
      intent: `${title} for ${meta.businessName}.`,
      titleDirection: `${title} — ${meta.businessName}`,
      metaDescriptionDirection: description,
      targetKeywords: [],
      headingsOutline: [primitiveId],
      schemaOpportunities: [],
    },
    extensions: { legal: kind },
  };
}

function buildHomePage(
  strategy: ExperienceStrategy,
  archetype: TradeArchetype,
): PageBlueprint {
  const sections = ARCHETYPE_SEQUENCES[archetype].map((plan, index) =>
    buildSection(plan, index, strategy, archetype),
  );
  const tradeId = matchTradeId(strategy.meta.trade);
  const entry = tradeId ? SIGNATURE_MOMENT_BY_TRADE[tradeId] : undefined;
  if (entry && entry.archetypes.includes(archetype) && sections[0]) {
    sections[0] = {
      ...sections[0],
      extensions: { ...sections[0].extensions, signatureMoment: entry.moment },
    };
  }
  const { conversionStrategy, seoStrategy, mobileStrategy } = strategy;

  return {
    id: "home",
    confidence: strategyConfidence(
      `Homepage structured for the "${archetype}" archetype — the section sequence answers how these customers actually buy.`,
    ),
    name: "Home",
    type: "home",
    purpose: `Land the strategy's thesis in one page: ${strategy.storytelling.summary}`,
    targetAudience: strategy.visualDirection.rationale,
    primaryConversionGoal: conversionStrategy.primaryCta,
    seoIntent: seoStrategy.summary,
    suggestedUrl: "/",
    sections,
    conversion: {
      id: "home.conversion",
      confidence: strategyConfidence(
        "Page conversion goal taken from the conversion strategy.",
      ),
      primaryGoal: conversionStrategy.primaryCta,
      ctas: [buildCta("home", strategy)],
      principles: [conversionStrategy.summary],
    },
    seo: {
      id: "home.seo",
      confidence: strategyConfidence("Page SEO derived from the SEO strategy."),
      intent: seoStrategy.summary,
      titleDirection: `${strategy.meta.businessName} — ${strategy.heroConcept.headline}`,
      metaDescriptionDirection: strategy.heroConcept.subheadline,
      targetKeywords: seoStrategy.primaryKeywords,
      headingsOutline: sections.map((section) => section.identifier),
      schemaOpportunities: seoStrategy.schemaTypes,
    },
    trustElements: {
      id: "home.trust",
      confidence: strategyConfidence(
        "Trust signals taken from the conversion strategy.",
      ),
      signals: conversionStrategy.trustSignals.map((signal, index) => ({
        id: `home.trust.${index + 1}`,
        confidence: strategyConfidence("Trust signal from the strategy."),
        type: "strategy-trust-signal",
        label: signal,
      })),
    },
    responsive: {
      id: "home.responsive",
      confidence: strategyConfidence(
        "Responsive behaviour derived from the mobile strategy.",
      ),
      deviceOrder: ["mobile", "tablet", "desktop"],
      behaviour: mobileStrategy.principles,
    },
    accessibility: {
      id: "home.accessibility",
      confidence: strategyConfidence("Platform accessibility baseline."),
      wcagTarget: "AA",
      requirements: [
        "all interactions operable by keyboard and touch",
        "motion respects prefers-reduced-motion",
        "content readable at 200% zoom",
      ],
    },
    futureAiNotes: [
      "Multi-page blueprints (services, locations, about) are a future engine capability — this version is deliberately homepage-only.",
    ],
  };
}

/**
 * Build a Website Blueprint from an approved Experience Strategy.
 * Deterministic and synchronous; homepage only.
 */
export function buildWebsiteBlueprint(
  request: WebsiteBlueprintRequest,
): WebsiteBlueprint {
  const { strategy } = request;
  const { meta } = strategy;
  const archetype = classifyArchetype(meta.trade.toLowerCase());
  const homePage = buildHomePage(strategy, archetype);
  const coverageAreas = (request.coverageAreas ?? []).filter(
    (area) => area.trim().length > 0,
  );
  const areaPages = coverageAreas.map((area, index) =>
    buildAreaPage(area.trim(), index, strategy, archetype),
  );
  enforceAreaDifferentiation(homePage, areaPages);
  // Legal pages (ADR-045) — Privacy + Terms for EVERY site, required for a UK
  // site that collects enquiries. They join the page collection (routing +
  // sitemap) but NOT the header nav (they belong in the footer), and are
  // excluded from the anti-doorway check above (which guards area pages only).
  const navPages = [homePage, ...areaPages];
  const legalPages = [
    buildLegalPage("privacy", strategy, archetype),
    buildLegalPage("terms", strategy, archetype),
  ];
  const allPages = [...navPages, ...legalPages];

  return {
    id: "website-blueprint.home",
    version: WEBSITE_BLUEPRINT_VERSION,
    confidence: strategyConfidence(
      `Blueprint generated deterministically from the Experience Strategy for ${meta.businessName} ("${archetype}" archetype).`,
    ),
    identity: {
      id: "identity",
      confidence: strategyConfidence("Identity taken from the strategy metadata."),
      businessName: meta.businessName,
      trade: meta.trade,
      location: meta.location,
      ...(coverageAreas.length > 0 ? { coverageAreas } : {}),
      positioning: strategy.visualDirection.summary,
      voice: strategy.visualDirection.moodKeywords,
    },
    informationArchitecture: {
      id: "information-architecture",
      confidence: strategyConfidence(
        coverageAreas.length > 0
          ? "Homepage plus one landing page per coverage area (ADR-028)."
          : "Homepage-only architecture; pillars reserved as future pages.",
      ),
      hierarchy: allPages.map((page) => page.id),
      pillars: strategy.seoStrategy.contentPillars,
    },
    navigation: {
      id: "navigation",
      confidence: strategyConfidence(
        "Primary navigation links the homepage and area pages; legal pages live in the footer (ADR-028/045).",
      ),
      items: navPages.map((page) => ({
        id: `navigation.${page.id}`,
        confidence: strategyConfidence(
          page.type === "home"
            ? "The homepage."
            : `Area landing page for ${page.name}.`,
        ),
        label: page.type === "home" ? "Home" : page.name,
        toPageId: page.id,
      })),
    },
    header: {
      id: "header",
      confidence: strategyConfidence(
        "Header carries the identity and the primary action everywhere.",
      ),
      navigationId: "navigation",
      cta: buildCta("header", strategy),
      contents: [meta.businessName, "primary navigation", "primary call to action"],
    },
    footer: {
      id: "footer",
      confidence: strategyConfidence("Footer grounds trust and contact."),
      navigationId: "navigation",
      contents: [
        `contact details for ${meta.businessName}`,
        `service area: ${meta.location} and surrounding areas`,
        "accreditations and guarantees",
      ],
      legal: ["copyright notice", "privacy policy"],
    },
    pages: {
      id: "pages",
      confidence: strategyConfidence(
        coverageAreas.length > 0
          ? `Homepage + ${areaPages.length} area landing page(s), differentiation enforced (ADR-028).`
          : "Homepage only (no coverage areas recorded).",
      ),
      pages: allPages,
    },
    seo: {
      id: "site.seo",
      confidence: strategyConfidence("Site SEO derived from the SEO strategy."),
      intent: strategy.seoStrategy.summary,
      targetKeywords: strategy.seoStrategy.primaryKeywords,
      schemaOpportunities: strategy.seoStrategy.schemaTypes,
    },
    conversion: {
      id: "site.conversion",
      confidence: strategyConfidence(
        "Site conversion derived from the conversion strategy.",
      ),
      primaryGoal: strategy.conversionStrategy.primaryCta,
      ctas: [buildCta("site", strategy)],
      principles: [strategy.conversionStrategy.summary],
    },
    responsive: {
      id: "site.responsive",
      confidence: strategyConfidence("Mobile-first, from the mobile strategy."),
      deviceOrder: ["mobile", "tablet", "desktop"],
      behaviour: strategy.mobileStrategy.principles,
    },
    designSystem: {
      id: "design-system",
      confidence: strategyConfidence(
        "Theme reference chosen deterministically from the trade archetype; renderers resolve it to a token set.",
      ),
      themeRef: `titan-${archetype}`,
    },
    futureExpansion: {
      id: "future-expansion",
      confidence: strategyConfidence("Explicit growth points for later engine versions."),
      points: [
        {
          id: "future-expansion.pages",
          confidence: strategyConfidence("Reserved."),
          area: "multi-page blueprints",
          note: "Service, location, and about pages generated from the same strategy.",
        },
        {
          id: "future-expansion.media",
          confidence: strategyConfidence("Reserved."),
          area: "media generation",
          note: "Each MediaBlueprint carries a generationRef for a future Media Generator.",
        },
      ],
    },
    extensions: {
      archetype,
      experienceArc: strategy.storytelling.narrativeArc,
    },
  };
}

/**
 * Create the deterministic Website Blueprint Engine. Dependencies are accepted
 * to honour the contract's dependency-inversion seam; this version needs none
 * of them — a Brain-driven engine will.
 */
export function createWebsiteBlueprintEngine(
  dependencies: WebsiteBlueprintDependencies = {},
): WebsiteBlueprintEngine {
  void dependencies;
  return {
    build: (request) => Promise.resolve(buildWebsiteBlueprint(request)),
  };
}
