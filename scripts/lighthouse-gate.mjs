#!/usr/bin/env node
/**
 * The Published Sites Performance Law, enforced by a machine (ADR-055).
 *
 *   node scripts/lighthouse-gate.mjs <baseUrl> [--runs 3] [--paths /a,/b]
 *
 * Runs Lighthouse under mobile emulation against the live archetype sites,
 * takes the MEDIAN of N runs (one run is noisy enough to both pass a bad
 * build and fail a good one), and judges it against src/core/performance-law
 * /law.json — the same numbers the publish gate and the nightly sampler read.
 *
 * The failure output reads like a media-gate rejection on purpose: what
 * failed, by how much, and what to do about it. Exit 1 = no merge.
 *
 * Lighthouse is invoked through `npx --yes` rather than added to
 * package.json: the gate must not add a runtime dependency to the product,
 * and the lockfile is deliberately left alone.
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const LAW = JSON.parse(
  readFileSync(join(HERE, "..", "src", "core", "performance-law", "law.json"), "utf8"),
);

const LIGHTHOUSE = "lighthouse@12";

/**
 * What the law refuses to measure, and the correct way to say so — including
 * the runtime proof that Lighthouse actually did it (ADR-071).
 *
 * The comma-joined form this gate used for weeks blocked NOTHING, so every
 * preview run scored Vercel's toolbar as TITAN's product. See
 * `scripts/lighthouse-flags.mjs` for the full account.
 */
import {
  NOT_THE_PRODUCT,
  blockedPatternsProblem,
  blockedUrlPatternFlags,
} from "./lighthouse-flags.mjs";

/**
 * A 200 is not proof we are looking at a TITAN site — a preview login wall,
 * an SSO redirect and an error page all answer 200 and all score beautifully
 * against floors they were never meant to meet. Every published page carries
 * primitive markers, so that is what we insist on seeing.
 */
const SITE_FINGERPRINT = "data-primitive=";

/**
 * TITAN's own site is under the same law (ADR-064) — its home page says
 * "Speed is a rule, not an aspiration" in public, so the gate measures it
 * with everything else. Company pages are hand-written, not primitive-
 * built, so they carry their own marker: the sphere's server-rendered
 * still (home.tsx). Same principle, different fingerprint.
 */
const COMPANY_FINGERPRINT = "data-sphere-still";

/**
 * Preview deployments sit behind Vercel Deployment Protection, so an
 * unauthenticated CI runner is served the login wall — which answers 200
 * with Vercel's own HTML. That is not a hypothetical: the first two runs of
 * this gate scored that wall, once reporting 1,304KB of "our" script.
 *
 * The bypass secret is passed on EVERY request (Protection checks each one,
 * not just the first), and it is written to a 0600 file rather than an argv
 * flag so the value never appears in a process listing or a crash dump.
 * Production needs none of this — it is public — so an absent secret is
 * normal, not an error.
 */
const BYPASS_HEADER = "x-vercel-protection-bypass";
const BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

/**
 * Using a bypass means we are auditing a PREVIEW, and previews are served
 * `X-Robots-Tag: noindex` by Vercel. Lighthouse's SEO category weighs "page
 * is blocked from indexing" heavily, so a preview scored 61 where the same
 * pages score 92 in production. A floor that cannot be met by a correct build
 * is not a floor, it is noise — and noise is how a gate gets ignored.
 *
 * So SEO is reported but not enforced on previews. It is enforced in full on
 * the nightly production run, where the answer means something.
 */
const PREVIEW = Boolean(BYPASS);
const NOT_ENFORCEABLE_ON_PREVIEW = new Set(["seo"]);
const isAdvisory = (key) => PREVIEW && NOT_ENFORCEABLE_ON_PREVIEW.has(key);

const bypassHeaders = BYPASS ? { [BYPASS_HEADER]: BYPASS } : undefined;
const extraHeadersPath = bypassHeaders
  ? join(mkdtempSync(join(tmpdir(), "perf-law-")), "extra-headers.json")
  : null;
