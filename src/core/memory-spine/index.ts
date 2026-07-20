/**
 * Memory Spine v1 (ADR-046) — the knowledge-graph substrate.
 *
 * A derived, deterministic graph over the Business Spine's entities, a
 * multi-hop traversal API, named structured queries, and the append-only
 * learning feed. This is the shared memory layer the Brain and the AI
 * departments build on — one layer, no private copies.
 */

export {
  metricDayId,
  refKey,
  type EdgeKind,
  type EntityRef,
  type KnowledgeEdge,
  type KnowledgeGraph,
  type KnowledgeNode,
  type MarketContext,
  type MemorySnapshot,
  type NodeKind,
  type SpineProvenance,
} from "./model";

export { buildKnowledgeGraph } from "./graph";

export {
  getNode,
  neighbors,
  traverse,
  type NeighborOptions,
  type TraverseStep,
} from "./traverse";

export {
  enquiriesAndDealsFor,
  leadsNotContacted,
  measurementForSite,
  promisesFor,
  type NeglectedLead,
} from "./queries";

export {
  createMemoryLearningFeed,
  type LearningFeed,
  type Observation,
  type ObservationDraft,
  type ObservationFilter,
} from "./learning-feed";

export { loadMemorySnapshot, type LoadSnapshotOptions } from "./snapshot";

export { resolveLearningFeed } from "./provider";
