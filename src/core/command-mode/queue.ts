/**
 * The approval queue (ADR-052) — event-sourced over the learning feed.
 *
 * No new tables: a request is a `command_requested` observation; a founder
 * decline is `command_rejected`; an execution outcome is `command_executed`
 * / `command_failed` / `command_partial`. Pending = requested minus
 * terminal. Everything is derived, deterministic, and append-only honest.
 */

import type { Observation } from "@/core/memory-spine";
import { getCommandAction, isCommandActionId } from "./catalogue";
import type {
  CommandHistoryEntry,
  CommandOutcomeStatus,
  CommandRequestRecord,
  CommandTrace,
  PendingCommand,
  RejectedCommand,
} from "./model";

export const COMMAND_REQUESTED_KIND = "command_requested";
export const COMMAND_REJECTED_KIND = "command_rejected";

export const COMMAND_OUTCOME_KINDS: Readonly<
  Record<CommandOutcomeStatus, string>
> = {
  executed: "command_executed",
  failed: "command_failed",
  partial: "command_partial",
};

const OUTCOME_BY_KIND: Readonly<Record<string, CommandOutcomeStatus>> = {
  command_executed: "executed",
  command_failed: "failed",
  command_partial: "partial",
};

function requestOf(observation: Observation): CommandRequestRecord | null {
  const payload = observation.payload;
  if (!payload) return null;
  const { requestId, actionId, params, previewLines, tier, via } = payload as {
    requestId?: unknown;
    actionId?: unknown;
    params?: unknown;
    previewLines?: unknown;
    tier?: unknown;
    via?: unknown;
  };
  if (typeof requestId !== "string" || typeof actionId !== "string") return null;
  if (!isCommandActionId(actionId)) return null;
  return {
    requestId,
    actionId,
    params: (params ?? {}) as Record<string, unknown>,
    previewLines: Array.isArray(previewLines)
      ? previewLines.filter((line): line is string => typeof line === "string")
      : [],
    tier: (tier ?? "approval_required") as CommandRequestRecord["tier"],
    via: (via ?? "brain-workspace") as CommandRequestRecord["via"],
  };
}

/** Request ids that have reached a terminal state (outcome or rejection). */
function terminalIds(observations: ReadonlyArray<Observation>): Set<string> {
  const ids = new Set<string>();
  for (const observation of observations) {
    if (
      observation.kind !== COMMAND_REJECTED_KIND &&
      OUTCOME_BY_KIND[observation.kind] === undefined
    ) {
      continue;
    }
    const id = observation.payload?.requestId;
    if (typeof id === "string") ids.add(id);
  }
  return ids;
}

/** Pending approval cards, oldest request first (founder works the queue). */
export function derivePendingCommands(
  observations: ReadonlyArray<Observation>,
): PendingCommand[] {
  const terminal = terminalIds(observations);
  const pending: PendingCommand[] = [];
  const seen = new Set<string>();
  for (const observation of observations) {
    if (observation.kind !== COMMAND_REQUESTED_KIND) continue;
    const request = requestOf(observation);
    if (!request || terminal.has(request.requestId) || seen.has(request.requestId)) {
      continue;
    }
    seen.add(request.requestId);
    pending.push({
      requestId: request.requestId,
      actionId: request.actionId,
      title: getCommandAction(request.actionId)!.title,
      previewLines: request.previewLines,
      tier: request.tier,
      via: request.via,
      requestedAt: observation.occurredAt,
      ...(observation.businessId ? { businessId: observation.businessId } : {}),
    });
  }
  return pending.sort((a, b) => a.requestedAt.localeCompare(b.requestedAt));
}

/** The stored request for a pending id — what the executor runs. */
export function findRequest(
  observations: ReadonlyArray<Observation>,
  requestId: string,
): CommandRequestRecord | null {
  for (const observation of observations) {
    if (observation.kind !== COMMAND_REQUESTED_KIND) continue;
    const request = requestOf(observation);
    if (request?.requestId === requestId) return request;
  }
  return null;
}

/** Executed/failed/partial history, newest first, traces attached. */
export function deriveCommandHistory(
  observations: ReadonlyArray<Observation>,
): CommandHistoryEntry[] {
  const previews = new Map<string, ReadonlyArray<string>>();
  for (const observation of observations) {
    if (observation.kind !== COMMAND_REQUESTED_KIND) continue;
    const request = requestOf(observation);
    if (request) previews.set(request.requestId, request.previewLines);
  }
  const history: CommandHistoryEntry[] = [];
  for (const observation of observations) {
    const status = OUTCOME_BY_KIND[observation.kind];
    if (!status) continue;
    const payload = observation.payload as
      | { requestId?: unknown; actionId?: unknown; trace?: unknown; error?: unknown }
      | undefined;
    const requestId =
      typeof payload?.requestId === "string" ? payload.requestId : null;
    const actionId =
      typeof payload?.actionId === "string" && isCommandActionId(payload.actionId)
        ? payload.actionId
        : null;
    if (!requestId || !actionId || !payload?.trace) continue;
    history.push({
      requestId,
      actionId,
      title: getCommandAction(actionId)!.title,
      status,
      trace: payload.trace as CommandTrace,
      ...(typeof payload.error === "string" ? { error: payload.error } : {}),
      occurredAt: observation.occurredAt,
      previewLines: previews.get(requestId) ?? [],
    });
  }
  return history.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

/** Declined requests, newest first — kept visible for honesty. */
export function deriveRejectedCommands(
  observations: ReadonlyArray<Observation>,
): RejectedCommand[] {
  const requests = new Map<string, CommandRequestRecord>();
  for (const observation of observations) {
    if (observation.kind !== COMMAND_REQUESTED_KIND) continue;
    const request = requestOf(observation);
    if (request) requests.set(request.requestId, request);
  }
  const rejected: RejectedCommand[] = [];
  for (const observation of observations) {
    if (observation.kind !== COMMAND_REJECTED_KIND) continue;
    const payload = observation.payload as
      | { requestId?: unknown; reason?: unknown }
      | undefined;
    const requestId =
      typeof payload?.requestId === "string" ? payload.requestId : null;
    if (!requestId) continue;
    const request = requests.get(requestId);
    if (!request) continue;
    rejected.push({
      requestId,
      actionId: request.actionId,
      title: getCommandAction(request.actionId)!.title,
      ...(typeof payload?.reason === "string" && payload.reason
        ? { reason: payload.reason }
        : {}),
      occurredAt: observation.occurredAt,
      previewLines: request.previewLines,
    });
  }
  return rejected.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}
