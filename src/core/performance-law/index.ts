/**
 * The Published Sites Performance Law, as data (ADR-055).
 *
 * `docs/experience/PUBLISHED-SITES-PERFORMANCE-LAW.md` is the prose; this
 * module is the enforcement surface. The floors and budgets live in exactly
 * ONE place — `law.json` — because the law is enforced in three places that
 * must never disagree:
 *
 *   1. the CI gate on every renderer PR (scripts/lighthouse-gate.mjs),
 *   2. the publish gate (a site that misses a floor does not go live),
 *   3. the nightly fleet sampler.
 *
 * The comparison is data-driven rather than hand-written per metric, so a
 * new floor is added by editing JSON, not by remembering to update three
 * call sites. Budgets ratchet DOWN only: raising one requires an ADR.
 */

import law from "./law.json";

export const PERFORMANCE_LAW = law;
export type PerformanceLaw = typeof law;

/** One measured Lighthouse run, reduced to what the law cares about. */
export interface LawMeasurement {
  /** Category scores, 0–100, keyed as Lighthouse keys them. */
  categories: Readonly<Record<string, number>>;
  /** Metric numeric values (ms, or unitless for CLS). */
  metrics: Readonly<Record<string, number>>;
  /** Transferred KB by resource type, keyed as Lighthouse keys them. */
  budgets?: Readonly<Record<string, number>>;
}

export interface LawBreach {
  kind: "category" | "metric" | "budget";
  key: string;
  /** What was measured. */
  actual: number;
  /** The floor (categories) or ceiling (metrics, budgets) it broke. */
  limit: number;
  /** Human-grade sentence, written the way the media gate rejects an asset. */
  message: string;
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * Judge a measurement against the law. Empty array = the site may ship.
 *
 * A missing measurement is NOT a pass: the law can only be satisfied by
 * evidence, so anything the run failed to produce is reported as a breach.
 */
export function assessAgainstLaw(measurement: LawMeasurement): LawBreach[] {
  const breaches: LawBreach[] = [];

  for (const [key, rule] of Object.entries(PERFORMANCE_LAW.categories)) {
    const actual = measurement.categories[key];
    if (actual === undefined) {
      breaches.push({
        kind: "category",
        key,
        actual: Number.NaN,
        limit: rule.floor,
        message: `${key}: not measured — the law needs evidence, not silence (floor ${rule.floor})`,
      });
      continue;
    }
    if (actual < rule.floor) {
      breaches.push({
        kind: "category",
        key,
        actual: round(actual),
        limit: rule.floor,
        message: `${key} scored ${round(actual)} — ${round(rule.floor - actual)} below the floor of ${rule.floor}`,
      });
    }
  }

  for (const [key, rule] of Object.entries(PERFORMANCE_LAW.metrics)) {
    const actual = measurement.metrics[key];
    if (actual === undefined) continue;
    if (actual > rule.ceiling) {
      const unit = rule.unit ? ` ${rule.unit}` : "";
      breaches.push({
        kind: "metric",
        key,
        actual: round(actual),
        limit: rule.ceiling,
        message: `${key} is ${round(actual)}${unit} — ${round(actual - rule.ceiling)}${unit} over the ceiling of ${rule.ceiling}${unit}`,
      });
    }
  }

  for (const [key, rule] of Object.entries(PERFORMANCE_LAW.budgets)) {
    const actual = measurement.budgets?.[key];
    if (actual === undefined) continue;
    if (actual > rule.ceiling) {
      breaches.push({
        kind: "budget",
        key,
        actual: round(actual),
        limit: rule.ceiling,
        message: `${key} transferred ${round(actual)}KB — ${round(actual - rule.ceiling)}KB over the ${rule.ceiling}KB budget`,
      });
    }
  }

  // Composite budgets judge bytes by what they ARE, not which file carried
  // them (ADR-058): inlined CSS is still CSS.
  for (const [key, rule] of Object.entries(PERFORMANCE_LAW.compositeBudgets)) {
    const parts: Array<number | undefined> = rule.of.map(
      (part) => measurement.budgets?.[part],
    );
    if (parts.every((part) => part === undefined)) continue;
    const actual = parts.reduce<number>((sum, part) => sum + (part ?? 0), 0);
    if (actual > rule.ceiling) {
      breaches.push({
        kind: "budget",
        key,
        actual: round(actual),
        limit: rule.ceiling,
        message: `${key} transferred ${round(actual)}KB (${rule.of.join(" + ")}) — ${round(actual - rule.ceiling)}KB over the ${rule.ceiling}KB budget`,
      });
    }
  }

  return breaches;
}

/**
 * The median run by performance score. The law measures the MEDIAN of three
 * because a single Lighthouse run is noisy enough to both pass a bad build
 * and fail a good one.
 */
export function medianRun<T extends LawMeasurement>(runs: readonly T[]): T {
  if (runs.length === 0) throw new Error("medianRun: no runs to choose from");
  const sorted = [...runs].sort(
    (a, b) => (a.categories.performance ?? 0) - (b.categories.performance ?? 0),
  );
  return sorted[Math.floor(sorted.length / 2)];
}
