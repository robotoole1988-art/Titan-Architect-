# The Published Sites Performance Law

**Status:** Approved · **Version:** 1.0.0 · **Date:** 2026-07-27
**Applies to:** every site published by TITAN, every trade, every network — no exceptions.
**Derived from:** Research Dossier Vol 1 (Site Excellence), §§1–3 & 6; empirical Lighthouse audits of the two live archetype sites (2026-07-26: mobile perf 64, TBT 2,680ms, 20.4MB payload, 789KB decoded JS, 15.7MB cache-lifetime waste).
**Companion laws:** COCKPIT-DESIGN-LAW.md (the app), this document (the product the app ships).

---

## 0. The law in one sentence

**A TITAN site scores ≥95 on mobile Lighthouse performance — median of three runs, throttled emulation — before it is allowed to publish, and stays there for life.**

Target 100. Floor 95. The floor is enforced by machines, not intentions: a build that misses it is rejected the same way a garbled AI image is rejected at the media gate.

## 1. Metric floors (mobile emulation, median of 3)

| Metric | Floor | Aim |
|---|---|---|
| Performance | ≥95 | 100 |
| LCP | ≤2.5s | ≤1.8s |
| TBT | ≤200ms | ≤100ms |
| CLS | ≤0.1 | 0 |
| Accessibility | ≥95 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |

Desktop is not tracked separately; a site that passes mobile floors passes desktop by construction. We do **not** build separate mobile sites (ADR record: responsive one-site is the ruling).

## 2. Byte budgets (CI-enforced, ratchet down only)

- **Markup + styles ≤70KB gz combined** — one budget, whichever file the bytes arrive in (ADR-058: `inlineCss` puts the CSS *inside* the document, so the old split of HTML ≤35KB / CSS ≤35KB measured one artefact against one of its two numbers). Same total as before, counted once. **`markup` is the document MINUS its inline hydration payload** (ADR-071): a budget named markup+styles is not billed for React's flight data. *Measured on `/`, 2026-08-08: **34.3KB** — half the budget spare.*
- **Hydration payload ≤55KB gz** (ADR-071) — the App Router serialises every page twice: once as HTML the browser paints, once as the inline payload the client runtime hydrates from. Neither markup nor a script file, and the one line that grows every time a section is added, so it carries its own budget. *Measured on `/`: 41.0KB. **Provisional** — ratchet to measured + 2KB on the first green preview.*
- **JS: a measured framework floor plus a chosen allowance** (ADR-071, replacing the flat ≤130KB, which no TITAN page has ever met). `frameworkBaseline` = **194.6KB**, measured 2026-08-08 as the identical 11 chunks on `/`, `/about`, `/advertising` and `/privacy` with **zero page-unique bytes** — corroborated by Summit at 195.057KB on 2026-07-28. It is a *measurement*, not a choice: re-record it **downward** only, with the evidence in the diff. `appAuthored` = **≤20KB** on top — what TITAN itself puts on the page. *Measured today: 0KB.*
- Fonts ≤100KB (max 2 woff2, preloaded, `font-display: swap`). *Measured on `/`: 98.1KB across three woff2 — 1.9KB of headroom. The next family added breaks this.*
- Above-fold images ≤250KB · initial transfer ≤700KB excluding deferred film. *Measured on `/`: ~415KB total.*
- Budgets may only ever be lowered. Raising a budget requires an ADR. A **measured baseline** is not a budget: it may only be re-recorded downward, and never without a fresh measurement in the diff.

## 3. The JS law

- `"use client"` on leaf components only (forms, nav toggle). Every page renders complete with JavaScript off.
- **framer-motion is banned from the renderer.** Motion is CSS: `@starting-style` entries, scroll-driven animations behind `@supports (animation-timeline: view())` with a visible static fallback, `@view-transition` for page transitions. Escape hatch: motion mini `animate()` (2.3KB) only, with justification in the PR.
- Zero render-blocking third parties. No YouTube iframes (facade pattern only). Analytics is sendBeacon/deferred.

## 4. The media law

