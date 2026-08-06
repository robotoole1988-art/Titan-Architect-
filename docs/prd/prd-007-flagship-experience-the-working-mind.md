# PRD-007: The Working Mind

**TITAN's flagship marketing-site experience: the public face that demonstrably thinks**
Status: Draft v2 for founder review · Route: `/` in `src/app/(public)` ·
Author basis: repo state at 2026-08-03 (post PR #32 — the contact form is live)

**Revision record.** v1 proposed real-time particles and a WebGL upgrade
tier, gated on ADR-068. The founder rejected ADR-068 on 2026-08-03 on
quality grounds — the particle work ADR-041 retired was itself far below the
standard — and set the bar for any future medium: *a built prototype judged
by his eyes, not prose.* v2 recasts every act for **motion design**: ink,
type, and live data, with the real generator as the climax. The premise, the
honesty machinery, the climax, and the Performance Law discipline survive
unchanged. The particle machinery — canvas engines, three.js chunk, device
tiering, byte governor, frame monitor — is deleted, and the design is
lighter, calmer and more TITAN for it: **the film now ships with almost no
JavaScript at all.**

---

## 0. Premise and non-negotiables

The site does not describe TITAN; it lets a visitor watch TITAN think. A
near-black arrival, a system drawing itself into existence, departments
forming, one enquiry travelling the whole system, and a climax where the
visitor names a trade and a town and watches a real site assemble inside a
device frame — built by the same pure functions that build customer sites.

Three laws bind every decision below:

1. **The Performance Law is constitutional.** `law.json` v1.0.0, median of 3
   mobile Lighthouse runs: floors 95/95/100/100; LCP ≤ 2,500ms (aim 1,800);
   TBT ≤ 200ms; CLS ≤ 0.1; script ≤ 130KB, font ≤ 100KB, total ≤ 700KB,
   markup+styles ≤ 70KB (ADR-058). Budgets only ever go down. The experience
   arrives as instant legible text, is skippable, and honours
   `prefers-reduced-motion` absolutely.
2. **The film is made of true things** (ADR-064 pointed at the experience).
   Departments that exist are ALIVE; departments that do not are visibly
   FORMING and labelled. The enquiry story shows only what `processEnquiry`
   and its neighbours actually do. §4 is the machine-enforced map.
3. **The climax is the live generator.** `generateExperienceStrategy` →
   `buildWebsiteBlueprint` → `renderPage` is deterministic, synchronous and
   DB-free (`identitySeed` FNV-1a: same input, byte-identical output).
   Trade + town → painted site in a frame, p75 < 1s.

And one rule this revision adds, from the founder's rejection: **no medium
ships on argument.** Each motion treatment is prototyped and judged by the
founder against the standard before its act is built out. Increment 1 *is*
that judgment gate.

**Non-goals:** no customer-site changes; no new fonts; no sound (Q9); no
CMS; no motion or animation library of any kind on this route; no canvas,
no WebGL — that question is settled (ADR-041, ADR-068 Rejected).

---

## 1. The visual language — the architect's drawing

The particles were a costume. The replacement is TITAN's own native
language, already alive elsewhere in the product: the Experience Studio
preview is presented as *"the architect's drawing, annotations on."* The
flagship extends that drawing to the whole company:

- **Ink.** The system renders as a precise engineering schematic — SVG
  lines that draw themselves (stroke-dashoffset), department nodes as
  typographic cards that snap into position, edges that ink in as the
  visitor scrolls. ALIVE departments are solid ink; FORMING departments are
  dashed outline with the label printed on them. Nothing shimmers; things
  *are drawn*, the way a person drafts a plan.
- **Type.** Copy enters with purposeful, staggered mask reveals — words
  arriving in reading order, weight and tracking shifting to land emphasis.
  Geist only, as today.
- **Pulse.** Decisions and enquiries are small bright marks travelling the
  drawn edges (CSS `offset-path` / SVG motion paths). One pulse means one
  real thing happening; pulses are never decoration. Amber on near-black —
  the palette the site already owns.
- **Live data as texture.** Real artefacts, typeset as themselves: enquiry
  record fields, the notification, campaign CSV headers, sourced DNA
  labels. The most cinematic thing on the page is true information
  arriving in order.

**Mechanism, and the support posture.** Entrance choreography on the
arrival is plain `@keyframes` (universal). Scroll-linked choreography uses
CSS scroll-driven animations (`animation-timeline: view()`) inside
`@supports` guards — shipped in Chrome/Edge since 2023 and Safari 26
(WebKit's own guide, July 2026). Browsers without support, and every
visitor with `prefers-reduced-motion`, get the **composed still**: the
finished drawing, fully labelled, zero motion. The still is designed first,
as v1 already required — motion is applied to a page that is complete
without it. No polyfill, ever: a polyfill is bytes and jank purchased to
disguise the absence of a feature, which is the exact trade TITAN refuses.

**The byte consequence.** v1 carried ~115KB of Ledger-A script plus a 60KB
journey and a 180KB desktop 3D chunk. v2's film is CSS and SVG. The page's
JavaScript is the framework baseline plus, at most, three tiny islands
(§3.4) — currently estimated **≤ 5KB** beyond baseline, and the demo frame
needs none. The medium that was below the standard was also the expensive
one; the honest one is nearly free.

---

## 2. The experience, in acts

Shared rules, unchanged from v1: every act's content is real HTML rendered
by server components — the film is presentation layered over the same DOM,
so skip is instant and SEO reads the whole story. A persistent,
keyboard-first *"Skip the film — read it straight"* control switches to
`mode=straight` (also forced by `prefers-reduced-motion` and Save-Data);
acts are `id`-anchored sections (`#the-brain`, `#departments`, …); every
act reserves its height in CSS — CLS ≈ 0 by construction. Decorative SVG is
`aria-hidden` with the same facts present as text.

### Act 0 — Arrival (the first line) · `#titan`

**Purpose.** Land the thesis in one second and the feeling in six. Prove
the performance claim by being the proof.
**On-screen.** Near-black. The H1 — real text, the LCP element — legible at
first paint: *"Your business, thinking."* plus the one-sentence claim and
CTA. Then, over ~6s of plain `@keyframes`: a single line of ink begins at
the wordmark and draws across the dark; it branches — the first edges of
the system; the claim's words arrive in reading-order stagger; at ~5s the
first pulse travels the drawn line. The film's whole vocabulary — ink,
type, pulse — is taught in one breath. Skip control visible from 0ms.
**True data source.** Copy descends from `facts.ts` (trade count =
`TRADE_TAXONOMY.length`; floors read from `law.json` — derived, never
typed).
**Budget.** Zero JS. One inline SVG (the opening strokes) ≤ 4KB; keyframes
in the route CSS.
**Reduced-motion / no-support / straight.** The completed first drawing,
statically. Contrast ≥ 7:1; skip control first in tab order after nav.

### Act 1 — The Brain builds a company · `#the-brain`

**Purpose.** The founder's core image: TITAN doesn't have features, it
grows departments.
**On-screen.** On scroll, the drawing extends: department cards —
website engine, enquiry desk, ads planner, knowledge base, measurement —
ink in one by one along drawn edges, each settling with a single pulse.
FORMING departments draw as dashed outline and say so. By the end of the
act the full schematic exists and faint ambient pulses begin travelling it
(foreshadowing Act 4).
**True data source.** The schematic is generated at build time from a
`DEPARTMENTS` map in which every node and edge names a real module path; a
unit test walks the map and fails if a path doesn't exist or a status
contradicts §4. The picture of the system is derived from the system.
**Budget.** Zero JS. The schematic is server-rendered SVG + CSS
(scroll-driven where supported); ≤ 8KB of markup inside the 70KB composite.
**A11y.** The DOM is a real `<ol>` of departments with status badges; the
SVG carries a text alternative.

### Act 2 — Two Tuesdays · `#two-tuesdays`

Unchanged from v1 — it was already CSS-only. Split screen: the fragmented
Tuesday against the connected one; the right side renders the shapes of
real artefacts (`processEnquiry` fields, `buildEnquiryNotification` copy,
`buildCampaignCsvs` headers); the left is a dramatisation of the
*prospect's* life and is pinned as such (§4 dramatisation rule). Zero JS.

### Act 3 — Walk the floor · `#departments`

**Purpose.** Inspect any department without a page load.
**On-screen.** The schematic rearranges into a floor plan; each department
is a real disclosure. Open one: the panel expands with what it does, what
it has done (real counts where real ones exist), its status — and for
FORMING departments, what honestly isn't built yet.
**Medium change from v1.** Disclosure uses native semantics
(`<details>`/`:target`-driven panels) — **zero JS in v2**; the
hash-sync/roving-tabindex island is deferred until field data proves the
native pattern insufficient. Panels read the honesty map module (§4);
numbers are derived at build time or absent.
**A11y.** Native disclosure semantics; hit targets ≥ 44px; focus behaviour
is the browser's own, which is the point.

### Act 4 — One enquiry, end to end · `#one-enquiry`

Unchanged in purpose, data source and captions — Summit Roofing Rescue,
six beats, each naming the real code path, ending **"A person calls back.
TITAN doesn't do that part — yet."** The pulse advancing the schematic edge
between beats is CSS motion-path choreography, scroll-linked where
supported, stepped stills elsewhere. `STORY_STAGES` pinning as v1: no beat
without a real exported symbol. Budget: one optimised site screenshot
≤ 40KB or a live mini-render — decided by bytes. Zero JS.

### Act 5 — It already knows your trade · `#your-trade`

**Purpose.** The knowledge base made visible.
**On-screen.** A trade rail. Selecting a trade re-dresses the schematic —
accent hue, texture token, emphasis weights (the palette read from the
repo's own material verdict: slate, resin, stone — now colour/texture
tokens, not shaders) — while **sourced knowledge labels typeset themselves
into the drawing**: *"Emergency vs Planned IA split"*, *"Hourly rate table,
never fixed repair prices"*, *"Gas Safe registration is the trust anchor"*.
Caption states the law: **sourced or silent** (ADR-066/067).
**Medium.** v2 showcases a curated set (6–8 trades) with labels inlined at
build time and the swap done with radio-input + CSS selection — zero JS.
The full 35 live in the climax, where the visitor picks any trade for real.
(A labels-JSON island for all 35 in this act is a documented enhancement,
added only if field data shows visitors want it before the demo.)
**True data source.** Build-time extraction flattens each showcased trade's
`IndustryDna` record to ≤ 40 label strings; coverage backed by the existing
35/35 no-silent-gaps test.
**A11y.** Rail is a radiogroup; selected trade's labels are real text.

### Act 6 — Watch it build yours (THE CLIMAX) · `#build-yours`

**Purpose.** Stop narrating; do the thing. Unchanged from v1 in substance —
this act never depended on particles, and it is now the film's single
spectacle, which is the correct hierarchy: **the product is the effect.**
**On-screen.** Trade (`<select>`, all 35) + town. On submit the device
frame fills: the actual page streams and paints inside an iframe, built by
the production chain. The caption row tells the truth: *strategy →
blueprint (validated) → rendered — deterministic; the same functions that
build customer sites; run it twice, get the same site.* Permanent
**"Example — generated for demonstration"** badge, plus the standing
sentence: no invented reviews, no invented accreditations — the generator
has no route to produce one.
**Medium change from v1.** The particle funnel is deleted. Assembly is told
by the frame itself: a drawn wireframe of the coming page (hero, services,
proof, contact — the section list from the blueprint summary) inks in
during the wait, and the painted page arrives over it. The submit is a
**plain GET form targeting the iframe — the climax works with JavaScript
disabled.** One small island (§3.4) may enhance it: RUM timing and the
"still assembling — this is the real engine, not a video" state.
**Execution design.** §3.5 (unchanged): server-rendered demo route,
ISR-cached per combination, approach-time warm request, p75 pick→paint
< 1,000ms / p95 < 1,800ms by RUM; `noindex` + robots disallow; neutral
example naming (Q4).
**A11y.** Labelled fields; result announced via a titled iframe and
`aria-live` caption; focus to the frame's caption on completion.

### Act 7 — The room upstairs · `#command`

Unchanged in content: the Command Centre vignette computed by the real
engines (`buildBriefing`, `bandFor`) over a labelled sample snapshot, with
the FORMING ribbon; beside it the CSS phone frame showing the one phone
moment fully alive today — the owner's enquiry notification from
`buildEnquiryNotification`. **Medium note:** running the engines
client-side was v1's design; v2 prefers computing the vignette **at build
time on the server** (the engines are pure over a snapshot — same result,
zero shipped engine bytes) with one disclosure interaction. If a live
"recompute" affordance is wanted later it becomes an island (§3.4, Q2).

### Act 8 — Where TITAN is today · `#today`

The landing: the honesty section, the standards, capabilities in live/build
tense, price-list honesty (ADR-065), and the close. **v1's Q5 is resolved
by events:** the contact form shipped on 2026-08-03 and the privacy page
was amended the same day — the CTA is the real form, running TITAN's own
enquiry capture. "This form is the product" is now simply true, and
`honesty-law.test.tsx` already pins this page.

---

## 3. Technical architecture

### 3.1 Where the code lives (boundary-legal)

- `src/features/company-site/experience/` — `drawing/` (the schematic:
  build-time SVG generation from the honesty map), `acts/` (server
  components), `honesty/` (DEPARTMENTS + STORY_STAGES, §4), `styles/`
  (act keyframes, scroll-timeline rules, still fallbacks).
- Demo route: `src/app/(demo)/experience/demo/[trade]/[town]/page.tsx` via
  a new `website-renderer` export `WebsiteDemoPage` — the thinned
  `WebsitePreviewPage` with the spine path removed (no DB, pure chain).
  App→feature import, legal; output carries the `data-primitive`
  fingerprint.
- Labels: build-time static JSON/inline per showcased trade. No API route
  in v2 (Act 5 medium).
- **Deleted from v1:** `score/`, `engine-2d/`, `three/`, `orchestrator/`;
  the `device-tier.ts` move to `src/lib` (nothing needs tiering — CSS
  support queries and media queries do the classifying, in the browser's
  own language).

### 3.2 Rendering strategy

Route stays `force-static`; all narrative content is server-rendered HTML.
The marketing route never imports the renderer or any primitive component —
the demo lives in its own iframe document — and the eslint boundary rule
pinning company-site away from website-renderer ships in Increment 1.

### 3.3 The film's engine is the CSS engine

Entrance choreography: `@keyframes` + `animation-delay` stagger (Act 0,
time-based, universal). Scroll choreography: `animation-timeline: view()`
inside `@supports (animation-timeline: view())` (Acts 1, 4, and the split
in 2). Pulses: CSS `offset-path` along the drawn edges. Line drawing:
`stroke-dashoffset` keyframes on server-rendered SVG paths.
`prefers-reduced-motion` disables all of it and shows composed stills —
`@media not (prefers-reduced-motion: reduce)` wraps every animation rule,
so stillness is the default and motion is the exception, which is the
accessibility posture stated by WebKit's own guidance.

### 3.4 JavaScript islands — the complete list

The route ships **zero client components in Increment 1** (the existing
"ships no client component" test keeps passing). Later increments may add
at most three, each individually byte-priced and separately justified:

1. **Skip/straight persistence** (~1KB): stores the visitor's mode choice.
   Until it exists, `?straight=1` server-renders the still variant — the
   control works today with zero JS.
2. **RUM beacon** (~2KB, pending Q7): LCP/INP/CLS, act-reach funnel, skip
   rate, demo pick→paint timing.
3. **Demo enhancement** (~2KB): the "still assembling" state + timing
   marks around the GET-form iframe submit, which functions without it.

Ceiling: ≤ 5KB total beyond framework baseline; the CI ledger script
(§6.2) fails the build if exceeded. No store, no orchestrator, no
observers beyond what the islands themselves need.

### 3.5 The generator demo — execution decision

Unchanged from v1 (server-rendered demo route in an iframe; honesty, bytes,
determinism and ISR caching all argue for it; client-side chain retained as
the documented fallback if RUM misses p75 two weeks running). v2 addition:
the submit path is a native GET form, so the climax has no JS dependency.

---

## 4. The honesty map

Unchanged from v1 in structure and enforcement: `experience/honesty/
departments.ts` as single source; tests assert (a) every node/edge names an
existing module path, (b) every FORMING department renders its label,
(c) `STORY_STAGES` symbols exist and are exported, (d) the extended
`honesty-law` suite walks the experience markup for forbidden shapes.
Dramatisation rule as v1. The ALIVE/FORMING table from v1 carries over
verbatim, with one row updated:

| Change | v1 | v2 |
|---|---|---|
| Enquiry capture | ALIVE (customer sites) | **ALIVE — and dogfooded:** TITAN's own site runs it (`company-site/api/contact.ts` → spine, PR #32) |

**Privacy-page coherence, updated.** The 2026-08-03 privacy page already
states the truth about the one form and what it stores. Remaining
amendments ride with their features: the demo picker (trade + town, never
stored) and the beacon (anonymous, cookie-less, pending Q7) each ship with
their honest privacy sentence in the same increment — or they don't ship.

---

## 5. Build order — independently shippable increments

Every increment merges only with floors green on `/` (preview through
`lighthouse-gate.mjs`) and honesty tests green. Increment 1 is the
founder's judgment gate on the medium itself — nothing else starts until
the arrival earns its place with his eyes.

| # | Ships | Contents | Effort (dev-days) |
|---|---|---|---|
| 1 | **The arrival prototype — the judgment gate** | Act 0 in pure CSS on a branch preview: ink, type, pulse, still fallback, skip anchor. Founder judges against the standard. Pass → continue; fail → binned, lesson recorded | 2–3 |
| 2 | The gated shell | `/` joins `law.json` `archetypePaths`; act skeleton with all real content (Act 8 complete); straight mode via `?straight=1`; boundary rule; ledger script | 3–4 |
| 3 | Acts 1 + 2 | The drawing draws itself; DEPARTMENTS map + tests; Two Tuesdays | 4–6 |
| 4 | **Act 6 — the climax** | `WebsiteDemoPage`, demo route + ISR, GET-form iframe, wireframe-ink wait state, noindex; RUM island if Q7 sanctioned | 6–8 |
| 5 | Acts 3 + 4 | Floor plan disclosures; Summit story with `STORY_STAGES` | 4–6 |
| 6 | Acts 5 + 7 | Trade re-dress with sourced labels; Command vignette (build-time) + phone moment | 4–6 |

Total ≈ **23–33 dev-days** — roughly half of v1 (46–61), with the climax
arriving by Increment 4 as before. Nothing here waits on any ADR: no law
is being amended and no retired capability revived. The only standing
approval is the founder's eye, increment by increment.

---

## 6. Measurement plan

1. **The Law:** `lighthouse-gate.mjs <preview> --paths /` — merge-blocking,
   thresholds as §0.
2. **Ledger script:** maps emitted CSS/JS to acts; fails on: islands > 5KB
   total, composite markup+styles > 70KB, any client component before its
   priced increment.
3. **Journey test (Playwright):** full scroll + disclosure + demo submit
   under mobile throttle; asserts zero unexpected network fetches, no long
   task > 200ms, zero console errors; **a JS-disabled run must still reach
   a painted demo site** (the GET-form guarantee).
4. **Demo SLO:** synthetic pick→paint in CI (warm + cold); field p75
   < 1,000ms / p95 < 1,800ms once the RUM island exists.
5. **A11y:** axe-core per act (0 serious/critical); keyboard-only journey;
   reduced-motion snapshot asserting stills and zero animation.
6. **Honesty:** extended honesty-law suite + departments existence test +
   `STORY_STAGES` pinning, merge-blocking.

The v1 INP-ceiling law amendment is withdrawn with the beacon question —
if Q7 sanctions field data and it shows INP headroom, the tightening
returns as its own one-line ADR.

---

## 7. Top risks

| # | Risk | Mitigation |
|---|---|---|
| 1 | The motion, though cheap, is *below the standard* — the particle verdict repeats | Increment 1 is a judgment gate on a 2–3 day prototype, not a 46-day programme; binning it costs a weekend |
| 2 | Scroll-driven animations absent on older Safari/Firefox → a large minority sees stills | Stills are designed first and are complete; the arrival (the feeling-setter) is time-based `@keyframes`, universal; support only widens from here |
| 3 | CSS/markup creep across 9 acts breaks the 70KB composite | Ledger script tracks composite per PR; stills as external SVG; per-act copy budget ~3KB |
| 4 | Demo misses p75 < 1s | Warm request, ISR per combo, streamed tiny document, wireframe-ink wait state, documented client-side fallback |
| 5 | Long single-page film → bounce before the climax | Skip from 0ms; straight mode; act order revisited on funnel data once Q7 beacon exists — a data decision, pre-agreed |
| 6 | Honesty drift as acts are polished | Merge-blocking maps and pinned stages, as v1 |
| 7 | Native `<details>`/`:target` disclosure proves clunky in Act 3 | The priced-island escape hatch exists; upgrade only on observed need, never on taste alone |

---

## 8. Open questions for the founder

Renumbered; two of v1's ten are resolved by events.

1. **The phone act (v1 Q1):** ship the real owner-notification moment and
   omit the customer app entirely, or show the app as labelled FORMING?
   (Recommended: real notification only.)
2. **Command vignette (v1 Q2):** build-time computed sample (v2 default) —
   agreed? And which surfaces are safe under ADR-061?
3. **Arrival length (v1 Q3):** 6s or 3s? (Prototype ships at 6s with a
   skip; judge with eyes, then decide.)
4. **Demo naming + towns (v1 Q4):** neutral pattern ("Example Roofing,
   Leeds") and curated towns list vs free text — free text puts
   visitor-typed words into a generated H1.
5. **Beacon (v1 Q7):** anonymous, cookie-less field measurement with the
   honest privacy sentence — or synthetic-only?
6. **Finance & reception (v1 Q8):** shown as visibly FORMING, or omitted
   until they exist?
7. **When `/` joins law.json (v1 Q9):** Increment 2 as written — confirm.
8. **Sound (v1 Q10):** recommendation remains none in v1 of the film.
   Confirm.

*Resolved since v1:* Q5 (dogfooding CTA) — **shipped 2026-08-03**, the form
is live and the privacy page tells the truth. Q6 (ADR-068 sanction) —
**rejected 2026-08-03**; this document is the consequence.

---

*Repo grounding: budgets from `src/core/performance-law/law.json`; the pure
chain from `src/core/experience-strategy/generator.ts`,
`src/core/website-blueprint/builder.ts`, `src/features/website-renderer`;
honesty precedents ADR-059/060/064/065, `facts.ts`,
`tests/features/company-site/honesty-law.test.tsx`; palette tokens from the
material verdict in `morph-lab/particle-materials.ts` (as colour/texture
authority — no shaders); enquiry truth from `company-site/api/contact.ts`
and `core/business/workflows.ts`; knowledge truth from
`src/core/industry-dna/` (35/35 sourced, ADR-066/067); scroll-driven
animation support per WebKit's guide to scroll-driven animations (Safari
26) and MDN.*
