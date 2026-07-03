import { describe, expect, it } from "vitest";
import {
  BUILD_ITEM_KINDS,
  BUILD_ITEM_STATUSES,
  BuildTransitionError,
  assertBuildItemTransition,
  buildItemLabel,
  isManualBuildKind,
} from "@/core/business";

describe("build item model", () => {
  it("defines the founder's build items and status ladder", () => {
    expect(BUILD_ITEM_KINDS).toEqual([
      "website",
      "google_ads",
      "lsa",
      "seo",
      "gbp",
      "meta_ads",
      "ai_search",
    ]);
    expect(BUILD_ITEM_STATUSES).toEqual([
      "queued",
      "building",
      "ai_check",
      "review",
      "approved",
      "live",
    ]);
  });

  it("marks only the website as automated; the rest are manual for now", () => {
    expect(isManualBuildKind("website")).toBe(false);
    for (const kind of BUILD_ITEM_KINDS.filter((k) => k !== "website")) {
      expect(isManualBuildKind(kind)).toBe(true);
    }
  });

  it("the review gate is law: live only from approved, approved only from review", () => {
    expect(() => assertBuildItemTransition("queued", "live")).toThrow(
      BuildTransitionError,
    );
    expect(() => assertBuildItemTransition("building", "live")).toThrow(
      BuildTransitionError,
    );
    expect(() => assertBuildItemTransition("review", "live")).toThrow(
      BuildTransitionError,
    );
    expect(() => assertBuildItemTransition("queued", "approved")).toThrow(
      BuildTransitionError,
    );
    expect(() => assertBuildItemTransition("approved", "live")).not.toThrow();
    expect(() => assertBuildItemTransition("review", "approved")).not.toThrow();
  });

  it("allows send-back and manual progression", () => {
    expect(() => assertBuildItemTransition("review", "building")).not.toThrow();
    expect(() => assertBuildItemTransition("queued", "review")).not.toThrow();
    expect(() => assertBuildItemTransition("building", "ai_check")).not.toThrow();
    expect(() => assertBuildItemTransition("live", "building")).not.toThrow();
  });

  it("rejects a no-op transition", () => {
    expect(() => assertBuildItemTransition("review", "review")).toThrow(
      BuildTransitionError,
    );
  });

  it("labels item kinds for the UI", () => {
    expect(buildItemLabel("website")).toBe("Website");
    expect(buildItemLabel("google_ads")).toBe("Google Ads");
    expect(buildItemLabel("lsa")).toBe("Local Services Ads");
    expect(buildItemLabel("gbp")).toBe("Google Business Profile");
    expect(buildItemLabel("ai_search")).toBe("AI Search");
  });
});
