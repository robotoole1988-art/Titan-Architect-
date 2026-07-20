import { describe, expect, it } from "vitest";
import {
  COMMAND_CATALOGUE,
  canBrainInitiate,
  effectiveTier,
  getCommandAction,
  requiresApproval,
} from "@/core/command-mode";
import type { Observation } from "@/core/memory-spine";
import { fixtureGraph } from "../brain-orchestrator/fixture";

/**
 * ADR-052 §1–2: the catalogue is policy-as-data and the v1 tier policy is
 * constitutional — these tests are the constitution's enforcement.
 */

const graph = fixtureGraph();

describe("the action catalogue (policy as data)", () => {
  it("contains exactly the five v1 actions — nothing customer-visible, no spend, no delete", () => {
    expect(COMMAND_CATALOGUE.map((action) => action.id)).toEqual([
      "create_next_action",
      "append_business_note",
      "draft_follow_up",
      "update_build_item",
      "delegate_recommendation",
    ]);
  });

  it("declares every action internal and reversible", () => {
    for (const action of COMMAND_CATALOGUE) {
      expect(action.internal).toBe(true);
      expect(action.reversible).toBe(true);
    }
  });

  it("v1 policy: NO action is tier auto — everything gates on founder approval", () => {
    for (const action of COMMAND_CATALOGUE) {
      expect(action.tier).not.toBe("auto");
      expect(requiresApproval(action.tier)).toBe(true);
    }
  });

  it("previews are concrete — they name the business and what will happen", () => {
    const action = getCommandAction("create_next_action")!;
    const params = { businessId: "b-roof", text: "chase the quote" };
    expect(action.validate(params, graph)).toEqual([]);
    const preview = action.preview(params, graph);
    expect(preview.businessId).toBe("b-roof");
    expect(preview.lines[0]).toContain("Rapid Roofing");
    expect(preview.lines[0]).toContain("chase the quote");
  });

  it("the follow-up draft preview states it is never sent", () => {
    const action = getCommandAction("draft_follow_up")!;
    const params = { enquiryId: "e-breach" };
    expect(action.validate(params, graph)).toEqual([]);
    const preview = action.preview(params, graph);
    expect(preview.lines.join(" ")).toMatch(/NEVER sent/);
  });

  it("validation is honest about unknown targets", () => {
    const action = getCommandAction("create_next_action")!;
    expect(
      action.validate({ businessId: "nope", text: "x" }, graph),
    ).toContain("Unknown business.");
    expect(
      getCommandAction("update_build_item")!.validate(
        { businessId: "b-build", itemKind: "blimps", status: "flying" },
        graph,
      ),
    ).toEqual(['Unknown build item kind "blimps".', 'Unknown build status "flying".']);
  });
});

describe("guardrail tier machinery (promotion is a founder decision, as data)", () => {
  const promotion = (source: string, tier = "auto"): Observation => ({
    id: "obs-1",
    kind: "tier_promoted",
    occurredAt: "2026-07-20T10:00:00.000Z",
    summary: "Promoted create_next_action to auto",
    payload: { actionId: "create_next_action", tier },
    source,
  });

  it("defaults to the catalogue tier with no founder record", () => {
    expect(effectiveTier("create_next_action", [])).toBe("recommend_first");
    expect(effectiveTier("update_build_item", [])).toBe("approval_required");
  });

  it("honours a founder promotion recorded in the learning feed", () => {
    expect(effectiveTier("create_next_action", [promotion("founder")])).toBe("auto");
    expect(requiresApproval(effectiveTier("create_next_action", [promotion("founder")]))).toBe(false);
  });

  it("ignores promotions from anyone but the founder — the Brain cannot promote itself", () => {
    expect(effectiveTier("create_next_action", [promotion("command-mode")])).toBe(
      "recommend_first",
    );
    expect(effectiveTier("create_next_action", [promotion("decision-engine")])).toBe(
      "recommend_first",
    );
  });

  it("ignores malformed tiers and takes the newest founder decision", () => {
    expect(
      effectiveTier("create_next_action", [promotion("founder", "yolo")]),
    ).toBe("recommend_first");
    // Feed order is newest first — the demotion recorded later wins.
    const demotedThenPromoted = [
      { ...promotion("founder", "approval_required"), id: "obs-2", occurredAt: "2026-07-20T11:00:00.000Z" },
      promotion("founder", "auto"),
    ];
    expect(effectiveTier("create_next_action", demotedThenPromoted)).toBe(
      "approval_required",
    );
  });

  it("only recommend_first (and a future auto) may be Brain-initiated", () => {
    expect(canBrainInitiate("recommend_first")).toBe(true);
    expect(canBrainInitiate("auto")).toBe(true);
    expect(canBrainInitiate("approval_required")).toBe(false);
  });
});
