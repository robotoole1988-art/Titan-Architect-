import { describe, expect, it } from "vitest";
import {
  deriveCommandHistory,
  derivePendingCommands,
  deriveRejectedCommands,
  findRequest,
} from "@/core/command-mode";
import type { Observation } from "@/core/memory-spine";

/**
 * ADR-052 §3: the queue is DERIVED from the append-only feed — requested
 * minus terminal (outcome or rejection). No table, no mutation, no drift.
 */

let counter = 0;
function observation(
  kind: string,
  payload: Record<string, unknown>,
  occurredAt: string,
  businessId?: string,
): Observation {
  counter += 1;
  return {
    id: `obs-${counter}`,
    kind,
    occurredAt,
    summary: kind,
    payload,
    source: "command-mode",
    ...(businessId ? { businessId } : {}),
  };
}

const requested = (requestId: string, at: string, businessId?: string) =>
  observation(
    "command_requested",
    {
      requestId,
      actionId: "append_business_note",
      params: { businessId: businessId ?? "b-1", note: "hello" },
      previewLines: [`Append note (${requestId}).`],
      tier: "recommend_first",
      via: "ask-brain",
    },
    at,
    businessId,
  );

const TRACE = {
  requestId: "r-1",
  actionId: "append_business_note",
  approvedBy: "founder",
  approvedAt: "2026-07-20T12:05:00.000Z",
  startedAt: "2026-07-20T12:05:00.000Z",
  finishedAt: "2026-07-20T12:05:01.000Z",
  steps: [],
  changes: ["Note appended."],
};

describe("the pending queue", () => {
  it("shows a requested command until it reaches a terminal state", () => {
    const pending = derivePendingCommands([
      requested("r-1", "2026-07-20T12:00:00.000Z", "b-1"),
    ]);
    expect(pending).toHaveLength(1);
    expect(pending[0]).toMatchObject({
      requestId: "r-1",
      actionId: "append_business_note",
      title: "Append note",
      tier: "recommend_first",
      via: "ask-brain",
      businessId: "b-1",
    });
    expect(pending[0].previewLines[0]).toContain("r-1");
  });

  it("removes executed, failed, partial, and rejected requests", () => {
    const observations = [
      requested("r-exec", "2026-07-20T12:00:00.000Z"),
      requested("r-fail", "2026-07-20T12:01:00.000Z"),
      requested("r-part", "2026-07-20T12:02:00.000Z"),
      requested("r-rej", "2026-07-20T12:03:00.000Z"),
      requested("r-open", "2026-07-20T12:04:00.000Z"),
      observation("command_executed", { requestId: "r-exec", actionId: "append_business_note", trace: TRACE }, "2026-07-20T12:05:00.000Z"),
      observation("command_failed", { requestId: "r-fail", actionId: "append_business_note", trace: TRACE, error: "boom" }, "2026-07-20T12:06:00.000Z"),
      observation("command_partial", { requestId: "r-part", actionId: "append_business_note", trace: TRACE, error: "half" }, "2026-07-20T12:07:00.000Z"),
      observation("command_rejected", { requestId: "r-rej", reason: "not now" }, "2026-07-20T12:08:00.000Z"),
    ];
    const pending = derivePendingCommands(observations);
    expect(pending.map((command) => command.requestId)).toEqual(["r-open"]);
  });

  it("orders pending oldest first — the founder works the queue in arrival order", () => {
    const pending = derivePendingCommands([
      requested("r-new", "2026-07-20T13:00:00.000Z"),
      requested("r-old", "2026-07-20T11:00:00.000Z"),
    ]);
    expect(pending.map((command) => command.requestId)).toEqual(["r-old", "r-new"]);
  });
});

describe("history and rejections", () => {
  it("attaches the full trace and the original preview to history entries", () => {
    const history = deriveCommandHistory([
      requested("r-1", "2026-07-20T12:00:00.000Z"),
      observation(
        "command_failed",
        { requestId: "r-1", actionId: "append_business_note", trace: TRACE, error: "spine down" },
        "2026-07-20T12:05:01.000Z",
      ),
    ]);
    expect(history).toHaveLength(1);
    expect(history[0].status).toBe("failed");
    expect(history[0].error).toBe("spine down");
    expect(history[0].trace.approvedBy).toBe("founder");
    expect(history[0].previewLines[0]).toContain("r-1");
  });

  it("keeps declined requests visible with their reason", () => {
    const rejected = deriveRejectedCommands([
      requested("r-1", "2026-07-20T12:00:00.000Z"),
      observation("command_rejected", { requestId: "r-1", reason: "wrong business" }, "2026-07-20T12:09:00.000Z"),
    ]);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toBe("wrong business");
  });

  it("findRequest recovers the exact stored request for the executor", () => {
    const observations = [requested("r-1", "2026-07-20T12:00:00.000Z", "b-9")];
    const request = findRequest(observations, "r-1");
    expect(request?.actionId).toBe("append_business_note");
    expect(request?.params).toEqual({ businessId: "b-9", note: "hello" });
    expect(findRequest(observations, "r-missing")).toBeNull();
  });
});
