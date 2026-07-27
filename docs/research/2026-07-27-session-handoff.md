# TITAN — Session Handoff (27 July 2026)

Complete state transfer for a fresh session. Supersedes `2026-07-26-session-handoff.md`.
Robert = founder ("Robert O'Toole", robotoole1988@gmail.com). Repo: `github.com/robotoole1988-art/Titan-Architect-` (private), local at `/Users/robertotoole/Titan-Architect-` on his Mac.

---

## 1. What TITAN is

A Next.js 16 platform that auto-generates marketing websites for UK local trade businesses (~35 trades in the intake dropdown). Live in production on Vercel: **titan-architect.vercel.app** (app is founder-gated; published demo sites are public):

- `titan-architect.vercel.app/sites/summit-roofing-rescue` — emergency roofing archetype (Leeds)
- `titan-architect.vercel.app/sites/kerbside-kings` — driveways archetype (Manchester)
- Custom customer domains serve via host-header rewrite to `/sites/-host/{hostname}` (middleware, ADR-027; cookieless by construction).

Repo culture: ADR-driven (docs/architecture/adr-001…057), every fix ships with a pinning test. Merge style: **"Create a merge commit"** (never squash). CI (required check): lint + typecheck + build + vitest.

## 2. Where things stand tonight — MERGED today

| PR | What | Result |
|---|---|---|
| #21 | Research dossiers Vols 1–3 → `docs/research/`, Published Sites Performance Law → `docs/experience/PUBLISHED-SITES-PERFORMANCE-LAW.md`, Codex seed entries | merged |
| #22 | Codex store: newly added seeds now merge into browsers with persisted data | merged (shipped via GitHub web editor — see §4) |
| #23 | **The JS diet**: framer-motion fully removed from the renderer (10 files); motion system v2 is CSS (ADR-022 v2) | merged |
| #24 | **Media law**: ambient film OFF by default (`model/film-flag.ts`, opt-in `NEXT_PUBLIC_AMBIENT_FILM=1`), hero `sizes="100vw"`, month-long immutable media caching (proxy + `images.minimumCacheTTL`) | merged |

