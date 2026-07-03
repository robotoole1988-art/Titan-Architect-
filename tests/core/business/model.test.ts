import { describe, expect, it } from "vitest";
import {
  LIFECYCLE_STAGES,
  isStageAtLeast,
  stageIndex,
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
});
