import { describe, expect, it } from "vitest";
import {
  CALL_COMPLIANCE_GATES,
  canRecordCalls,
  type CallComplianceGateId,
} from "@/core/call-compliance";

/**
 * NOTHING RECORDS UNTIL EVERY BOX IS TICKED (PRD-008, brief §8).
 *
 * The compliance brief ends in a fourteen-gate GO/NO-GO checklist built
 * from primary sources (IPA 2016 s.3/s.46, SI 2018/356, PECR reg 22, ICO
 * and Ofcom guidance). These tests make the checklist load-bearing: the
 * gate count is pinned so a refactor cannot quietly drop one, and the
 * resolver has no path to GO with anything missing.
 */

const ALL: ReadonlySet<CallComplianceGateId> = new Set(
  CALL_COMPLIANCE_GATES.map((gate) => gate.id),
);

describe("the gate list is the brief's, whole", () => {
  it("carries exactly fourteen gates, uniquely identified", () => {
    expect(CALL_COMPLIANCE_GATES.length).toBe(14);
    expect(ALL.size).toBe(14);
  });

  it("every gate names its evidence basis from the brief", () => {
    for (const gate of CALL_COMPLIANCE_GATES) {
      expect(gate.basis, gate.id).toMatch(/VERIFIED|PRACTICE|NEEDS-REVIEW/);
      expect(gate.requirement.length, gate.id).toBeGreaterThan(20);
    }
  });

  it("solicitor sign-off is itself a gate — the checklist cannot complete on unreviewed analysis", () => {
    expect(ALL.has("solicitor-sign-off")).toBe(true);
  });

  it("the announcement gate demands recording technically cannot start first", () => {
    const announcement = CALL_COMPLIANCE_GATES.find(
      (gate) => gate.id === "announcement-in-platform",
    );
    expect(announcement?.requirement).toMatch(/cannot start before/);
  });
});

describe("canRecordCalls — no path to GO with a box unticked", () => {
  it("all fourteen ticked → GO, nothing missing", () => {
    const verdict = canRecordCalls(ALL);
    expect(verdict.go).toBe(true);
    expect(verdict.missing).toEqual([]);
  });

  it("one missing → NO-GO, and the gap is named", () => {
    const nearly = new Set(ALL);
    nearly.delete("retention-and-deletion");
    const verdict = canRecordCalls(nearly);
    expect(verdict.go).toBe(false);
    expect(verdict.missing).toEqual(["retention-and-deletion"]);
  });

  it("nothing ticked → every gate reported, in brief order — all gaps at once, never just the first", () => {
    const verdict = canRecordCalls(new Set());
    expect(verdict.go).toBe(false);
    expect(verdict.missing).toEqual(CALL_COMPLIANCE_GATES.map((g) => g.id));
  });
});
