/**
 * `/robots.txt` for the APP host — TITAN's own front door (ADR-064, ADR-071).
 *
 * Published customer sites have had a robots.txt since ADR-027, per slug and
 * per hostname. The app host never did, so `titan-architect.vercel.app/robots
 * .txt` fell through to the founder gate: a redirect to the login page for a
 * crawler, a 404 HTML page for a signed-in browser. Lighthouse read that as
 * an invalid robots.txt and scored SEO 91 against a floor of 100 — which is
 * why the nightly production run could not go green even with the fleet up.
 *
 * Deliberately plain. Every directive here is the conventional form, because
 * this file exists to satisfy a validator as well as a crawler, and clever
 * pattern syntax is how you fail one while pleasing the other.
 *
 * What is disallowed, and why each one:
 *
 * - `/experience/demo/` — the generated example sites are public so a
 *   prospect can be shown their trade and their town (ADR-070). They already
 *   carry `noindex` per page and per layout; this is the crawler-side half of
 *   the same promise, which ADR-070 §4 said would arrive with the surface
 *   that links to them.
 * - `/lab/` — founder judgment prototypes. Publicly reachable so they can be
 *   judged on a real deployment, linked from nowhere, deleted if they miss
 *   the standard. Reachable is not the same as crawlable.
 * - `/login`, `/auth/` — the door. Nothing to index, and a crawler that
 *   walks the gated OS collects nothing but redirects to it.
 *
 * Everything else is allowed, which is exactly the public company site. The
 * internal OS needs no line of its own: it is behind the founder gate, so a
 * crawler is turned away before it sees a page (ADR-054).
 *
 * No `Sitemap:` line — the app host has no sitemap yet, and pointing a
 * crawler at a 404 is the same class of mistake this route exists to fix.
 */
export const dynamic = "force-static";

/**
 * Paths kept out of the index. Exported so the test can prove that none of
 * them shadows a page the company site publishes on purpose — the one way
 * this file could quietly do real damage.
 */
export const DISALLOWED_PREFIXES = [
  "/experience/demo/",
  "/lab/",
  "/login",
  "/auth/",
] as const;

export function GET() {
  const body = [
    "# TITAN — the growth platform for UK trade businesses",
    "# The public company site is crawlable. The internal OS sits behind the",
    "# founder gate and is never served to a crawler at all.",
    "",
    "User-agent: *",
    "Allow: /",
    ...DISALLOWED_PREFIXES.map((path) => `Disallow: ${path}`),
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Read constantly, changes only on a deploy.
      "Cache-Control": "public, max-age=86400",
    },
  });
}
