"use server";

/**
 * Founder controls for Command Mode (ADR-052). Requesting NEVER executes;
 * approving executes exactly once, with a full trace; declining is recorded.
 * Every path revalidates the Brain and Mission Control surfaces.
 */

import { revalidatePath } from "next/cache";
import type { CommandActionId, CommandOutcomeStatus } from "@/core/command-mode";
import {
  approveAndExecute,
  rejectCommand,
  requestCommand,
} from "./commands";

function revalidateSurfaces(): void {
  revalidatePath("/brain");
  revalidatePath("/dashboard");
}

export interface CommandRequestState {
  ok: boolean;
  message: string;
}

/** Queue a catalogued action as a pending approval card. */
export async function requestCommandAction(
  actionId: CommandActionId,
  params: Record<string, unknown>,
  via: "recommendation" | "brain-workspace" | "mission-control",
): Promise<CommandRequestState> {
  const result = await requestCommand({ actionId, params, via });
  revalidateSurfaces();
  return result.ok
    ? { ok: true, message: "Queued for your approval — nothing runs until you approve it." }
    : { ok: false, message: result.problems.join(" ") };
}

export interface ApproveCommandState {
  ok: boolean;
  status?: CommandOutcomeStatus;
  message: string;
}

/** Approve → execute → verify → learn. Returns the honest outcome. */
export async function approveCommandAction(
  requestId: string,
): Promise<ApproveCommandState> {
  const result = await approveAndExecute(requestId);
  revalidateSurfaces();
  if (!result.ok) return { ok: false, message: result.problems.join(" ") };
  const { outcome } = result;
  return {
    ok: outcome.status === "executed",
    status: outcome.status,
    message:
      outcome.status === "executed"
        ? outcome.trace.changes.join(" ")
        : `${outcome.status === "failed" ? "Failed" : "Partially executed"}: ${outcome.error}`,
  };
}

/** Decline a pending card, optionally with a reason. */
export async function rejectCommandAction(
  requestId: string,
  reason?: string,
): Promise<void> {
  await rejectCommand(requestId, reason);
  revalidateSurfaces();
}
