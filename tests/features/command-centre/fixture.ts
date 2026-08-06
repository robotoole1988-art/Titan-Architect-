/**
 * Command Centre test fixtures (ADR-057) — a facts factory with Partial
 * overrides, following the repo's fixed-clock convention.
 */

import type { Briefing } from "@/core/mission-control";
import type { CommandCentreFacts } from "@/features/command-centre/model/facts";

export const NOW = "2026-07-26T14:30:00.000Z";

export function makeBriefing(overrides: Partial<Briefing> = {}): Briefing {
  return {
    generatedAt: NOW,
    enquiriesNeedingAttention: [],
    pipeline: {
      byStage: [
        { stage: "lead", count: 5 },
        { stage: "qualified", count: 1 },
      ],
      total: 6,
      stale: [],
      dealsNeedingAction: [],
    },
    buildQueue: { inProgress: [], total: 0 },
    accounts: [],
    topActions: [],
    isEmpty: false,
    ...overrides,
  };
}

export function makeFacts(
  overrides: Partial<CommandCentreFacts> = {},
): CommandCentreFacts {
  return {
    now: NOW,
    founderName: "Robert",
    briefing: makeBriefing(),
    address: {
      line: "Nothing awaits your approval.",
      quiet: true,
      facts: ["pending approvals: 0"],
    },
    bookSize: 8,
    liveAccounts: 2,
    newThisMonth: 1,
    measuredVisitsAllTime: 176,
    measuredVisitsWeek: 0,
    liveSites: 3,
    enquiriesAllTime: 12,
    revenue: null,
    departments: [
      { id: "pipeline", label: "Pipeline", band: "green", note: "score 82" },
      { id: "enquiries", label: "Enquiries", band: "amber", note: "score 55" },
      {
        id: "measurement",
        label: "Measurement",
        band: null,
        note: "not yet scoreable — needs live traffic",
      },
    ],
    pendingDecisions: [],
    recommendations: [],
    timeline: [],
    ...overrides,
  };
}
