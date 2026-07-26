/**
 * ADR-057 — the typed briefing composes only from facts that exist, and the
 * empty-state branches speak with grace instead of padding.
 */

import { describe, expect, it } from "vitest";
import {
  composeActivityLine,
  composeBookLine,
  composeBriefing,
} from "@/features/command-centre/model/compose-briefing";
import { makeBriefing, makeFacts } from "./fixture";

describe("the briefing speaks only measured facts (ADR-057)", () => {
  it("greets by time of day from the injected clock, never Date.now()", () => {
    const afternoon = composeBriefing(makeFacts({ now: "2026-07-26T14:30:00.000Z" }));
    expect(afternoon.greeting).toBe("Good afternoon, Robert");
    const morning = composeBriefing(makeFacts({ now: "2026-07-26T08:00:00.000Z" }));
    expect(morning.greeting).toBe("Good morning, Robert");
    const evening = composeBriefing(makeFacts({ now: "2026-07-26T20:00:00.000Z" }));
    expect(evening.greeting).toBe("Good evening, Robert");
  });

  it("states the book with live count and pipeline stages", () => {
    const line = composeBookLine(makeFacts());
    expect(line).toBe(
      "The book holds 8 businesses — 2 live; in the pipeline: 5 leads, 1 qualified.",
    );
  });

  it("renders the crafted empty state when the book is empty", () => {
    const line = composeBookLine(
      makeFacts({
        bookSize: 0,
        liveAccounts: 0,
        briefing: makeBriefing({
          pipeline: { byStage: [], total: 0, stale: [], dealsNeedingAction: [] },
          isEmpty: true,
        }),
      }),
    );
    expect(line).toBe("The book is empty — your first business begins with an intake.");
  });

  it("says 'none live yet' honestly instead of hiding a zero", () => {
    const line = composeBookLine(makeFacts({ liveAccounts: 0 }));
    expect(line).toContain("none live yet");
  });

  it("earns the activity line only when the week measured something", () => {
    expect(composeActivityLine(makeFacts({ measuredVisitsWeek: 41 }))).toBe(
      "Measured this week: 41 page views across the live sites.",
    );
    // history exists, week quiet → no line (the chips carry history)
    expect(
      composeActivityLine(makeFacts({ measuredVisitsWeek: 0, measuredVisitsAllTime: 176 })),
    ).toBeNull();
    // nothing measured ever → no line (absence is rendered once, not narrated)
    expect(
      composeActivityLine(makeFacts({ measuredVisitsWeek: 0, measuredVisitsAllTime: 0 })),
    ).toBeNull();
  });

  it("closes with the situation address so the approval clause always lands", () => {
    const composed = composeBriefing(makeFacts());
    expect(composed.lines[composed.lines.length - 1]).toBe(
      "Nothing awaits your approval.",
    );
  });

  it("carries provenance facts for the ⓘ affordance", () => {
    const composed = composeBriefing(makeFacts());
    expect(composed.facts).toContain("book: businesses where internal = false (8)");
    expect(composed.facts).toContain("pending approvals: 0");
  });
});
