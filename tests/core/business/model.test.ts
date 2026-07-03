import { describe, expect, it } from "vitest";
import {
  ALL_LIFECYCLE_STATES,
  LIFECYCLE_STAGES,
  LOST_STAGES,
  isLostStage,
  isStageAtLeast,
  stageIndex,
  stageLabel,
} from "@/core/business";

describe("business lifecycle model", () => {
  it("defines the founder-superset lifecycle in order", () => {
    expect(LIFECYCLE_STAGES).toEqual([
      "lead",
      "qualified",
      "proposed",
      "won",
      "building",
      "review",
      "live",
      "account",
    ]);
  });

  it("orders stages by index", () => {
    expect(stageIndex("lead")).toBe(0);
    expect(stageIndex("account")).toBe(LIFECYCLE_STAGES.length - 1);
    expect(stageIndex("building")).toBeGreaterThan(stageIndex("won"));
  });

  it("compares stage progress", () => {
    expect(isStageAtLeast("building", "won")).toBe(true);
    expect(isStageAtLeast("lead", "qualified")).toBe(false);
    expect(isStageAtLeast("live", "live")).toBe(true);
  });

  it("defines the lost states off the progression ladder (ADR-024)", () => {
    expect(LOST_STAGES).toEqual(["not_interested", "not_going_ahead"]);
    expect(ALL_LIFECYCLE_STATES).toEqual([...LIFECYCLE_STAGES, ...LOST_STAGES]);
    expect(isLostStage("not_interested")).toBe(true);
    expect(isLostStage("lead")).toBe(false);
    // Lost states never count as progress.
    expect(isStageAtLeast("not_interested", "lead")).toBe(false);
  });

  it("labels stages for humans", () => {
    expect(stageLabel("not_interested")).toBe("not interested");
    expect(stageLabel("lead")).toBe("lead");
  });
});
