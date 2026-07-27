import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The serving law (ADR-055 §5): a published page is a static snapshot,
 * invalidated by the founder actions that can change it — never polled for.
 *
 * "layout" matters: it invalidates the segment AND everything nested under
 * it, so one call covers a site's homepage and all of its area pages. A
 * "page" invalidation would silently leave the area pages stale, which is
 * exactly the class of bug that is invisible until a customer finds it.
 */

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (...args: unknown[]) => revalidatePath(...args) }));

const { revalidatePublishedSite } = await import(
  "@/features/website-renderer/api/revalidate-site"
);

beforeEach(() => {
  revalidatePath.mockClear();
});

describe("revalidatePublishedSite", () => {
  it("invalidates ONE site's whole page collection when the slug is known", () => {
    revalidatePublishedSite("kerbside-kings");
    expect(revalidatePath).toHaveBeenCalledWith("/sites/kerbside-kings", "layout");
  });

  it("always invalidates custom-domain serving too — domains have no index", () => {
    revalidatePublishedSite("kerbside-kings");
    expect(revalidatePath).toHaveBeenCalledWith("/sites/-host/[hostname]", "layout");
  });

  it("falls back to every slug-served site when the slug is unknown", () => {
    revalidatePublishedSite();
    expect(revalidatePath).toHaveBeenCalledWith("/sites/[slug]", "layout");
    expect(revalidatePath).toHaveBeenCalledWith("/sites/-host/[hostname]", "layout");
  });

  it("never invalidates the whole app — the CRM is not a published site", () => {
    revalidatePublishedSite("summit-roofing-rescue");
    for (const [path] of revalidatePath.mock.calls) {
      expect(String(path).startsWith("/sites/")).toBe(true);
    }
  });
});
