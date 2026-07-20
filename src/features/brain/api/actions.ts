"use server";

/**
 * Ask the Brain — the surface's data seam (ADR-048).
 *
 * One read path: Business Spine → memory snapshot → knowledge graph (+ the
 * learning feed's observations) → the ask engine, with the reasoner resolved
 * behind its seam. READ-ONLY by construction: the only writes are learning-feed
 * observations recording the question (and, separately, that the founder acted
 * on an answer) — the substrate future ranking learns from.
 */

import { resolveBusinessSpine } from "@/core/business";
import {
  askBrain,
  brainReasonerBackend,
  resolveBrainReasoner,
  type BrainAnswer,
} from "@/core/ask-brain";
import {
  buildKnowledgeGraph,
  loadMemorySnapshot,
  resolveLearningFeed,
} from "@/core/memory-spine";

export interface AskBrainResponse extends BrainAnswer {
  /** Which reasoner answered — shown honestly in the UI. */
  backend: "anthropic" | "deterministic";
}

export async function askBrainAction(question: string): Promise<AskBrainResponse> {
  const trimmed = question.trim().slice(0, 500);
  if (!trimmed) {
    return {
      question: "",
      answer: "Ask a question first.",
      confidence: "low",
      records: [],
      derivation: "Empty question.",
      isEmpty: true,
      backend: brainReasonerBackend(),
    };
  }

  const [spine, feed, reasoner] = await Promise.all([
    resolveBusinessSpine(),
    resolveLearningFeed(),
    resolveBrainReasoner(),
  ]);
  const [snapshot, observations] = await Promise.all([
    loadMemorySnapshot(spine),
    feed.list({ limit: 500 }),
  ]);
  const graph = buildKnowledgeGraph(snapshot);

  const answer = await askBrain(trimmed, { graph, observations, now: new Date().toISOString() }, reasoner);

  // Every question becomes an observation — what was asked, how it resolved.
  await feed
    .append({
      kind: "question",
      summary: trimmed,
      payload: {
        intentId: answer.intentId ?? null,
        confidence: answer.confidence,
        resultCount: answer.records.length,
        isEmpty: answer.isEmpty,
      },
      source: "ask-brain",
    })
    .catch(() => undefined); // logging must never break the answer

  return { ...answer, backend: brainReasonerBackend() };
}

/** The founder followed an evidence link — record that the answer was acted on. */
export async function recordBrainFollowUp(
  question: string,
  href: string,
): Promise<void> {
  const feed = await resolveLearningFeed();
  await feed
    .append({
      kind: "acted",
      summary: `Followed evidence for: ${question.slice(0, 200)}`,
      payload: { href },
      source: "ask-brain",
    })
    .catch(() => undefined);
}
