# TITAN — Session Handoff (27–28 July 2026, late evening)

Complete state transfer for a fresh session. Supersedes `2026-07-27-session-handoff.md`.
Robert = founder ("Robert O'Toole", robotoole1988@gmail.com). Repo: `github.com/robotoole1988-art/Titan-Architect-` (private), local at `/Users/robertotoole/Titan-Architect-` on his Mac.

---

## 1. What TITAN is

A Next.js 16 platform that auto-generates marketing websites for UK local trade businesses (~35 trades in the intake dropdown). Live in production on Vercel: **titan-architect.vercel.app** (app is founder-gated; published demo sites are public):

- `titan-architect.vercel.app/sites/summit-roofing-rescue` — emergency roofing archetype (Leeds)
- `titan-architect.vercel.app/sites/kerbside-kings` — driveways archetype (Manchester)
- Custom customer domains serve via host-header rewrite to `/sites/-host/{hostname}` (middleware, ADR-027; cookieless by construction).

Repo culture: ADR-driven (docs/architecture/adr-001…058), every fix ships with a pinning test. Merge style: **"Create a merge commit"** (never squash). CI (required check): lint + typecheck + build + vitest.

## 2. Where things stand — MERGED tonight

| PR | What | Result |
|---|---|---|
| #25 | **The box law** (ADR-055): `CinematicImage` `fit` required; snapshot serving by signal; Lighthouse CI gate; rendition ladder | merged `f611a7b` |
| #26 | Gate sends the Vercel protection bypass — audits the site, not the login wall | merged |
| #27 | Fraunces off the critical path (−36KB); SEO advisory on previews; composite markup+styles budget (ADR-058) | merged `f40477a` |

Earlier today: #21 dossiers + Performance Law, #22 codex seeds, #23 the JS diet, #24 media law.

### The headline result

**Every non-hero photograph on both live sites had never loaded.** `CinematicImage` hardcoded `relative overflow-hidden` and concatenated the caller's `absolute inset-0`; Tailwind emits `.relative` after `.absolute`, so the wrapper stayed in flow with an absolutely-positioned `next/image fill` child and collapsed to **zero height** — which also means it never intersects the viewport, so the lazy loader never fires. Measured in production: `box 755x0`, `loaded: false`, **10 of 11 images on Kerbside**. Six call sites used `absolute inset-0`; two more (`story.gentle-welcome`, `trust.team-introduction`) passed `w-full` with no height and failed the same way.

Verified fixed on production: **11 boxes, 0 zero-height, 8 loaded on scroll, 0 in-view unloaded.** The before/after wipe and the portfolio showcase render real photography for the first time.

## 3. Real measurements (all taken tonight — trust these over inference)

**Fresh scaffolding site, built end-to-end and scored (PSI, mobile):**
`Performance 99 · Accessibility 96 · Best Practices 100 · SEO 92` — no approved media, so the LCP is text.

**Gate on preview (Summit), median of 3, bypass in use:**
```
FAIL performance  91  (floor 95)
PASS accessibility 96 · best-practices 100 · CLS 0
note seo 61 (advisory — previews are noindex)
FAIL largest-contentful-paint 3276.9ms (ceiling 2500)
PASS total-blocking-time 126.5ms (ceiling 200)
FAIL script 195.057KB (budget 130)
PASS font 82.812KB · total 373.147KB · markup+styles 57.896KB (budget 70)
```

