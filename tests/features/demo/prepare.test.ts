import { beforeEach, describe, expect, it } from "vitest";
import {
  createMemoryBusinessSpine,
  type Business,
  type BusinessSpineRepositories,
} from "@/core/business";
import {
  createMemoryLearningFeed,
  type LearningFeed,
} from "@/core/memory-spine";
import type { MediaStorage } from "@/core/media/generate";
import {
  DEMO_CAPTURE_KIND,
  extractSiteSignals,
  isFetchableSiteUrl,
  prepareDemo,
  type PageFetcher,
} from "@/features/demo";

/**
 * ADR-055 before-capture: the Before is read, never invented. With a URL:
 * real signals + their own og:image stored through the media pipeline.
 * Without one — or unreachable — the honest state is recorded and NOTHING
 * is fabricated.
 */

const HTML = `<!doctype html><html><head>
<title>  Liberty Contractors — Roofing Oxford  </title>
<meta name="description" content="Family-run roofing across Oxfordshire.">
<meta property="og:image" content="/images/hero.jpg">
</head><body>old site</body></html>`;

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);

function fakeFetcher(): PageFetcher {
  return async (url) =>
    url.endsWith("hero.jpg")
      ? { ok: true, bytes: JPEG, contentType: "image/jpeg" }
      : { ok: true, bytes: new TextEncoder().encode(HTML), contentType: "text/html" };
}

function memoryStorage(): MediaStorage {
  return {
    async save(businessId, slotRef, _bytes, format) {
      return { url: `/generated-media/${businessId}/${slotRef}.${format}` };
    },
  };
}

describe("prepareDemo", () => {
  let spine: BusinessSpineRepositories;
  let feed: LearningFeed;

  async function makeBusiness(currentWebsiteUrl?: string): Promise<Business> {
    return spine.businesses.create({
      name: "Liberty Contractors",
      trade: "Roofing",
      location: "Oxford",
      contact: { phone: "01865 000000" },
      ...(currentWebsiteUrl ? { currentWebsiteUrl } : {}),
    });
  }

  beforeEach(() => {
    spine = createMemoryBusinessSpine();
    feed = createMemoryLearningFeed();
  });

  it("captures real signals + stores their og:image as an approved media asset", async () => {
    const business = await makeBusiness("https://libertycontractors.co.uk");
    const result = await prepareDemo(business, {
      spine,
      feed,
      storage: memoryStorage(),
      fetchPage: fakeFetcher(),
      now: () => "2026-07-21T22:00:00.000Z",
    });
    expect(result.presence).toBe("website");
    expect(result.title).toBe("Liberty Contractors — Roofing Oxford");
    expect(result.description).toBe("Family-run roofing across Oxfordshire.");
    expect(result.mediaId).toBeTruthy();

    const media = await spine.media.get(result.mediaId!);
    expect(media?.status).toBe("approved"); // the prep click is the founder action
    expect(media?.provenance.provider).toBe("before-capture");
    expect(media?.provenance.costUsd).toBe(0);
    expect(media?.slotRef).toBe("demo.before");

    const captures = await feed.list({ kind: DEMO_CAPTURE_KIND });
    expect(captures).toHaveLength(1);
    expect(captures[0].payload?.presence).toBe("website");
    expect(captures[0].payload?.url).toBe("https://libertycontractors.co.uk");
  });

  it("no URL → the honest no-presence state; NO media asset, nothing invented", async () => {
    const business = await makeBusiness();
    const result = await prepareDemo(business, {
      spine,
      feed,
      storage: memoryStorage(),
      fetchPage: fakeFetcher(),
    });
    expect(result.presence).toBe("none");
    expect(result.mediaId).toBeUndefined();
    expect(await spine.media.listForBusiness(business.id)).toEqual([]);
    const captures = await feed.list({ kind: DEMO_CAPTURE_KIND });
    expect(captures[0].payload?.presence).toBe("none");
    expect(captures[0].summary).toContain("presence card is the honest before");
  });

  it("unreachable site → honest failure recorded, never a fake before", async () => {
    const business = await makeBusiness("https://gone.example");
    const result = await prepareDemo(business, {
      spine,
      feed,
      storage: memoryStorage(),
      fetchPage: async () => {
        throw new Error("ECONNREFUSED");
      },
    });
    expect(result.presence).toBe("website-unreachable");
    expect(await spine.media.listForBusiness(business.id)).toEqual([]);
    const captures = await feed.list({ kind: DEMO_CAPTURE_KIND });
    expect(captures[0].summary).toContain("FAILED honestly");
  });

  it("guards the fetch: http(s) only, never loopback or private ranges", () => {
    expect(isFetchableSiteUrl("https://libertycontractors.co.uk")).toBe(true);
    expect(isFetchableSiteUrl("http://example.com/page")).toBe(true);
    for (const bad of [
      "ftp://example.com",
      "file:///etc/passwd",
      "http://localhost:4100/dashboard",
      "http://127.0.0.1:54321",
      "http://192.168.0.10",
      "http://10.0.0.1",
      "http://172.16.0.1",
      "not a url",
    ]) {
      expect(isFetchableSiteUrl(bad), bad).toBe(false);
    }
  });

  it("extractSiteSignals returns only what the site actually exposes", () => {
    expect(extractSiteSignals("<html><body>nothing</body></html>", "https://x.example")).toEqual({});
    const signals = extractSiteSignals(HTML, "https://libertycontractors.co.uk/about");
    expect(signals.imageUrl).toBe("https://libertycontractors.co.uk/images/hero.jpg");
  });
});