**Mobile Lighthouse, Summit (PSI, Moto G Power / slow 4G): 64 (yesterday) → 86 (after #23) → 92 (after #24).**
Current metrics: TBT 10ms · LCP 2.9s (amber — last blocker) · CLS 0 · FCP 1.1s · Speed Index 4.5s · A11y 96 · BP 100 · SEO 92.
Both live sites visually verified after each merge — identical look, reveals/stagger/sticky-bar/comparison-wipe all working in CSS.

Earlier merges (yesterday): #17 go-live, #18 cc-room containing-block fix, #19 the-way-home navigation, #20 ghost-word removal.

## 3. The JS diet — what changed (PR #23, know this before touching the renderer)

- `src/features/website-renderer/motion/motion.tsx` — same exported API (Reveal, Stagger, StaggerItem, Parallax, MagneticCTA, PulseBeacon) but universal server-safe components, zero framer.
- `motion/reveal-observer.tsx` (new, "use client") — THE one motion island: one IntersectionObserver marks `[data-wr-reveal]` / `[data-wr-stagger]` targets `data-wr-on`; CSS in render-page ROOT_CSS transitions them. Hiding only applies under `[data-wr-js]` (set by the observer itself) → no JS = fully visible. Above-fold is revealed synchronously before hiding activates (no LCP blink).
- `model/render-page.tsx` — MotionConfig gone; ROOT_CSS now carries the whole motion system incl. scroll-driven animations behind `@supports (animation-timeline: view())` with static fallbacks: `.wr-sticky-bar` (slide-in via scroll() timeline; fallback = always visible), `.wr-rail-draw`, `.wr-parallax`, `.wr-collapse` (grid-rows accordion), `.wr-rotor`, `.wr-panel-in`, `.wr-wipe`, `.wr-radar-sweep`, `.wr-beacon`, `.wr-magnetic`.
- Demoted to SERVER components: gallery-immersive-grid, proof-portfolio-showcase, location-service-area, process-journey-map, conversion-emergency-cta, both moments. Still client: faq accordion, surface selector, story-transformation-arc (Comparison), conversion-lead-capture, ambient-film, site-metrics-beacon, rendered-site, morph-lab/world.
- Both signature moments (storm-cloud-new-roof, gravel-to-resin) are now zero-JS CSS scroll cinematics: markup authored at the designed-still END state; keyframes (incl. `d: path()` morph) run only under @supports+motion-ok on a named view-timeline (`--wr-sm` / `--wr-gv`, range `exit 0% exit 100%`). They remain preview-only behind `NEXT_PUBLIC_PREVIEW_SIGNATURE_MOMENTS=1` (morph retreat, ADR-032 addendum).
- `framer-motion` is still in package.json (UNUSED — nothing imports it). Removing it needs a lockfile regen, which needs npm network the Mac VM doesn't have. Remove when network allows.
- Laws pinned in: `tests/features/command-centre/room-containing-block.test.ts` (never transform-animate `.cc-room`), `navigation.test.ts` ("the way home"), `tests/features/website-renderer/*` (public-output scaffolding denylist incl. `border-dashed` and `data-signature-moment`; no `<video>` in SSR markup; no `transform-origin=` attribute in moment SVG).

## 4. HOW WE SHIP (critical mechanics — the Mac VM has no network)

- I work in the cloud; his repo is mounted read-write at `/sessions/<session>/mnt/Titan-Architect-` (device tools only). `device_bash` = his Mac VM: git push/npm BLOCKED (proxy 403), but **`node_modules/.bin/tsc --noEmit` works (~17s)** — always typecheck there before shipping. vitest and eslint DON'T run there (mac-native bindings missing on linux VM) — CI covers them.
- Normal route: edit files in cloud → SendUserFile → device_commit_files to the repo path → tsc on device → give Robert a Terminal paste-block (single-line commit messages; he pastes, says "pushed") → I drive PR/merge via claude-in-chrome on github.com.
- **No-Terminal route (proven on PR #22)**: computer_resolve_access + computer_request_access with `clipboardWrite` → `computer_write_clipboard` with full file content → GitHub web editor (github.com/…/edit/main/<path>) → click editor, cmd+a, cmd+v → Commit changes → new branch → PR → merge. Grant persists this session only; re-request in a new session.
- GitHub PR forms: **single-line typing only** (multiline submits early); form_input tool is safe for description textareas. Merge = "Create a merge commit"; if branch behind, click "Update branch" first.
- Chrome extension domain permissions: github.com, vercel.com, titan-architect.vercel.app, pagespeed.web.dev all work. Vercel PREVIEW subdomains (`*-git-*.vercel.app`) are NOT permitted (screenshots denied) and the app is founder-gated anyway — verify on production after merge; Vercel dashboard has one-click Rollback.
- Cloud sandbox CANNOT reach vercel.app (403 allowlist) — use PageSpeed Insights in his Chrome for Lighthouse: `https://pagespeed.web.dev/analysis?url=<encoded>` then wait ~40s and screenshot.
- Verification codes NEVER go in chat — only into GitHub's own pages (established rule).

## 5. NEXT UP (agreed order)

1. **PR: static serving + Lighthouse CI gate + Kerbside image fix** — the push from 92 → 95+ (the Performance Law floor):
   - Static serving of published snapshots (they ARE snapshots; fixes bfcache + TTFB; LCP 2.9s → target <2.5s). Dynamic media-gate asset resolution must be preserved (approved assets appear WITHOUT republish — currently server-resolved; moving to static needs a client-side media-manifest hydration or revalidate-on-approve).
   - Lighthouse CI gate on renderer PRs (mobile emulation, median of 3, floors from the Performance Law §1–2, byte budgets; config in one file shared by CI/publish gate/nightly sampler).
   - **Kerbside bug (diagnosed, unfixed)**: portfolio images render as stuck LQIP gradients — `next/image fill` containers laid out at ZERO height (rect "755x0") so lazy-load never fires. Fix: give the image wrappers real height (the ProjectFrame figure has minHeight but the CinematicImage absolute-inset wrapper chain loses it) — inspect `proof-portfolio-showcase.tsx` ProjectFrame + `cinematic-image.tsx`.
2. **PR: conversion pass** (Vol 1 §3 laws: fold discipline, forms 3–5 fields, reviews with name+town+date, guide-from pricing + finance framing, speed-to-lead auto-acknowledgement).
3. **PR: per-trade modules** from Vols 2–3 (OKLCH token pipeline, trade themes, Utopia type — the big design-system build).

## 6. Research corpus (all in repo `docs/research/`)

- `2026-07-26-site-excellence-dossier.md` (Vol 1: performance/media/conversion laws, GDC/CQC/ASA + MCS/RECC compliance MUSTs, enforcement)
- `2026-07-26-trade-playbooks-vol2.md` (Vol 2: all ~35 trades)
- `2026-07-26-design-and-acquisition-dossier-vol3.md` (Vol 3: design craft — prototypicality law, OKLCH/Leonardo contrast-first tokens, Utopia fluid type, imagery triad + 3-tier treatment, WCAG 2.2 AA; acquisition — UK LSAs ~£10–30/lead emergency-first, SKAGs dead, call ads sunset, PMax default-no, Consent Mode v2, GEO = same work as SEO re-weighted, DMCC Act makes review gating ILLEGAL UK, review velocity 18-day cliff, Meta trade hierarchy + Andromeda 6+ creatives + sub-60s speed-to-lead)
- `docs/experience/PUBLISHED-SITES-PERFORMANCE-LAW.md` — the law: ≥95 mobile floor, byte budgets (JS ≤130KB gz), JS law, media law (Ken Burns default, film ≤2.5MB opt-in), static serving, enforcement.
- Codex inside Titan shows these as entries (seeds in `src/features/codex/model/mock-data.ts`; store merges new seeds into persisted browsers).

## 7. Founder decisions on record

- 2026-07-04: morph retreat — v1 vector moments retired from public output.
- 2026-07-27: ship the JS diet (framer-motion banned; Performance Law adopted).
- 2026-07-28 (his evening ask): **image-only heroes by default; film kept as opt-in premium flag** (env-level now; per-site flag when the publication record grows one). His words: "remove the media video… just use visually amazing top quality images" — implemented as default-off, not deletion.

## 8. Smaller backlog

- SEO keyword pills on site pages (blueprint coverage data exists).
- Horsforth van film with garbled livery — awaiting his reject in the media gate at /crm/{id}/media (moot for now with film off, but tidy the gate).
- Repeat-visit typing ritual skip on the Command Centre.
- Naming decision: "Command Centre" vs "Mission Control" — his call, unforced.
- Remove framer-motion + any other unused deps from package.json when npm network is available (lockfile regen).
- Per-site premium-film flag on the publication record (replaces the env switch).
- His local repo may sit on a merged feature branch — start any session by having him (or the web-editor route avoids it) run `git checkout main && git pull`.

## 9. Working style that fits Robert

Non-technical founder, decisive, high trust. Explain in plain terms with the numbers, do the work end-to-end, ask only decisions that are genuinely his (one AskUserQuestion at a time). He says "pushed" after Terminal pastes. Evenings: save state before he sleeps. He values seeing the product (screenshots of the live sites) alongside the scores.
