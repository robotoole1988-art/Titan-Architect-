import { revalidatePublishedSite } from "./revalidate-site";

/**
 * Remote cache eviction for takedowns (the serving law, ADR-055 §5).
 *
 * Published pages are static snapshots served from the edge. In-app founder
 * actions evict them via the server action, but a takedown can also start
 * OUTSIDE the app — scripts/unpublish-site.mjs flipping the publication row
 * directly. A row change alone leaves the page serving until the hourly
 * backstop or the next deploy, which is not a takedown at all: "offline"
 * must mean offline within seconds of the founder saying so.
 *
 * This is the bridge: POST /api/revalidate, authenticated by a shared
 * secret, calls the same eviction the server action uses. Fail-closed by
 * design — no configured secret means NO remote eviction, never an open one.
 */

/** Slugs are slugify() output: lowercase alphanumerics and hyphens only. */
const SLUG_SHAPE = /^[a-z0-9][a-z0-9-]{0,98}$/;

/**
 * Constant-time string equality. The comparison cost depends on the
 * provided value's length, never on WHERE the first mismatch sits, so the
 * secret cannot be guessed byte by byte from response timing.
 */
function secretsMatch(provided: string, configured: string): boolean {
  let mismatch = provided.length === configured.length ? 0 : 1;
  for (let index = 0; index < provided.length; index += 1) {
    const expected = configured.charCodeAt(index % configured.length);
    mismatch |= provided.charCodeAt(index) ^ expected;
  }
  return mismatch === 0;
}

export interface TakedownRequestOutcome {
  status: 200 | 400 | 401 | 503;
  body: {
    revalidated: boolean;
    /** Present on success: the slug evicted, or null when ALL sites were. */
    slug?: string | null;
    /** Present on refusal: why, in one machine-readable word. */
    reason?: "secret_not_configured" | "unauthorized" | "invalid_slug";
  };
}

/**
 * Decide and perform a remote eviction request.
 *
 * @param providedSecret the x-titan-revalidate-secret request header.
 * @param slug optional: scope eviction to one site. Absent = every site.
 * @param configuredSecret injectable for tests; defaults to the env var.
 */
export function processTakedownRequest(
  providedSecret: string | null,
  slug?: unknown,
  configuredSecret: string | undefined = process.env.TITAN_REVALIDATE_SECRET,
): TakedownRequestOutcome {
  if (!configuredSecret) {
    return {
      status: 503,
      body: { revalidated: false, reason: "secret_not_configured" },
    };
  }
  if (providedSecret === null || !secretsMatch(providedSecret, configuredSecret)) {
    return { status: 401, body: { revalidated: false, reason: "unauthorized" } };
  }
  let scope: string | undefined;
  if (slug !== undefined) {
    if (typeof slug !== "string" || !SLUG_SHAPE.test(slug)) {
      return { status: 400, body: { revalidated: false, reason: "invalid_slug" } };
    }
    scope = slug;
  }
  revalidatePublishedSite(scope);
  return { status: 200, body: { revalidated: true, slug: scope ?? null } };
}
