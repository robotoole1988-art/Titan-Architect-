/**
 * Section Primitive Registry — the typed catalogue of composable sections.
 *
 * Every section a generated blueprint may contain is a **named primitive** in
 * this registry. Registry ids are the ONLY legal values a generator may write
 * into `SectionBlueprint.identifier` and `ComponentBlueprint.type`; the future
 * Renderer composes hand-crafted premium primitives 1:1 from these ids and
 * never free-generates layout (ADR-021).
 *
 * Each primitive declares its legal variants, which trade archetypes it serves
 * best, the content slots a generator must populate, and which cross-cutting
 * aspects (animation / interaction / media) it supports. The prose fields on a
 * blueprint (purpose, headline direction, cinematic treatment) remain direction
 * and explainability — never the composition mechanism.
 */

import type { TradeArchetype } from "@/core/experience-strategy";

/** Which cross-cutting aspects a primitive supports. */
export interface PrimitiveAspects {
  readonly animation: boolean;
  readonly interaction: boolean;
  readonly media: boolean;
}

/** One named, composable section primitive. */
export interface SectionPrimitive {
  /** Namespaced id, e.g. "hero.cinematic-reveal". */
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** The legal variants a blueprint may select (via `extensions.variant`). */
  readonly variants: ReadonlyArray<string>;
  /** The archetypes this primitive serves best — guidance, not law. */
  readonly archetypeAffinities: ReadonlyArray<TradeArchetype>;
  /** Content slots a generator MUST populate ("slot: direction" entries). */
  readonly contentSlots: ReadonlyArray<string>;
  readonly aspects: PrimitiveAspects;
}

/** The registry shape: primitives keyed by their id. */
export type PrimitiveRegistry = Readonly<Record<string, SectionPrimitive>>;

const ALL_ARCHETYPES: ReadonlyArray<TradeArchetype> = [
  "emergency",
  "project",
  "premium",
  "care",
  "technical",
  "recurring",
  "event",
  "general",
];

