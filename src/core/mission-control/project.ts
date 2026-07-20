/**
 * projectMissionControlData (ADR-046): the memory-spine → Mission Control
 * projection. The graph carries every source record on its nodes; this
 * projection lifts them back out into the plain snapshot the pure briefing
 * engine reasons over — proven equal to the old direct spine reads by the
 * regression suite. The engine itself does not change.
 */

import type {
  Build,
  Business,
  Enquiry,
  Publication,
  SiteMetricRow,
} from "@/core/business";
import type { KnowledgeGraph } from "@/core/memory-spine";
import type { MissionControlData } from "./model";

function recordsOf<R>(graph: KnowledgeGraph, kind: string): R[] {
  return Object.values(graph.nodes)
    .filter((node) => node.ref.kind === kind)
    .map((node) => node.record as R);
}

export function projectMissionControlData(
  graph: KnowledgeGraph,
): MissionControlData {
  return {
    businesses: recordsOf<Business>(graph, "business"),
    enquiries: recordsOf<Enquiry>(graph, "enquiry"),
    builds: recordsOf<Build>(graph, "build"),
    // The graph holds the FULL publication history; Mission Control (like the
    // old publications.current() reads) sees only what is live.
    publications: recordsOf<Publication>(graph, "site").filter(
      (publication) => publication.status === "live",
    ),
    metrics: recordsOf<SiteMetricRow>(graph, "metric-day"),
  };
}
