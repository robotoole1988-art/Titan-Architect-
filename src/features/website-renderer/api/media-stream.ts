/**
 * Media streaming proxy (ADR-037).
 *
 * Chrome's `<video>` byte-stream loader hangs on the raw Supabase public
 * URL: its 206 range responses omit `Accept-Ranges`, don't CORS-expose
 * `Content-Range`, and are Cloudflare-cached per-range — an inconsistent
 * cross-origin byte-serving contract the media loader cannot stream (a plain
 * `fetch()` still succeeds, which is exactly what hid the bug). The fix is a
 * SAME-ORIGIN proxy that normalises the contract: it forwards the client's
 * Range to storage server-side (where ranges ARE correct) and re-emits a
 * clean, consistent response — 206 + Content-Range + Accept-Ranges for a
 * ranged request, 200 + Accept-Ranges otherwise. Provider-independent by
 * design; the only provider-specific part is the SSRF allowlist.
 */

const MEDIA_ROUTE = "/api/media";

/** The storage prefix we are willing to proxy (SSRF guard). */
function allowedPrefix(): string | null {
  const base = process.env.SUPABASE_URL;
  return base ? `${base.replace(/\/+$/, "")}/storage/v1/object/public/` : null;
}

/** True when the URL is a public object in our Supabase storage. */
export function isProxyableMediaUrl(url: string): boolean {
  const prefix = allowedPrefix();
  return prefix !== null && url.startsWith(prefix);
}

/**
 * Rewrite a stored media URL to the same-origin streaming route when it is a
 * remote storage object; leave local/static and already-proxied URLs alone
 * (Next's static serving already does Range correctly for those).
 */
export function toStreamUrl(url: string): string {
  if (!url.startsWith("http")) return url; // local /generated-media/*
  // Client-side we can't read SUPABASE_URL; rewrite any storage-public URL
  // and let the route's server-side allowlist reject anything else.
  if (!url.includes("/storage/v1/object/public/")) return url;
  return `${MEDIA_ROUTE}?u=${encodeURIComponent(url)}`;
}

/** The route handler body: stream `?u=<upstream>` with correct Range headers. */
export async function streamMedia(request: Request): Promise<Response> {
  const upstream = new URL(request.url).searchParams.get("u");
  if (!upstream || !isProxyableMediaUrl(upstream)) {
    return new Response("Not found", { status: 404 });
  }

  const range = request.headers.get("range") ?? undefined;
  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(upstream, {
      headers: range ? { Range: range } : {},
      // We re-emit our own cache headers; don't let fetch collapse ranges.
      cache: "no-store",
    });
  } catch {
    return new Response("Bad gateway", { status: 502 });
  }
  if (upstreamRes.status !== 200 && upstreamRes.status !== 206) {
    return new Response("Upstream error", { status: 502 });
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    upstreamRes.headers.get("content-type") ?? "application/octet-stream",
  );
  // The missing piece that hangs Chrome — always advertise range support.
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=3600");
  const contentLength = upstreamRes.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  const rangedAndHonoured = Boolean(range) && upstreamRes.status === 206;
  if (rangedAndHonoured) {
    const contentRange = upstreamRes.headers.get("content-range");
    if (contentRange) headers.set("Content-Range", contentRange);
    return new Response(upstreamRes.body, { status: 206, headers });
  }
  // No range, or the provider ignored it — serve the whole object as 200
  // (still advertising Accept-Ranges so the client can seek by re-requesting).
  return new Response(upstreamRes.body, { status: 200, headers });
}
