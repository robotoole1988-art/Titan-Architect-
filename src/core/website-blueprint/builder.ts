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
  type ExperienceStrategy,
  type TradeArchetype,
} from "@/core/experience-strategy";
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
      return [
        `narrative-arc: ${storytelling.narrativeArc}`,
        `key-messages: ${storytelling.keyMessages.join(" · ")}`,
      ];
    case "story.gentle-welcome":
      return [
        `welcome-message: ${storytelling.summary}`,
        `reassurances: Address "${conversionStrategy.summary}" in a warm, unhurried voice — emotional register: ${storytelling.emotionalHooks.join(", ")}.`,
      ];
    case "proof.credential-band":
      return [`credentials: ${conversionStrategy.trustSignals.join(" · ")}`];
    case "proof.portfolio-showcase":
      return [
        `portfolio-direction: ${mediaDirection.photographyStyle}`,
        `captions-direction: Caption each piece with the outcome, not the task — reinforce "${storytelling.keyMessages[0]}".`,
      ];
    case "services.interactive-explorer":
      return [
        `services: The core ${trade} services in ${meta.location}, organised around the content pillars: ${seoStrategy.contentPillars.join(" · ")}.`,
        `service-explainers: Explain each service through the key messages — ${storytelling.keyMessages.join(" · ")}.`,
      ];
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
    case "trust.team-introduction":
      return [
        `team-direction: ${mediaDirection.photographyStyle}`,
        `credentials: ${conversionStrategy.trustSignals.join(" · ")}`,
      ];
    case "location.service-area":
      return [
        `coverage: ${meta.location} and surrounding areas — anchor the local terms: ${seoStrategy.localKeywords.join(", ")}.`,
        `response-notes: ${mobileStrategy.summary}`,
      ];
    case "process.journey-map":
      return [
        `steps: Map the engagement to the narrative arc — ${storytelling.narrativeArc}`,
        `guarantees: Close each step with proof: ${conversionStrategy.trustSignals.join(" · ")}.`,
      ];
    case "faq.reassurance-accordion":
      return [
        `questions-direction: Answer the objection behind "${conversionStrategy.summary}" and the questions implied by: ${seoStrategy.contentPillars.join(" · ")}.`,
      ];
    case "gallery.immersive-grid":
      return [
        `gallery-direction: ${mediaDirection.photographyStyle} Shot priorities: ${mediaDirection.shotList.join(" · ")}.`,
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
): SectionBlueprint {
  const primitive = SECTION_PRIMITIVE_REGISTRY[plan.primitive];
  if (!primitive) {
    throw new Error(
      `Archetype sequence references unregistered primitive "${plan.primitive}"`,
    );
  }

  const sectionId = `home.${String(index + 1).padStart(2, "0")}.${primitive.id}`;
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

function buildHomePage(
  strategy: ExperienceStrategy,
  archetype: TradeArchetype,
): PageBlueprint {
  const sections = ARCHETYPE_SEQUENCES[archetype].map((plan, index) =>
    buildSection(plan, index, strategy, archetype),
  );
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
      positioning: strategy.visualDirection.summary,
      voice: strategy.visualDirection.moodKeywords,
    },
    informationArchitecture: {
      id: "information-architecture",
      confidence: strategyConfidence(
        "Homepage-only architecture; pillars reserved as future pages.",
      ),
      hierarchy: ["home"],
      pillars: strategy.seoStrategy.contentPillars,
    },
    navigation: {
      id: "navigation",
      confidence: strategyConfidence("Single-page navigation for a homepage-only blueprint."),
      items: [
        {
          id: "navigation.home",
          confidence: strategyConfidence("The only page in this blueprint."),
          label: "Home",
          toPageId: "home",
        },
      ],
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
      confidence: strategyConfidence("Homepage only in this engine version."),
      pages: [homePage],
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
