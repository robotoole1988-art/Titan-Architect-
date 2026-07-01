import type { ExperienceStrategyRequest } from "@/core/experience-strategy";

/**
 * The sample business the studio showcases (v0.1). Mock/local only — the studio
 * renders the Experience Strategy Generator's output for this request. Later,
 * the request will come from a real selected customer.
 */
export const MOCK_STUDIO_REQUEST: ExperienceStrategyRequest = {
  businessName: "Rapid Response Plumbing",
  trade: "Plumbing",
  location: "Manchester",
};