const PRIMITIVES: ReadonlyArray<SectionPrimitive> = [
  {
    id: "hero.cinematic-reveal",
    name: "Cinematic Reveal Hero",
    description:
      "A full-viewport cinematic opening that lands the positioning in one held breath — imagery-led, headline-forward, one primary action.",
    variants: ["full-bleed", "split-editorial", "video-backdrop"],
    archetypeAffinities: ["project", "premium", "care", "technical", "recurring", "event", "general"],
    contentSlots: ["headline", "subheadline", "primary-cta", "backdrop-direction"],
    aspects: { animation: true, interaction: false, media: true },
  },
  {
    id: "hero.rapid-response",
    name: "Rapid Response Hero",
    description:
      "An urgency-first opening built for a stressed thumb: instant reassurance, a one-tap call, and a visible response promise.",
    variants: ["call-first", "quote-first"],
    archetypeAffinities: ["emergency"],
    contentSlots: ["headline", "subheadline", "primary-cta", "response-promise"],
    aspects: { animation: true, interaction: true, media: true },
  },
  {
    id: "story.transformation-arc",
    name: "Transformation Arc",
    description:
      "A scroll-paced narrative that walks the visitor through the strategy's story arc — from the problem or dream to the finished transformation.",
    variants: ["scroll-narrative", "chaptered"],
    archetypeAffinities: ["project", "premium", "event"],
    contentSlots: ["narrative-arc", "key-messages"],
    aspects: { animation: true, interaction: false, media: true },
  },
  {
    id: "story.gentle-welcome",
    name: "Gentle Welcome",
    description:
      "A soft, unhurried introduction that removes fear before anything is sold — warm imagery, reassuring tone, progressive disclosure.",
    variants: ["soft-intro", "meet-the-practice"],
    archetypeAffinities: ["care"],
    contentSlots: ["welcome-message", "reassurances"],
    aspects: { animation: true, interaction: false, media: true },
  },
  {
    id: "proof.credential-band",
    name: "Credential Band",
    description:
      "A compact strip of accreditations, guarantees, and registrations — scannable proof that de-risks the decision at a glance.",
    variants: ["badge-row", "inline-strip"],
    archetypeAffinities: ["emergency", "project", "care", "technical", "recurring", "general"],
    contentSlots: ["credentials"],
    aspects: { animation: false, interaction: false, media: false },
  },
  {
    id: "proof.portfolio-showcase",
    name: "Portfolio Showcase",
    description:
      "Finished work presented as the hero of the argument — galleries, case studies, and before/after reveals that prove the craft.",
    variants: ["filterable-grid", "cinematic-carousel", "before-after-reveal"],
    archetypeAffinities: ["project", "premium", "technical", "event", "general"],
    contentSlots: ["portfolio-direction", "captions-direction"],
    aspects: { animation: true, interaction: true, media: true },
  },
  {
    id: "services.interactive-explorer",
    name: "Interactive Service Explorer",
    description:
      "The service offer made explorable — visitors drill into what's offered, how it works, and what it costs, without leaving the page.",
    variants: ["tabbed", "card-grid", "guided-accordion"],
    archetypeAffinities: ["emergency", "project", "care", "technical", "recurring", "general"],
    contentSlots: ["services", "service-explainers"],
    aspects: { animation: true, interaction: true, media: true },
  },
  {
    id: "conversion.emergency-cta",
    name: "Emergency Call To Action",
    description:
      "A high-visibility conversion moment for urgent buyers — a sticky or full-width action that is always one tap from help.",
    variants: ["sticky-call-bar", "full-width-banner"],
    archetypeAffinities: ["emergency"],
    contentSlots: ["cta-label", "reassurance"],
    aspects: { animation: true, interaction: true, media: false },
  },
  {
    id: "conversion.lead-capture",
    name: "Lead Capture",
    description:
      "The page's committed next step — a low-friction form, callback request, or booking flow matched to how this trade's customers buy.",
    variants: ["short-form", "multi-step", "callback-request", "consultation-booking"],
    archetypeAffinities: ALL_ARCHETYPES,
    contentSlots: ["objective", "fields", "cta-label"],
    aspects: { animation: false, interaction: true, media: false },
  },
  {
    id: "trust.review-wall",
    name: "Review Wall",
    description:
      "Genuine customer voices at scale — reviews arranged to answer the visitor's real objection with social proof, not claims.",
    variants: ["carousel", "masonry", "spotlight"],
    archetypeAffinities: ALL_ARCHETYPES,
    contentSlots: ["review-themes", "attribution-direction"],
    aspects: { animation: true, interaction: true, media: false },
  },
  {
    id: "trust.team-introduction",
    name: "Team Introduction",
    description:
      "The real people behind the service — portraits, credentials, and a human tone that turns an anonymous business into a trusted one.",
    variants: ["portrait-grid", "spotlight-profiles"],
    archetypeAffinities: ["care", "recurring", "general"],
    contentSlots: ["team-direction", "credentials"],
    aspects: { animation: true, interaction: false, media: true },
  },
  {
    id: "location.service-area",
    name: "Service Area",
    description:
      "Where the business actually operates — a map or area list that grounds the service locally and reassures on coverage and response.",
    variants: ["map-focus", "area-list"],
    archetypeAffinities: ["emergency", "project", "technical", "recurring", "general"],
    contentSlots: ["coverage", "response-notes"],
    aspects: { animation: false, interaction: true, media: true },
  },
  {
    id: "process.journey-map",
    name: "Process Journey Map",
    description:
      "The engagement made predictable — numbered steps or a timeline that shows exactly what happens from enquiry to completion.",
    variants: ["numbered-steps", "timeline"],
    archetypeAffinities: ["project", "premium", "care", "technical", "recurring", "general"],
    contentSlots: ["steps", "guarantees"],
    aspects: { animation: true, interaction: false, media: false },
  },
  {
    id: "faq.reassurance-accordion",
    name: "Reassurance FAQ",
    description:
      "The questions visitors actually ask, answered plainly — objection handling that doubles as long-tail SEO surface.",
    variants: ["accordion", "two-column"],
    archetypeAffinities: ALL_ARCHETYPES,
    contentSlots: ["questions-direction"],
    aspects: { animation: false, interaction: true, media: false },
  },
  {
    id: "gallery.immersive-grid",
    name: "Immersive Gallery",
    description:
      "An imagery-led, full-attention gallery for businesses whose work is bought with the eyes — expansive, editorial, unhurried.",
    variants: ["masonry", "full-bleed-slider"],
    archetypeAffinities: ["premium", "event"],
    contentSlots: ["gallery-direction"],
    aspects: { animation: true, interaction: true, media: true },
  },
  {
    id: "legal.privacy-policy",
    name: "Privacy Policy",
    description:
      "The site's UK GDPR privacy notice — what the enquiry form collects, why, the lawful basis, retention, data-subject rights, the cookie position, and that the site operates on the business's behalf — populated from real business details, never fabricated.",
    variants: ["standard"],
    archetypeAffinities: ALL_ARCHETYPES,
    contentSlots: [
      "controller",
      "collected",
      "purpose",
      "lawful-basis",
      "retention",
      "rights",
      "contact",
      "cookies",
      "processor",
    ],
    aspects: { animation: false, interaction: false, media: false },
  },
  {
    id: "legal.legal-notice",
    name: "Terms & Legal Notice",
    description:
      "The site's terms and legal notice — business identity, service terms, a liability limitation, governing law (England & Wales), and contact.",
    variants: ["standard"],
    archetypeAffinities: ALL_ARCHETYPES,
    contentSlots: ["identity", "service-terms", "liability", "governing-law", "contact"],
    aspects: { animation: false, interaction: false, media: false },
  },
];

/**
 * The registry: every legal section primitive, keyed by id. ~10–15 entries by
 * design — a curated catalogue of hand-craftable premium sections, not an open
 * component namespace.
 */
export const SECTION_PRIMITIVE_REGISTRY: PrimitiveRegistry = Object.fromEntries(
  PRIMITIVES.map((primitive) => [primitive.id, primitive]),
);

/** Look a primitive up by id; undefined when the id is not registered. */
export function getSectionPrimitive(
  registry: PrimitiveRegistry,
  id: string,
): SectionPrimitive | undefined {
  return registry[id];
}
