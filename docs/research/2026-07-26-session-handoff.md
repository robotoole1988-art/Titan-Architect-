# TITAN — Session Handoff Notes (26 July 2026, end of day)

State of play at bedtime. Everything below is either shipped, saved, or queued for the morning.

---

## What is LIVE (merged to main, deployed on Vercel)

- **PR #17** — GitHub↔Vercel connected; Titan is live in production. Push a branch → preview deploy; merge to main → production; Vercel dashboard has one-click rollback.
- **PR #18** — Command Centre room fix: `.cc-room` now animates with the opacity-only `cc-fade` keyframes (a `transform` animation on an ancestor re-anchors all `fixed` children — proven in-browser, pinned by `tests/features/command-centre/room-containing-block.test.ts` and ADR-057 §6).
- **PR #19** — The way home: ⌘K palette shows a "Command Centre" entry on every page except home; sidebar brand mark links to `/`; briefing section no longer uses `-translate-y-1/3`; brain canvas labels removed. Pinned in `tests/features/command-centre/navigation.test.ts` ("the way home", ADR-057 §7).
- **PR #20** — Ghost words removed from both hero primitives (`hero-rapid-response.tsx`, `hero-cinematic-reveal.tsx`), including the dangling `displayFont` imports.

## Research saved (three volumes, all in `docs/research/` on your Mac — untracked, ready to commit)

1. `2026-07-26-site-excellence-dossier.md` — **Vol 1**: performance & media laws (≤2.5MB hero film budget, JS diet, byte budgets, poster-first LCP, conversion laws, GDC/CQC/ASA compliance MUSTs, roadmap).
2. `2026-07-26-trade-playbooks-vol2.md` — **Vol 2**: per-trade playbooks for all ~35 trades (design voice, proof elements, legal MUSTs per trade, platform layer).
3. `2026-07-26-design-and-acquisition-dossier-vol3.md` — **Vol 3**: design craft (OKLCH token pipeline, Utopia fluid type, prototypicality law, imagery triad + 3-tier treatment, wordmark identity, WCAG 2.2 AA) + full acquisition layer (Google Search Ads + LSAs, SEO/GEO/reviews/GBP, Meta Ads) with UK benchmarks and legal constraints (DMCC review law, Consent Mode v2, call-ads sunset, special ad category rules).

Copies also remain in `.next/ship4/` (gitignored staging).

## Morning batch — agreed order

1. **Commit the dossiers**: `docs/research/` → PR (plus Codex ingestion so the laws are queryable inside Titan).
2. **Write the "Published Sites Performance Law" directive** (mobile Lighthouse ≥95 target, byte budgets, media rules) as a repo doc the renderer work answers to.
3. **PR: JS diet** — replace framer-motion entrances with CSS motion, cut hydration (789KB decoded JS today; TBT is what holds mobile at 64).
4. **PR: media law** — Ken Burns default hero, ≤2.5MB AV1 film budget, poster-LCP loader, immutable cache headers on Supabase media (15.7MB cache-lifetime savings identified), upload-time AVIF renditions.
5. **PR: Lighthouse CI gate** (mobile, median-of-3, byte budgets) + static serving + contrast token + **fix Kerbside zero-height portfolio images** (fill images laid out at 0 height so lazy-load never fires — stuck LQIPs; diagnosed, unfixed).
6. **PR: conversion pass**, then **per-trade modules** from Vol 2/3.

## Smaller backlog

- SEO keyword pills on site pages (blueprint coverage data exists).
- Horsforth van film with garbled livery — awaiting your reject in the media gate.
- Repeat-visit typing ritual skip on the Command Centre.
- Naming decision: "Command Centre" vs "Mission Control" — your call.
- Your local repo: run `git checkout main && git pull` before we branch tomorrow.

## Working notes (how we ship)

- Your Mac's VM blocks git push from my side — I stage files in gitignored `.next/shipN/`, you paste a Terminal block, I drive the PR/merge in Chrome.
- GitHub PR forms: single-line text only (multiline paste submits early).
- Merge style: "Create a merge commit", update branch first if required.
- Verification codes never go in chat — only into GitHub's own page.
