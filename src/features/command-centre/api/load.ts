import "server-only";

/**
 * Command Centre — the data seam (ADR-057).
 *
 * One read path, no writes: spine → memory snapshot → knowledge graph →
 * briefing, plus the command queue, recommendations and department health.
 * Internal/test rows are excluded at the snapshot choke point (ADR-056 §7),
 * so nothing rendered in the room can be steered by a test artifact.
 *
 * Deliberately read-only: unlike /brain's loadDepartmentHealth (which
 * appends the daily health_snapshot observation), landing in the room
 * observes the world without writing to it.
 */

import { resolveBusinessSpine } from "@/core/business";
import {
  buildKnowledgeGraph,
  loadMemorySnapshot,
  resolveLearningFeed,
  type Observation,
} from "@/core/memory-spine";
import {
  buildBriefing,
  composeSituationAddress,
  projectMissionControlData,
} from "@/core/mission-control";
import { computeDepartmentHealth, type DepartmentHealth } from "@/core/health-engine";
import { loadCommandCentre, loadRecommendations } from "@/features/brain";
import type {
  CommandCentreFacts,
  DepartmentGlow,
  PendingDecisionFact,
  RecommendationFact,
  TimelineFact,
} from "../model/facts";

const FEED_WINDOW = 500;

function departmentLabel(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

function toGlow(health: DepartmentHealth): DepartmentGlow {
  if (health.scoreable) {
    return {
      id: health.department,
      label: departmentLabel(health.department),
      band: health.band,
      note: `score ${health.score} · ${health.formula}`,
    };
  }
  return {
    id: health.department,
    label: departmentLabel(health.department),
    band: null,
    note: health.reason,
  };
}

function toTimelineFact(observation: Observation): TimelineFact {
  return {
    id: observation.id,
    kind: observation.kind,
    occurredAt: observation.occurredAt,
    summary: observation.summary,
    businessId: observation.businessId,
  };
}

function sameCalendarMonth(iso: string, now: string): boolean {
  const a = new Date(iso);
  const b = new Date(now);
  return (
    a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth()
  );
}

export async function loadCommandCentreFacts(input: {
  founderName: string;
  now?: string;
}): Promise<CommandCentreFacts> {
  const now = input.now ?? new Date().toISOString();

  const spine = await resolveBusinessSpine();
  const [snapshot, feed] = await Promise.all([
    loadMemorySnapshot(spine),
    resolveLearningFeed(),
  ]);
  const [observations, commandCentre, recommendationsPayload] = await Promise.all([
    feed.list({ limit: FEED_WINDOW }),
    loadCommandCentre(),
    loadRecommendations(),
  ]);

  const graph = buildKnowledgeGraph(snapshot);
  const data = projectMissionControlData(graph);
  const briefing = buildBriefing(data, { now });
  const health = computeDepartmentHealth({ graph, observations, now });

  const pendingDecisions: PendingDecisionFact[] = commandCentre.pending.map(
    (pending) => ({
      requestId: pending.requestId,
      title: pending.title,
      previewLines: pending.previewLines,
      tier: pending.tier,
      requestedAt: pending.requestedAt,
    }),
  );

  const recommendations: RecommendationFact[] =
    recommendationsPayload.recommendations.map((rec) => ({
      id: rec.id,
      whatHappened: rec.whatHappened,
      recommendedAction: rec.recommendedAction,
      expectedImpact: rec.expectedImpact,
      urgency: rec.urgency,
      riskLevel: rec.riskLevel,
      link: rec.link,
    }));

  const address = composeSituationAddress({
    briefing,
    health,
    pendingApprovals: pendingDecisions.length,
  });

  const weekAgo = new Date(new Date(now).getTime() - 7 * 24 * 60 * 60 * 1000);
  const measuredVisitsAllTime = snapshot.metrics.reduce(
    (sum, row) => sum + row.views,
    0,
  );
  const measuredVisitsWeek = snapshot.metrics
    .filter((row) => new Date(row.date) >= weekAgo)
    .reduce((sum, row) => sum + row.views, 0);

  return {
    now,
    founderName: input.founderName,
    briefing,
    address,
    bookSize: snapshot.businesses.length,
    liveAccounts: snapshot.businesses.filter((b) => b.stage === "live").length,
    newThisMonth: snapshot.businesses.filter((b) =>
      sameCalendarMonth(b.createdAt, now),
    ).length,
    measuredVisitsAllTime,
    measuredVisitsWeek,
    // Structurally unmeasured today: no revenue store exists (ADR-057).
    revenue: null,
    departments: health.map(toGlow),
    pendingDecisions,
    recommendations,
    timeline: observations.map(toTimelineFact),
  };
}
