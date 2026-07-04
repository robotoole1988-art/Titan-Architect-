# ADR-037: Media Streaming — a same-origin Range proxy so films actually play

- **Status:** Accepted
- **Date:** 2026-07-05
- **Deciders:** Robert O'Toole
- **Tags:** media, renderer, video, serving
- **Supersedes:** — (fixes a playback defect in [ADR-036](./adr-036-video-engine.md))
- **Superseded by:** —

## Context

Video Engine v1 ([ADR-036](./adr-036-video-engine.md)) shipped: the four
hero films generate, store to Supabase, and appear in the review gate. But
the `<video>` player would not play. In-browser diagnosis (dev server on
:4100): the element hangs permanently at `readyState 0`, `networkState 2`,
`currentTime 0`, no error; `video.play()` returns a promise that never
resolves — while a plain `fetch()` of a byte range succeeds. **That gap is
exactly what let the bug through the first time: prior verification proved the
file downloads, not that it plays.**

Root cause, confirmed server-side against the real Supabase responses (not
assumed):

- A plain `GET` returns `200` + `Accept-Ranges: bytes` + `Content-Length`.
- A ranged `GET` returns `206` + a correct `Content-Range`, **but omits
  `Accept-Ranges: bytes`**, does **not** send `Access-Control-Expose-Headers`
  (so a cross-origin `fetch()` cannot even read `Content-Range` — hence the
  "no Content-Range" report), and is served through Cloudflare with
  `cf-cache-status: HIT` — i.e. range responses are edge-cached per-URL.

The file itself is healthy (faststart, `moov` before `mdat`). The failure is
the **byte-serving contract**: an inconsistent, cross-origin, per-range-cached
206 that Chrome's media byte-stream loader cannot reliably stream, so it
stalls before `readyState` ever advances.

## Decision

**Serve generated video through a same-origin Next.js Range proxy.** A route
handler at `/api/media` proxies the storage object and normalises the
contract:

- forwards the client's `Range` header to storage **server-side**, where
  ranges are correct and consistent (proven by `curl`);
- re-emits a clean response — **`206` + `Content-Range` + `Accept-Ranges:
  bytes`** for a ranged request, **`200` + `Accept-Ranges: bytes`** for a
  plain one — always advertising range support (the header Supabase omits);
- is **same-origin**, so there is no CORS expose-header ambiguity and no
  per-browser Cloudflare range-cache mismatch.

Both the review-gate player and the public hero (`AmbientFilm`, for approved
films) point at the proxy: video `ResolvedMediaAsset` URLs and the CRM
`<video src>` pass through `toStreamUrl(url)`, which rewrites a storage-public
URL to `/api/media?u=<encoded>` and leaves local/static URLs untouched (Next's
static serving already does Range correctly).

**Provider-independent by design.** The Range normalisation is generic; the
only provider-specific part is an **SSRF allowlist** — the proxy only fetches
objects under the configured Supabase storage-public prefix, and 404s
anything else.

**Unchanged:** the founder gate. Nothing about approval logic moves. The
public hero stays **poster-only with zero `<video>` in SSR** until a film is
approved — `AmbientFilm` remains client-only and reduced-motion/reduced-data
safe. This ADR only fixes where the bytes come from.

## Consequences

- Video now streams from `localhost`/the app origin; the proxy adds a hop but
  the hero clip is lazy ambience, so latency is immaterial and the poster
  (the LCP) is untouched.
- A regression test asserts the endpoint returns `206` with `Content-Range`
  **and** `Accept-Ranges: bytes` on a ranged request (and `200` otherwise),
  so the byte-serving contract can never regress silently.
- Images are unaffected — they go through `next/image` and need no rewrite.

## Alternatives Considered

- **Point `<video>` straight at Supabase (the shipped state).** The defect
  itself. Rejected.
- **Fix Supabase/Cloudflare headers (expose `Content-Range`, add
  `Accept-Ranges`, disable range caching).** Not fully in our control, still
  cross-origin, and provider-specific. Rejected in favour of owning the
  contract.
- **Download the whole clip client-side and play from a Blob.** Defeats
  streaming, hurts the very LCP discipline the ambience layer protects.
  Rejected.