if (extraHeadersPath) {
  writeFileSync(extraHeadersPath, JSON.stringify(bypassHeaders), { mode: 0o600 });
}

function parseArgs(argv) {
  const [baseUrl, ...rest] = argv;
  if (!baseUrl) {
    console.error("usage: node scripts/lighthouse-gate.mjs <baseUrl> [--runs N] [--paths /a,/b]");
    process.exit(2);
  }
  const options = {
    baseUrl: baseUrl.replace(/\/$/, ""),
    runs: LAW.runs,
    // The whole public surface: the archetype fleet plus TITAN's own pages.
    paths: [...LAW.archetypePaths, ...(LAW.companyPaths ?? [])],
  };
  for (let i = 0; i < rest.length; i += 2) {
    if (rest[i] === "--runs") options.runs = Number(rest[i + 1]);
    if (rest[i] === "--paths") options.paths = rest[i + 1].split(",").filter(Boolean);
  }
  return options;
}

/**
 * What the document is MADE of, in decoded bytes (ADR-071).
 *
 * Lighthouse reports one transfer size for the whole document, so a budget
 * named markup+styles was silently billed for React's inline hydration
 * payload — on TITAN's own home page that is 288KB of 528KB. The gate
 * already holds the body (it reads it to prove the page is a TITAN page),
 * so the split costs nothing but this function.
 */
function documentComposition(body) {
  let inlineScriptBytes = 0;
  // Inline scripts only: a `src=` tag carries no bytes in the document, and
  // Lighthouse already counts those files under `script`.
  for (const match of body.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
    inlineScriptBytes += Buffer.byteLength(match[1], "utf8");
  }
  return { inlineScriptBytes, totalBytes: Buffer.byteLength(body, "utf8") };
}

/**
 * markup / hydration are DERIVED lines (ADR-071); every other key is
 * Lighthouse's own. Mirrors budgetLines() in src/core/performance-law.
 *
 * No composition → the whole document is charged to markup+styles. That is
 * the conservative reading on purpose: no evidence gets the strict answer,
 * never a free pass.
 */
function budgetLines(measurement) {
  const lines = { ...measurement.budgets };
  if (lines.document !== undefined) {
    const composition = measurement.documentComposition;
    const share =
      composition && composition.totalBytes > 0
        ? Math.min(1, Math.max(0, composition.inlineScriptBytes / composition.totalBytes))
        : 0;
    lines.markup = lines.document * (1 - share);
    lines.hydration = lines.document * share;
  }
  return lines;
}

/** The framework floor TITAN cannot move, plus what it may add (ADR-071). */
function scriptCeiling() {
  return LAW.scriptLaw.frameworkBaseline.measured + LAW.scriptLaw.appAuthored.ceiling;
}

