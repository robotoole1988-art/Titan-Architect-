import { describe, expect, it } from "vitest";
import {
  PERFORMANCE_LAW,
  assessAgainstLaw,
  budgetLines,
  medianRun,
  scriptCeiling,
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

  it("byte budgets (§2)", () => {
    expect(PERFORMANCE_LAW.budgets.font.ceiling).toBe(100);
    expect(PERFORMANCE_LAW.budgets.total.ceiling).toBe(700);
    // The App Router ships every page twice; the duplicate gets its own line
    // (ADR-071) because it is the one that grows with the content.
    expect(PERFORMANCE_LAW.budgets.hydration.ceiling).toBe(55);
  });

  it("markup and styles share ONE budget — and are not billed for hydration (ADR-058, ADR-071)", () => {
    const composite = PERFORMANCE_LAW.compositeBudgets["markup+styles"];
    // 35 (HTML) + 35 (CSS) — the same total §2 always allowed, counted once.
    expect(composite.ceiling).toBe(70);
    // `markup` is the DERIVED line: the document minus its inline hydration
    // payload. Charging the raw `document` here is the bug ADR-071 fixed.
    expect(composite.of).toEqual(["markup", "stylesheet"]);
  });

  it("the script line is a measured framework floor plus a tight allowance (ADR-071)", () => {
    const { frameworkBaseline, appAuthored } = PERFORMANCE_LAW.scriptLaw;
    // Measured 2026-08-08: the identical 11 chunks on /, /about, /advertising
    // and /privacy, with ZERO page-unique bytes. Not a chosen number — and it
    // may only ever be re-recorded downward, with the measurement in the diff.
    expect(frameworkBaseline.measured).toBe(194.6);
    expect(frameworkBaseline.measuredOn).toBe("2026-08-08");
    expect(frameworkBaseline.evidence).toBeTruthy();
    expect(appAuthored.ceiling).toBe(20);
    expect(scriptCeiling()).toBe(214.6);
  });

  it("has retired the one ceiling no TITAN page has ever met", () => {
    // The old law wrote `script: 130`. Every page measured since has shipped
    // ~195KB before TITAN wrote a line, so that number could only ever be a
    // permanently red light — and a gate nobody believes is worth nothing.
    expect("script" in PERFORMANCE_LAW.budgets).toBe(false);
  });

  it("is judged on the median of three runs, on both live archetypes and TITAN's own page", () => {
    expect(PERFORMANCE_LAW.runs).toBe(3);
    expect(PERFORMANCE_LAW.archetypePaths).toContain("/sites/summit-roofing-rescue");
    expect(PERFORMANCE_LAW.archetypePaths).toContain("/sites/kerbside-kings");
    expect(PERFORMANCE_LAW.companyPaths).toContain("/");
  });
});

describe("budgetLines — a byte is judged by what it IS (ADR-071)", () => {
  it("splits the document into markup and hydration payload", () => {
    // The real shape of TITAN's home page on 2026-08-08: 75.3KB transferred,
    // of which 288KB of 528.1KB decoded is React's inline flight payload.
    const lines = budgetLines({
      categories: {},
      metrics: {},
      budgets: { document: 75.3, stylesheet: 0 },
      documentComposition: { inlineScriptBytes: 288 * 1024, totalBytes: 528.1 * 1024 },
    });
    expect(lines.markup).toBeCloseTo(34.2, 1);
    expect(lines.hydration).toBeCloseTo(41.1, 1);
  });

  it("counts every byte of the document exactly once", () => {
    const lines = budgetLines({
      categories: {},
      metrics: {},
      budgets: { document: 75.3 },
      documentComposition: { inlineScriptBytes: 288 * 1024, totalBytes: 528.1 * 1024 },
    });
    expect(lines.markup + lines.hydration).toBeCloseTo(75.3, 6);
  });

  it("charges the WHOLE document to markup when nobody measured its inside", () => {
    // No evidence gets the STRICT answer, never a free pass: the conservative
    // reading bills the tighter budget.
    const lines = budgetLines({
      categories: {},
      metrics: {},
      budgets: { document: 75.3 },
    });
    expect(lines.markup).toBe(75.3);
    expect(lines.hydration).toBe(0);
  });

  it("refuses to divide by a document of no bytes", () => {
    const lines = budgetLines({
      categories: {},
      metrics: {},
      budgets: { document: 10 },
      documentComposition: { inlineScriptBytes: 0, totalBytes: 0 },
    });
    expect(lines.markup).toBe(10);
    expect(lines.hydration).toBe(0);
  });
});

describe("assessAgainstLaw", () => {
  it("passes a site that clears every floor", () => {
    expect(assessAgainstLaw(PASSING)).toEqual([]);
  });

  it("passes TITAN's own home page as measured, once the bytes are counted honestly", () => {
    // The page that could not pass under the old accounting: 75.3KB document,
    // 194.6KB of framework JS, SEO fixed by the robots.txt route.
    const breaches = assessAgainstLaw({
      categories: { performance: 99, accessibility: 100, "best-practices": 100, seo: 100 },
      metrics: {
        "largest-contentful-paint": 1400,
        "total-blocking-time": 80,
        "cumulative-layout-shift": 0.002,
      },
      budgets: { document: 75.3, stylesheet: 0, script: 194.6, font: 98.1, total: 415 },
      documentComposition: { inlineScriptBytes: 288 * 1024, totalBytes: 528.1 * 1024 },
    });
    expect(breaches).toEqual([]);
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

  it("rejects app-authored JS over its allowance, and names the framework floor", () => {
    const breaches = assessAgainstLaw({
      ...PASSING,
      budgets: { ...PASSING.budgets, script: 230 },
    });
    expect(breaches).toHaveLength(1);
    expect(breaches[0].kind).toBe("budget");
    expect(breaches[0].key).toBe("script");
    // The sentence has to tell the founder what HE added, not what React did.
    expect(breaches[0].message).toContain("35.4KB above the 194.6KB framework baseline");
    expect(breaches[0].message).toContain("allowance of 20KB");
    expect(breaches[0].message).toContain("15.4KB over");
  });

  it("does not blame TITAN for the framework floor alone", () => {
    // Exactly the baseline, nothing added: that is not a breach, it is the
    // cost of the framework, and the law says so by staying silent.
    expect(assessAgainstLaw({ ...PASSING, budgets: { ...PASSING.budgets, script: 194.6 } })).toEqual(
      [],
    );
  });

  it("rejects a hydration payload that has grown past its own budget", () => {
    const [breach] = assessAgainstLaw({
      ...PASSING,
      budgets: { ...PASSING.budgets, document: 120, stylesheet: 0 },
      // Three-quarters of a much bigger document is flight payload: 90KB.
      documentComposition: { inlineScriptBytes: 750, totalBytes: 1000 },
    });
    expect(breach.key).toBe("hydration");
    expect(breach.actual).toBe(90);
    expect(breach.message).toContain("35KB over the 55KB budget");
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
