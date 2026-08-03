# PRD-007: The Working Mind

**TITAN's flagship marketing-site experience: the public face that demonstrably thinks**
Status: Draft for founder review · Route: `/` in `src/app/(public)` · Requires: ADR-068 (sanctions this document's two law amendments) · Author basis: repo state at 2026-08-02

---

## 0. Premise and non-negotiables

The site does not describe TITAN; it lets a visitor watch TITAN think. A near-black arrival, a mind assembling from particles, departments forming, one enquiry travelling the whole system, and a climax where the visitor names a trade and a town and watches a real site assemble inside a device frame — built by the same pure functions that build customer sites.

Three laws bind every decision below:

1. **The Performance Law is constitutional.** `src/core/performance-law/law.json` v1.0.0, median of 3 mobile Lighthouse runs: performance floor **95** (aim 100), accessibility floor **95** (aim 100), best-practices floor **100**, SEO floor **100**; LCP ceiling **2,500ms** (aim 1,800), TBT ceiling **200ms** (aim 100), CLS ceiling **0.1** (aim 0); transfer budgets: script ≤ **130KB**, font ≤ **100KB**, total ≤ **700KB**, markup+styles composite ≤ **70KB** (ADR-058). Budgets may only ever be lowered. The experience arrives as instant legible text, layers up by device tier, is skippable, and honours `prefers-reduced-motion` absolutely (`device-tier.ts`: "Reduced motion always wins").
2. **The film is made of true things** (ADR-064 discipline pointed at the experience). Departments that exist are ALIVE; departments that do not are visibly FORMING and labelled. The enquiry story shows only what `processEnquiry` and its neighbours actually do. Section 4 is the machine-enforced map.
3. **The climax is the live generator.** `generateExperienceStrategy` → `buildWebsiteBlueprint` → `renderPage` is deterministic, synchronous and DB-free (`builder.ts:998` — "Deterministic and synchronous"; `identitySeed` FNV-1a means same input, byte-identical output). Trade + town → painted site in a frame, p75 < 1s. Assembly particles carry real `industry-dna` labels, nothing invented.

**Non-goals:** no customer-site changes; no new fonts; no sound; no CMS; no analytics beyond an anonymous performance beacon (pending Q7); no motion library on this route.

---

## 1. The two-ledger byte accounting (how lazy WebGL counts)

The Law audits a page load; the experience is a journey. Two ledgers, both gated:

- **Ledger A — the audited load.** Every byte transferred from navigation until network-quiet **with zero user input**. This is exactly what `scripts/lighthouse-gate.mjs` measures (mobile emulation, median of 3, vercel.live excluded). Ledger A must satisfy `law.json` in full. `/` joins `archetypePaths` in Increment 1 — the follow-up ADR-064 already names.
- **Ledger B — the interaction ledger.** Bytes fetched only after (a) the LCP entry exists **and** (b) a genuine user gesture (scroll, pointerdown, keydown). Nothing may be fetched on a timer or on idle alone except the Act 0 canvas mount, whose code is already in Ledger A. Enforced two ways: a Playwright journey test per tier diffs the network log against per-chunk ceilings, and a runtime byte governor (Resource Timing) refuses optional upgrades once the tier's journey ceiling is reached. Lighthouse never gestures, so Ledger B is structurally invisible to the audit — and the e2e test asserts that: **a no-interaction load transfers zero three.js bytes**.

**Ledger A budget (mobile, brotli transfer), summing inside the Law:**

| Item | Budget | Law ceiling |
|---|---|---|
| Document (all acts' semantic HTML, server-rendered) | 30KB | — |
| Styles (Tailwind subset + act keyframes, inlined) | 18KB | markup+styles ≤ 70KB → **48/70** |
| Next 16 + React 19 framework/runtime | 92KB | — |
| Experience boot: orchestrator 6 + Act 0 canvas2d engine 10 + tier detect 1 + skip/straight controller 2 + store 1 + hash sync 1 + perf beacon 2 | 23KB | script ≤ 130KB → **115/130** |
| Geist variable, latin subset (already the only face) | 60KB | font ≤ 100KB |
| Reduced-motion stills (external SVG, still tier only) | 30KB | — |
| **Ledger A total** | **≈ 255KB** | total ≤ 700KB |

**Ledger B ceilings (self-imposed, CI-enforced):** per canvas2d act engine ≤ 8KB; mobile journey sum (all act engines + orbit + demo controller + labels JSON) ≤ **60KB**; Command Centre sim (real engines, pure TS) ≤ 20KB; **whole mobile journey including the demo iframe's own document ≤ the Law's 700KB total**. Desktop full-3d upgrade chunk (three core + r3f + scene, no drei, no postprocessing) ≤ **180KB**, desktop whole journey ≤ 900KB. The demo iframe is a separate document governed by the *Published Sites* law itself — the demo is audited by the same `law.json` as real customer sites, which is the point.

---

## 2. The experience, in acts

Shared rules: every act's content is real HTML rendered by server components (headings, prose, lists) — the film is presentation layered over the same DOM, so **skip is instant and SEO floor 100 reads the whole story**. A persistent, keyboard-first control — *"Skip the film — read it straight"* — switches to `mode=straight` (also set by `prefers-reduced-motion`, Save-Data, or a returning visitor's stored choice). Canvases are `aria-hidden`; each act is an `id`-anchored `<section>` (deep-linkable: `#the-brain`, `#departments`, …). Acts reserve height via CSS (`min-height`/`aspect-ratio`) — CLS ≈ 0 by construction. Visual language is bound to the repo's own material verdict (`morph-lab/particle-materials.ts`): physical surfaces — slate, resin, stone — emissive "a whisper of internal heat… never the base colour". No glowing-blue confetti; the founder already ruled on that, in code.

**Tiers** (public classifier `classifyExperienceTier`, wrapping the preserved `device-tier.ts`): **still** — reduced-motion, Save-Data, or floor-spec hardware; **fallback-2d** — the canonical experience: one canvas2d engine, DPR-capped (1.5 mobile / 2 desktop), particle caps per act; **full-3d** — desktop-only upgrade (tier `full-3d` ∧ not mobile ∧ gesture seen ∧ LCP fired ∧ byte governor headroom): r3f instanced points render the *same choreography score*. WebGL2 absence no longer forces `still` (that rule was written for WebGL-only scenes); canvas2d needs no GL. A rolling frame monitor demotes one rung (3d→2d→still) after two consecutive 5s windows over 15% dropped frames, and beacons the demotion.

Per-act Ledger B figures below are the enforced chunk ceilings.

---

### Act 0 — Arrival (the awakening) · `#titan`

**Purpose.** Land the thesis in one second and the feeling in six. Prove the performance claim by being the proof.
**On-screen.** Near-black (`#0a0a0b`). The H1 — real text, the LCP element — is legible at first paint: *"Your business, thinking."* plus the one-sentence claim and CTA. Behind the text, over ~6s, particles drift in and gather into the Brain — a constellation, not a logo flourish; the final second shows the first faint pulse. A visible skip control from 0ms. Canvas elements are not LCP candidates, so the text always wins the metric; the film cannot delay the content because the content ships first.
**True data source.** Copy descends from `src/features/company-site/model/facts.ts` (trade count = `TRADE_TAXONOMY.length` = 35; floors read from `law.json` — derived, never typed).
**Budget.** In Ledger A (engine 10KB, above). Particles: 1,800 mobile / 3,500 desktop-2d. Init deferred to first rAF after LCP; no task > 50ms.
**Degradation.** *full-3d:* same score, instanced points, parallax depth on pointer. *fallback-2d:* canonical, described above. *still:* the designed still — the formed constellation as an inline-positioned external SVG, full copy, zero canvas mounted.
**Reduced-motion/a11y.** Still tier exactly; skip control is first in tab order after nav; contrast ≥ 7:1 on near-black.

### Act 1 — The Brain builds a company · `#the-brain`

**Purpose.** The founder's core image: TITAN doesn't have features, it grows departments.
**On-screen.** On scroll, the Brain extrudes department nodes one by one — website engine, enquiry desk, ads planner, knowledge base, measurement — each snapping into a labelled position with a settle pulse. Faint ambient enquiry-pulses begin travelling existing edges (foreshadowing Act 4). Forming departments condense only partially and carry the label **Forming**.
**True data source.** The constellation is generated at build time from a `DEPARTMENTS` map in which **every node and edge must name a real module path** (`src/core/...`, `src/features/...`); a unit test walks the map and fails if a path doesn't exist or a status contradicts the honesty map (§4). The picture of the system is derived from the system.
**Budget.** Ledger B: engine chunk ≤ 8KB, prefetched on first scroll gesture, mounted on approach (IO rootMargin 150%), unmounted and freed two viewports away.
**Degradation.** *full-3d:* nodes at real depth, camera eases along the scroll. *fallback-2d:* identical timings from the shared score, flat projection. *still:* the finished org-constellation as SVG with printed labels and statuses — an honest system diagram.
**Reduced-motion/a11y.** The section's DOM is a real `<ol>` of departments with status badges; SVG diagram carries a text alternative.

### Act 2 — Two Tuesdays · `#two-tuesdays`

**Purpose.** The problem, felt: a trade business's Tuesday without coordination vs the same Tuesday inside TITAN.
**On-screen.** Split screen. Left: fragmented grey shards — the missed call, the notebook page, "which ad did this come from?", the quote that never went out. Right: the same events as one connected line — enquiry stored **timestamped with its source page**, the notification arriving, the plan with the working shown. Scroll drives the divergence; the split resolves right.
**True data source.** Right side renders the *shapes of real artefacts*: enquiry record fields from `processEnquiry` (`core/business/workflows.ts` — `sourcePage` trimmed to 500 chars, timestamps), notification copy from `buildEnquiryNotification`, campaign CSV headers from `buildCampaignCsvs` (ADR-031). Left side is a dramatisation of the *prospect's* current life — it makes no TITAN claim, contains no invented TITAN result, and is pinned as such (§4, "dramatisation rule").
**Budget.** Ledger B ≤ 4KB — this act is CSS-driven (grid, clip-path, scroll-linked transforms); no canvas.
**Degradation.** *full-3d:* none needed — CSS everywhere. *fallback-2d:* identical. *still:* the two columns side by side, captioned.
**A11y.** Two labelled lists; the comparison reads as content, not decoration.

### Act 3 — Walk the floor · `#departments`

**Purpose.** The interactive orbit: inspect any department without a page load.
**On-screen.** The constellation rearranges into an orbit. Each department is a real focusable button. Click/Enter: the camera eases in, an inspection panel expands — what this department does, what it has done (real counts where real ones exist), its status, and for FORMING departments what is being built and honestly *isn't* yet. No routing; disclosure semantics; `history.replaceState` keeps a shareable hash.
**True data source.** Panels read the honesty map module (§4). Numbers are derived at build time or absent — never typed (the `facts.ts` rule).
**Budget.** Ledger B ≤ 6KB. Orbit is DOM/SVG + CSS transforms; connective lines are SVG paths.
**Degradation.** All tiers interactive — this act's medium is DOM. *full-3d* adds depth to the ease-in only. *still:* panels pre-expanded in sequence, no orbit motion.
**A11y.** Roving tabindex around the orbit, `aria-expanded` panels, focus moved into and restored out of the zoom; hit targets ≥ 44px.

### Act 4 — One enquiry, end to end · `#one-enquiry`

**Purpose.** The complete story, told with the system's own artefacts: a roofing enquiry travels reception → marketing → website → sales, and stops where TITAN honestly stops.
**On-screen.** Summit Roofing Rescue, Leeds — the repo's own archetype demo, live at `/sites/summit-roofing-rescue` and audited nightly against the Law. Beats, each with the pulse advancing an edge and a caption naming the real code path: (1) a campaign plan the generator produced for roofing/Leeds — actual RSA headlines, keywords, negatives from `generateCampaignPlan`, benchmarked by `market-intelligence` (founder's workbook seed); *"launched from your own account — today, a person imports it"* (the `/advertising` sentence, kept); (2) the click lands on the real site — a live thumbnail of the actual page; (3) the form submits — honeypot and rate-limit visibly check (`submit-enquiry.ts`); (4) the enquiry is stored — timestamped, source page captured, "the lead is already safe" (delivery failure never loses it — the code's own comment); (5) the phone buzzes — the real notification content; (6) it lands in the ledger, attributed. Final caption: **"A person calls back. TITAN doesn't do that part — yet."**
**True data source.** Every beat maps 1:1 to an exported `STORY_STAGES` list; a test asserts each stage names a real exported symbol (`processEnquiry`, `buildEnquiryNotification`, …) and that no beat exists without one. The film cannot narrate behaviour the system doesn't have.
**Budget.** Ledger B ≤ 6KB (pulse choreography over the existing engine) + one optimised site screenshot ≤ 40KB (or a live 1:1 mini-render — decide by bytes).
**Degradation.** *full-3d/2d:* identical score. *still:* a numbered six-step diagram with the same captions — which is also precisely what a screen-reader hears.

### Act 5 — It already knows your trade · `#your-trade`

**Purpose.** The knowledge base made visible: the Brain re-dresses per trade DNA.
**On-screen.** A trade rail (all 35, from `TRADE_TAXONOMY`, `customerName` casing per ADR-061). Selecting a trade morphs the constellation's material and emphasis — slate for roofing, resin for driveways, stone for patios (`PARTICLE_MATERIALS` is the palette authority) — while sourced knowledge labels stream through the field as legible fragments: *"Emergency vs Planned IA split"*, *"Hourly rate table, never fixed repair prices"*, *"Gas Safe registration is the trust anchor"*, *"Stopcock first-steps micro-content"*. A caption states the law: **sourced or silent** — sections without research show nothing (ADR-066/067, and the resolver already behaves that way).
**True data source.** A build-time extraction script flattens each trade's `IndustryDna` record to ≤ 40 labels (label text only; provenance stays in the repo), emitted as per-trade JSON ≤ 4KB, fetched on selection. Coverage is 35/35 by the existing no-silent-gaps test.
**Budget.** Ledger B: morph engine ≤ 8KB + labels ≤ 4KB per selected trade (first trade's labels inlined).
**Degradation.** *full-3d:* material response (sheen, env intensity) per the PBR spec. *fallback-2d:* palette + density morph, same labels. *still:* trade selector still works — swaps a static themed panel listing the labels as text. The knowledge is the point; the particles are the costume.
**A11y.** Rail is a listbox/radiogroup; label stream mirrored in a visually-hidden live region, throttled.

### Act 6 — Watch it build yours (THE CLIMAX) · `#build-yours`

**Purpose.** Stop narrating; do the thing. Trade + town → a real site assembles in a device frame in under a second.
**On-screen.** A two-field form: trade (`<select>`, 35 options) and town. On submit: the constellation's particles — seeded from that trade's real DNA labels — funnel into a phone-shaped frame; inside it, the actual page streams and paints; particles resolve onto the painted sections as each settles (hero, services, proof, contact — the section list read from the blueprint). A caption row shows what really happened: *strategy → blueprint (validated against the primitive registry) → rendered — deterministic; the same functions that build customer sites; run it twice, get the same site* (`identitySeed`). The frame carries a permanent **"Example — generated for demonstration"** badge. What the demo will never show is stated beside it: no invented reviews, no invented accreditations — **the generator has no route to produce one** (`facts.ts` language, true of the code).
**Execution design.** §3.5 — server-rendered demo route in an iframe, racing a labels JSON. p75 pick→first-paint-in-frame **< 1,000ms**, p95 < 1,800ms, measured by RUM; the assembly choreography is authored to mask up to 1.2s so a slow paint degrades to "still assembling — this is the real engine, not a video."
**True data source.** The production chain itself; labels from `industry-dna`; section list from the returned blueprint summary. Nothing is mocked.
**Budget.** Ledger B: demo controller ≤ 8KB + labels ≤ 4KB; the iframe document is separately governed by the Sites law (≤ 70KB markup+styles, ≤ 130KB script — in practice these pages ship far less).
**Degradation.** *full-3d/2d:* as described. *still:* no particle funnel — form submits, frame cross-fades from empty to painted, same captions, same < 1s. The demo is the climax on every tier **including still** — the honesty artefact is the site appearing, not the particles.
**A11y.** Labelled fields; result announced via `aria-live="polite"` ("Example site for roofing in Leeds — homepage assembled: hero, services, proof, contact"); iframe titled; focus moves to the frame's caption on completion.

### Act 7 — The room upstairs · `#command`

**Purpose.** A limited, honest glimpse of running the business from one room — and the phone moment.
**On-screen.** A framed Command Centre vignette: department health bands and the morning briefing, computed **by the real engines running in the browser** — `buildBriefing` (`core/mission-control`, pure over a snapshot) and `bandFor` (`core/health-engine`) — over a clearly-labelled sample snapshot ("Sample business · not live data"). Interaction is limited to hovering/expanding one or two cards; a **Forming** ribbon states this surface is being built for customers (matching `facts.ts` status `"build"`). Beside it, a CSS phone frame shows the one phone moment that is fully alive today: the owner's enquiry notification, rendered from `buildEnquiryNotification` output.
**True data source.** Real engine code, sample data, labelled; notification copy from the real builder. No customer app is depicted (none exists in `src/`) pending Q1.
**Budget.** Ledger B ≤ 20KB (the engines are dependency-free TS; feature→core import is legal).
**Degradation.** All tiers DOM. *still:* the vignette static, pre-expanded.

### Act 8 — Where TITAN is today · `#today`

**Purpose.** The landing: the honesty section that makes the rest credible, and the ask.
**On-screen.** The existing, tested content — `STATUS_HEADING`/`STATUS_BODY` ("TITAN is a new company… no case studies, no logos, no testimonials, because TITAN has not earned them yet"), the five `STANDARDS` each naming its enforcement point, capabilities with live/build tense, price-list honesty in one line (services are delivered by platform or by hand, and the catalogue says which — ADR-065), and the CTA (today: `CONTACT_EMAIL`; pending Q5). Static; the film has ended.
**Budget.** Ledger A (it's the document). **Degradation/a11y:** none needed — it is already plain, tested HTML (`honesty-law.test.tsx`).

---

## 3. Technical architecture

### 3.1 Where the code lives (boundary-legal)

- `src/features/company-site/experience/` — the film: `score/` (pure choreography data + maths, unit-tested), `engine-2d/` (zero-dep canvas2d renderer), `three/` (the r3f scene, its own async chunk), `acts/` (server components + client islands), `honesty/` (the departments/story-stages maps, §4), `orchestrator/` (store + IO + rAF loop + byte governor + frame monitor).
- `src/lib/device-tier.ts` — **move** `website-renderer/webgl/device-tier.ts` to foundation. Its own docstring says it was "designed for later PUBLIC use"; features cannot import features, so the move is the fulfilment, not a workaround. `website-renderer` re-exports during transition.
- Demo route: `src/app/(demo)/experience/demo/[trade]/[town]/page.tsx` (own minimal root layout, no chrome) rendered by a new `website-renderer` export `WebsiteDemoPage` — a thinned `WebsitePreviewPage` with the spine path removed: no `businessId`, no DB, pure chain only. App→feature import, legal. Output is `renderPage` markup, so it carries the `data-primitive=` fingerprint the gate insists on.
- Labels API: `src/app/api/experience/dna-labels/route.ts` → thin handler in `company-site` feature → `resolveIndustryDna` (feature→core). Alternatively build-time static JSON per trade under `public/` — decided by whichever keeps the labels ≤ 4KB with zero cold-start; default is static JSON.

### 3.2 Rendering strategy per act

The route stays **`force-static`** (ADR-064: no session, no DB). All narrative content is server components streamed as HTML. Client islands, mounted top-down: orchestrator (always), Act 0 canvas (always), then per-act islands hydrated on approach. The demo is isolated in its own document (iframe), so the marketing route never imports the renderer, framer-motion, or any primitive component — the heavy generator UI cannot leak into Ledger A even by accident, and an `eslint` boundary rule pins it (company-site may not import website-renderer).

### 3.3 Lazy-load choreography (the timeline)

1. **0ms** — HTML streams: nav, H1, skip control, all acts' semantic content; critical CSS inline (composite ≤ 70KB).
2. Framework + boot hydrate (Ledger A ≤ 130KB script). LCP = H1 text, target ≤ 1,800ms emulated mobile.
3. **Post-LCP idle** — Act 0 canvas mounts (code already present); awakening plays. Nothing is fetched.
4. **First gesture** — Ledger B opens. Act 1 engine prefetches; thereafter act N+1 prefetches when act N passes 50% progress; mount on entry, unmount + free two viewports away.
5. **Full-3d qualification** (all of: tier, desktop UA/viewport, gesture seen, LCP fired, no Save-Data, byte-governor headroom) — `modulepreload` the three chunk on idle; swap 2d→3d at the next act boundary (same score, so the cut is invisible).
6. **Act 6 approach** — preconnect; one speculative warm request for the default trade/town to lift the function and cache out of cold start.
7. **Submit** — labels JSON + iframe navigation race; RUM beacon records pick→paint.

### 3.4 State

One hand-rolled store (~1KB, `useSyncExternalStore`): `{ tier, mode: film|straight, act, progress, ledgerB bytes, demo phase }`. No zustand, no context tree, no framer-motion on this route (motion is CSS + canvas; framer exists only inside the iframe'd demo document, where it is already the renderer's dependency under the Sites law). Scroll handling: IntersectionObservers + one passive rAF-throttled loop; transform/opacity-only mutations; zero layout reads in the hot path. URL hash sync throttled ≥ 300ms.

### 3.5 The generator demo — execution decision

**Chosen: server-rendered demo route in an iframe** over bundling the chain client-side. Rationale: (a) honesty — the frame shows the output of the *exact* production path (`generateExperienceStrategy` → `createWebsiteBlueprintEngine().build` → `renderPage`), the same code behind `/sites/*`, not a client re-implementation that could drift; (b) bytes — shipping `renderPage` + primitives + theme + framer-motion to the marketing route would cost 100KB+ against Ledger B and duplicate the renderer; (c) determinism and caching — path params (sanitised trade id from the 35-entry taxonomy; town normalised) make each combination ISR-cacheable, so repeat picks are edge-cache hits. Latency budget: warm regional function (LHR) ~50–150ms TTFB + generation (~80ms, synchronous) + streamed HTML ≤ ~120KB own-document → p75 < 1s on UK 4G, verified by RUM not by hope. The client-side-pure-function option is retained as a documented fallback if RUM misses p75 two weeks running (the chain minus rendering is ~25KB and could seed a skeleton assembly while the frame streams). Demo pages are `noindex` + `robots.txt` disallowed — fabricated example businesses must never enter the index (ADR-059 optics), and the in-frame "Example" badge is permanent.

### 3.6 r3f / drei vs CSS / canvas2d

| Surface | Medium |
|---|---|
| Acts 0/1/4/5 particle field | canvas2d engine (canonical, all devices); r3f instanced points as desktop full-3d upgrade, same score |
| Act 2 split-screen | CSS only |
| Act 3 orbit | DOM/SVG + CSS transforms (focusable, semantic) |
| Act 6 frame | DOM device frame + iframe; particle overlay from the shared engine |
| Act 7 vignette + phone | DOM |
| drei | **not used v1** — every candidate import must be byte-justified; budget assumes zero |
| @react-three/postprocessing | **prohibited** — ADR-041's lesson stands; glow is a precomputed additive sprite, never a bloom pass |

### 3.7 Bundle strategy to stay ≤ 130KB initial

Own root layout (already true of `(public)`); no app providers, no command palette, no lucide beyond inline SVG; no framer-motion; Geist only (≤ 60KB of the 100KB font ceiling); Tailwind purged to the route; act engines authored dependency-free against a fixed particle struct-of-arrays (no per-frame allocation); three confined to one async chunk imported by exactly one gesture-gated call site; a CI **ledger script** maps every emitted chunk to an act and a ledger and fails the build on any ceiling breach — the byte budget becomes a compile error, which is the Performance Law's house style.

---

## 4. The honesty map

Single source: `experience/honesty/departments.ts`. Tests: (a) every node/edge names an existing module path; (b) every FORMING department renders its label; (c) `STORY_STAGES` symbols exist and are exported; (d) the extended `honesty-law.test.tsx` walks the experience markup with the same forbidden shapes (trade-body names, star ratings, testimonials, fabricated counts). **Dramatisation rule:** fiction may depict only the prospect's life without TITAN (Act 2 left panel); no fictional TITAN behaviour, result, or customer may appear anywhere.

| Department in the film | Status | What backs the claim |
|---|---|---|
| Website engine | **ALIVE** | `core/experience-strategy` + `core/website-blueprint` (builder, registry, validator) + `features/website-renderer`; live archetypes `/sites/summit-roofing-rescue`, `/sites/kerbside-kings`; audited nightly against `law.json` |
| Enquiry capture | **ALIVE** | `/api/enquiries` → `submit-enquiry.ts` (rate limit + honeypot) → `processEnquiry` → spine storage; timestamp + `sourcePage` captured; "delivery failure never breaks the enquiry" |
| Notifications (the phone buzz) | **ALIVE** | `core/notifications` — `buildEnquiryNotification` + channel seam; owner and founder notified |
| Ads planning | **ALIVE, with the sentence** | `core/ads-intelligence` — `generateCampaignPlan` / `validateCampaignPlan` / `buildCampaignCsvs` (ADR-031); `core/market-intelligence` benchmarks; execution is a manual Ads Editor import today — stated on `/advertising` and repeated in the film |
| Knowledge base | **ALIVE** | `core/industry-dna` — 35/35 sourced records, resolver, coverage + provenance gates (ADR-066/067) |
| Measurement | **ALIVE** | `lighthouse-gate.mjs`, publish gate, nightly sampler, site-metrics beacon |
| Sales — the enquiry ledger | **ALIVE (internal surface)** | `features/crm` over the spine; the `facts.ts` "one place" claim. Sales *automation* is not shown |
| Intelligence (briefing, health) | **FORMING — real bones** | `core/mission-control` `buildBriefing` and `core/health-engine` exist and run (Act 7 executes them on labelled sample data); `facts.ts` status `"build"`; shown condensing, labelled |
| Command Mode (approvals) | **FORMING** | `core/command-mode` exists, internal only |
| Reception AI | **FORMING — not built** | Nothing in `src/`; label says so |
| Finance | **FORMING — not built** | No finance automation; the price list itself is real and honest (`ServiceDelivery: platform \| hand`, ADR-065) |
| Customer app | **Not depicted v1** | Nothing in `src/`; the phone shows the real owner notification instead (Q1) |

**Privacy-page coherence:** `/privacy` currently states "No tracking, no cookies, no form." The demo picker collects a trade and a town, never stored; the proposed performance beacon is anonymous and cookie-less. Both require honest amendments to that page in the same increment they ship — or they don't ship (Q5, Q7).

---

## 5. Build order — independently shippable increments

Every increment merges only with floors green on `/` (preview URL through `lighthouse-gate.mjs`) and honesty tests green; each leaves the live site better than the last. Effort assumes the founder + AI pair, in dev-days.

| # | Ships | Contents | Effort |
|---|---|---|---|
| 1 | The gated shell | ADR-068 drafted (sanctions particles for the public face only + law amendments); `/` added to `law.json` `archetypePaths`; device-tier moved to `src/lib`; orchestrator, skip/straight mode, hash anchors; existing content restructured into the act skeleton (Act 8 complete); ledger script + journey budget test | 4–6 |
| 2 | Acts 0–1 | canvas2d engine, awakening, departments constellation from the honesty map, stills, reduced-motion variants | 6–8 |
| 3 | Act 3 | Orbit + inspection panels + alive/forming labelling; extended honesty tests | 4–5 |
| 4 | **Act 6 — the climax** | Demo route (`WebsiteDemoPage`), labels extraction, iframe frame + assembly, warm-up, RUM timing, noindex | 8–10 |
| 5 | Acts 2 + 4 | Split-screen; Summit Roofing Rescue story with `STORY_STAGES` pinning | 6–8 |
| 6 | Act 5 | 35-trade morph, material palettes, label streams | 5–7 |
| 7 | Act 7 | Command Centre vignette running real engines on sample data; phone notification moment (per Q1/Q2) | 5–7 |
| 8 | Full-3d layer | r3f scene on the shared score, gesture gating, byte governor, frame-monitor demotion | 8–10 |

Total ≈ **46–61 dev-days**. The 2D experience must stand alone as the finished work before Increment 8 begins; the 3D layer is an upgrade, never a dependency. If anything must be cut, cut from the back — the climax ships in Increment 4 by design.

---

## 6. Measurement plan (per increment, before shipping)

1. **The Law:** `lighthouse-gate.mjs <preview> --paths /` — median of 3, mobile: ≥95/≥95/100/100, LCP ≤ 2,500 (aim 1,800), TBT ≤ 200, CLS ≤ 0.1, script ≤ 130KB, font ≤ 100KB, total ≤ 700KB, markup+styles ≤ 70KB. Merge-blocking.
2. **Ledger script:** build-output → chunk→act→ledger mapping; fails on any §1 ceiling.
3. **Journey test (Playwright, per tier):** scripted full scroll + orbit click + demo submit under mobile CPU/network throttle; asserts network log within Ledger B ceilings, **zero three.js bytes without a gesture**, no long task > 200ms during act transitions, dropped-frame % < 10 (CDP tracing), zero console errors/warnings (best-practices 100 — includes handled WebGL context loss).
4. **Demo SLO:** synthetic pick→paint timing in CI (warm + cold) plus field RUM p75 < 1,000ms / p95 < 1,800ms; two weeks over budget triggers the documented client-side fallback (§3.5).
5. **A11y:** axe-core per act (0 serious/critical); keyboard-only journey test (skip → orbit → demo → CTA); reduced-motion snapshot test asserting stills render and no canvas mounts.
6. **Honesty:** extended `honesty-law` suite + departments-map existence test + `STORY_STAGES` pinning, all merge-blocking.
7. **Field:** anonymous perf beacon (pending Q7) — LCP/INP/CLS, act-reach funnel, skip rate, tier/demotion counts, demo timings. Proposed law amendment via ADR-068: add INP ceiling 200ms to `law.json` (a tightening; the file permits only lowering, and the ADR records it).

---

## 7. Top 10 risks

| # | Risk | Mitigation |
|---|---|---|
| 1 | Next 16 + React 19 baseline (~90–105KB) leaves ~25KB for everything else in the 130KB script budget | Zero-dep engines; no motion/state libraries; ledger script fails the PR, not the retro; if baseline grows, demote act islands to vanilla script islands |
| 2 | Lighthouse's emulated device classifies as `full-3d` and the audit fetches three.js | 3D requires a *user gesture* — audits never gesture; plus desktop-only gate; e2e asserts zero three bytes on a no-interaction load |
| 3 | Reviving particles contradicts ADR-041's retirement | ADR-068: public-face only, Ledger B only, canvas2d canonical, kill-switch, never on customer sites; explicitly the founder's call to reverse his own call |
| 4 | Demo misses p75 < 1s (cold start, slow 4G) | Approach-time warm request, ISR cache per combo, streamed tiny document, choreography masks 1.2s, honest "still assembling" state, RUM-triggered client-side fallback |
| 5 | Scroll narrative wrecks TBT/INP on low-end phones | Particle caps + DPR caps, no hot-path layout reads, work sliced under a rAF budget, OffscreenCanvas where available, runtime frame-monitor demotion |
| 6 | Honesty drift as acts are polished (a beat outruns the code) | Departments map + `STORY_STAGES` + extended honesty-law tests are merge-blocking; forming labels are asserted, not remembered |
| 7 | Privacy page contradiction ("no tracking, no form") | Beacon and demo picker ship only with the amended, honest privacy copy — or not at all (Q5/Q7) |
| 8 | Fabricated example business leaks (indexed, screenshotted as real) | `noindex` + robots disallow; permanent in-frame Example badge; neutral naming rule (Q4); generator already refuses reviews/accreditations |
| 9 | Nine acts is long; visitors bounce before the climax | Skip control from 0ms; straight mode; act-reach funnel decides whether Act 6 moves earlier — a data decision, pre-agreed |
| 10 | CSS/markup creep across 9 acts breaks the 70KB composite | Composite tracked per PR in the ledger script; stills externalised as SVG; copy budget per act (~3KB) |

---

## 8. Open questions for the founder

1. **The phone act:** no customer app exists in `src/`. Ship the real owner-notification moment and omit the customer app, show it as labelled FORMING, or cut the phone beat? (Recommended: real notification only.)
2. **Command Centre glimpse:** run the real briefing/health engines on a labelled sample snapshot (recommended), or a stylised recreation? And which surfaces are safe to show under ADR-061's "nothing internal reaches the customer"?
3. **Awakening length:** commit to 6s, or 3s with the remaining drama spread into Act 1? Accept a skip-rate-driven decision rule after two weeks of field data?
4. **Demo naming + towns:** neutral example-business naming pattern (e.g. "Example Roofing, Leeds") and free-text town vs a curated UK towns list — free text puts visitor-typed words into a generated H1.
5. **Dogfooding the CTA:** TITAN's site currently has no form on principle. The strongest possible close to Act 6 is a real enquiry form running TITAN's own pipeline — "this form is the product." That reverses a documented privacy stance; your call.
6. **ADR-068:** you retired the particle morph (ADR-041). This design revives real-time particles for the public face only, under the containment above. Sanction it?
7. **Anonymous performance beacon** on the company site — acceptable with amended privacy copy, or do we fly synthetic-only?
8. **Finance and reception in the film:** show both as visibly FORMING (candour as theatre, consistent with ADR-065), or omit until they exist?
9. **When does `/` join `law.json`:** Increment 1 (everything gated from day one — recommended) or after Act 0 ships?
10. **Sound:** the film language implies it; recommendation is none in v1. Confirm.

---

*Repo grounding: budgets from `src/core/performance-law/law.json`; tiering from `src/features/website-renderer/webgl/device-tier.ts`; the pure chain from `src/core/experience-strategy/generator.ts:109`, `src/core/website-blueprint/builder.ts:998`, `src/features/website-renderer/model/render-page` via `components/website-preview-page.tsx`; honesty precedents from ADR-064/065, `src/features/company-site/model/facts.ts`, and `tests/features/company-site/honesty-law.test.tsx`; materials from `src/features/website-renderer/morph-lab/particle-materials.ts`; enquiry truth from `src/features/website-renderer/api/submit-enquiry.ts` and `src/core/business/workflows.ts`; knowledge truth from `src/core/industry-dna/` (35/35 sourced, ADR-066/067).*
