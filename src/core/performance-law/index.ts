/**
 * The Published Sites Performance Law, as data (ADR-055, ADR-058, ADR-071).
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
 *
 * ADR-071 added one idea to the arithmetic: **a byte is judged by what it
 * is, and by whether TITAN chose it.** Lighthouse can only see files, so it
 * charges every inline byte to `document` — which billed the markup budget
 * for React's hydration payload, and left the script budget measuring a
 * framework floor nobody can move. Both are now counted honestly.
 */

import law from "./law.json";

export const PERFORMANCE_LAW = law;
export type PerformanceLaw = typeof law;

/**
 * What the document is actually MADE of, in decoded bytes (ADR-071).
 *
 * Lighthouse reports one transfer size for the whole document. To tell
 * markup from hydration payload you have to look inside it — which the CI
 * gate already does on every page, because it reads the body to prove the
 * page is a TITAN page before it believes any number.
 */
export interface DocumentComposition {
  /** Decoded bytes of every inline `<script>` in the document. */
  inlineScriptBytes: number;
  /** Decoded bytes of the whole document. */
  totalBytes: number;
}

/** One measured Lighthouse run, reduced to what the law cares about. */
export interface LawMeasurement {
  /** Category scores, 0–100, keyed as Lighthouse keys them. */
  categories: Readonly<Record<string, number>>;
  /** Metric numeric values (ms, or unitless for CLS). */
  metrics: Readonly<Record<string, number>>;
  /** Transferred KB by resource type, keyed as Lighthouse keys them. */
  budgets?: Readonly<Record<string, number>>;
  /** The document's inside, so markup can be told from hydration payload. */
  documentComposition?: DocumentComposition;
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
 * The share of the document that is hydration payload, not markup.
 *
 * Apportioning a compressed transfer size by DECODED share is an
 * approximation, and the law says so out loud rather than pretending
 * otherwise. It was checked against the real page before being trusted: on
 * `/` the inline script is 54.5% of decoded bytes and 54.3% of gzipped
 * bytes — a fifth of one percent apart, because the payload and the markup
 * compress alike.
 *
 * No composition supplied → 0, which charges the WHOLE document to the
 * tighter markup+styles budget. That is the conservative reading on
 * purpose: a caller without evidence gets the strict answer, never a free
 * pass. The CI gate always supplies it.
 */
function hydrationShare(composition: DocumentComposition | undefined): number {
  if (!composition) return 0;
  const { inlineScriptBytes, totalBytes } = composition;
  if (!(totalBytes > 0)) return 0;
  return Math.min(1, Math.max(0, inlineScriptBytes / totalBytes));
}

/**
 * The measured budget lines, with the document split into what it is
 * (ADR-071). `markup` and `hydration` are derived; every other key is
 * Lighthouse's own.
 *
 * Every byte of the document is counted exactly once: markup + hydration
 * add back up to the document's transfer size.
 */
export function budgetLines(
  measurement: LawMeasurement,
): Record<string, number> {
  const lines: Record<string, number> = { ...(measurement.budgets ?? {}) };
  const document = lines.document;
  if (document !== undefined) {
    const share = hydrationShare(measurement.documentComposition);
    lines.markup = document * (1 - share);
    lines.hydration = document * share;
  }
  return lines;
}

/**
 * The script ceiling: the framework floor TITAN cannot move, plus the
 * allowance for what TITAN puts on top of it (ADR-071).
 */
export function scriptCeiling(): number {
  const { frameworkBaseline, appAuthored } = PERFORMANCE_LAW.scriptLaw;
  return frameworkBaseline.measured + appAuthored.ceiling;
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

  const lines = budgetLines(measurement);

  for (const [key, rule] of Object.entries(PERFORMANCE_LAW.budgets)) {
    const actual = lines[key];
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
  // them (ADR-058): inlined CSS is still CSS — and inlined hydration
  // payload is not markup (ADR-071).
  for (const [key, rule] of Object.entries(PERFORMANCE_LAW.compositeBudgets)) {
    const parts: Array<number | undefined> = rule.of.map((part) => lines[part]);
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

  // The script line, judged in two parts (ADR-071): the framework floor is
  // a measured fact, so the breach names what TITAN actually added.
  const script = lines.script;
  if (script !== undefined) {
    const { frameworkBaseline, appAuthored } = PERFORMANCE_LAW.scriptLaw;
    const ceiling = scriptCeiling();
    if (script > ceiling) {
      const appAdded = script - frameworkBaseline.measured;
      breaches.push({
        kind: "budget",
        key: "script",
        actual: round(script),
        limit: ceiling,
        message:
          `script transferred ${round(script)}KB — ${round(appAdded)}KB above the ` +
          `${frameworkBaseline.measured}KB framework baseline, against an app-authored ` +
          `allowance of ${appAuthored.ceiling}KB (${round(script - ceiling)}KB over)`,
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
