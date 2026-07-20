import "server-only";

/**
 * Command Mode data seam (ADR-052): request → approval queue → execution,
 * all through the learning feed and the Business Spine. This module is the
 * ONLY place feature code touches the Command Mode executor.
 */

import { randomUUID } from "node:crypto";
import { resolveBusinessSpine } from "@/core/business";
import {
  COMMAND_REJECTED_KIND,
  COMMAND_REQUESTED_KIND,
  deriveCommandHistory,
  derivePendingCommands,
  deriveRejectedCommands,
  effectiveTier,
  executeCommand,
  findRequest,
  getCommandAction,
  type CommandActionId,
  type CommandHistoryEntry,
  type CommandOrigin,
  type CommandOutcome,
  type PendingCommand,
  type RejectedCommand,
} from "@/core/command-mode";
import {
  buildKnowledgeGraph,
  loadMemorySnapshot,
  resolveLearningFeed,
} from "@/core/memory-spine";

/** How much feed history the queue derivations read. */
const FEED_WINDOW = 500;

export interface CommandCentre {
  pending: PendingCommand[];
  history: CommandHistoryEntry[];
  rejected: RejectedCommand[];
}

export async function loadCommandCentre(): Promise<CommandCentre> {
  const feed = await resolveLearningFeed();
  const observations = await feed.list({ limit: FEED_WINDOW });
  return {
    pending: derivePendingCommands(observations),
    history: deriveCommandHistory(observations).slice(0, 20),
    rejected: deriveRejectedCommands(observations).slice(0, 10),
  };
}

export type RequestCommandResult =
  | { ok: true; requestId: string; previewLines: ReadonlyArray<string> }
  | { ok: false; problems: string[] };

/**
 * Land a command as a pending approval (`command_requested`). NOTHING
 * executes here — regardless of who calls it or how it was phrased.
 */
export async function requestCommand(input: {
  actionId: CommandActionId;
  params: Record<string, unknown>;
  via: CommandOrigin;
}): Promise<RequestCommandResult> {
  const action = getCommandAction(input.actionId);
  if (!action) return { ok: false, problems: [`Unknown action "${input.actionId}".`] };

  const [spine, feed] = await Promise.all([
    resolveBusinessSpine(),
    resolveLearningFeed(),
  ]);
  const [snapshot, observations] = await Promise.all([
    loadMemorySnapshot(spine),
    feed.list({ limit: FEED_WINDOW }),
  ]);
  const graph = buildKnowledgeGraph(snapshot);

  const problems = action.validate(input.params, graph);
  if (problems.length > 0) return { ok: false, problems };

  const preview = action.preview(input.params, graph);
  const requestId = randomUUID();
  await feed.append({
    kind: COMMAND_REQUESTED_KIND,
    summary: `Requested: ${preview.lines[0] ?? action.title}`,
    ...(preview.businessId ? { businessId: preview.businessId } : {}),
    payload: {
      requestId,
      actionId: action.id,
      params: input.params,
      previewLines: preview.lines,
      tier: effectiveTier(action.id, observations),
      via: input.via,
    },
    source: input.via,
  });
  return { ok: true, requestId, previewLines: preview.lines };
}

export type ApproveResult =
  | { ok: true; outcome: CommandOutcome }
  | { ok: false; problems: string[] };

/** The founder clicked Approve: execute with full trace, learn the outcome. */
export async function approveAndExecute(requestId: string): Promise<ApproveResult> {
  const [spine, feed] = await Promise.all([
    resolveBusinessSpine(),
    resolveLearningFeed(),
  ]);
  const observations = await feed.list({ limit: FEED_WINDOW });
  // Only a still-pending request may run — approve twice, execute once.
  const pending = derivePendingCommands(observations);
  if (!pending.some((command) => command.requestId === requestId)) {
    return { ok: false, problems: ["That request is no longer pending."] };
  }
  const request = findRequest(observations, requestId);
  if (!request) return { ok: false, problems: ["Request not found in the feed."] };

  const outcome = await executeCommand(request, {
    spine,
    feed,
    now: () => new Date().toISOString(),
    approvedBy: "founder",
  });
  return { ok: true, outcome };
}

/** The founder declined a pending card. Recorded, visible, honest. */
export async function rejectCommand(
  requestId: string,
  reason?: string,
): Promise<void> {
  const feed = await resolveLearningFeed();
  await feed.append({
    kind: COMMAND_REJECTED_KIND,
    summary: `Declined command request ${requestId}`,
    payload: {
      requestId,
      ...(reason?.trim() ? { reason: reason.trim().slice(0, 300) } : {}),
    },
    source: "founder",
  });
}
