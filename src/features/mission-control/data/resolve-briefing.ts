import { resolveBusinessSpine } from "@/core/business";
import {
  buildBriefing,
  projectMissionControlData,
  type Briefing,
} from "@/core/mission-control";
import { buildKnowledgeGraph, loadMemorySnapshot } from "@/core/memory-spine";

/**
 * The data SEAM for Mission Control (ADR-042) — RE-POINTED onto the memory
 * spine (ADR-046), exactly as ADR-042 planned. The briefing now reads through
 * the shared knowledge graph: snapshot → graph → projection → the unchanged
 * pure engine. The projection is regression-proven equal to the old direct
 * repository reads (tests/core/mission-control/spine-projection.test.ts), so
 * the surface behaves identically — it just reads from the same shared layer
 * every future Brain surface will.
 *
 * `now` is injectable so the surface (and tests) stay deterministic.
 */
export async function resolveBriefing(
  now: string = new Date().toISOString(),
): Promise<Briefing> {
  const spine = await resolveBusinessSpine();
  const snapshot = await loadMemorySnapshot(spine);
  const graph = buildKnowledgeGraph(snapshot);
  return buildBriefing(projectMissionControlData(graph), { now });
}
