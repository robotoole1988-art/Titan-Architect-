import { describe, expect, it } from "vitest";
import { buildKnowledgeGraph, refKey } from "@/core/memory-spine";
import {
  enquiryDangling,
  enquiryNew,
  fixtureSnapshot,
  livePublication,
  summit,
  summitDeal,
} from "./fixture";

/**
 * ADR-046: the graph is DERIVED from the Business Spine — pure, deterministic,
 * with provenance on every node and edge, and no fabricated relationships.
 */

const graph = buildKnowledgeGraph(fixtureSnapshot());

function edgesOf(kind: string) {
  return graph.edges.filter((edge) => edge.kind === kind);
}

describe("buildKnowledgeGraph", () => {
  it("creates one node per source record, keyed kind:id, carrying the record", () => {
    const businessNode = graph.nodes[refKey({ kind: "business", id: summit.id })];
    expect(businessNode).toBeDefined();
    expect(businessNode!.label).toBe("Summit Roofing Rescue");
    expect(businessNode!.record).toEqual(summit);

    expect(graph.nodes[refKey({ kind: "enquiry", id: enquiryNew.id })]).toBeDefined();
    expect(graph.nodes[refKey({ kind: "deal", id: summitDeal.id })]).toBeDefined();
    expect(graph.nodes[refKey({ kind: "site", id: livePublication.id })]).toBeDefined();
    expect(graph.nodes[refKey({ kind: "build", id: "build-summit" })]).toBeDefined();
    expect(graph.nodes[refKey({ kind: "campaign", id: "art-campaign-summit" })]).toBeDefined();
    expect(graph.nodes[refKey({ kind: "media-asset", id: "media-1" })]).toBeDefined();
    expect(graph.nodes[refKey({ kind: "activity", id: "act-summit-1" })]).toBeDefined();
    // Metric days have a composite id: businessId:path:date.
    expect(
      graph.nodes[refKey({ kind: "metric-day", id: "b-summit:/:2026-07-07" })],
    ).toBeDefined();
    // Market context (provider-named provenance).
    expect(graph.nodes[refKey({ kind: "market", id: "b-summit" })]).toBeDefined();
  });

  it("derives every edge from a real foreign key", () => {
    expect(edgesOf("has_enquiry")).toHaveLength(3); // all three enquiries belong to Summit
    expect(edgesOf("captured_by")).toHaveLength(2); // dangling one produces NO edge
    expect(edgesOf("has_deal")).toHaveLength(1);
    expect(edgesOf("has_campaign")).toHaveLength(1);
    expect(edgesOf("has_build")).toHaveLength(1);
    expect(edgesOf("published")).toHaveLength(2); // live + superseded versions
    expect(edgesOf("measured")).toHaveLength(3);
    expect(edgesOf("has_media")).toHaveLength(1);
    expect(edgesOf("logged")).toHaveLength(3);
    expect(edgesOf("has_review")).toHaveLength(1); // ADR-053
    expect(edgesOf("in_market")).toHaveLength(1);
  });

  it("HONESTY: a dangling foreign key produces no edge, and is reported", () => {
    const captured = edgesOf("captured_by").map((edge) => edge.from.id);
    expect(captured).not.toContain(enquiryDangling.id);
    // The gap is surfaced, never silently swallowed or invented around.
    expect(
      graph.integrityNotes.some(
        (note) => note.includes(enquiryDangling.id) && note.includes("pub-deleted"),
      ),
    ).toBe(true);
  });

  it("never fabricates an enquiry→deal edge (the data model has no such link)", () => {
    expect(
      graph.edges.some(
        (edge) => edge.from.kind === "enquiry" && edge.to.kind === "deal",
      ),
    ).toBe(false);
  });

  it("stamps provenance (source + record id) on every node and edge", () => {
    for (const node of Object.values(graph.nodes)) {
      expect(node.provenance.source, `${refKey(node.ref)} missing source`).toBeTruthy();
      expect(node.provenance.recordId, `${refKey(node.ref)} missing recordId`).toBeTruthy();
    }
    for (const edge of graph.edges) {
      expect(edge.provenance.source).toBeTruthy();
    }
    // The market node names its provider — derived data is attributed.
    const market = graph.nodes[refKey({ kind: "market", id: "b-summit" })]!;
    expect(market.provenance.source).toContain("seeded");
  });

  it("is deterministic: same snapshot, byte-identical graph", () => {
    const again = buildKnowledgeGraph(fixtureSnapshot());
    expect(JSON.stringify(again)).toBe(JSON.stringify(graph));
  });

  it("builds an honest empty graph from an empty snapshot", () => {
    const empty = buildKnowledgeGraph({
      businesses: [],
      enquiries: [],
      deals: [],
      campaigns: [],
      builds: [],
      publications: [],
      metrics: [],
      media: [],
      activity: [],
      reviews: [],
      markets: [],
    });
    expect(Object.keys(empty.nodes)).toHaveLength(0);
    expect(empty.edges).toHaveLength(0);
    expect(empty.integrityNotes).toHaveLength(0);
  });
});
