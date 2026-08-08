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
 * this file has to satisfy a validator as well as a crawler, and clever
 * pattern syntax is how you fail one while pleasing the other.
 *
 * ## What is NOT here, and why that is the point
 *
 * `/experience/demo/` and `/lab/arrival` are public and must never be
 * indexed — and they are already `robots: { index: false }` at the page and
 * the layout (ADR-070 §4). **They are deliberately NOT disallowed here.**
 *
 * A `Disallow` and a `noindex` on the same URL cancel each other out: a
 * crawler that is forbidden to fetch the page can never read the `noindex`
 * inside it, so a single inbound link can put the bare URL in the index with
 * the instruction not to permanently unread. One or the other, never both —
 * and `noindex` is the one that actually removes a page.
 *
 * ADR-070 §4 anticipated a disallow for the demo "with the flagship
 * increment that links to the demo publicly", and that is the right moment
 * for it: once the demo is linked, its URL space is 35 trades × any town, and
 * crawl budget becomes the concern that outweighs de-indexing. Until
 * something links to it, `noindex` alone is doing the job perfectly, and
 * adding a disallow now would only break it.
 *
 * So what remains is the door. `/login` and `/auth/` carry no `noindex` and
 * hold nothing worth indexing, which makes a disallow the correct and only
 * instrument for them. The internal OS needs no line of its own: it sits
 * behind the founder gate, so a crawler is turned away before it ever sees a
 * page (ADR-054).
 *
 * No `Sitemap:` line — the app host has no sitemap yet, and pointing a
 * crawler at a 404 is the same class of mistake this route exists to fix.
 */
export const dynamic = "force-static";

/**
 * Paths kept out of the index BY ROBOTS. Exported so the tests can prove two
 * things: that nothing here shadows a page the company site publishes on
 * purpose, and that nothing here also relies on a `noindex` it would make
 * unreachable.
 */
export const DISALLOWED_PREFIXES = ["/login", "/auth/"] as const;

export function GET() {
  const body = [
    "# TITAN — the growth platform for UK trade businesses",
    "# The public company site is crawlable. The internal OS sits behind the",
    "# founder gate and is never served to a crawler at all.",
    "#",
    "# Pages that must not be indexed (/experience/demo/, /lab/arrival) use",
    "# noindex, not Disallow — a page a crawler may not fetch is a page whose",
    "# noindex it can never read.",
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
