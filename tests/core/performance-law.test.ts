import { describe, expect, it } from "vitest";
import {
  PERFORMANCE_LAW,
  assessAgainstLaw,
  medianRun,
  type LawMeasurement,
} from "@/core/performance-law";

/**
 * The law is only a law if the numbers cannot drift (ADR-055).
 *
 * These are the floors and budgets written in
 * docs/experience/PUBLISHED-SITES-PERFORMANCE-LAW.md §§1–2. The CI gate, the
 * publish gate and the nightly sampler all read them from one file; this
 * suite pins that file to the document, so lowering a floor is a deliberate
 * act with a failing test in front of it — never a quiet edit.
 *
 * Budgets ratchet DOWN only. Raising one requires an ADR.
 */

const PASSING: LawMeasurement = {
  categories: { performance: 97, accessibility: 98, "best-practices": 100, seo: 100 },
  metrics: {
    "largest-contentful-paint": 1900,
    "total-blocking-time": 40,
    "cumulative-layout-shift": 0,
  },
  budgets: { document: 50, stylesheet: 0, script: 90, font: 60, total: 480 },
};

describe("the law's numbers match the document", () => {
  it("category floors (§1)", () => {
    expect(PERFORMANCE_LAW.categories.performance.floor).toBe(95);
    expect(PERFORMANCE_LAW.categories.accessibility.floor).toBe(95);
    expect(PERFORMANCE_LAW.categories["best-practices"].floor).toBe(100);
    expect(PERFORMANCE_LAW.categories.seo.floor).toBe(100);
  });

  it("metric ceilings (§1)", () => {
    expect(PERFORMANCE_LAW.metrics["largest-contentful-paint"].ceiling).toBe(2500);
    expect(PERFORMANCE_LAW.metrics["total-blocking-time"].ceiling).toBe(200);
    expect(PERFORMANCE_LAW.metrics["cumulative-layout-shift"].ceiling).toBe(0.1);
  });

  it("byte budgets (§2) — JS is the one that killed us at 64", () => {
    expect(PERFORMANCE_LAW.budgets.script.ceiling).toBe(130);
    expect(PERFORMANCE_LAW.budgets.font.ceiling).toBe(100);
    expect(PERFORMANCE_LAW.budgets.total.ceiling).toBe(700);
  });

  it("markup and styles share ONE budget — inlined CSS is still CSS (ADR-058)", () => {
    const composite = PERFORMANCE_LAW.compositeBudgets["markup+styles"];
    // 35 (HTML) + 35 (CSS) — the same total §2 always allowed, counted once.
    expect(composite.ceiling).toBe(70);
    expect(composite.of).toEqual(["document", "stylesheet"]);
  });

  it("is judged on the median of three runs, on both live archetypes", () => {
    expect(PERFORMANCE_LAW.runs).toBe(3);
    expect(PERFORMANCE_LAW.archetypePaths).toContain("/sites/summit-roofing-rescue");
    expect(PERFORMANCE_LAW.archetypePaths).toContain("/sites/kerbside-kings");
  });
});

describe("assessAgainstLaw", () => {
  it("passes a site that clears every floor", () => {
    expect(assessAgainstLaw(PASSING)).toEqual([]);
  });

  it("rejects the score we actually shipped at (92) and says by how much", () => {
    const [breach] = assessAgainstLaw({
      ...PASSING,
      categories: { ...PASSING.categories, performance: 92 },
    });
    expect(breach.kind).toBe("category");
    expect(breach.key).toBe("performance");
    expect(breach.actual).toBe(92);
    expect(breach.message).toContain("3 below the floor of 95");
  });

  it("rejects the LCP that is the last blocker (2.9s vs the 2.5s ceiling)", () => {
    const [breach] = assessAgainstLaw({
      ...PASSING,
      metrics: { ...PASSING.metrics, "largest-contentful-paint": 2900 },
    });
    expect(breach.kind).toBe("metric");
    expect(breach.message).toContain("400 ms over the ceiling");
  });

  it("rejects a JS payload over budget", () => {
    const breaches = assessAgainstLaw({
      ...PASSING,
      budgets: { ...PASSING.budgets, script: 131 },
    });
    expect(breaches).toHaveLength(1);
    expect(breaches[0].kind).toBe("budget");
    expect(breaches[0].message).toContain("130KB budget");
  });

  it("treats an unmeasured CATEGORY as a breach — evidence, not silence", () => {
    const breaches = assessAgainstLaw({ ...PASSING, categories: { performance: 99 } });
    expect(breaches.map((breach) => breach.key).sort()).toEqual([
      "accessibility",
      "best-practices",
      "seo",
    ]);
  });

  it("counts inlined CSS against the shared markup budget, not a phantom 0", () => {
    // The real shape after inlineCss: all the styles live in the document.
    const clean = assessAgainstLaw({
      ...PASSING,
      budgets: { ...PASSING.budgets, document: 57.9, stylesheet: 0 },
    });
    expect(clean).toEqual([]);

    const over = assessAgainstLaw({
      ...PASSING,
      budgets: { ...PASSING.budgets, document: 71, stylesheet: 0 },
    });
    expect(over).toHaveLength(1);
    expect(over[0].key).toBe("markup+styles");
    expect(over[0].message).toContain("1KB over the 70KB budget");
  });

  it("adds the pair up — a separate stylesheet counts exactly the same", () => {
    const [breach] = assessAgainstLaw({
      ...PASSING,
      budgets: { ...PASSING.budgets, document: 40, stylesheet: 40 },
    });
    expect(breach.key).toBe("markup+styles");
    expect(breach.actual).toBe(80);
  });

  it("reports EVERY breach at once — a rejection lists all the work", () => {
    const breaches = assessAgainstLaw({
      categories: { performance: 60, accessibility: 80, "best-practices": 90, seo: 70 },
      metrics: { "largest-contentful-paint": 6000, "total-blocking-time": 2680 },
      budgets: { document: 100, stylesheet: 20, script: 789, total: 20400 },
    });
    expect(breaches.length).toBe(9);
    expect(breaches.filter((breach) => breach.kind === "category")).toHaveLength(4);
    expect(breaches.filter((breach) => breach.kind === "metric")).toHaveLength(2);
    expect(breaches.filter((breach) => breach.kind === "budget")).toHaveLength(3);
  });
});

describe("medianRun", () => {
  const run = (performance: number): LawMeasurement => ({
    categories: { performance },
    metrics: {},
  });

  it("takes the middle run by performance, not the best one", () => {
    expect(medianRun([run(99), run(88), run(94)]).categories.performance).toBe(94);
  });

  it("handles a single run", () => {
    expect(medianRun([run(91)]).categories.performance).toBe(91);
  });

  it("refuses to invent a result from no runs", () => {
    expect(() => medianRun([])).toThrow(/no runs/);
  });
});
