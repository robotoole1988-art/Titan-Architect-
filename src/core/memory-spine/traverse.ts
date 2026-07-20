/**
 * Graph traversal (ADR-046): node lookup, typed-edge neighbours, and
 * multi-hop walks. Pure functions over the plain graph — linear scans are the
 * right trade at founder scale; an adjacency index is a later optimisation
 * behind the same signatures.
 */

import {
  refKey,
  type EdgeKind,
  type EntityRef,
  type KnowledgeGraph,
  type KnowledgeNode,
} from "./model";

export function getNode(
  graph: KnowledgeGraph,
  ref: EntityRef,
): KnowledgeNode | null {
  return graph.nodes[refKey(ref)] ?? null;
}

export interface NeighborOptions {
  /** Restrict to one edge kind. */
  edge?: EdgeKind;
  /** Follow edges out of the node (default), into it, or both. */
  direction?: "out" | "in" | "both";
}

/** Nodes one hop away, in stable edge order, deduplicated. */
export function neighbors(
  graph: KnowledgeGraph,
  from: EntityRef,
  options: NeighborOptions = {},
): KnowledgeNode[] {
  const direction = options.direction ?? "out";
  const key = refKey(from);
  const found: KnowledgeNode[] = [];
  const seen = new Set<string>();
  for (const edge of graph.edges) {
    if (options.edge && edge.kind !== options.edge) continue;
    let targetRef: EntityRef | null = null;
    if ((direction === "out" || direction === "both") && refKey(edge.from) === key) {
      targetRef = edge.to;
    } else if ((direction === "in" || direction === "both") && refKey(edge.to) === key) {
      targetRef = edge.from;
    }
    if (!targetRef) continue;
    const targetKey = refKey(targetRef);
    if (seen.has(targetKey)) continue;
    const node = graph.nodes[targetKey];
    if (!node) continue;
    seen.add(targetKey);
    found.push(node);
  }
  return found;
}

/** One hop of a multi-hop walk. Direction defaults to "out". */
export interface TraverseStep {
  edge: EdgeKind;
  direction?: "out" | "in";
}

/**
 * Walk a typed path from a start ref: each step expands the whole frontier
 * along one edge kind, deduplicating as hops converge. Returns the final
 * frontier — [] when the start is unknown or the path dead-ends.
 */
export function traverse(
  graph: KnowledgeGraph,
  start: EntityRef,
  path: ReadonlyArray<TraverseStep>,
): KnowledgeNode[] {
  let frontier = getNode(graph, start) ? [start] : [];
  for (const step of path) {
    const next: EntityRef[] = [];
    const seen = new Set<string>();
    for (const ref of frontier) {
      for (const node of neighbors(graph, ref, step)) {
        const key = refKey(node.ref);
        if (seen.has(key)) continue;
        seen.add(key);
        next.push(node.ref);
      }
    }
    frontier = next;
    if (frontier.length === 0) break;
  }
  return frontier
    .map((ref) => graph.nodes[refKey(ref)])
    .filter((node): node is KnowledgeNode => node !== undefined);
}
