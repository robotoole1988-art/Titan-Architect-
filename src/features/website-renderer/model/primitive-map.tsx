/**
 * The PrimitiveComponentMap: registry primitive id → the hand-crafted React
 * component that realises it (ADR-022). The Renderer composes 1:1 from these
 * ids and never free-generates layout (ADR-021). v1 maps the emergency-
 * archetype homepage sequence plus the transformation arc; other primitives
 * fail loudly in development until their crafted components land.
 */

import { ConversionEmergencyCta } from "../primitives/conversion-emergency-cta";
import { ConversionLeadCapture } from "../primitives/conversion-lead-capture";
import { FaqReassuranceAccordion } from "../primitives/faq-reassurance-accordion";
import { HeroRapidResponse } from "../primitives/hero-rapid-response";
import { LocationServiceArea } from "../primitives/location-service-area";
import { ProcessJourneyMap } from "../primitives/process-journey-map";
import { ProofCredentialBand } from "../primitives/proof-credential-band";
import { ServicesInteractiveExplorer } from "../primitives/services-interactive-explorer";
import { StoryTransformationArc } from "../primitives/story-transformation-arc";
import { TrustReviewWall } from "../primitives/trust-review-wall";
import type { PrimitiveComponentMap } from "./types";

export const PRIMITIVE_COMPONENT_MAP: PrimitiveComponentMap = {
  "hero.rapid-response": HeroRapidResponse,
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
