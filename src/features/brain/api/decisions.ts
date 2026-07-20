import "server-only";

/**
 * Decision Engine data seam (ADR-050): spine → graph (+ feed) → ranked
 * recommendations. Issues are logged to the learning feed ONCE per
 * recommendation id; the top few are narrated through the reasoner seam
 * (deterministic text stands whenever the reasoner declines).
 */

import {
  brainReasonerBackend,
  resolveBrainReasoner,
} from "@/core/ask-brain";
import {
  generateRecommendations,
  narrateRecommendation,
  type Recommendation,
} from "@/core/brain-orchestrator";
import { resolveBusinessSpine } from "@/core/business";
import {
  buildKnowledgeGraph,
  loadMemorySnapshot,
  resolveLearningFeed,
} from "@/core/memory-spine";

export interface NarratedRecommendation extends Recommendation {
  /** Reasoner phrasing over the deterministic payload — optional polish. */
  narrated?: string;
}

export interface RecommendationsPayload {
  recommendations: NarratedRecommendation[];
  backend: "anthropic" | "deterministic";
  generatedAt: string;
}

/** How many top recommendations get reasoner narration per load. */
const NARRATE_TOP = 3;

export async function loadRecommendations(): Promise<RecommendationsPayload> {
  const [spine, feed] = await Promise.all([
    resolveBusinessSpine(),
    resolveLearningFeed(),
  ]);
  const [snapshot, observations] = await Promise.all([
    loadMemorySnapshot(spine),
    feed.list({ limit: 500 }),
  ]);
  const now = new Date().toISOString();
  const graph = buildKnowledgeGraph(snapshot);
  const recommendations = generateRecommendations({ graph, observations, now });

  // Log each FIRST issuance (the feed is the memory of what was recommended).
  const alreadyIssued = new Set(
    observations
      .filter((observation) => observation.kind === "recommendation_issued")
      .map((observation) => observation.payload?.recommendationId)
      .filter((id): id is string => typeof id === "string"),
  );
  for (const recommendation of recommendations) {
    if (alreadyIssued.has(recommendation.id)) continue;
    await feed
      .append({
        kind: "recommendation_issued",
        summary: recommendation.recommendedAction,
        payload: {
          recommendationId: recommendation.id,
          rule: recommendation.rule,
          urgency: recommendation.urgency,
          score: recommendation.score,
        },
        source: "decision-engine",
      })
      .catch(() => undefined); // logging must never break the surface
  }

  const backend = brainReasonerBackend();
  const narrated: NarratedRecommendation[] = [...recommendations];
  if (backend === "anthropic" && narrated.length > 0) {
    const reasoner = await resolveBrainReasoner();
    const phrasings = await Promise.all(
      narrated
        .slice(0, NARRATE_TOP)
        .map((recommendation) => narrateRecommendation(recommendation, reasoner)),
    );
    phrasings.forEach((phrase, index) => {
      if (phrase) narrated[index] = { ...narrated[index], narrated: phrase };
    });
  }

  return { recommendations: narrated, backend, generatedAt: now };
}
