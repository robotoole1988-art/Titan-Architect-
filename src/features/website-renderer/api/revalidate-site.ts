import { revalidatePath } from "next/cache";

/**
 * The serving law (Performance Law §5, ADR-055).
 *
 * A publication is an immutable snapshot, so a published page is static
 * output: rendered once, served from the edge, no per-request work. The old
 * arrangement kept `revalidate = 60` and let the page re-render every minute
 * on the CHANCE something had changed — a poll standing in for a signal.
 *
 * The signal is cheap and we already own both ends of it: the founder
 * approves an asset in the media gate, publishes, or takes a site offline.
 * Those are the only three things that can change a live page, so those are
 * the three things that revalidate it. The time-based revalidate stays only
 * as a slow backstop against a missed hook.
 *
 * This is what §5 means by "dynamic asset resolution preserved": an approved
 * photograph still appears WITHOUT a republish — the page is re-rendered on
 * approval instead of being re-rendered sixty times an hour in the hope of
 * catching one.
 */

/** Slug serving: /sites/{slug} and every area page beneath it. */
const SLUG_ROUTE = "/sites/[slug]";
/** Custom-domain serving: the internal host resolver (ADR-027). */
const HOST_ROUTE = "/sites/-host/[hostname]";

/**
 * Invalidate the static output of a live site.
 *
 * `"layout"` invalidates the segment AND everything nested under it, so one
 * call covers the homepage and all of its area pages.
 *
 * Pass the slug whenever it is known — that scopes the work to one site. A
 * custom domain has no index to enumerate (domains map INTO businesses, not
 * out of them), so host-served pages are invalidated as a set; they are rare
 * and the re-render is lazy, on next request.
 */
export function revalidatePublishedSite(slug?: string): void {
  if (slug) {
    revalidatePath(`/sites/${slug}`, "layout");
  } else {
    revalidatePath(SLUG_ROUTE, "layout");
  }
  revalidatePath(HOST_ROUTE, "layout");
}
