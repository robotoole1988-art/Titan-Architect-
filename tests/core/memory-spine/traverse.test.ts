import { describe, expect, it } from "vitest";
import {
  buildKnowledgeGraph,
  getNode,
  neighbors,
  traverse,
} from "@/core/memory-spine";
import { fixtureSnapshot } from "./fixture";

/** ADR-046: multi-hop traversal over typed edges — the Brain's walking legs. */

const graph = buildKnowledgeGraph(fixtureSnapshot());
const summitRef = { kind: "business", id: "b-summit" } as const;
const siteRef = { kind: "site", id: "pub-summit-2" } as const;

describe("traversal", () => {
  it("getNode resolves a ref, null for the unknown", () => {
    expect(getNode(graph, summitRef)?.label).toBe("Summit Roofing Rescue");
    expect(getNode(graph, { kind: "business", id: "nope" })).toBeNull();
  });

  it("neighbors walks OUT edges, filterable by edge kind", () => {
    const all = neighbors(graph, summitRef);
    expect(all.length).toBeGreaterThan(5);
    const enquiries = neighbors(graph, summitRef, { edge: "has_enquiry" });
    expect(enquiries.map((n) => n.ref.id).sort()).toEqual([
      "enq-1",
      "enq-2",
      "enq-dangling",
    ]);
  });

  it("neighbors walks IN edges when asked", () => {
    // Who published this site? (published edge points business → site.)
    const owner = neighbors(graph, siteRef, { edge: "published", direction: "in" });
    expect(owner.map((n) => n.ref.id)).toEqual(["b-summit"]);
  });

  it("traverses multi-hop: enquiry → site → business (mixed directions)", () => {
    const start = { kind: "enquiry", id: "enq-1" } as const;
    const reached = traverse(graph, start, [
      { edge: "captured_by" }, // enquiry → site
      { edge: "published", direction: "in" }, // site → business
    ]);
    expect(reached.map((n) => n.ref.id)).toEqual(["b-summit"]);
  });

  it("traverses site → business → metric-days (the measurement path)", () => {
    const reached = traverse(graph, siteRef, [
      { edge: "published", direction: "in" },
      { edge: "measured" },
    ]);
    expect(reached).toHaveLength(3);
    expect(reached.every((n) => n.ref.kind === "metric-day")).toBe(true);
  });

  it("deduplicates when hops converge and returns [] off the map", () => {
    // Two enquiries → the same site: one site node, once.
    const sites = traverse(graph, summitRef, [
      { edge: "has_enquiry" },
      { edge: "captured_by" },
    ]);
    expect(sites.map((n) => n.ref.id)).toEqual(["pub-summit-2"]);
    expect(
      traverse(graph, { kind: "business", id: "nope" }, [{ edge: "has_enquiry" }]),
    ).toEqual([]);
  });
});
