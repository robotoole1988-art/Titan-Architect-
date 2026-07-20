import { describe, expect, it } from "vitest";
import { generateRecommendations } from "@/core/brain-orchestrator";
import {
  buildHealthSnapshotObservations,
  computeDepartmentHealth,
  type DepartmentHealth,
} from "@/core/health-engine";
import type { Observation } from "@/core/memory-spine";
import { NOW, THRESHOLDS, emptyGraph, fixtureGraph } from "../brain-orchestrator/fixture";

/**
 * ADR-051: the Business Health Engine. Five departments scored purely over
 * the spine — inspectable formulas, honest not-scoreable states, degraded
 * data lowering confidence VISIBLY, trend from feed snapshots, and
 * threshold-crossings feeding the Decision Engine.
 */

function compute(observations: ReadonlyArray<Observation> = []): DepartmentHealth[] {
  return computeDepartmentHealth({
    graph: fixtureGraph(),
    observations,
    now: NOW,
    thresholds: THRESHOLDS,
  });
}

function dept(healths: DepartmentHealth[], id: string): DepartmentHealth {
  const found = healths.find((health) => health.department === id);
  expect(found, `expected department "${id}"`).toBeDefined();
  return found!;
}

describe("the five departments on the fixture", () => {
  const healths = compute();

  it("reports all five, in stable order", () => {
    expect(healths.map((health) => health.department)).toEqual([
      "enquiries",
      "pipeline",
      "delivery",
      "experience",
      "measurement",
    ]);
  });

  it("enquiries: the open SLA breach drags the score down, with evidence", () => {
    const health = dept(healths, "enquiries");
    if (!health.scoreable) throw new Error("must be scoreable");
    // 1 of 2 window enquiries handled in SLA + 1 open breach.
    expect(health.score).toBeLessThan(80);
    expect(health.factors.some((factor) => factor.id === "sla_compliance")).toBe(true);
    const breaches = health.factors.find((factor) => factor.id === "open_breaches")!;
    expect(breaches.evidence.length).toBeGreaterThan(0);
    expect(breaches.evidence[0].provenance).toContain("memory spine");
    expect(health.formula).toContain("sla_compliance");
    expect(health.formula).toContain("weight");
  });

  it("delivery: blocked build items produce an amber-or-worse band", () => {
    const health = dept(healths, "delivery");
    if (!health.scoreable) throw new Error("must be scoreable");
    expect(["amber", "red"]).toContain(health.band);
    expect(health.brainHealth.level).toMatch(/degraded|unhealthy/);
    const flow = health.factors.find((factor) => factor.id === "flow")!;
    // 2 of 3 non-terminal items blocked/stalled → flow ≈ 33.
    expect(flow.score).toBeLessThan(50);
  });

  it("experience: the missing Lighthouse input is NAMED and lowers confidence", () => {
    const health = dept(healths, "experience");
    if (!health.scoreable) throw new Error("must be scoreable");
    expect(health.confidence).not.toBe("high");
    expect(health.gaps.join(" ")).toMatch(/lighthouse/i);
    // FAQ coverage: roofing banked, signwriting not → 50%.
    const faq = health.factors.find((factor) => factor.id === "faq_coverage")!;
    expect(faq.score).toBe(50);
  });

  it("measurement: trend factor scores below neutral on the -75% drop", () => {
    const health = dept(healths, "measurement");
    if (!health.scoreable) throw new Error("must be scoreable");
    const traffic = health.factors.find((factor) => factor.id === "traffic_trend")!;
    expect(traffic.score).toBeLessThan(50);
    expect(traffic.detail).toMatch(/-75%|75%/);
  });

  it("every scoreable department is fully inspectable", () => {
    for (const health of healths) {
      if (!health.scoreable) continue;
      expect(health.score).toBeGreaterThanOrEqual(0);
      expect(health.score).toBeLessThanOrEqual(100);
      expect(["green", "amber", "red"]).toContain(health.band);
      expect(["high", "medium", "low"]).toContain(health.confidence);
      expect(health.formula.length).toBeGreaterThan(20);
      const weightSum = health.factors.reduce((sum, factor) => sum + factor.weight, 0);
      expect(weightSum).toBeCloseTo(1, 5); // weights renormalised
      for (const factor of health.factors) {
        expect(factor.score).toBeGreaterThanOrEqual(0);
        expect(factor.score).toBeLessThanOrEqual(100);
        expect(factor.detail.length).toBeGreaterThan(5);
      }
      // ADR-015 implemented: band ↔ BrainHealth level.
      const expectedLevel =
        health.band === "green" ? "healthy" : health.band === "amber" ? "degraded" : "unhealthy";
      expect(health.brainHealth.level).toBe(expectedLevel);
      expect(health.brainHealth.checkedAt).toBe(NOW);
    }
  });

  it("is deterministic: identical data, byte-identical output", () => {
    expect(JSON.stringify(compute())).toBe(JSON.stringify(compute()));
  });
});

