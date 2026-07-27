# ADR-055 — The box law, the serving law, and a machine that enforces both

- **Status:** Accepted
- **Date:** 2026-07-27
- **Implements:** `docs/experience/PUBLISHED-SITES-PERFORMANCE-LAW.md` §§5–6
- **Builds on:** ADR-022 v2 (the JS diet), ADR-027/028 (publications, page
  collections), ADR-033 (media pipeline, CinematicImage), ADR-054 (static
  serving of published routes)

## Context

Three things were true on the morning of 27 July, and only the third was
known.

**1. Most of the photography on the live sites had never loaded.** The
Kerbside portfolio was reported as "stuck LQIP gradients". The cause was not
in the portfolio primitive. `CinematicImage` hardcoded
`relative overflow-hidden` and concatenated whatever the caller passed;
six call sites passed `absolute inset-0`. Tailwind emits `.relative` after
`.absolute` in the stylesheet, so `relative` won regardless of the order in
the class attribute. The wrapper stayed in normal flow, its only child was
an absolutely-positioned `next/image fill`, and it therefore laid out at
**zero height**.

Zero height is not merely invisible. A zero-height box never intersects the
viewport, so the lazy-load IntersectionObserver never fires, so the image is
never requested. Measured in production on `/sites/kerbside-kings`:

```
parentClass: "relative overflow-hidden absolute inset-0"
computed position: relative      box: 755x0      grandparent: 755x359
loaded: false   ×10 of 11 images
```

Two further call sites (`story.gentle-welcome`, `trust.team-introduction`)
passed `w-full` with no height at all and failed the same way. Only the two
heroes and two `h-56` frames — the call sites that happened to supply their
own height — ever worked.

**2. Static serving was already in place, and the remaining problem is not
TTFB.** ADR-054 put `dynamic = "force-static"` on the four site routes.
Measured warm TTFB on the live Summit site is **13ms**, and the hero AVIF is
**33KB**. Neither is the reason LCP sits at 2.9s. What §5 of the law was
actually still missing was the *snapshot* semantics: `revalidate = 60` meant
each page re-rendered up to sixty times an hour on the chance something had
changed — a poll standing in for a signal we already own.

**3. Nothing stopped any of this from regressing.** The law had floors and
budgets in prose. Prose does not fail a build.

## Decision

### 1. The box law — every CinematicImage declares how it gets its box

`fit` is a **required** prop with three values. The component owns
`position`; callers never pass position or inset utilities.

| `fit` | The box comes from | Used by |
|---|---|---|
| `inset` | the nearest positioned ancestor, which the caller sizes | portfolio, gallery, surface selector, before/after pair |
| `sized` | the caller's own height utilities (`h-full`, `h-56 sm:h-72`) | both heroes, process + FAQ support frames |
| `ratio` | its own `aspect-ratio`, from the asset's intrinsic dimensions | gentle-welcome frame, team portraits |

Required, not defaulted, because the failure mode is *an unanswered
question*. A default would let the next call site inherit the bug silently;
a required prop makes the compiler ask. The wrapper emits `data-wr-box` so
the law is enforced by a test rather than by memory
(`tests/features/website-renderer/media-box.test.tsx` asserts no element
carries competing position utilities, and that every box has a height
source). `ratio` also gives CLS 0 for free — media law §4's "intrinsic
dimensions everywhere".

### 2. The serving law — snapshots are invalidated by signal, not by poll

`revalidatePublishedSite(slug?)` invalidates a live site's static output
with `revalidatePath(..., "layout")`, which covers the homepage *and* every
area page beneath it in one call. It is called from exactly the three
founder actions that can change a published page: **media approval**,
**publish**, **unpublish**. Time-based `revalidate` moves 60s → 3600s and is
demoted to a backstop against a missed hook.

This is what §5 means by preserving dynamic asset resolution: an approved
photograph still reaches the live site without a republish — the page is
re-rendered *on the approval* instead of being re-rendered sixty times an
hour in the hope of catching one.

Custom domains are invalidated as a set (`/sites/-host/[hostname]`), because
the domain table maps hostnames *into* businesses and cannot be walked the
other way. They are rare and the re-render is lazy.

### 3. The rendition ladder

`deviceSizes` drops from Next's default eight widths (to 3840) to
`[640, 960, 1280, 1920]` plus `imageSizes: [384]` — the media law's ladder.
Measured against the live hero, every width from 1080 up returned the same
33KB: the sources are not that big, so the extra rungs bought nothing while
splitting the optimiser's cache across eight keys per image. Fewer, larger
buckets means a cold region is likelier to serve a HIT, and a cold optimiser
MISS is transcode time spent on the LCP path.

### 4. One config, three enforcers

`src/core/performance-law/law.json` holds every floor and budget.
`src/core/performance-law/index.ts` exposes them typed, with
`assessAgainstLaw()` and `medianRun()` — data-driven, so a new floor is added
by editing JSON, not by remembering three call sites.
`scripts/lighthouse-gate.mjs` reads the same JSON, runs Lighthouse under
mobile emulation, takes the median of three, and prints a rejection that
reads like a media-gate rejection: what failed, by how much.
`.github/workflows/lighthouse.yml` runs it against the Vercel **preview**
deployment on `deployment_status`, and against production nightly (§6.3).

## Consequences

### Positive
- Every photograph on every published site actually loads. This was ten of
  eleven images on Kerbside.
- The zero-height class of bug cannot return silently: it is a type error at
  the call site and a test failure in CI.
- A published page is a real snapshot — rendered on change, not on a timer.
- Floors and budgets are a build status, not a good intention.
- Unpublishing evicts the cached snapshot immediately instead of serving a
  dead site from the edge for up to an hour.

### Negative / Trade-offs
- `fit` is required, so every future call site must answer the box question.
  That is the point, but it is friction.
- A missed revalidation hook now costs up to an hour of staleness instead of
  a minute. Accepted: the three write paths are enumerated and tested, and
  the backstop still exists.
- Approving media on one site invalidates all custom-domain pages. Cheap
  today; revisit when the domain table is walkable.
- `scripts/lighthouse-gate.mjs` re-implements the comparison in JS because
  CI cannot import TypeScript. The **numbers** are single-source; the twenty
  lines of comparison are not. Keeping the shape data-driven in both places
  keeps them honest.
- The gate audits preview deployments, so it needs Vercel previews to carry
  working Supabase credentials. A preview that 404s is reported as a
  rejection rather than scored, so this fails loudly rather than silently
  passing.

### Neutral
- The Lighthouse gate lands as a normal check, not a required one. It should
  be made required in branch protection once the fleet is clearing the
  floors — a gate that is red the day it lands teaches everyone to ignore it.
- Lighthouse runs via `npx --yes` rather than as a dependency: the product
  gains no runtime weight and the lockfile is untouched.
