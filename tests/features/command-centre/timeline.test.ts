/**
 * ADR-057 — the timeline is real events only, founder-scale kinds
 * allowlisted; machine bookkeeping never reaches the room.
 */

import { describe, expect, it } from "vitest";
import {
  buildTimeline,
  EMPTY_TIMELINE_LINE,
} from "@/features/command-centre/model/timeline";
import type { TimelineFact } from "@/features/command-centre/model/facts";

function fact(kind: string, id: string): TimelineFact {
  return {
    id,
    kind,
    occurredAt: "2026-07-26T09:42:00.000Z",
    summary: `event ${id}`,
  };
}

describe("the timeline renders real events only (ADR-057)", () => {
  it("allowlists founder-scale kinds and drops machine bookkeeping", () => {
    const entries = buildTimeline([
      fact("milestone", "1"),
      fact("health_snapshot", "2"),
      fact("recommendation_issued", "3"),
      fact("command_executed", "4"),
      fact("question", "5"),
    ]);
    expect(entries.map((entry) => entry.id)).toEqual(["1", "4", "5"]);
  });

  it("tags entries by origin", () => {
    const entries = buildTimeline([fact("command_executed", "1"), fact("milestone", "2")]);
    expect(entries[0].tag).toBe("Command");
    expect(entries[1].tag).toBe("Milestone");
  });

  it("respects the limit", () => {
    const many = Array.from({ length: 20 }, (_, i) => fact("milestone", String(i)));
    expect(buildTimeline(many, 12)).toHaveLength(12);
  });

  it("has a crafted absence line for the day-one feed", () => {
    expect(buildTimeline([])).toHaveLength(0);
    expect(EMPTY_TIMELINE_LINE).toBe("The feed begins with your first live activity.");
  });
});
