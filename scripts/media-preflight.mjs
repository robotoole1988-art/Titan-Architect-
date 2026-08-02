#!/usr/bin/env node
/**
 * Media pipeline preflight.
 *
 * The generated-imagery pipeline (ADR-033/036/039) is complete in code and
 * gated entirely on configuration. Four things have to be true before a
 * single image can reach a published site, and three of them live outside
 * the repository — which is why "it doesn't work" has no stack trace to read.
 *
 *   1. REPLICATE_API_TOKEN  — images and standard film
 *   2. FAL_KEY              — the 4K and morph film tiers
 *   3. SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY — or storage silently falls
 *      back to local disk, which on Vercel is read-only and ephemeral, so
 *      assets generate, cost money, and evaporate
 *   4. A PUBLIC STORAGE BUCKET NAMED `media` — created by hand, because no
 *      migration can create one. Its absence surfaces only as an HTTP 4xx
 *      from the storage API at the moment of generation, after the image has
 *      already been paid for.
 *
 * This script reports on all four and, with --create-bucket, fixes the one
 * it can. It NEVER prints a secret — only whether a name is set.
 *
 *   node scripts/media-preflight.mjs
 *   node scripts/media-preflight.mjs --create-bucket
 */

import { readFileSync, existsSync } from "node:fs";

const CREATE = process.argv.includes("--create-bucket");
const BUCKET = "media";

/** process.env wins, so this works unchanged in CI and on Vercel. */
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

const tick = (ok) => (ok ? "  ok  " : " MISS ");
console.log("\nMEDIA PIPELINE PREFLIGHT\n" + "=".repeat(52));
console.log("\nCredentials (names only — no values are read out)\n");
for (const name of [
  "REPLICATE_API_TOKEN",
  "FAL_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
]) {
  console.log(` [${tick(Boolean(env[name]))}] ${name}`);
}
const film = env.NEXT_PUBLIC_AMBIENT_FILM === "1";
console.log(
  ` [${tick(film)}] NEXT_PUBLIC_AMBIENT_FILM` +
    (film ? "" : "   <- film is OFF: commissioned video will not render"),
);

if (!url || !key) {
  console.log("\nNo Supabase service credentials — stopping here.\n");
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}` };
const rest = async (path) => {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: { ...headers, Prefer: "count=exact" },
  });
  if (!response.ok) return { error: `${response.status} ${await response.text()}` };
  const range = response.headers.get("content-range") ?? "";
  return { rows: await response.json(), total: range.split("/")[1] ?? "?" };
};

console.log(`\nProject: ${new URL(url).host}`);

// ── Storage ────────────────────────────────────────────────────────────
const bucketsResponse = await fetch(`${url}/storage/v1/bucket`, { headers });
if (!bucketsResponse.ok) {
  console.log(`\nStorage API error: ${bucketsResponse.status}`);
  console.log(await bucketsResponse.text());
  process.exit(1);
}
const buckets = await bucketsResponse.json();
const media = buckets.find((bucket) => bucket.name === BUCKET);
console.log("\nStorage buckets\n");
console.log(
  buckets.length
    ? buckets.map((b) => `  - ${b.name} (public: ${b.public})`).join("\n")
    : "  (none)",
);

if (media && !media.public) {
  console.log(
    `\n  !! '${BUCKET}' exists but is PRIVATE. Published sites read it over a` +
      "\n     public URL, so every image will 400. Make it public.",
  );
} else if (!media && CREATE) {
  const created = await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  console.log(
    created.ok
      ? `\n  created public bucket '${BUCKET}'`
      : `\n  could not create '${BUCKET}': ${created.status} ${await created.text()}`,
  );
} else if (!media) {
  console.log(
    `\n  !! No '${BUCKET}' bucket. Generation will fail at the storage write,` +
      "\n     AFTER the image has been generated and paid for." +
      "\n     Re-run with --create-bucket to create it.",
  );
}

// ── What is actually in the database ───────────────────────────────────
const businesses = await rest(
  "businesses?select=id,name,trade,location,stage,internal&order=created_at.desc&limit=200",
);
const publications = await rest("publications?select=business_id,slug,status&limit=200");
const assets = await rest("media_assets?select=business_id,status&limit=1000");
// Reviews are stored rows, not blueprint content — regenerating a blueprint
// will NOT remove a fabricated one. If a demo site is showing a review, it
// has to be found and deleted here.
const reviews = await rest(
  "business_reviews?select=business_id,customer_name,rating,status&limit=200",
);

console.log("\n" + "=".repeat(52) + "\nWHAT IS IN THE DATABASE\n");
if (businesses.error) {
  console.log("businesses:", businesses.error);
} else {
  const live = new Map();
  for (const publication of publications.rows ?? []) {
    if (publication.status === "live") live.set(publication.business_id, publication.slug);
  }
  const byBusiness = new Map();
  for (const asset of assets.rows ?? []) {
    const bucketed = byBusiness.get(asset.business_id) ?? { review: 0, approved: 0, rejected: 0 };
    bucketed[asset.status] = (bucketed[asset.status] ?? 0) + 1;
    byBusiness.set(asset.business_id, bucketed);
  }
  console.log(`businesses: ${businesses.total}   media assets: ${assets.total}\n`);
  for (const business of businesses.rows) {
    const slug = live.get(business.id);
    const media = byBusiness.get(business.id);
    console.log(
      [
        business.internal ? "[internal]" : "          ",
        (business.name ?? "").padEnd(30).slice(0, 30),
        (business.trade ?? "").padEnd(22).slice(0, 22),
        (business.stage ?? "").padEnd(16),
        slug ? `LIVE /sites/${slug}` : "not published",
        media
          ? `media ${media.approved ?? 0} approved / ${media.review ?? 0} review`
          : "no media",
      ].join(" "),
    );
  }

  // ── Stored reviews ───────────────────────────────────────────────────
  // A review on a demo site is a named person vouching for a business that
  // does not exist. It survives a blueprint regeneration, so it gets its
  // own section rather than a footnote.
  console.log("\n" + "-".repeat(52) + "\nSTORED REVIEWS\n");
  if (reviews.error) {
    console.log("  ", reviews.error);
  } else if (!reviews.rows?.length) {
    console.log("  (none — nothing to clean up)");
  } else {
    const nameOf = new Map(businesses.rows.map((b) => [b.id, b.name]));
    for (const review of reviews.rows) {
      console.log(
        `  ${(nameOf.get(review.business_id) ?? review.business_id).padEnd(30).slice(0, 30)}` +
          ` ${String(review.customer_name ?? "?").padEnd(24).slice(0, 24)}` +
          ` ${review.rating ?? "?"}★  ${review.status ?? ""}`,
      );
    }
  }
}
console.log("");
