import { loadRecommendations } from "../api/decisions";
import { RecommendationList } from "./recommendation-list";

/**
 * Recommendations (ADR-050) — the Decision Engine's surface: server-side
 * load through the memory spine, client-side founder controls.
 */
export async function Recommendations() {
  const { recommendations, backend } = await loadRecommendations();
  return <RecommendationList recommendations={recommendations} backend={backend} />;
}
