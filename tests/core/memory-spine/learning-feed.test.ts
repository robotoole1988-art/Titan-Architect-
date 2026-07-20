import { describe, expect, it } from "vitest";
import { createMemoryLearningFeed, type LearningFeed } from "@/core/memory-spine";

/**
 * ADR-046: the learning feed — append-only observations (what happened, the
 * decision, the outcome). The substrate every Brain function and department
 * writes back to. The interface exposes append + list ONLY; nothing mutates.
 */

function feedWith(): LearningFeed {
  return createMemoryLearningFeed();
}

describe("learning feed", () => {
  it("append assigns id + occurredAt and returns the stored observation", async () => {
    const feed = feedWith();
    const stored = await feed.append({
      kind: "decision",
      businessId: "b-1",
      summary: "Regenerated the blueprint for the legal pages.",
      payload: { blueprintVersion: 3 },
      source: "mission-control",
    });
    expect(stored.id).toBeTruthy();
    expect(stored.occurredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(stored.summary).toContain("Regenerated");
  });

  it("honours a caller-supplied occurredAt (backfilling history honestly)", async () => {
    const feed = feedWith();
    const stored = await feed.append({
      kind: "outcome",
      summary: "Campaign CSV imported by the founder.",
      occurredAt: "2026-07-01T09:00:00.000Z",
      source: "test",
    });
    expect(stored.occurredAt).toBe("2026-07-01T09:00:00.000Z");
  });

  it("lists newest first, filterable by business and kind, with a limit", async () => {
    const feed = feedWith();
    await feed.append({ kind: "promise", businessId: "b-1", summary: "One", occurredAt: "2026-07-01T00:00:00.000Z", source: "t" });
    await feed.append({ kind: "outcome", businessId: "b-1", summary: "Two", occurredAt: "2026-07-02T00:00:00.000Z", source: "t" });
    await feed.append({ kind: "promise", businessId: "b-2", summary: "Three", occurredAt: "2026-07-03T00:00:00.000Z", source: "t" });

    const all = await feed.list();
    expect(all.map((observation) => observation.summary)).toEqual(["Three", "Two", "One"]);

    const b1 = await feed.list({ businessId: "b-1" });
    expect(b1.map((observation) => observation.summary)).toEqual(["Two", "One"]);

    const promises = await feed.list({ kind: "promise" });
    expect(promises.map((observation) => observation.summary)).toEqual(["Three", "One"]);

    const limited = await feed.list({ limit: 1 });
    expect(limited).toHaveLength(1);
    expect(limited[0].summary).toBe("Three");
  });

  it("is append-only: no mutation surface, and returned records are copies", async () => {
    const feed = feedWith();
    const stored = await feed.append({ kind: "note", summary: "Original", source: "t" });
    // The interface itself carries no update/remove.
    expect("update" in feed).toBe(false);
    expect("remove" in feed).toBe(false);
    // Mutating what append/list returned must not touch the stored entry.
    (stored as { summary: string }).summary = "TAMPERED";
    const listed = await feed.list();
    expect(listed[0].summary).toBe("Original");
    (listed[0] as { summary: string }).summary = "TAMPERED AGAIN";
    const again = await feed.list();
    expect(again[0].summary).toBe("Original");
  });
});
