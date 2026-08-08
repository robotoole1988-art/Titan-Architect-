# Changelog

## 2026-08-08 — A byte is judged by what it is (ADR-071)

- **TITAN's own home page joined the law yesterday. Nobody measured it first
  — and it failed three lines.** Against production: SEO 91 (floor 100),
  markup+styles 75.3KB (budget 70), script 194.6KB (budget 130). The page
  itself is genuinely fast: performance 99, LCP 1.4s, TBT 80ms — beating the
  law's *aims*, not just its floors. Every breach was an accounting fault,
  and each is now fixed rather than excused.
- **The document is split into what it is made of.** Of 528.1KB decoded,
  288KB is React's inline flight payload. Lighthouse cannot see inside a
  document, so a budget named *markup+styles* was billed for over half its
  total in hydration data — the same mistake ADR-058 fixed one layer up. The
  gate already reads every body to prove the page is ours; it now spends it
  twice. `markup` (document − inline script) and `hydration` are separate
  lines that sum back to the document, pinned by test. **markup+styles comes
  out at 34.3KB of 70 — half the budget spare**, which was unknowable while
  React was on the bill.
- **The script ceiling no page has ever met is retired.** `/`, `/about`,
  `/advertising` and `/privacy` load the identical 11 chunks totalling
  194.6KB with **zero page-unique bytes** — `/privacy` is legal text and
  ships what the home page with its sphere ships. Summit measured 195.057KB
  six weeks earlier. That is the App Router floor before TITAN writes a line;
  TITAN's own app-authored client JS is **0KB**. So `script ≤ 130` never
  measured discipline — it measured the framework, and reported a failure
  nothing could clear. It becomes a *measured* baseline (194.6KB,
  re-recordable downward only, with the evidence in the diff) plus a
  deliberately small 20KB allowance for what TITAN adds. A breach now names
  what TITAN added, not what React costs, and a page under the baseline is
  reported as the ratchet it is.
- **The app host serves its own robots.txt.** Published sites have had one
  per slug and per hostname since ADR-027; the app host never did, so
  `/robots.txt` fell through to the founder gate and answered a login
  redirect. Lighthouse scored that as invalid — SEO 91, enforced nightly on
  production, and on its own enough to keep the run red. The public site is
  crawlable; the door is not.
- **`/experience/demo/` and `/lab/arrival` are deliberately NOT disallowed**,
  though the first draft of this change disallowed both. Each already carries
  `noindex`, and a `Disallow` on the same URL cancels it: a crawler forbidden
  to fetch the page can never read the `noindex` inside it, so one inbound
  link can index the bare URL with the instruction not to permanently unread.
  ADR-070 §4's demo disallow becomes correct when the flagship *links* the
  demo publicly and crawl budget over 35 trades × any town outweighs
  de-indexing — not before. A test pins both halves: that those routes really
  declare `index: false`, and that none of them is disallowed.
- Noted, not fixed: fonts measure **98.1KB against a 100KB ceiling** on `/`,
  across three woff2. The next family added breaks it.

## 2026-08-07 — The nightly gate audits what exists (overnight build)

- **The Performance Law's nightly was red eleven mornings straight** — it
  audits the two archetype demo paths, both offline in production since the
  internal-business cleanup, and a 404 was treated as a law breach. The gate
  now tells the truth in both directions: a 404 is reported **OFFLINE and
  skipped** (a takedown is a state, not a lie), any other broken answer
  still REJECTS, and a fully dark fleet — nothing auditable — fails the run
  on its own terms. Verified against a mock fleet: 2 offline skipped + live
  page audited; all-offline exits 1.
- **TITAN's own home page joins the law** (`companyPaths: ["/"]` in
  law.json): the site that says "Speed is a rule, not an aspiration" in
  public is now measured nightly with everything else, fingerprinted by the
  sphere's server-rendered still.

## 2026-07-21 — Area-page radar centres the page's area

- The `location.service-area` radar on area landing pages centred and
  labelled the business BASE (e.g. the Greater London page showed
  "Oxford"). Area pages now ground the visitor in THEIR area: the builder's
  ADR-028 localisation seam writes a `focus-place` slot + re-anchored
  coverage heading per area, and the primitive centres that slot with the
  base shown as a quiet secondary point ("based in Oxford"). Homepages and
  already-published blueprints (no slot) keep centring the base. Pinned by
  builder + renderer tests across all four Liberty Contractors areas.

## 2026-07-20 — Pre-deploy fix-pack (audit F1–F3)

- **F1 · Broken poster assets**: the ADR-054 auth middleware was gating
  `/renderer/*` (and `/generated-media/*`) static assets behind login —
  the renderer's poster fallbacks 307'd to the sign-in page and drew
  broken-image glyphs on Voltway Renewables and Bright Smile Dental
  (Summit/Kerbside were covered by approved media). Both prefixes are now
  public in `isProtectedAppPath` (tested). Both `/renderer/*` posters
  exist and are committed; no other `/renderer/*` references in the tree.
- **F2 · Enquiry submit label**: the lead-capture submit button echoed the
  page's primary CTA ("Call now") — misleading on a form that sends an
  enquiry. Submit copy is now crafted per archetype (emergency "Request
  urgent callback" · premium/project "Request my quote" · care "Request an
  appointment" · technical/default "Request a callback"), overridable via
  a `form-cta-label` content slot; the post-submit success state is
  per-archetype too, with no invented SLA figures.
- **F3 · Blank viewport on fast scroll**: reveals now look AHEAD
  (positive viewport margins — sections begin animating ~a fifth of a
  screen before entry), travel is shorter (28→18px / 24→16px), and a
  backup trigger (a cheap self-disposing interval) force-runs the SAME
  rise animation if the intersection observer ever lags while an element
  sits in the viewport — content can never be stuck invisible, and late
  sections keep their full reveal motion. Reduced-motion path untouched.
