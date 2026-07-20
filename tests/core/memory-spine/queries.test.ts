import { describe, expect, it } from "vitest";
import {
  buildKnowledgeGraph,
  createMemoryLearningFeed,
  enquiriesAndDealsFor,
  leadsNotContacted,
  measurementForSite,
  promisesFor,
} from "@/core/memory-spine";
import { NOW, fixtureSnapshot } from "./fixture";

/**
 * ADR-046: the named structured queries — the exact questions the milestone
 * demands the spine answer, resolved rule-based over the graph (and feed).
 */

const graph = buildKnowledgeGraph(fixtureSnapshot());

describe("leadsNotContacted", () => {
  it("finds pipeline businesses whose last touch is older than N days", () => {
    const neglected = leadsNotContacted(graph, { days: 7, now: NOW });
    // Kerbside: stage "lead", last activity 8 days ago → neglected.
    // Bright: touched yesterday → fine. Summit: stage "live" → not a lead.
    expect(neglected.map((lead) => lead.business.id)).toEqual(["b-kerbside"]);
    expect(neglected[0].daysSinceLastTouch).toBe(8);
    expect(neglected[0].lastTouchAt).toBe("2026-06-30T09:00:00.000Z");
  });

  it("is a window, not a verdict: tighten the days and Bright appears too", () => {
    const neglected = leadsNotContacted(graph, { days: 0, now: NOW });
    expect(neglected.map((lead) => lead.business.id)).toEqual([
      "b-kerbside",
      "b-bright",
    ]); // oldest touch first
  });

  it("falls back to createdAt for a business with no activity at all", () => {
    const snapshot = fixtureSnapshot();
    const bare = buildKnowledgeGraph({
      ...snapshot,
      activity: [],
    });
    const neglected = leadsNotContacted(bare, { days: 7, now: NOW });
    // Kerbside created 2026-06-20 (18 days), Bright 2026-06-25 (13 days).
    expect(neglected.map((lead) => lead.business.id)).toEqual([
      "b-kerbside",
      "b-bright",
    ]);
    expect(neglected[0].daysSinceLastTouch).toBe(18);
  });
});

describe("enquiriesAndDealsFor", () => {
  it("resolves all enquiries and deals for a business through the hub", () => {
    const { enquiries, deals } = enquiriesAndDealsFor(graph, "b-summit");
    expect(enquiries.map((enquiry) => enquiry.id).sort()).toEqual([
      "enq-1",
      "enq-2",
      "enq-dangling",
    ]);
    expect(deals.map((deal) => deal.id)).toEqual(["art-deal-summit"]);
  });

  it("is honestly empty for a business with neither", () => {
    const { enquiries, deals } = enquiriesAndDealsFor(graph, "b-bright");
    expect(enquiries).toEqual([]);
    expect(deals).toEqual([]);
  });
});

describe("measurementForSite", () => {
  it("resolves a slug to its metric days via the multi-hop path", () => {
    const measured = measurementForSite(graph, "summit-roofing-rescue");
    expect(measured).not.toBeNull();
    expect(measured!.site.id).toBe("pub-summit-2"); // the LIVE publication
    expect(measured!.metrics).toHaveLength(3);
    expect(
      measured!.metrics.reduce((sum, row) => sum + row.views, 0),
    ).toBe(105);
  });

  it("returns null for an unknown slug — never an invented site", () => {
    expect(measurementForSite(graph, "not-a-site")).toBeNull();
  });
});

describe("promisesFor (structured observations)", () => {
  it("resolves recorded promises for a customer from the learning feed", async () => {
    const feed = createMemoryLearningFeed();
    await feed.append({
      kind: "promise",
      businessId: "b-summit",
      summary: "Founder promised a revised proposal by Friday.",
      payload: { dueBy: "2026-07-11" },
      source: "test",
    });
    await feed.append({
      kind: "decision",
      businessId: "b-summit",
      summary: "Chose the technical theme.",
      source: "test",
    });
    await feed.append({
      kind: "promise",
      businessId: "b-kerbside",
      summary: "Promised a callback.",
      source: "test",
    });

    const observations = await feed.list();
    const promises = promisesFor("b-summit", observations);
    expect(promises).toHaveLength(1);
    expect(promises[0].summary).toContain("revised proposal");
    expect(promises[0].payload).toEqual({ dueBy: "2026-07-11" });
  });
});
