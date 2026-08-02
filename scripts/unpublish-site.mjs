#!/usr/bin/env node
/**
 * Take a published site offline by slug — row AND edge cache.
 *
 * A takedown has two halves. The publication row flips to `unpublished`
 * (Supabase, service role), and the cached static pages are evicted from
 * the edge (POST /api/revalidate on the live app, authenticated by
 * TITAN_REVALIDATE_SECRET). The row alone is NOT a takedown: published
 * routes are `force-static` with a one-hour backstop, so without the
 * eviction the page keeps serving until the backstop elapses or the next
 * deploy. This script does both, and says plainly when it could only do one.
 *
 * The CRM can do this too — the Live site panel on any business's detail
 * page has the Unpublish control, whatever the stage. This script is the
 * ops path for when the app isn't the right tool: bulk demo cleanup, or a
 * takedown that must not wait on a browser.
 *
 *   node scripts/unpublish-site.mjs                        # list live sites
 *   node scripts/unpublish-site.mjs voltway-renewables     # take one offline
 *   node scripts/unpublish-site.mjs --all-demos            # every live site
 *   node scripts/unpublish-site.mjs a-slug --origin=https://example.app
 *
 * Env (from .env.local or the shell): SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY, TITAN_REVALIDATE_SECRET. The eviction origin
 * defaults to the production app; override with --origin or
 * TITAN_REVALIDATE_ORIGIN.
 */

import { readFileSync, existsSync } from "node:fs";

const PRODUCTION_ORIGIN = "https://titan-architect.vercel.app";

function loadEnv() {
  const env = { ...process.env };
  if (!existsSync(".env.local")) return env;
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const text = line.trim();
    if (!text || text.startsWith("#")) continue;
    const split = text.indexOf("=");
    if (split < 1) continue;
    const key = text.slice(0, split).trim();
    if (env[key]) continue;
    env[key] = text.slice(split + 1).trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = loadEnv();
const url = env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.log("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  process.exit(1);
}
const headers = { apikey: key, Authorization: `Bearer ${key}` };
const json = { ...headers, "Content-Type": "application/json" };

const args = process.argv.slice(2).filter((a) => a !== "--");
const all = args.includes("--all-demos");
const originFlag = args.find((a) => a.startsWith("--origin="));
const origin = (
  originFlag?.slice("--origin=".length) ||
  env.TITAN_REVALIDATE_ORIGIN ||
  PRODUCTION_ORIGIN
).replace(/\/$/, "");
const revalidateSecret = env.TITAN_REVALIDATE_SECRET;
const slugs = args.filter((a) => !a.startsWith("--"));

/**
 * Evict a slug's cached pages from the edge. Returns true when the live
 * app confirmed the eviction, false otherwise (and says why not).
 */
async function evictFromEdge(slug) {
  if (!revalidateSecret) return false;
  try {
    const response = await fetch(`${origin}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-titan-revalidate-secret": revalidateSecret,
      },
      body: JSON.stringify({ slug }),
    });
    if (response.ok) return true;
    console.log(
      `           edge eviction FAILED — ${origin}/api/revalidate returned ${response.status}: ${await response.text()}`,
    );
    return false;
  } catch (error) {
    console.log(
      `           edge eviction FAILED — could not reach ${origin}: ${error?.message ?? error}`,
    );
    return false;
  }
}

const liveResponse = await fetch(
  `${url}/rest/v1/publications?select=id,business_id,slug,version,status&status=eq.live`,
  { headers },
);
if (!liveResponse.ok) {
  console.log(`Supabase error ${liveResponse.status}: ${await liveResponse.text()}`);
  process.exit(1);
}
const live = await liveResponse.json();

if (!live.length) {
  console.log("\nNo live publications. Nothing is being served.\n");
  process.exit(0);
}

if (!all && slugs.length === 0) {
  console.log("\nLIVE PUBLICATIONS\n");
  for (const publication of live) {
    console.log(`  /sites/${publication.slug}  (v${publication.version})`);
  }
  console.log(
    "\nPass a slug to take one offline, or --all-demos for every one above.\n",
  );
  process.exit(0);
}

const targets = all
  ? live
  : live.filter((publication) => slugs.includes(publication.slug));

const missing = slugs.filter(
  (slug) => !live.some((publication) => publication.slug === slug),
);
for (const slug of missing) {
  console.log(`  ! /sites/${slug} — no live publication (already offline?)`);
}

if (targets.length > 0 && !revalidateSecret) {
  console.log(
    "\n  ! TITAN_REVALIDATE_SECRET is not set — rows will flip but the edge" +
      "\n    cache will NOT be evicted. Set it (matching the Vercel env var)" +
      "\n    to make takedowns immediate.",
  );
}

console.log("");
const evictionFailures = [];
for (const publication of targets) {
  const patched = await fetch(`${url}/rest/v1/publications?id=eq.${publication.id}`, {
    method: "PATCH",
    headers: { ...json, Prefer: "return=minimal" },
    body: JSON.stringify({ status: "unpublished" }),
  });
  if (!patched.ok) {
    console.log(
      `  FAILED:  /sites/${publication.slug} — ${patched.status} ${await patched.text()}`,
    );
    continue;
  }
  const evicted = await evictFromEdge(publication.slug);
  if (!evicted) evictionFailures.push(publication.slug);
  console.log(
    evicted
      ? `  offline: /sites/${publication.slug} — row flipped, edge cache evicted`
      : `  offline: /sites/${publication.slug} — row flipped, edge cache NOT evicted`,
  );
  // Same note the server action writes, so the history reads the same
  // whichever route took the site down.
  await fetch(`${url}/rest/v1/business_activity`, {
    method: "POST",
    headers: { ...json, Prefer: "return=minimal" },
    body: JSON.stringify({
      business_id: publication.business_id,
      kind: "publication",
      message: `Unpublished v${publication.version} — site offline (scripts/unpublish-site.mjs)`,
    }),
  });
}

if (evictionFailures.length > 0) {
  console.log(
    `\nRows updated, but ${evictionFailures.length} page(s) are still serving` +
      "\nfrom the edge cache until the hourly backstop or the next deployment:" +
      `\n  ${evictionFailures.map((slug) => `/sites/${slug}`).join("\n  ")}` +
      "\nFix the eviction (secret/origin above), re-run, then re-check the URLs.\n",
  );
} else if (targets.length > 0) {
  console.log(
    "\nDone. Re-check the URLs now — each one should 404 immediately.\n",
  );
}
