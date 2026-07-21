/**
 * Founder-facing archetype labels for the variant pills (ADR-055) — taste
 * words, not taxonomy ids. The prospect never needs to hear "archetype".
 */

import type { TradeArchetype } from "@/core/experience-strategy";

const LABELS: Record<TradeArchetype, string> = {
  emergency: "Rapid response",
  project: "Craftsmanship",
  premium: "Premium",
  care: "Warm & personal",
  technical: "Precision",
  recurring: "Dependable",
  event: "Occasion",
  general: "Classic",
};

export function archetypeLabel(archetype: TradeArchetype): string {
  return LABELS[archetype];
}