describe("Activation Law: honest not-scoreable states", () => {
  it("an empty world scores NOTHING — every department names what it needs", () => {
    const healths = computeDepartmentHealth({
      graph: emptyGraph(),
      observations: [],
      now: NOW,
      thresholds: THRESHOLDS,
    });
    expect(healths).toHaveLength(5);
    for (const health of healths) {
      expect(health.scoreable).toBe(false);
      if (!health.scoreable) {
        expect(health.reason).toMatch(/needs/i);
        expect(health.brainHealth.level).toBe("unknown");
      }
    }
  });
});

describe("trend from feed snapshots", () => {
  function snapshot(department: string, score: number, occurredAt: string): Observation {
    return {
      id: `obs-${department}-${occurredAt}`,
      kind: "health_snapshot",
      occurredAt,
      summary: `${department} health`,
      payload: { department, score },
      source: "health-engine",
    };
  }

  it("no prior snapshot → trend honestly null (first reading)", () => {
    const health = dept(compute(), "delivery");
    if (!health.scoreable) throw new Error("scoreable");
    expect(health.trend).toBeNull();
  });

  it("a prior snapshot yields a real delta and direction", () => {
    const current = dept(compute(), "delivery");
    if (!current.scoreable) throw new Error("scoreable");
    const withPrior = dept(
      compute([snapshot("delivery", current.score + 20, "2026-07-13T12:00:00.000Z")]),
      "delivery",
    );
    if (!withPrior.scoreable) throw new Error("scoreable");
    expect(withPrior.trend).toEqual({
      delta: -20,
      direction: "down",
      since: "2026-07-13T12:00:00.000Z",
    });
  });

  it("snapshot observations serialize the payload the trend reads back", () => {
    const drafts = buildHealthSnapshotObservations(compute(), NOW);
    expect(drafts.length).toBe(5); // one per SCOREABLE department… see assertion below
    for (const draft of drafts) {
      expect(draft.kind).toBe("health_snapshot");
      expect(draft.source).toBe("health-engine");
      expect(typeof draft.payload?.department).toBe("string");
    }
    // Not-scoreable departments snapshot too (score null) so gaps have history.
    const empty = buildHealthSnapshotObservations(
      computeDepartmentHealth({ graph: emptyGraph(), observations: [], now: NOW, thresholds: THRESHOLDS }),
      NOW,
    );
    expect(empty.every((draft) => draft.payload?.score === null)).toBe(true);
  });
});

describe("threshold-crossings feed the Decision Engine", () => {
  it("amber/red departments emit department_health recommendations with the dragging factors", () => {
    const healths = compute();
    const recommendations = generateRecommendations({
      graph: fixtureGraph(),
      observations: [],
      now: NOW,
      thresholds: THRESHOLDS,
      health: healths,
    });
    const healthRecs = recommendations.filter((rec) => rec.rule === "department_health");
    expect(healthRecs.length).toBeGreaterThan(0);
    const delivery = healthRecs.find((rec) => rec.id === "department_health:delivery");
    expect(delivery).toBeDefined();
    expect(delivery!.whatHappened).toMatch(/delivery/i);
    expect(delivery!.whatHappened).toMatch(/amber|red/i);
    expect(delivery!.whatHappened).toMatch(/flow|blocked|stalled/i);
    expect(delivery!.evidence.length).toBeGreaterThan(0);
  });

  it("green departments emit nothing", () => {
    const healths = compute().map((health) =>
      health.scoreable ? { ...health, band: "green" as const } : health,
    );
    const recommendations = generateRecommendations({
      graph: fixtureGraph(),
      observations: [],
      now: NOW,
      thresholds: THRESHOLDS,
      health: healths,
    });
    expect(recommendations.some((rec) => rec.rule === "department_health")).toBe(false);
  });
});
