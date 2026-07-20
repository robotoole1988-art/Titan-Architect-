import "server-only";

/**
 * Health Engine data seam (ADR-051): spine → graph (+ feed) → department
 * health. Appends at most ONE health_snapshot per department per day, so
 * trend history accumulates without spamming the feed.
 */

import {
  buildHealthSnapshotObservations,
  computeDepartmentHealth,
  type DepartmentHealth,
} from "@/core/health-engine";
import { resolveBusinessSpine } from "@/core/business";
import {
  buildKnowledgeGraph,
  loadMemorySnapshot,
  resolveLearningFeed,
} from "@/core/memory-spine";

export interface HealthPayload {
  healths: DepartmentHealth[];
  computedAt: string;
}

export async function loadDepartmentHealth(): Promise<HealthPayload> {
  const [spine, feed] = await Promise.all([
    resolveBusinessSpine(),
    resolveLearningFeed(),
  ]);
  const [snapshot, observations] = await Promise.all([
    loadMemorySnapshot(spine),
    feed.list({ kind: "health_snapshot", limit: 200 }),
  ]);
  const now = new Date().toISOString();
  const graph = buildKnowledgeGraph(snapshot);
  const healths = computeDepartmentHealth({ graph, observations, now });

  // One snapshot per department per day — the feed is the trend history.
  // Deduped against a FRESH read taken immediately before appending: the
  // earlier `observations` read predates graph building, which left a race
  // window wide enough for concurrent first-loads to double-append.
  const today = now.slice(0, 10);
  const fresh = await feed
    .list({ kind: "health_snapshot", limit: 30 })
    .catch(() => observations);
  const snapshottedToday = new Set(
    fresh
      .filter((observation) => observation.occurredAt.slice(0, 10) === today)
      .map((observation) => observation.payload?.department)
      .filter((department): department is string => typeof department === "string"),
  );
  for (const draft of buildHealthSnapshotObservations(healths, now)) {
    const department = draft.payload?.department;
    if (typeof department === "string" && snapshottedToday.has(department)) continue;
    await feed.append(draft).catch(() => undefined);
  }

  return { healths, computedAt: now };
}
