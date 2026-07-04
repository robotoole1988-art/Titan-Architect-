import { afterEach, describe, expect, it, vi } from "vitest";
import { isProxyableMediaUrl, streamMedia, toStreamUrl } from "@/features/website-renderer";

/**
 * Media streaming proxy (ADR-037). The bug that shipped: a raw Supabase
 * `<video src>` hangs Chrome's media loader because storage's 206 range
 * responses omit `Accept-Ranges` and are cross-origin/edge-cached. The proxy
 * normalises the byte-serving contract. These tests pin that contract so it
 * can never regress silently.
 */

const SUPABASE = "https://proj.supabase.co";
const MEDIA_URL = `${SUPABASE}/storage/v1/object/public/media/biz/hero.film.mp4`;

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.SUPABASE_URL;
});

describe("toStreamUrl — only remote storage objects are proxied", () => {
  it("rewrites a storage-public URL to the same-origin route", () => {
    expect(toStreamUrl(MEDIA_URL)).toBe(`/api/media?u=${encodeURIComponent(MEDIA_URL)}`);
  });
  it("leaves local/static paths untouched (Next handles Range for those)", () => {
    expect(toStreamUrl("/generated-media/biz/hero.film.mp4")).toBe(
      "/generated-media/biz/hero.film.mp4",
    );
  });
});

describe("SSRF allowlist", () => {
  it("only proxies objects under the configured Supabase storage prefix", () => {
    process.env.SUPABASE_URL = SUPABASE;
    expect(isProxyableMediaUrl(MEDIA_URL)).toBe(true);
    expect(isProxyableMediaUrl("https://evil.example.com/secret")).toBe(false);
    expect(isProxyableMediaUrl(`${SUPABASE}/rest/v1/media_assets`)).toBe(false);
  });
});

describe("streamMedia — the byte-serving contract", () => {
  it("a RANGED request returns 206 with Content-Range AND Accept-Ranges: bytes", async () => {
    process.env.SUPABASE_URL = SUPABASE;
    // Upstream (Supabase) returns a correct 206 but WITHOUT Accept-Ranges —
    // exactly the shape that hangs Chrome. The proxy must add it.
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3, 4]), {
        status: 206,
        headers: {
          "content-type": "video/mp4",
          "content-range": "bytes 0-3/18560964",
          "content-length": "4",
        },
      }),
    );
    const res = await streamMedia(
      new Request(`http://localhost/api/media?u=${encodeURIComponent(MEDIA_URL)}`, {
        headers: { Range: "bytes=0-3" },
      }),
    );
    expect(res.status).toBe(206);
    expect(res.headers.get("content-range")).toBe("bytes 0-3/18560964");
    expect(res.headers.get("accept-ranges")).toBe("bytes"); // the fix
    expect(res.headers.get("content-type")).toBe("video/mp4");
  });

  it("a NON-range request returns 200 with Accept-Ranges: bytes", async () => {
    process.env.SUPABASE_URL = SUPABASE;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3, 4]), {
        status: 200,
        headers: { "content-type": "video/mp4", "content-length": "18560964" },
      }),
    );
    const res = await streamMedia(
      new Request(`http://localhost/api/media?u=${encodeURIComponent(MEDIA_URL)}`),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("accept-ranges")).toBe("bytes");
    expect(res.headers.get("content-length")).toBe("18560964");
  });

  it("404s a URL outside the allowlist — never an open proxy", async () => {
    process.env.SUPABASE_URL = SUPABASE;
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const res = await streamMedia(
      new Request("http://localhost/api/media?u=https%3A%2F%2Fevil.example.com%2Fx"),
    );
    expect(res.status).toBe(404);
    expect(fetchSpy).not.toHaveBeenCalled(); // rejected before any fetch
  });
});
