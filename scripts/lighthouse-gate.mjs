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
 * Vercel injects its preview toolbar (comments, feedback) from vercel.live
 * into every PREVIEW deployment. It is not part of the product and the
 * customer never downloads it, but Lighthouse counts every byte of it: the
 * first run of this gate reported 1,304KB of script against a 130KB budget,
 * and most of that was toolbar. Auditing a preview means blocking it, or the
 * gate measures Vercel's code and calls it ours.
 */
const NOT_THE_PRODUCT = ["*vercel.live*", "*vercel-scripts.com*", "*vercel.com/api*"];

/**
 * A 200 is not proof we are looking at a TITAN site — a preview login wall,
 * an SSO redirect and an error page all answer 200 and all score beautifully
 * against floors they were never meant to meet. Every published page carries
 * primitive markers, so that is what we insist on seeing.
 */
const SITE_FINGERPRINT = "data-primitive=";

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
  const options = { baseUrl: baseUrl.replace(/\/$/, ""), runs: LAW.runs, paths: LAW.archetypePaths };
  for (let i = 0; i < rest.length; i += 2) {
    if (rest[i] === "--runs") options.runs = Number(rest[i + 1]);
    if (rest[i] === "--paths") options.paths = rest[i + 1].split(",").filter(Boolean);
  }
  return options;
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
      `--blocked-url-patterns=${NOT_THE_PRODUCT.join(",")}`,
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

  for (const [key, rule] of Object.entries(LAW.budgets)) {
    const actual = measurement.budgets[key];
    if (actual === undefined) continue;
    if (actual > rule.ceiling) {
      breaches.push(
        `${key} transferred ${round(actual)}KB — ${round(actual - rule.ceiling)}KB over the ${rule.ceiling}KB budget`,
      );
    }
  }

  return breaches;
}

function report(url, measurement, breaches) {
  console.log(`\n${"─".repeat(72)}\n${url}\n${"─".repeat(72)}`);
  for (const [key, rule] of Object.entries(LAW.categories)) {
    const actual = measurement.categories[key];
    const mark = actual === undefined ? "?" : actual >= rule.floor ? "PASS" : "FAIL";
    console.log(`  ${mark.padEnd(5)} ${key.padEnd(16)} ${actual === undefined ? "—" : round(actual)}  (floor ${rule.floor})`);
  }
  for (const [key, rule] of Object.entries(LAW.metrics)) {
    const actual = measurement.metrics[key];
    if (actual === undefined) continue;
    const mark = actual <= rule.ceiling ? "PASS" : "FAIL";
    console.log(`  ${mark.padEnd(5)} ${key.padEnd(16)} ${round(actual)}${rule.unit ? rule.unit : ""}  (ceiling ${rule.ceiling}${rule.unit ?? ""})`);
  }
  for (const [key, rule] of Object.entries(LAW.budgets)) {
    const actual = measurement.budgets[key];
    if (actual === undefined) continue;
    const mark = actual <= rule.ceiling ? "PASS" : "FAIL";
    console.log(`  ${mark.padEnd(5)} ${`${key} bytes`.padEnd(16)} ${round(actual)}KB  (budget ${rule.ceiling}KB)`);
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
  for (const path of paths) {
    const url = `${baseUrl}${path}`;

    // A 404 scores beautifully. Prove the page exists — and that it is OURS —
    // before believing any number that comes back.
    const response = await fetch(url, {
      redirect: "follow",
      ...(bypassHeaders ? { headers: bypassHeaders } : {}),
    });
    if (!response.ok) {
      console.error(`\nREJECTED ${url} — responded ${response.status}; there is nothing to audit.`);
      failed = true;
      continue;
    }
    const body = await response.text();
    if (!body.includes(SITE_FINGERPRINT)) {
      console.error(
        `\nREJECTED ${url} — 200, but this is not a published TITAN page (no ${SITE_FINGERPRINT}).` +
          `\n  A preview behind deployment protection, or a site whose publication did not resolve,` +
          `\n  answers 200 with someone else's HTML. Scoring it would be a lie in either direction.`,
      );
      failed = true;
      continue;
    }

    const measurements = [];
    for (let run = 1; run <= runs; run += 1) {
      process.stdout.write(`\n  run ${run}/${runs} ${url} … `);
      measurements.push(measure(url));
      process.stdout.write("done");
    }
    const median = medianRun(measurements);
    const breaches = assess(median);
    report(url, median, breaches);
    if (breaches.length > 0) failed = true;
  }

  if (failed) {
    console.error(
      `\n${"─".repeat(72)}\nThe Performance Law is not satisfied. A site that misses a floor does\nnot go live — see docs/experience/PUBLISHED-SITES-PERFORMANCE-LAW.md.\n`,
    );
    process.exit(1);
  }
  console.log(`\n${"─".repeat(72)}\nEvery archetype clears the law.\n`);
}

main().catch((error) => {
  console.error(`\nlighthouse-gate failed to run: ${error.message}`);
  process.exit(1);
});
