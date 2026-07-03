/**
 * The PrimitiveComponentMap: registry primitive id → the hand-crafted React
 * component that realises it (ADR-022). The Renderer composes 1:1 from these
 * ids and never free-generates layout (ADR-021). The emergency (ADR-022) and
 * premium/project (ADR-029) sets are crafted; the care/recurring primitives
 * resolve to the labelled placeholder until their crafted components land.
 */

import {
  SECTION_PRIMITIVE_REGISTRY,
  getSectionPrimitive,
} from "@/core/website-blueprint";
import { ConversionEmergencyCta } from "../primitives/conversion-emergency-cta";
import { GalleryImmersiveGrid } from "../primitives/gallery-immersive-grid";
import { HeroCinematicReveal } from "../primitives/hero-cinematic-reveal";
import { ProofPortfolioShowcase } from "../primitives/proof-portfolio-showcase";
import { ConversionLeadCapture } from "../primitives/conversion-lead-capture";
import { FaqReassuranceAccordion } from "../primitives/faq-reassurance-accordion";
import { HeroRapidResponse } from "../primitives/hero-rapid-response";
import { LocationServiceArea } from "../primitives/location-service-area";
import { ProcessJourneyMap } from "../primitives/process-journey-map";
import { ProofCredentialBand } from "../primitives/proof-credential-band";
import { ServicesInteractiveExplorer } from "../primitives/services-interactive-explorer";
import { PremiumSectionPlaceholder } from "../primitives/premium-placeholder";
import { StoryTransformationArc } from "../primitives/story-transformation-arc";
import { TrustReviewWall } from "../primitives/trust-review-wall";
import type { PrimitiveComponent, PrimitiveComponentMap } from "./types";

export const PRIMITIVE_COMPONENT_MAP: PrimitiveComponentMap = {
  "hero.rapid-response": HeroRapidResponse,
  "hero.cinematic-reveal": HeroCinematicReveal,
  "proof.portfolio-showcase": ProofPortfolioShowcase,
  "gallery.immersive-grid": GalleryImmersiveGrid,
  "conversion.emergency-cta": ConversionEmergencyCta,
  "conversion.lead-capture": ConversionLeadCapture,
  "trust.review-wall": TrustReviewWall,
  "proof.credential-band": ProofCredentialBand,
  "services.interactive-explorer": ServicesInteractiveExplorer,
  "location.service-area": LocationServiceArea,
  "process.journey-map": ProcessJourneyMap,
  "faq.reassurance-accordion": FaqReassuranceAccordion,
  "story.transformation-arc": StoryTransformationArc,
};

/**
 * Resolution NEVER misses for a registry primitive: crafted component where
 * built, the labelled premium placeholder where not (any variant — the variant
 * rides in as a prop, so unknown variants land on the primitive's default
 * component). Null only for identifiers outside the registry entirely.
 */
export function resolvePrimitiveComponent(
  identifier: string,
  map: PrimitiveComponentMap = PRIMITIVE_COMPONENT_MAP,
): PrimitiveComponent | null {
  const crafted = map[identifier];
  if (crafted) return crafted;
  if (getSectionPrimitive(SECTION_PRIMITIVE_REGISTRY, identifier)) {
    return PremiumSectionPlaceholder;
  }
  return null;
}
