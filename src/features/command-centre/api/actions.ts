"use server";

/**
 * Command Centre — founder-gate actions (ADR-057, wiring ADR-052).
 *
 * Thin wrappers over the Brain's approval/decision actions so the Decisions
 * row works from the room. Approval semantics are untouched — the Brain
 * feature owns them ("approve twice, execute once"); this module only adds
 * the landing route to the revalidation set.
 */

import { revalidatePath } from "next/cache";
import {
  acceptRecommendation,
  approveCommandAction,
  dismissRecommendation,
  rejectCommandAction,
} from "@/features/brain";

export async function approveDecision(requestId: string): Promise<void> {
  await approveCommandAction(requestId);
  revalidatePath("/");
}

export async function declineDecision(requestId: string): Promise<void> {
  await rejectCommandAction(requestId, "Declined from the Command Centre.");
  revalidatePath("/");
}

export async function acceptOpportunity(
  recommendationId: string,
  summary: string,
): Promise<void> {
  await acceptRecommendation(recommendationId, summary);
  revalidatePath("/");
}

export async function dismissOpportunity(
  recommendationId: string,
  summary: string,
): Promise<void> {
  await dismissRecommendation(recommendationId, summary);
  revalidatePath("/");
}