- **Default hero = Ken Burns cinema**: CSS pan/zoom over a high-quality AVIF still (8–20s, reduced-motion safe). ~100–200KB. Film is the premium exception, never the default.
- Where film is used (max one per page): ≤10s loop, muted, 720p, AV1 + H.264 fallback with explicit `codecs=`, **≤2.5MB hard ceiling per rendition** (target 1–1.5MB). The media pipeline rejects an oversized encode back to the gate like any failed asset.
- Poster = first-frame AVIF ≤150KB, preloaded `fetchpriority=high`. **The poster is always the LCP.** Video src attaches post-LCP via IntersectionObserver; `prefers-reduced-motion` or Save-Data serves poster only.
- Images: AVIF-first, renditions pre-generated at upload (384/640/960/1280/1920), content-hashed URLs with `Cache-Control: public, max-age=31536000, immutable`. Exactly one eager `fetchpriority=high` image per page. Accurate `sizes` per slot. Intrinsic dimensions everywhere; placeholder ≤300B.
- Hero containers have fixed height. CLS from media is 0 by construction.

## 5. Serving law

- Published sites are snapshots — they are served **statically** (fixes bfcache, TTFB, and removes `no-store` headers from pages that never change between publishes). *Shipped: ADR-054 (`force-static`) + ADR-055. Measured warm TTFB on the live sites: 13ms.*
- Dynamic asset resolution (media gate approvals appearing without republish) is preserved by **invalidating on the signal, not polling for it**: `revalidatePublishedSite()` runs on media approval, publish and unpublish. Time-based `revalidate` is a 1-hour backstop, not the mechanism. (The alternative — client-side hydration of the media manifest — was rejected: it spends JavaScript to solve a problem a server-side invalidation solves for free, and the JS law comes first.)
- **Every media box declares how it gets its height** (`CinematicImage` `fit`, ADR-055). A `next/image fill` wrapper that lays out at zero height never intersects the viewport, so the image is never requested and the visitor sees the placeholder for ever. This shipped once; it is now a required prop and a CI test.

## 6. Enforcement (what makes it permanent)

1. **Lighthouse CI on every renderer PR**, run against the preview deployment of both live archetype sites: mobile emulation, median of 3, all floors + byte budgets asserted. Red = no merge. *Shipped: `.github/workflows/lighthouse.yml` → `scripts/lighthouse-gate.mjs` (ADR-055). Make it a required check in branch protection once the fleet clears the floors.*
   - Preview deployments are behind Vercel Deployment Protection and are served `X-Robots-Tag: noindex`. The gate sends the automation bypass so it measures the site rather than the login wall, and treats **SEO as advisory on previews** — a noindex preview cannot reach the SEO floor no matter how correct the build. SEO is enforced in full on the nightly production run. Byte budgets are build output and mean the same on both.
   - **The gate proves its own block list** (ADR-071). Vercel injects its preview toolbar from `vercel.live` into every preview; the gate blocks it, because the customer never downloads it. That block was silently broken for weeks — the patterns were comma-joined into a single flag, which Lighthouse parses as one literal pattern matching nothing, so every preview run scored the toolbar as TITAN's product (`performance 72`, `TBT 1425ms`, against `99`/`80ms` for the same code in production). The flag is now repeated per pattern, **and the gate reads `configSettings.blockedUrlPatterns` back out of every report and refuses the measurement if a pattern it asked for is missing.** A measurement the gate cannot vouch for is not a measurement. Preview performance figures from before this fix are worthless and should be discarded, not reasoned from.
2. **Publish gate**: a site build that misses a floor does not go live. The failure reads like a media-gate rejection: what failed, by how much, what to fix. *Judgement shipped (`assessAgainstLaw`); the wiring into the publish path is still open.*
3. **Nightly fleet sampler**: N random live sites audited; any site <95 raises an alert in the Command Centre. *Nightly production run shipped; the fleet sampling + Command Centre alert are still open.*
4. Budgets and floors live in one config file; the CI, the publish gate, and the sampler all read the same numbers. *Shipped: `src/core/performance-law/law.json`, pinned to this document by `tests/core/performance-law.test.ts`.*

## 7. Why this is a business law, not a vanity metric

Every trade site TITAN ships competes against sites built by agencies that ignore all of this. Sub-2s mobile loads are directly correlated with call and form conversion; the research corpus (Vol 1 §3) puts single-CTA fast pages at multiples of the baseline. "Every TITAN site scores 95+" is also a **sales sentence** — measurable, verifiable by the customer on their own phone, and very few competitors can say it.
