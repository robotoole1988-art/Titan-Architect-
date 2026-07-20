import { describe, expect, it } from "vitest";
import {
  generateRecommendations,
  narrateRecommendation,
  type Recommendation,
} from "@/core/brain-orchestrator";
import type { BrainReasoner } from "@/core/ask-brain";
import type { Observation } from "@/core/memory-spine";
import { NOW, THRESHOLDS, emptyGraph, fixtureGraph } from "./fixture";

/**
 * ADR-050: the Decision Engine — ADR-015's contracts, implemented. Six pure
 * rules over the memory spine produce ranked, evidence-backed, provenance-
 * linked recommendations. Deterministic, honest, read-only.
 */

function generate(observations: ReadonlyArray<Observation> = []): Recommendation[] {
  return generateRecommendations({
    graph: fixtureGraph(),
    observations,
    now: NOW,
    thresholds: THRESHOLDS,
  });
}

function byRule(recommendations: Recommendation[], rule: string): Recommendation {
  const found = recommendations.find((rec) => rec.rule === rule);
  expect(found, `expected a "${rule}" recommendation`).toBeDefined();
  return found!;
}

describe("the six rules (Activation Law: only where data exists)", () => {
  const recommendations = generate();

  it("fires exactly one recommendation per rule on the fixture", () => {
    expect(recommendations.map((rec) => rec.rule).sort()).toEqual([
      "build_blocked",
      "enquiry_sla",
      "measurement_move",
      "media_review",
      "missing_content",
      "stale_deal",
    ]);
  });

  it("enquiry_sla: breach detected with measured minutes, urgency NOW", () => {
    const rec = byRule(recommendations, "enquiry_sla");
    expect(rec.id).toBe("enquiry_sla:e-breach");
    expect(rec.whatHappened).toContain("Dana Homeowner");
    expect(rec.whatHappened).toMatch(/75 minutes past|90 minutes/);
    expect(rec.urgency).toBe("now");
    expect(rec.suggestedOwner).toBe("founder");
    expect(rec.riskLevel).toBe("high"); // risk of NOT acting
    expect(rec.link).toBe("/crm/b-roof");
    // The handled enquiry never fires.
    expect(recommendations.some((r) => r.id.includes("e-handled"))).toBe(false);
  });

  it("stale_deal: proposed business unmoved past the threshold", () => {
    const rec = byRule(recommendations, "stale_deal");
    expect(rec.id).toBe("stale_deal:b-deal");
    expect(rec.whatHappened).toContain("Slow Deal Co");
    expect(rec.whatHappened).toMatch(/10 days/);
    expect(rec.recommendedAction).toMatch(/chase|follow|close/i);
  });

  it("build_blocked: reports the gate + the stall, never the queued item", () => {
    const rec = byRule(recommendations, "build_blocked");
    expect(rec.id).toBe("build_blocked:b-build");
    expect(rec.whatHappened).toMatch(/website.*review/i);
    expect(rec.whatHappened).toMatch(/google_ads.*5 days/i);
    expect(rec.whatHappened).not.toMatch(/seo/i);
  });

  it("measurement_move: cites its own MEASURED delta — the only figure allowed", () => {
    const rec = byRule(recommendations, "measurement_move");
    expect(rec.id).toBe("measurement_move:b-roof");
    expect(rec.whatHappened).toMatch(/-75%|75%/);
    expect(rec.whatHappened).toMatch(/10 visits|40 visits/);
    expect(rec.expectedImpact).not.toMatch(/\d+%.*(more|increase|extra) (leads|enquiries|revenue)/i);
  });

  it("media_review: the founder gate has work waiting", () => {
    const rec = byRule(recommendations, "media_review");
    expect(rec.id).toBe("media_review:b-roof");
    expect(rec.whatHappened).toMatch(/1 generated asset/i);
    expect(rec.urgency).toBe("this_week");
  });

  it("missing_content: live site, unbanked trade — and ONLY that one", () => {
    const rec = byRule(recommendations, "missing_content");
    expect(rec.id).toBe("missing_content:b-signs");
    expect(rec.whatHappened).toContain("Northern Signs");
    // Rapid Roofing's trade IS banked — no missing_content for it.
    expect(recommendations.filter((r) => r.rule === "missing_content")).toHaveLength(1);
  });

  it("every recommendation carries the FULL shape with evidence + provenance", () => {
    for (const rec of recommendations) {
      expect(rec.whatHappened.length, rec.id).toBeGreaterThan(10);
      expect(rec.whyItMatters.length, rec.id).toBeGreaterThan(10);
      expect(rec.recommendedAction.length, rec.id).toBeGreaterThan(5);
      expect(rec.suggestedOwner).toBe("founder");
      expect(["now", "today", "this_week"]).toContain(rec.urgency);
      expect(["high", "medium"]).toContain(rec.confidence);
      expect(rec.expectedImpact.length, rec.id).toBeGreaterThan(5);
      expect(["low", "medium", "high"]).toContain(rec.riskLevel);
      expect(rec.evidence.length, rec.id).toBeGreaterThan(0);
      for (const record of rec.evidence) {
        expect(record.href, rec.id).toMatch(/^\//);
        expect(record.provenance, rec.id).toBeTruthy();
      }
    }
  });

  it("implements the ADR-015 contracts FOR REAL", () => {
    for (const rec of recommendations) {
      // BrainObservation: what happened, sourced and timestamped.
      expect(rec.observation.id).toBeTruthy();
      expect(rec.observation.source).toBe("memory-spine");
      expect(rec.observation.observedAt).toBe(NOW);
      // BrainDecision: rationale + read-only approval gate.
      expect(rec.decision.summary).toBe(rec.recommendedAction);
      expect(rec.decision.rationale).toBe(rec.whyItMatters);
      expect(rec.decision.requiresApproval).toBe(true);
      expect(rec.decision.basedOn).toContain(rec.observation.id);
      // BrainExecutionPlan with ONE pending task for the founder — no
      // department executes anything in v1.
      const task = rec.decision.plan!.tasks[0];
      expect(task.status).toBe("pending");
      expect(task.requiresApproval).toBe(true);
      expect(task.assignedDepartmentId).toBeUndefined();
    }
  });
});

describe("Activation Law + determinism + ranking", () => {
  it("an empty world produces ZERO recommendations — never placeholders", () => {
    expect(
      generateRecommendations({
        graph: emptyGraph(),
        observations: [],
        now: NOW,
        thresholds: THRESHOLDS,
      }),
    ).toEqual([]);
  });

  it("ranking is deterministic and stable: identical data, identical output", () => {
    expect(JSON.stringify(generate())).toBe(JSON.stringify(generate()));
  });

  it("orders by severity × urgency × confidence: the SLA breach leads", () => {
    const recommendations = generate();
    expect(recommendations[0].rule).toBe("enquiry_sla");
    // Scores strictly non-increasing, all positive.
    for (let index = 1; index < recommendations.length; index += 1) {
      expect(recommendations[index].score).toBeLessThanOrEqual(
        recommendations[index - 1].score,
      );
      expect(recommendations[index].score).toBeGreaterThan(0);
    }
    // The weakest class (missing_content) ranks below the SLA breach.
    const ids = recommendations.map((rec) => rec.rule);
    expect(ids.indexOf("enquiry_sla")).toBeLessThan(ids.indexOf("missing_content"));
  });
});

describe("suppression via the learning feed", () => {
  function feedEntry(kind: string, recommendationId: string): Observation {
    return {
      id: `obs-${kind}-${recommendationId}`,
      kind,
      occurredAt: "2026-07-19T09:00:00.000Z",
      summary: kind,
      payload: { recommendationId },
      source: "test",
    };
  }

  it("accepted and dismissed recommendations do not come back", () => {
    const suppressed = generate([
      feedEntry("recommendation_accepted", "enquiry_sla:e-breach"),
      feedEntry("recommendation_dismissed", "missing_content:b-signs"),
    ]);
    expect(suppressed.some((rec) => rec.id === "enquiry_sla:e-breach")).toBe(false);
    expect(suppressed.some((rec) => rec.id === "missing_content:b-signs")).toBe(false);
    expect(suppressed).toHaveLength(4); // the other four still stand
  });

  it("delegated recommendations (Command Mode, ADR-052) do not come back", () => {
    const suppressed = generate([
      feedEntry("recommendation_delegated", "stale_deal:b-deal"),
    ]);
    expect(suppressed.some((rec) => rec.id === "stale_deal:b-deal")).toBe(false);
    expect(suppressed).toHaveLength(5);
  });

  it("unrelated observations suppress nothing", () => {
    expect(generate([feedEntry("question", "whatever")])).toHaveLength(6);
  });
});

describe("LLM narration (behind the seam, honesty preserved)", () => {
  it("uses the reasoner's phrasing when it delivers", async () => {
    const stub: BrainReasoner = {
      async parseIntent() {
        return null;
      },
      async composeAnswer({ result }) {
        return `Narrated with ${result.records.length} evidence records.`;
      },
    };
    const rec = generate()[0];
    const narrated = await narrateRecommendation(rec, stub);
    expect(narrated).toContain("Narrated with");
  });

  it("falls back to null on reasoner failure — deterministic text stands", async () => {
    const failing: BrainReasoner = {
      async parseIntent() {
        return null;
      },
      async composeAnswer() {
        throw new Error("api down");
      },
    };
    const rec = generate()[0];
    expect(await narrateRecommendation(rec, failing)).toBeNull();
  });
});
