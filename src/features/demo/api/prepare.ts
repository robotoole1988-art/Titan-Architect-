import "server-only";

/**
 * Demo prep (ADR-055): capture the business's CURRENT presence honestly at
 * prep time, so the live pitch never waits on a network fetch and never
 * shows anything fabricated.
 *
 * With a website URL: read the real <title>, meta description and og:image;
 * store the image (their own asset) through the media pipeline; record the
 * capture in the learning feed. Without one — or when the fetch fails — the
 * honest state is recorded and the route falls back to the presence card.
 */

import type { Business, BusinessSpineRepositories } from "@/core/business";
import type { MediaStorage } from "@/core/media/generate";
import type { LearningFeed } from "@/core/memory-spine";

export const DEMO_CAPTURE_KIND = "demo_before_capture";
export const BEFORE_CAPTURE_PROVIDER = "before-capture";

/** Bounded fetches: a pitch prep must never slurp arbitrary bytes. */
const MAX_HTML_BYTES = 512 * 1024;
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

/** Injectable fetch seam — deterministic tests, no network. */
export type PageFetcher = (url: string) => Promise<{
  ok: boolean;
  bytes: Uint8Array;
  contentType: string;
}>;

export async function defaultPageFetcher(url: string): ReturnType<PageFetcher> {
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "TITAN-demo-prep/1.0 (+founder pitch preparation)" },
    signal: AbortSignal.timeout(15_000),
  });
  const bytes = new Uint8Array(await response.arrayBuffer());
  return {
    ok: response.ok,
    bytes,
    contentType: response.headers.get("content-type") ?? "",
  };
}

/** http(s) only, never loopback/private ranges — the light SSRF guard. */
export function isFetchableSiteUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host === "::1" || host.endsWith(".local")) return false;
  if (/^(127|10|0)\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host)) {
    return false;
  }
  return true;
}

/** Pull the first content= for a meta tag matching the attribute pattern. */
function metaContent(html: string, pattern: RegExp): string | undefined {
  const tag = html.match(pattern)?.[0];
  return tag?.match(/content=["']([^"']+)["']/i)?.[1]?.trim() || undefined;
}

export interface SiteSignals {
  title?: string;
  description?: string;
  imageUrl?: string;
}

/** The real signals a site exposes — never invented, empty when absent. */
export function extractSiteSignals(html: string, baseUrl: string): SiteSignals {
  const title = html
    .match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    ?.replace(/\s+/g, " ")
    .trim();
  const description =
    metaContent(html, /<meta[^>]+name=["']description["'][^>]*>/i) ??
    metaContent(html, /<meta[^>]+property=["']og:description["'][^>]*>/i);
  const ogImage = metaContent(html, /<meta[^>]+property=["']og:image["'][^>]*>/i);
  let imageUrl: string | undefined;
  if (ogImage) {
    try {
      imageUrl = new URL(ogImage, baseUrl).toString();
    } catch {
      imageUrl = undefined;
    }
  }
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(imageUrl && isFetchableSiteUrl(imageUrl) ? { imageUrl } : {}),
  };
}

export interface PrepareDemoDeps {
  spine: BusinessSpineRepositories;
  feed: LearningFeed;
  storage: MediaStorage;
  fetchPage?: PageFetcher;
  now?: () => string;
}

export interface PrepareDemoResult {
  /** "website" (captured), "website-unreachable" (honest failure), "none". */
  presence: "website" | "website-unreachable" | "none";
  title?: string;
  description?: string;
  /** The stored before-image media record id, when one was captured. */
  mediaId?: string;
}

/**
 * Prepare the demo for one business. Founder-triggered; deterministic given
 * the fetch seam; every outcome — including failure — is recorded honestly
 * in the learning feed as the route's prepared data.
 */
export async function prepareDemo(
  business: Business,
  deps: PrepareDemoDeps,
): Promise<PrepareDemoResult> {
  const fetchPage = deps.fetchPage ?? defaultPageFetcher;
  const now = deps.now ?? (() => new Date().toISOString());
  const url = business.currentWebsiteUrl?.trim();

  let result: PrepareDemoResult;
  if (!url || !isFetchableSiteUrl(url)) {
    // The no-presence rung: the fallback card is built from the business
    // record at render time — nothing to capture, nothing invented.
    result = { presence: "none" };
  } else {
    try {
      const page = await fetchPage(url);
      if (!page.ok || page.bytes.length === 0 || page.bytes.length > MAX_HTML_BYTES * 8) {
        result = { presence: "website-unreachable" };
      } else {
        const html = new TextDecoder().decode(page.bytes.slice(0, MAX_HTML_BYTES));
        const signals = extractSiteSignals(html, url);
        let mediaId: string | undefined;
        if (signals.imageUrl) {
          try {
            const image = await fetchPage(signals.imageUrl);
            const format = image.contentType.includes("png")
              ? "png"
              : image.contentType.includes("webp")
                ? "webp"
                : "jpeg";
            if (image.ok && image.bytes.length > 0 && image.bytes.length <= MAX_IMAGE_BYTES) {
              const stored = await deps.storage.save(
                business.id,
                "demo.before",
                image.bytes,
                format,
              );
              const record = await deps.spine.media.create({
                businessId: business.id,
                slotRef: "demo.before",
                brief: `Their current site's own og:image (${new URL(url).hostname})`,
                modality: "image",
                url: stored.url,
                provenance: {
                  provider: BEFORE_CAPTURE_PROVIDER,
                  model: "site-capture",
                  prompt: url,
                  costUsd: 0,
                  generatedAt: now(),
                },
              });
              // The founder's prepare click IS the founder action: their
              // prospect's own published image, shown back to them
              // (ADR-055). Approval recorded through the normal gate API.
              await deps.spine.media.setStatus(record.id, "approved");
              mediaId = record.id;
            }
          } catch {
            // Image capture is best-effort; the text signals still stand.
          }
        }
        result = {
          presence: "website",
          ...(signals.title ? { title: signals.title } : {}),
          ...(signals.description ? { description: signals.description } : {}),
          ...(mediaId ? { mediaId } : {}),
        };
      }
    } catch {
      result = { presence: "website-unreachable" };
    }
  }

  await deps.feed.append({
    kind: DEMO_CAPTURE_KIND,
    businessId: business.id,
    summary:
      result.presence === "website"
        ? `Demo before-capture: ${url} (${result.title ?? "untitled"})`
        : result.presence === "website-unreachable"
          ? `Demo before-capture FAILED honestly: ${url} unreachable at prep time`
          : "Demo prep: no website — presence card is the honest before",
    payload: {
      presence: result.presence,
      ...(url ? { url } : {}),
      ...(result.title ? { title: result.title } : {}),
      ...(result.description ? { description: result.description } : {}),
      ...(result.mediaId ? { mediaId: result.mediaId } : {}),
      capturedAt: now(),
    },
    source: "demo-prep",
  });

  return result;
}
