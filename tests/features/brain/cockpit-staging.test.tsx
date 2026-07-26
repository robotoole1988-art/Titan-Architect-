import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProvenanceInfo } from "@/components/ui/provenance-info";
import {
  confidenceBadged,
  healthDotVisible,
  historyStatusBadged,
  recommendationBadge,
  trendVisible,
} from "@/features/brain/model/badges";
import { acceptableNarration } from "@/features/mission-control/data/resolve-address";

/**
 * ADR-056 Decisions 2–4 pinned: the exceptional-badge predicate table, the
 * narration voice guard, and the ⓘ verbatim-provenance claim — the staging
 * rules that must survive the M2 rollout mechanically, beyond one founder
 * look at one dataset.
 */

describe("the exceptional-badge table (Decision 3)", () => {
  it("recommendations: NOW wins; high risk only when not already now; else nothing", () => {
    expect(recommendationBadge("now", "high")).toBe("now");
    expect(recommendationBadge("now", "low")).toBe("now");
    expect(recommendationBadge("today", "high")).toBe("high-risk");
    expect(recommendationBadge("this_week", "high")).toBe("high-risk");
    expect(recommendationBadge("today", "medium")).toBeNull();
    expect(recommendationBadge("this_week", "low")).toBeNull();
  });

  it("command history: only failure and partiality badge", () => {
    expect(historyStatusBadged("failed")).toBe(true);
    expect(historyStatusBadged("partial")).toBe(true);
    expect(historyStatusBadged("executed")).toBe(false);
  });

  it("health: dot only amber/red; trend only on real movement", () => {
    expect(healthDotVisible(true, "red")).toBe(true);
    expect(healthDotVisible(true, "amber")).toBe(true);
    expect(healthDotVisible(true, "green")).toBe(false);
    expect(healthDotVisible(false, "red")).toBe(false);
    expect(trendVisible({ delta: 5, direction: "up" })).toBe(true);
    expect(trendVisible({ delta: -3, direction: "down" })).toBe(true);
    expect(trendVisible({ delta: 0, direction: "flat" })).toBe(false);
    expect(trendVisible(null)).toBe(false);
    expect(trendVisible(undefined)).toBe(false);
  });

  it("ask answers: uncertainty badges, confidence does not", () => {
    expect(confidenceBadged("high")).toBe(false);
    expect(confidenceBadged("medium")).toBe(true);
    expect(confidenceBadged("low")).toBe(true);
  });
});

describe("the narration voice guard (Decision 2)", () => {
  it("accepts calm, bounded rephrasings", () => {
    expect(
      acceptableNarration(
        "Two enquiries are aging past SLA; nothing awaits your approval.",
        false,
      ),
    ).toBe(true);
  });

  it("rejects exclamation, bloat, and emptiness", () => {
    expect(acceptableNarration("Everything is on fire!", false)).toBe(false);
    expect(acceptableNarration("x".repeat(221), false)).toBe(false);
    expect(acceptableNarration("   ", false)).toBe(false);
  });

  it("a quiet world stays quiet — invented urgency is rejected", () => {
    expect(acceptableNarration("Act NOW on the urgent breach.", true)).toBe(false);
    expect(acceptableNarration("All quiet — nothing needs you.", true)).toBe(true);
    // The same words are fine when the world ISN'T quiet.
    expect(acceptableNarration("One enquiry needs you now.", false)).toBe(true);
  });
});

describe("the ⓘ pattern (Decision 4): provenance staged VERBATIM", () => {
  it("renders every lineage line exactly as it stood on the wall", () => {
    const lines = [
      "Decision Engine · anthropic narration · approval-gated (ADR-052)",
      "Health Engine · deterministic · formulas in the Brain",
      "ADR-052 · nothing runs without you",
    ];
    const html = renderToStaticMarkup(
      <ProvenanceInfo lines={lines} defaultOpen />,
    );
    for (const line of lines) {
      expect(html).toContain(
        line.replace(/&/g, "&amp;").replace(/·/g, "·"),
      );
    }
    expect(html).toContain("data-provenance-content");
  });

  it("renders nothing at all with no lineage (no empty ⓘ decoration)", () => {
    expect(renderToStaticMarkup(<ProvenanceInfo lines={[]} />)).toBe("");
  });
});
