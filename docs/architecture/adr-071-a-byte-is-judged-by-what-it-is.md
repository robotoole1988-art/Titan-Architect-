# ADR-071 — A byte is judged by what it is, and by whether we chose it

- **Status:** Proposed (the accounting is built and tested; the founder's sign-off makes these numbers binding)
- **Date:** 2026-08-08
- **Prompted by:** adding `/` to the nightly audit (2026-08-07, overnight build) and then measuring it — TITAN's own home page could not pass TITAN's own law
- **Builds on:** ADR-055 (the box law, the serving law, the gate), ADR-058 (markup and styles share one budget), ADR-064 (TITAN has a public face)

## Context

The overnight build of 2026-08-07 put TITAN's own home page under the
Performance Law, on the correct principle that a page which says *"Speed is
a rule, not an aspiration"* in public should be measured with everything
else. Nobody measured it first. Measured on 2026-08-08 against production:

| Law line | Measured | Ceiling | |
| --- | --- | --- | --- |
| performance | 99 | ≥ 95 | pass |
| accessibility | 100 | ≥ 95 | pass |
| best-practices | 100 | = 100 | pass |
| seo | **91** | = 100 | **fail** |
| LCP | 1,400 ms | ≤ 2,500 (aim 1,800) | beats the aim |
| TBT | 80 ms | ≤ 200 (aim 100) | beats the aim |
| CLS | 0.002 | ≤ 0.1 | pass |
| markup+styles | **75.3 KB** | ≤ 70 KB | **fail** |
| script | **194.6 KB** | ≤ 130 KB | **fail** |

Three findings sit underneath those three failures, and each one is about
accounting rather than craft.

**1. The document is not what the budget thinks it is.** `/` transfers
75.3 KB and decodes to 528.1 KB. Of that, **288 KB is React's inline flight
payload** — the App Router serialises every page twice, once as HTML the
browser paints and once as a payload the client runtime hydrates from — plus
144.2 KB of inlined CSS and 54 KB of SVG. Lighthouse cannot see inside a
document, so it charges every inline byte to `document`, and ADR-058's
composite adds `document + stylesheet`. A budget named **markup+styles was
being billed for React's hydration data**, which is over half of it.

ADR-058 exists because the old law measured inlined CSS against a
CSS-*file* budget and got the wrong answer. This is the identical mistake,
one layer down.

**2. The script ceiling has never once been met, and never could be.** The
law wrote `script ≤ 130 KB`. Measured on 2026-08-08, `/`, `/about`,
`/advertising` and `/privacy` load the **identical eleven chunks totalling
194.6 KB, with zero page-unique bytes** — `/privacy` is a page of legal
text and ships exactly what the home page with its sphere ships.
Corroborated independently: the 2026-07-28 session measured
`/sites/summit-roofing-rescue` at **195.057 KB** — a different page, six
weeks earlier, the same number to within half a kilobyte.

That is the floor for a Next.js App Router page before TITAN writes a line.
TITAN's own app-authored client JS on the company site is **0 KB**: the
layout loads no client component at all, and the JS diet left nothing
behind. So the 130 KB line never measured TITAN's discipline — it measured
the framework, and reported a permanent failure that no achievable change
could clear.

A ceiling nothing can reach is not a law. It is a red light that teaches
everyone to ignore red lights — which is precisely the disease the same
overnight build set out to cure when it stopped a 404 from being reported
as a breach.

**3. The app host had no robots.txt.** Published customer sites have had
one per slug and per hostname since ADR-027. The app host never did, so
`/robots.txt` fell through to the founder gate and answered a redirect to
the login page. Lighthouse scored that as an invalid robots.txt: **SEO 91
against a floor of 100** — enforced on the nightly production run, and by
itself enough to keep it red.

None of this makes the page slow. It is genuinely fast: 99, LCP 1.4 s,
TBT 80 ms — it beats the law's *aims*, not just its floors. The 194.6 KB is
deferred and costs no user-facing metric. The breaches were real against
the law as written, and invisible to anyone using the site. That gap is the
problem this ADR closes.

## Decision

**A byte is judged by what it is, and by whether TITAN chose it.**

### 1. The document is split into what it is made of

The CI gate already reads every page's body — it has to, to prove the page
is a TITAN page before it believes any number (ADR-055). It now spends that
body a second time and reports the document's composition. Two derived
lines replace the raw `document` key:

- **`markup`** — the document minus its inline `<script>` bytes. This is
  what `markup+styles` is measured against, restoring ADR-058's intent.
- **`hydration`** — the inline flight payload, with a budget of its own.

Every byte of the document is counted exactly once: `markup + hydration`
sums back to the document's transfer size, and a test pins that.

Apportioning a *compressed* transfer size by *decoded* share is an
approximation, and the law states it rather than hiding it. It was checked
before being trusted: on `/` the inline script is 54.5% of decoded bytes and
54.3% of gzipped bytes — a fifth of one percent apart, because the payload
and the markup compress alike.

A caller who supplies no composition has the **whole** document charged to
`markup+styles`. No evidence gets the strict answer, never a free pass.

### 2. The script line becomes a measured floor plus a chosen allowance

`script ≤ 130` is retired and replaced by two parts:

- **`frameworkBaseline: 194.6 KB`** — a **measurement, never a choice**,
  carrying its date and its evidence in `law.json`. It may only ever be
  re-recorded **downward**, and only with a fresh measurement in the diff.
  Raising it requires an ADR, exactly like raising a budget.
- **`appAuthored: 20 KB`** — what TITAN may add on top. Measured today:
  **0 KB**. The allowance is deliberately small: it buys a real island when
  one is genuinely needed, and trips the moment a dependency smuggles a
  runtime back in.

The effective ceiling is their sum, 214.6 KB. A breach names what TITAN
added, not what React costs: *"script transferred 230 KB — 35.4 KB above the
194.6 KB framework baseline, against an app-authored allowance of 20 KB
(15.4 KB over)."* And a page that comes in **under** the recorded baseline
is reported as the ratchet it is, so the floor is re-measured downward
rather than quietly enjoyed as headroom.

This is not a raised budget. It is the same discipline, pointed at the thing
TITAN controls. The bytes a visitor pays for are unchanged and still capped
by `total ≤ 700 KB` (measured: ~415 KB).

### 3. The app host serves its own robots.txt

A new route handler at `/robots.txt`, public by exact path in the auth model
(ADR-064's Set, so nothing rides in behind it). Conventional directives
only — this file must satisfy a validator as well as a crawler. The public
company site is crawlable; the door (`/login`, `/auth/`) is disallowed. No
`Sitemap:` line, because the app host has no sitemap and pointing a crawler
at a 404 is the mistake this route exists to fix.

**`/experience/demo/` and `/lab/arrival` are deliberately NOT disallowed**,
and this is the part worth writing down. Both are already
`robots: { index: false }` at the page and the layout. A `Disallow` and a
`noindex` on the same URL cancel each other out: a crawler forbidden to
*fetch* the page can never read the `noindex` inside it, so one inbound link
can put the bare URL in the index with the instruction not to permanently
unread. One or the other, never both — and `noindex` is the one that
actually removes a page.

ADR-070 §4 anticipated a disallow for the demo "with the flagship increment
that links to the demo publicly", and that remains the right moment for it:
once the demo is linked, its URL space is 35 trades × any town and crawl
budget becomes the concern that outweighs de-indexing. Until something links
to it, `noindex` alone is doing the job, and a disallow would only break it.
A test pins both halves — that each of those routes really does declare
`index: false`, and that none of them is disallowed.

### 4. The hydration budget is provisional, and says so

`hydration: 55 KB` against 41.0 KB measured. The headroom is deliberate:
the trade-card artwork in the same branch adds SVG to the page and therefore
to the flight payload, and its true cost cannot be known until it is
deployed. **The number is to be ratcheted to measured + 2 KB on the first
green preview**, with the measurement in the diff. A budget set loose on
purpose, and written down as such, is honest; one set loose quietly is not.

## Consequences

- The nightly can go green truthfully, on evidence rather than by exemption.
  `/` passes every line as measured: markup+styles 34.3 KB of 70, hydration
  41.0 KB of 55, script 194.6 KB of 214.6, SEO 100 once robots.txt ships.
- **The markup+styles budget turns out to have half its room spare** — 34.3
  KB of 70. The sphere and the trade artwork are affordable, which was not
  knowable while the line was being billed for React.
- The published customer sites inherit the same accounting. Their script
  measurements (195.057 KB on 2026-07-28) sit within the baseline, meaning
  the JS diet achieved more than anyone could prove at the time: the sites
  ship essentially nothing but framework. That should be re-measured the
  moment the fleet is back online, and the baseline ratcheted if it lands
  lower.
- `font` is measured at **98.1 KB against a 100 KB ceiling** on `/` — 1.9 KB
  of headroom across three woff2 files. Not a breach, not addressed here,
  and the next family added breaks it. Noted so it is a decision when it
  arrives rather than a surprise.
- The one thing this ADR deliberately does **not** do is attack the 194.6 KB
  itself. Whether published customer sites should be delivered by something
  leaner than the App Router — where near-zero JS is genuinely reachable,
  since their motion is already CSS-only — is a milestone-sized question and
  its own decision.
- If the founder declines the split, the honest alternative is not to soften
  the gate but to say plainly that the script line is unenforceable as
  written and delete it, leaving `total` as the only byte law. Silence with
  a permanent red is the one option this ADR refuses.
