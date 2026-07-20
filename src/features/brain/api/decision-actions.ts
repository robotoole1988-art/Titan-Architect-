"use server";

/**
 * Founder controls for recommendations (ADR-050): Accept and Dismiss, each
 * appended to the learning feed — the substrate future ranking learns from.
 * Accepted/dismissed ids are suppressed from future engine runs.
 */

import { revalidatePath } from "next/cache";
import { resolveLearningFeed } from "@/core/memory-spine";

function revalidateSurfaces(): void {
  revalidatePath("/dashboard");
  revalidatePath("/brain");
}

export async function acceptRecommendation(
  recommendationId: string,
  summary: string,
): Promise<void> {
  const feed = await resolveLearningFeed();
  await feed.append({
    kind: "recommendation_accepted",
    summary: `Accepted: ${summary.slice(0, 200)}`,
    payload: { recommendationId },
    source: "decision-engine",
  });
  revalidateSurfaces();
}

export async function dismissRecommendation(
  recommendationId: string,
  summary: string,
  reason?: string,
): Promise<void> {
  const feed = await resolveLearningFeed();
  await feed.append({
    kind: "recommendation_dismissed",
    summary: `Dismissed: ${summary.slice(0, 200)}`,
    payload: {
      recommendationId,
      ...(reason?.trim() ? { reason: reason.trim().slice(0, 300) } : {}),
    },
    source: "decision-engine",
  });
  revalidateSurfaces();
}