/** One Lighthouse run, reduced to what the law cares about. */
function measure(url) {
  const result = spawnSync(
    "npx",
    [
      "--yes",
      LIGHTHOUSE,
      url,
      "--quiet",
      "--output=json",
      "--output-path=stdout",
      // The law is a MOBILE law: Lighthouse's default preset is mobile
      // emulation with simulated throttling. Stated, not assumed.
      "--form-factor=mobile",
      "--screenEmulation.mobile",
      "--throttling-method=simulate",
      `--only-categories=${Object.keys(LAW.categories).join(",")}`,
      // ONE flag per pattern. Comma-joining parses as a single literal
      // pattern and blocks nothing at all (ADR-071).
      ...blockedUrlPatternFlags(NOT_THE_PRODUCT),
      ...(extraHeadersPath ? [`--extra-headers=${extraHeadersPath}`] : []),
      "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu",
    ],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  if (result.status !== 0) {
    throw new Error(`lighthouse exited ${result.status}\n${(result.stderr || "").slice(-2000)}`);
  }
  const lhr = JSON.parse(result.stdout).lhr ?? JSON.parse(result.stdout);
  if (lhr.runtimeError) {
    throw new Error(`lighthouse runtime error: ${lhr.runtimeError.message}`);
  }

  // Prove, from the report, that what we asked to be blocked WAS blocked
  // (ADR-071). The flag syntax is an assumption about someone else's CLI, and
  // this exact assumption was silently wrong for weeks. A measurement the
  // gate cannot vouch for is not a measurement.
  const problem = blockedPatternsProblem(
    lhr.configSettings?.blockedUrlPatterns,
    NOT_THE_PRODUCT,
  );
  if (problem) throw new Error(problem);

  const categories = {};
  for (const key of Object.keys(LAW.categories)) {
    const score = lhr.categories?.[key]?.score;
    if (typeof score === "number") categories[key] = score * 100;
  }

  const metrics = {};
  for (const key of Object.keys(LAW.metrics)) {
    const value = lhr.audits?.[key]?.numericValue;
    if (typeof value === "number") metrics[key] = value;
  }

  // resource-summary gives TRANSFERRED bytes per type — i.e. what the phone
  // actually pulled over the wire, which is what the budgets are written in.
  const budgets = {};
  for (const item of lhr.audits?.["resource-summary"]?.details?.items ?? []) {
    if (typeof item.transferSize === "number") {
      budgets[item.resourceType] = item.transferSize / 1024;
    }
  }

  return { categories, metrics, budgets };
}

function medianRun(runs) {
  const sorted = [...runs].sort(
    (a, b) => (a.categories.performance ?? 0) - (b.categories.performance ?? 0),
  );
  return sorted[Math.floor(sorted.length / 2)];
}

const round = (n) => Math.round(n * 1000) / 1000;

/**
 * Judge a measurement. Mirrors assessAgainstLaw() in
 * src/core/performance-law — the NUMBERS are single-source (law.json); this
 * is the same data-driven comparison for the CI runtime, which cannot import
 * TypeScript.
 */
function assess(measurement) {
  const breaches = [];

  for (const [key, rule] of Object.entries(LAW.categories)) {
    if (isAdvisory(key)) continue;
    const actual = measurement.categories[key];
    if (actual === undefined) {
      breaches.push(`${key}: not measured — the law needs evidence, not silence (floor ${rule.floor})`);
    } else if (actual < rule.floor) {
      breaches.push(
        `${key} scored ${round(actual)} — ${round(rule.floor - actual)} below the floor of ${rule.floor}`,
      );
    }
  }

  for (const [key, rule] of Object.entries(LAW.metrics)) {
    const actual = measurement.metrics[key];
    if (actual === undefined) continue;
    const unit = rule.unit ? ` ${rule.unit}` : "";
    if (actual > rule.ceiling) {
      breaches.push(
        `${key} is ${round(actual)}${unit} — ${round(actual - rule.ceiling)}${unit} over the ceiling of ${rule.ceiling}${unit}`,
      );
    }
  }

  const lines = budgetLines(measurement);

  for (const [key, rule] of Object.entries(LAW.budgets)) {
    const actual = lines[key];
    if (actual === undefined) continue;
    if (actual > rule.ceiling) {
      breaches.push(
        `${key} transferred ${round(actual)}KB — ${round(actual - rule.ceiling)}KB over the ${rule.ceiling}KB budget`,
      );
    }
  }

  // Composite budgets judge bytes by what they ARE, not which file carried
  // them (ADR-058): inlined CSS is still CSS — and inlined hydration
  // payload is not markup (ADR-071).
  for (const [key, rule] of Object.entries(LAW.compositeBudgets ?? {})) {
    const parts = rule.of.map((part) => lines[part]);
    if (parts.every((part) => part === undefined)) continue;
    const actual = parts.reduce((sum, part) => sum + (part ?? 0), 0);
    if (actual > rule.ceiling) {
      breaches.push(
        `${key} transferred ${round(actual)}KB (${rule.of.join(" + ")}) — ${round(actual - rule.ceiling)}KB over the ${rule.ceiling}KB budget`,
      );
    }
  }

  // The script line, judged in two parts (ADR-071): the framework floor is a
  // measured fact, so a breach names what TITAN actually added on top of it.
  if (lines.script !== undefined) {
    const { frameworkBaseline, appAuthored } = LAW.scriptLaw;
    const ceiling = scriptCeiling();
    if (lines.script > ceiling) {
      breaches.push(
        `script transferred ${round(lines.script)}KB — ${round(lines.script - frameworkBaseline.measured)}KB ` +
          `above the ${frameworkBaseline.measured}KB framework baseline, against an app-authored ` +
          `allowance of ${appAuthored.ceiling}KB (${round(lines.script - ceiling)}KB over)`,
      );
    }
  }

  return breaches;
}

function report(url, measurement, breaches) {
  console.log(`\n${"─".repeat(72)}\n${url}\n${"─".repeat(72)}`);
  for (const [key, rule] of Object.entries(LAW.categories)) {
    const actual = measurement.categories[key];
    const mark = isAdvisory(key)
      ? "note"
      : actual === undefined
        ? "?"
        : actual >= rule.floor
          ? "PASS"
          : "FAIL";
    const suffix = isAdvisory(key)
      ? `  (floor ${rule.floor} — advisory: previews are noindex, enforced nightly on production)`
      : `  (floor ${rule.floor})`;
    console.log(`  ${mark.padEnd(5)} ${key.padEnd(16)} ${actual === undefined ? "—" : round(actual)}${suffix}`);
  }
  for (const [key, rule] of Object.entries(LAW.metrics)) {
    const actual = measurement.metrics[key];
    if (actual === undefined) continue;
    const mark = actual <= rule.ceiling ? "PASS" : "FAIL";
    console.log(`  ${mark.padEnd(5)} ${key.padEnd(16)} ${round(actual)}${rule.unit ? rule.unit : ""}  (ceiling ${rule.ceiling}${rule.unit ?? ""})`);
  }
  const lines = budgetLines(measurement);
  for (const [key, rule] of Object.entries(LAW.budgets)) {
    const actual = lines[key];
    if (actual === undefined) continue;
    const mark = actual <= rule.ceiling ? "PASS" : "FAIL";
    console.log(`  ${mark.padEnd(5)} ${`${key} bytes`.padEnd(16)} ${round(actual)}KB  (budget ${rule.ceiling}KB)`);
  }
  for (const [key, rule] of Object.entries(LAW.compositeBudgets ?? {})) {
    const parts = rule.of.map((part) => lines[part]);
    if (parts.every((part) => part === undefined)) continue;
    const actual = parts.reduce((sum, part) => sum + (part ?? 0), 0);
    const mark = actual <= rule.ceiling ? "PASS" : "FAIL";
    console.log(
      `  ${mark.padEnd(5)} ${`${key} bytes`.padEnd(16)} ${round(actual)}KB  (budget ${rule.ceiling}KB · ${rule.of.join(" + ")})`,
    );
  }
  // The script line is printed as its two parts (ADR-071), so the framework
  // floor stays visible as a MEASUREMENT — and a page that comes in under it
  // is reported as the ratchet it is, not passed over in silence.
  if (lines.script !== undefined) {
    const baseline = LAW.scriptLaw.frameworkBaseline.measured;
    const ceiling = scriptCeiling();
    const mark = lines.script <= ceiling ? "PASS" : "FAIL";
    const appAdded = lines.script - baseline;
    // Under the baseline, "app -194.6KB" is nonsense to read. Say what is
    // actually true instead: the floor measured lower than we recorded.
    const detail =
      appAdded < 0
        ? `(under the recorded ${baseline}KB framework baseline — see RATCHET)`
        : `(baseline ${baseline}KB + app ${round(appAdded)}KB of ${LAW.scriptLaw.appAuthored.ceiling}KB allowed)`;
    console.log(
      `  ${mark.padEnd(5)} ${"script bytes".padEnd(16)} ${round(lines.script)}KB  ${detail}`,
    );
    if (appAdded < 0) {
      console.log(
        `  RATCHET  the framework floor measured ${round(lines.script)}KB here, below the recorded ` +
          `${baseline}KB. Re-record it downward in law.json with this run as the evidence — a ` +
          `baseline is a measurement, and headroom is not a gift.`,
      );
    }
  }
  if (breaches.length > 0) {
    console.log(`\n  REJECTED — this page may not ship as it stands:`);
    for (const breach of breaches) console.log(`    · ${breach}`);
  }
}

async function main() {
  const { baseUrl, runs, paths } = parseArgs(process.argv.slice(2));
  console.log(
    `Performance Law v${LAW.version} · median of ${runs} · mobile emulation\nbase: ${baseUrl}\n` +
      `blocked (not the product): ${NOT_THE_PRODUCT.join(" ")}\n` +
      // Whether a bypass is in play, never what it is.
      `protection bypass: ${BYPASS ? "in use" : "none (expected for production)"}`,
  );

  let failed = false;
  let audited = 0;
  const offline = [];
  const companyPaths = new Set(LAW.companyPaths ?? []);
  for (const path of paths) {
    const url = `${baseUrl}${path}`;

    // A 404 scores beautifully. Prove the page exists — and that it is OURS —
    // before believing any number that comes back.
    const response = await fetch(url, {
      redirect: "follow",
      ...(bypassHeaders ? { headers: bypassHeaders } : {}),
    });
    if (response.status === 404) {
      // Not published is a STATE, not a lie: the takedown path exists so a
      // site can be offline on purpose ("offline means offline", PR #29).
      // The gate's job is to measure what is published and refuse to
      // pretend — so an absent page is reported loudly and skipped, and
      // the run fails only if that leaves nothing to audit. Eleven straight
      // nights of red taught us what a gate that conflates the two is
      // worth: nothing, because it gets ignored.
      console.log(`\nOFFLINE ${url} — 404: nothing is published here. Skipped, not scored.`);
      offline.push(url);
      continue;
    }
    if (!response.ok) {
      console.error(`\nREJECTED ${url} — responded ${response.status}; a live path answered brokenly.`);
      failed = true;
      continue;
    }
    const fingerprint = companyPaths.has(path) ? COMPANY_FINGERPRINT : SITE_FINGERPRINT;
    const body = await response.text();
    if (!body.includes(fingerprint)) {
      console.error(
        `\nREJECTED ${url} — 200, but this is not the TITAN page it claims to be (no ${fingerprint}).` +
          `\n  A preview behind deployment protection, or a site whose publication did not resolve,` +
          `\n  answers 200 with someone else's HTML. Scoring it would be a lie in either direction.`,
      );
      failed = true;
      continue;
    }
    audited += 1;
    const composition = documentComposition(body);

    const measurements = [];
    for (let run = 1; run <= runs; run += 1) {
      process.stdout.write(`\n  run ${run}/${runs} ${url} … `);
      measurements.push(measure(url));
      process.stdout.write("done");
    }
    // The body was already read above to prove this page is ours; ADR-071
    // spends it a second time, to tell markup from hydration payload.
    const median = { ...medianRun(measurements), documentComposition: composition };
    const breaches = assess(median);
    report(url, median, breaches);
    if (breaches.length > 0) failed = true;
  }

  if (audited === 0) {
    // Every path offline is its own emergency: a law with no subjects has
    // stopped being enforced, and that deserves a red no skip can soften.
    console.error(
      `\n${"─".repeat(72)}\nNothing was auditable — every path is offline (${offline.length} skipped).\nThe fleet is dark; the law has no subject. That is a failure of its own.\n`,
    );
    process.exit(1);
  }
  if (failed) {
    console.error(
      `\n${"─".repeat(72)}\nThe Performance Law is not satisfied. A site that misses a floor does\nnot go live — see docs/experience/PUBLISHED-SITES-PERFORMANCE-LAW.md.\n`,
    );
    process.exit(1);
  }
  console.log(
    `\n${"─".repeat(72)}\nEvery live page clears the law (${audited} audited` +
      `${offline.length > 0 ? `, ${offline.length} offline and skipped` : ""}).\n`,
  );
}

main().catch((error) => {
  console.error(`\nlighthouse-gate failed to run: ${error.message}`);
  process.exit(1);
});