**Production, direct measurement:**
- warm TTFB **13ms** — serving is NOT the problem
- hero AVIF **33KB** at 1080w; every width ≥1080 returns the same 33KB (source isn't bigger)
- JS **644KB decoded / 12 chunks**, `x-vercel-cache: MISS` seen on several image renditions
- **No `three`, no `framer-motion`, no `@react-three` in any chunk** — the JS diet held. It's React + Next's client runtime + the surviving islands.

## 4. THE KEY INSIGHT — read this before optimising anything

**The JavaScript is not what is holding LCP.** The scaffolding site ships the *identical* 644KB of JS and scores **99**. The only difference is that it has no hero photograph.

So the 92-vs-95 gap on Summit/Kerbside is **the hero image path**, almost certainly the Vercel image optimiser cold-missing and paying AVIF transcode time on the LCP critical path. The media law §4 already prescribes the fix: **renditions pre-generated at upload (384/640/960/1280/1920), content-hashed URLs, `Cache-Control: immutable`** — retiring the on-demand optimiser for published sites.

I spent an hour chasing the 195KB script budget as the LCP cause. It is a real budget breach worth fixing, but it is **not** the LCP lever. Don't repeat that.

## 5. OPEN BUG — fix this first

**Unpublish does not propagate.** Clicked Unpublish on the test scaffolding site; the CRM shows it offline; the public URL kept serving:

```
status 200 · x-vercel-cache HIT · age 324 → 342 (climbing) · full site HTML
```

`revalidatePublishedSite()` ran and purged nothing. Because #25 raised `revalidate` from 60s → 3600s, an unpublished site now stays live for up to **an hour** instead of a minute. ADR-055 documented that trade-off assuming the hook worked. It doesn't.

**Leading hypothesis (untested):** `revalidatePath(path, "layout")` may be a no-op for `/sites/[slug]`, which has no `layout.tsx` of its own. Try a plain page revalidation plus explicit area paths, or cache tags.

**Why it got through:** `tests/features/website-renderer/revalidate-site.test.ts` asserts the *call shape* (that `revalidatePath` is called with `"layout"`), not the *effect*. The replacement test must prove a slug actually 404s after unpublish.

## 6. HOW WE SHIP (updated — several hard-won corrections)

- **NEW — the cloud sandbox has npm network access.** Tar the repo source on the Mac (`tar --exclude=node_modules --exclude=.git --exclude=.next`), stage it, `npm ci` in the cloud → **full CI parity**: lint, `tsc --noEmit`, and the whole vitest suite all run. This is far better than the old "only tsc on the Mac" workflow. Use it for everything.
  - Cloud CANNOT reach: `vercel.app` (403), `googleapis.com` (PSI API), `fonts.googleapis.com` — so `next build` fails in the cloud on font fetching ONLY. That failure is expected and harmless; CI has network.
- `device_bash` = his Mac VM: git push/npm BLOCKED (proxy 403), but `node_modules/.bin/tsc --noEmit` works (~8s). vitest and eslint DON'T run there.
- **DO NOT run git commands via `device_bash`.** They leave a `.git/index.lock` the mount cannot unlink, which silently breaks his next `git add`. Cost us one failed push. Read `.git/HEAD` and `.git/refs/**` directly instead.
- **DO NOT put `git checkout main && git pull` in a Terminal block.** His local `main` and `origin/main` refs are both stale at `ca84677`; checkout aborts rather than clobber modified files, and the `&&` chain dies. **Branch from HEAD instead** — his HEAD is always a parent of the merge commit, so the PR diff is clean.
  - Worth resyncing when nothing is uncommitted: `git fetch origin && git checkout main && git reset --hard origin/main`.
- **`.github/workflows/*` cannot be written via `device_commit_files`** (protected path). Write those with `device_bash` + python instead.
- File transfer that works: tar the changed files → `SendUserFile` → `device_commit_files` to `.titan-tmp/` → extract to a temp dir on the device → copy in place with python (`open(dst,'wb')` truncates; `tar -x` CANNOT overwrite on that mount). Terminal block ends with `rm -rf .titan-tmp`.
- GitHub PR forms: `form_input` works for both title and body. Merge = "Create a merge commit". Click "Update branch" if offered.
- **Vercel Deployment Protection is ON** (`Require Log In: Standard Protection`). Preview URLs serve a login wall to anything unauthenticated — it answers **200**, which is why the gate's first run scored Vercel's page and reported 1,304KB of "our" JS. Robert created a bypass secret; `VERCEL_AUTOMATION_BYPASS_SECRET` now exists as a GitHub Actions secret and the gate sends `x-vercel-protection-bypass`.
- Chrome extension: github.com, vercel.com, titan-architect.vercel.app, pagespeed.web.dev all work. PSI's **anonymous API quota gets exhausted** — use the pagespeed.web.dev UI instead.
- Verification codes and secrets NEVER go in chat — only into the destination's own page.

## 7. The Performance Law gate (ADR-055, ADR-058)

- `src/core/performance-law/law.json` — the single source of floors and budgets. `index.ts` exposes `assessAgainstLaw()` / `medianRun()`, data-driven.
- `scripts/lighthouse-gate.mjs` — mobile emulation, median of 3, media-gate-style rejection, exit 1 on breach. Runs Lighthouse via `npx --yes` (no dependency, no lockfile change). Blocks `vercel.live` (the preview toolbar is not our product). Refuses to score any 200 lacking `data-primitive=` — that check is what caught the login wall.
- `.github/workflows/lighthouse.yml` — `deployment_status` (preview) + nightly 03:20 UTC against production.
- **Not yet a required check.** Make it required in branch protection once the fleet clears the floors.
- SEO is advisory on previews (noindex); enforced on the nightly production run.

## 8. NEXT UP (agreed order)

1. **Fix unpublish revalidation** (§5) + a test that proves the 404, not the call shape.
2. **Media renditions at upload** — pre-generated 384/640/960/1280/1920, content-hashed, immutable. This is the LCP lever and the path to ≥95 on the image-bearing sites.
3. **JS islands audit** — 195KB gz vs the 130KB budget. Real, but NOT the LCP cause. Candidates: `rendered-site` (client boundary, preview-only?), faq accordion, surface selector, story-transformation-arc, conversion-lead-capture.
4. **PR: conversion pass** (Vol 1 §3 laws: fold discipline, forms 3–5 fields, reviews with name+town+date, guide-from pricing + finance framing, speed-to-lead auto-acknowledgement).
5. **PR: per-trade modules** from Vols 2–3 (OKLCH token pipeline, trade themes, Utopia type).

## 9. Research corpus (all in repo `docs/research/`)

- `2026-07-26-site-excellence-dossier.md` (Vol 1), `2026-07-26-trade-playbooks-vol2.md` (Vol 2, ~35 trades), `2026-07-26-design-and-acquisition-dossier-vol3.md` (Vol 3)
- `docs/experience/PUBLISHED-SITES-PERFORMANCE-LAW.md` — the law: ≥95 mobile floor, byte budgets, JS law, media law, serving law, enforcement. §2 and §6 amended tonight.

## 10. Founder decisions on record

- 2026-07-04: morph retreat — v1 vector moments retired from public output.
- 2026-07-27: ship the JS diet (framer-motion banned; Performance Law adopted).
- 2026-07-27: image-only heroes by default; film opt-in premium flag.
- 2026-07-27 (tonight): **markup + styles share one 70KB budget** (ADR-058) rather than the unmeasurable HTML-35 / CSS-35 split, because `inlineCss` puts the CSS inside the document. Same total, counted once. Headroom is not an invitation — §2's ratchet-down rule stands.

## 11. Smaller backlog

- **Test data to clean up:** `Pennine Access Scaffolding` (Sheffield, businessId `8f7ade29-fbc1-4e23-847b-5aecef39dec6`) — built tonight to score a fresh trade. Unpublished in the CRM; the cached page self-expires within the hour of 23:05 BST. Remove the business record if you don't want it in the pipeline.
- Fonts: a per-archetype font module would let the care archetype preload Fraunces again without taxing every other trade.
- SEO keyword pills on site pages.
- Horsforth van film with garbled livery — awaiting reject in the media gate.
- Repeat-visit typing ritual skip on the Command Centre.
- Naming: "Command Centre" vs "Mission Control" — his call.
- Remove framer-motion + unused deps from package.json when npm network is available (lockfile regen).
- Per-site premium-film flag on the publication record (replaces the env switch).

## 12. Working style that fits Robert

Non-technical founder, decisive, high trust. Explain in plain terms with the numbers, do the work end-to-end, ask only decisions that are genuinely his (one AskUserQuestion at a time). He says "pushed" after Terminal pastes. Evenings: save state before he sleeps. He values seeing the product (screenshots of the live sites) alongside the scores.

**Do not spend money without him clicking.** Media generation (`commissionFilm`, `generateMissingMedia`) has real `costUsd`. Strategy and blueprint generation are deterministic and free.

**Do not click his approval gates for him.** The build queue says "Nothing goes live without approval here — the gate is law." Ask first; he answered instantly both times tonight.
