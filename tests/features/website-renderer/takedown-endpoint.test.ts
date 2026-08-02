import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Remote cache eviction (the serving law, ADR-055 §5): a takedown that
 * starts outside the app — scripts/unpublish-site.mjs — must be able to
 * evict the edge cache, or "offline" means "offline within the hour",
 * which is not a takedown at all.
 *
 * The gate is fail-closed. No configured secret: no remote eviction,
 * never an open endpoint. Wrong secret: refused. Malformed slug: refused
 * before it reaches the cache layer. Nothing here trusts the caller.
 */

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
}));

const { processTakedownRequest } = await import(
  "@/features/website-renderer/api/takedown"
);

const SECRET = "a-long-random-shared-secret";

beforeEach(() => {
  revalidatePath.mockClear();
});

describe("processTakedownRequest", () => {
  it("fails CLOSED when no secret is configured — even with a matching header", () => {
    for (const configured of [undefined, ""]) {
      const outcome = processTakedownRequest("anything", "a-slug", configured);
      expect(outcome.status).toBe(503);
      expect(outcome.body).toEqual({
        revalidated: false,
        reason: "secret_not_configured",
      });
    }
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("refuses a missing secret header", () => {
    const outcome = processTakedownRequest(null, "a-slug", SECRET);
    expect(outcome.status).toBe(401);
    expect(outcome.body.reason).toBe("unauthorized");
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("refuses a wrong secret, whatever its length", () => {
    for (const wrong of ["", "short", "a-long-random-shared-secreX", `${SECRET}x`]) {
      const outcome = processTakedownRequest(wrong, "a-slug", SECRET);
      expect(outcome.status).toBe(401);
    }
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("refuses a malformed slug before touching the cache layer", () => {
    for (const bad of ["", "Not-A-Slug", "../etc", "sites/x", "a slug", 7, {}]) {
      const outcome = processTakedownRequest(SECRET, bad, SECRET);
      expect(outcome.status).toBe(400);
      expect(outcome.body.reason).toBe("invalid_slug");
    }
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("evicts ONE site's whole page collection when authorised with a slug", () => {
    const outcome = processTakedownRequest(SECRET, "voltway-renewables", SECRET);
    expect(outcome.status).toBe(200);
    expect(outcome.body).toEqual({ revalidated: true, slug: "voltway-renewables" });
    expect(revalidatePath).toHaveBeenCalledWith(
      "/sites/voltway-renewables",
      "layout",
    );
    expect(revalidatePath).toHaveBeenCalledWith("/sites/-host/[hostname]", "layout");
  });

  it("evicts every site when authorised with no slug", () => {
    const outcome = processTakedownRequest(SECRET, undefined, SECRET);
    expect(outcome.status).toBe(200);
    expect(outcome.body).toEqual({ revalidated: true, slug: null });
    expect(revalidatePath).toHaveBeenCalledWith("/sites/[slug]", "layout");
  });

  it("never evicts outside /sites — the CRM is not a published site", () => {
    processTakedownRequest(SECRET, "kerbside-kings", SECRET);
    processTakedownRequest(SECRET, undefined, SECRET);
    for (const [path] of revalidatePath.mock.calls) {
      expect(String(path).startsWith("/sites/")).toBe(true);
    }
  });
});
