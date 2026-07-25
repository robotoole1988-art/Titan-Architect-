import { describe, expect, it } from "vitest";
import { composeSituationAddress } from "@/core/mission-control";
import type { Briefing } from "@/core/mission-control";
import type { DepartmentHealth } from "@/core/health-engine";

/**
 * ADR-056 Decision 2: the address-line contract. Deterministic, ranked,
 * max three clauses + the approval clause; the quiet line only when every
 * input is zero (honest by construction).
 */

function briefing(overrides: Partial<Briefing> = {}): Briefing {
  return {
    generatedAt: "2026-07-25T12:00:00.000Z",
    enquiriesNeedingAttention: [],
    pipeline: { byStage: [], total: 0, stale: [], dealsNeedingAction: [] },
    buildQueue: { inProgress: [], total: 0 },
    accounts: [],
    topActions: [],
    ...overrides,
  } as Briefing;
}

function attention(slaBreached: boolean) {
  return {
    enquiryId: "e1",
    businessId: "b1",
    businessName: "X",
    name: "Dana",
    contact: "c",
    sourcePage: "/",
    createdAt: "2026-07-25T10:00:00.000Z",
    ageMinutes: 120,
    slaBreached,
    minutesPastSla: slaBreached ? 105 : 0,
    link: "/crm/b1",
  };
}

function red(department: string): DepartmentHealth {
  return {
    department,
    scoreable: true,
    score: 20,
    band: "red",
    confidence: "high",
    factors: [],
    formula: "",
    trend: null,
  } as unknown as DepartmentHealth;
}

describe("composeSituationAddress", () => {
  it("leads with SLA breaches and always closes with the approval clause", () => {
    const address = composeSituationAddress({
      briefing: briefing({
        enquiriesNeedingAttention: [attention(true), attention(true), attention(false)],
      }),
      health: [],
      pendingApprovals: 0,
    });
    expect(address.quiet).toBe(false);
    expect(address.line).toBe(
      "Two enquiries are aging past SLA; one new enquiry waits; nothing awaits your approval.",
    );
  });

  it("speaks at most three clauses plus approvals, ranked by consequence", () => {
    const address = composeSituationAddress({
      briefing: briefing({
        enquiriesNeedingAttention: [attention(true)],
        pipeline: {
          byStage: [],
          total: 3,
          stale: [],
          dealsNeedingAction: [
            { businessId: "b", businessName: "B", stage: "proposed", daysSinceMovement: 9, stale: true, link: "/crm/b" },
          ],
        },
        buildQueue: {
          inProgress: [
            { businessId: "b", businessName: "B", inProgressCount: 1, reviewWaiting: ["website"], stalled: [], link: "/crm/b" },
          ],
          total: 1,
        },
      }),
      health: [red("Measurement")],
      pendingApprovals: 2,
    });
    // breach + red + stale spoken; review-gate clause (rank 5) dropped.
    expect(address.line).toBe(
      "One enquiry is aging past SLA; Measurement health is red; one proposal has gone quiet; two actions await your approval.",
    );
    expect(address.line).not.toContain("review");
  });

  it("honest absence: the quiet line ONLY when every input is zero", () => {
    const quiet = composeSituationAddress({
      briefing: briefing(),
      health: [],
      pendingApprovals: 0,
    });
    expect(quiet.quiet).toBe(true);
    expect(quiet.line).toBe(
      "All quiet. Enquiries answered, nothing stalled, nothing awaiting your approval.",
    );

    // One pending approval alone → NOT quiet.
    const oneThing = composeSituationAddress({
      briefing: briefing(),
      health: [],
      pendingApprovals: 1,
    });
    expect(oneThing.quiet).toBe(false);
    expect(oneThing.line).toBe("One action awaits your approval.");
  });

  it("never exclaims and reads calmly", () => {
    const address = composeSituationAddress({
      briefing: briefing({ enquiriesNeedingAttention: [attention(true)] }),
      health: [],
      pendingApprovals: 0,
    });
    expect(address.line).not.toContain("!");
  });
});

describe("honest absence holds against EVERY dimension alone (review finding)", () => {
  it("each single non-zero input defeats the quiet line", () => {
    const cases = [
      {
        name: "waiting enquiry only",
        input: {
          briefing: briefing({ enquiriesNeedingAttention: [attention(false)] }),
          health: [],
          pendingApprovals: 0,
        },
        expectContains: "one new enquiry waits",
      },
      {
        name: "red department only",
        input: { briefing: briefing(), health: [red("Measurement")], pendingApprovals: 0 },
        expectContains: "Measurement health is red",
      },
      {
        name: "stale deal only",
        input: {
          briefing: briefing({
            pipeline: {
              byStage: [],
              total: 1,
              stale: [],
              dealsNeedingAction: [
                { businessId: "b", businessName: "B", stage: "proposed", daysSinceMovement: 9, stale: true, link: "/crm/b" },
              ],
            },
          }),
          health: [],
          pendingApprovals: 0,
        },
        expectContains: "one proposal has gone quiet",
      },
      {
        name: "review-gate item only",
        input: {
          briefing: briefing({
            buildQueue: {
              inProgress: [
                { businessId: "b", businessName: "B", inProgressCount: 1, reviewWaiting: ["website"], stalled: [], link: "/crm/b" },
              ],
              total: 1,
            },
          }),
          health: [],
          pendingApprovals: 0,
        },
        expectContains: "one build item waits on your review",
      },
    ] as const;
    for (const testCase of cases) {
      const address = composeSituationAddress(testCase.input);
      expect(address.quiet, testCase.name).toBe(false);
      expect(address.line.toLowerCase(), testCase.name).toContain(testCase.expectContains.toLowerCase());
    }
  });
});
