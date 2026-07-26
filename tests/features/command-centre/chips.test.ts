/**
 * ADR-057 — every chip is a measured figure with provenance; structural
 * absence renders the crafted line, never a fake zero.
 */

import { describe, expect, it } from "vitest";
import { buildHealthChips } from "@/features/command-centre/model/chips";
import { makeFacts } from "./fixture";

describe("health chips render measured figures with provenance (ADR-057)", () => {
  it("maps live accounts against the book with the exclusion provenance", () => {
    const chip = buildHealthChips(makeFacts()).find((c) => c.key === "live-accounts");
    expect(chip).toBeDefined();
    expect(chip!.value).toBe("2");
    expect(chip!.sub).toBe("of 8 in the book");
    expect(chip!.href).toBe("/businesses");
    expect(chip!.provenance.join(" ")).toContain("internal = false");
  });

  it("renders revenue as ONE crafted absence chip while unmeasured", () => {
    const chips = buildHealthChips(makeFacts({ revenue: null }));
    const revenue = chips.filter((c) => c.key.startsWith("revenue"));
    expect(revenue).toHaveLength(1);
    expect(revenue[0].value).toBe("—");
    expect(revenue[0].empty).toBe(true);
    expect(revenue[0].sub).toBe("Measurement begins with your first live campaign.");
    expect(revenue[0].gold).toBe(false);
  });

  it("becomes the today/week/month trio the day revenue is measured", () => {
    const chips = buildHealthChips(
      makeFacts({ revenue: { today: 4820, week: 28340, month: 117620 } }),
    );
    const revenue = chips.filter((c) => c.key.startsWith("revenue"));
    expect(revenue.map((c) => c.key)).toEqual([
      "revenue-today",
      "revenue-week",
      "revenue-month",
    ]);
    expect(revenue[0].value).toBe("£4,820");
    expect(revenue[0].gold).toBe(true);
    expect(revenue[0].empty).toBe(false);
  });

  it("summarises departments by honest band, unscoreable included", () => {
    const chip = buildHealthChips(makeFacts()).find((c) => c.key === "departments");
    expect(chip!.value).toBe("3");
    expect(chip!.sub).toBe("1 green · 1 amber · 1 not yet scoreable");
    expect(chip!.href).toBe("/brain");
  });

  it("flags empty states so the room can style crafted absence", () => {
    const chips = buildHealthChips(
      makeFacts({ liveAccounts: 0, newThisMonth: 0 }),
    );
    expect(chips.find((c) => c.key === "live-accounts")!.empty).toBe(true);
    expect(chips.find((c) => c.key === "new-this-month")!.empty).toBe(true);
    expect(chips.find((c) => c.key === "new-this-month")!.sub).toBe(
      "none yet this month",
    );
  });
});
