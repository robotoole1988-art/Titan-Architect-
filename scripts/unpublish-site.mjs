#!/usr/bin/env node
/**
 * Take a published site offline by slug.
 *
 * The CRM's Unpublish button lives on the Accounts page, which only lists
 * businesses at stage `live`. A business can hold a LIVE publication at any
 * stage — publishing does not require the stage to move — so a site published
 * from a `lead` record is publicly serving with no control anywhere in the
 * app that can take it down. Two of them were (voltway-renewables,
 * bright-smile-dental).
 *
 * This is the escape hatch, not the fix. The fix is to surface Unpublish
 * wherever a publication exists rather than wherever a stage says so.
 *
 * Note what this does NOT do: evict the cached page. The published routes are
 * `force-static` with a one-hour backstop, and the cache eviction lives in the
 * server action. After running this the page keeps serving from the edge until
 * either the backstop elapses or a new deployment starts a fresh cache — a
 * deploy is the reliable one. The row is what matters here: once the
 * publication is not `live`, any fresh render 404s.
 *
 *   node scripts/unpublish-site.mjs                        # list live sites
 *   node scripts/unpublish-site.mjs voltway-renewables     # take one offline
 *   node scripts/unpublish-site.mjs --all-demos            # every live site
 */

import { readFileSync, existsSync } from "node:fs";

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
const slugs = args.filter((a) => !a.startsWith("--"));

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

console.log("");
for (const publication of targets) {
  const patched = await fetch(`${url}/rest/v1/publications?id=eq.${publication.id}`, {
    method: "PATCH",
    headers: { ...json, Prefer: "return=minimal" },
    body: JSON.stringify({ status: "unpublished" }),
  });
  console.log(
    patched.ok
      ? `  offline: /sites/${publication.slug}`
      : `  FAILED:  /sites/${publication.slug} — ${patched.status} ${await patched.text()}`,
  );
  if (!patched.ok) continue;
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

console.log(
  "\nRows updated. The pages keep serving from the edge cache until the next" +
    "\ndeployment — push to main to clear it, then re-check the URLs.\n",
);
