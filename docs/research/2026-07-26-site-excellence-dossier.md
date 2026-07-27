# TITAN Site Excellence Dossier
### Research synthesis: top-1% front-end engineering + trade-site conversion + UK compliance
Date: 2026-07-26 · Sources: ~60 primary references across three research tracks (performance engineering, trade conversion, clinical/professional compliance). Feed into: Codex, ADR/directive, blueprint builder prompts, renderer laws.

---

## 0. Executive verdict

1. **The ambient video question is answered: change it.** A naive 1080p hero loop is 8–15MB; TITAN ships ~20MB. Professional range is **≤2.5MB per rendition (target 1–1.5MB)**. Elite sites either ration video hard (short, silent, AV1, poster-first, deferred) or fake it for free — Stripe's famous hero is a few KB of canvas gradient, not video. **Default hero becomes Ken Burns AVIF still (~150KB); video becomes a budgeted, opt-in enhancement.** ~90% of the perceived effect for ~0.7% of the bytes.
2. **The JS diet is confirmed as the single biggest lever.** CSS has absorbed the animation library's job (scroll-driven animations, @starting-style, View Transitions). framer-motion (currently ~789KB total JS on a site page) should be banned from the renderer; expected end state ~90–130KB gz total JS.
3. **Conversion is a template property, not a copywriting accident.** The same fold wins everywhere: {service}+{town}+outcome headline, visible phone + tap-to-call, 3 trust chips, one real photo, one dominant CTA. Sticky mobile call bar alone: +25–40% mobile calls.
4. **Compliance must be a generator feature.** Dental (GDC/CQC/ASA) and solar (MCS/RECC/HIES) carry hard legal MUSTs. ASA now runs AI ad monitoring — a non-compliant generated site WILL be caught. TITAN needs a compliance manifest + banned-claims linter per trade.
5. **Speed-to-lead is the highest-ROI feature TITAN can build next**: contact within 5 min = 21x conversion vs 30 min; 78% of customers buy from the first responder; average business responds in 42 hours. TITAN's beacon + CRM already sees every enquiry the second it lands — instant-acknowledgement + booking-on-thank-you is the product moat.

---

## 1. THE VIDEO LAW (answers 2026-07-26 finding: 20.4MB home page)

- **Default hero = motion-free "cinema"**: Ken Burns pan/zoom on a high-quality AVIF still (CSS keyframes, 8–20s, reduced-motion safe) or CSS/canvas gradient mesh. ~100–200KB.
- **Where film is used (premium option, one per page max):**
  - ≤10s seamless loop, no audio track, 720p, 23.98/24fps
  - AV1 (libsvtav1) first + H.264 CRF~24 fallback, explicit `codecs=` in `type` attrs
  - **≤2.5MB hard ceiling per served rendition; target 1–1.5MB**
  - Poster = first-frame AVIF ≤150KB, preloaded `fetchpriority=high` — poster is ALWAYS the LCP
  - `autoplay muted loop playsinline preload="none"`; src attached only post-LCP via IntersectionObserver
  - `prefers-reduced-motion` or `saveData`/2G → poster only, zero video bytes
  - Hero container fixed height (CLS 0)
- Media pipeline enforces the budget at generation time: a film that encodes >2.5MB is rejected back to the gate, like any other failed asset.

## 2. UNIVERSAL FRONT-END LAWS (renderer)

- **JS**: `"use client"` only on leaf components (form, nav toggle); page must render complete with JS off. Total JS ≤130KB gz. framer-motion banned; escape hatch = motion mini `animate()` (2.3KB) only.
- **Motion = CSS**: `@starting-style` entries; scroll-driven animations behind `@supports (animation-timeline: view())` with visible-static fallback; `@view-transition { navigation: auto; }` for free page transitions; Speculation Rules prerender for instant navigation.
- **Images**: AVIF-first (only 0.7% of the web ships AVIF — real edge); pre-generated renditions at upload (384/640/960/1280/1920) with content-hashed URLs + `Cache-Control: public, max-age=31536000, immutable` (fixes the 15.7MB cache-lifetimes flag); exactly ONE eager fetchpriority=high image per page (LCP); accurate `sizes` per slot (never default 100vw on grids); intrinsic dimensions everywhere; ThumbHash/blur placeholder <300B.
- **Byte budgets (CI-enforced, ratchet down only)**: HTML ≤35KB gz · CSS ≤35KB gz · JS ≤130KB gz · fonts ≤100KB (2 woff2, preload, swap) · above-fold images ≤250KB · initial transfer ≤700KB excl. deferred film.
- **Metric floors (mobile emulation, median of 3 runs)**: perf ≥95 · LCP ≤2.5s (aim 1.8) · TBT ≤200ms (aim ≤100) · CLS ≤0.1 (aim 0) · a11y ≥95 → 100 after contrast token fix · BP = 100 · SEO = 100.
- **Zero render-blocking third parties**; no YouTube iframes (facade only); analytics stays sendBeacon/deferred.
- **CI**: Lighthouse CI on every renderer PR against preview deployment (both live archetype sites); nightly fleet sampler over N random live sites, alert <95. Static serving of published snapshots (they ARE snapshots) → fixes bfcache + TTFB.

## 3. UNIVERSAL CONVERSION LAWS (blueprint builder)

- **The fold**: {Service} in {Town} + outcome headline · visible phone number + tap-to-call · 3 trust chips (Google rating+count, key accreditation, years trading) · one real job photo · ONE dominant CTA (single-CTA pages: +371% clicks in 41k-page Unbounce corpus).
- **Sticky mobile call bar** ≥48px on every page (+25–40% mobile calls). Emergency pages: full-width, call-first.
- **Forms**: 3–5 fields single-step (name, phone, service, postcode) OR multi-step wizard for considered purchases (driveways/solar: project type → property → contact; multi-step lifts 35–214% in Venture Harbour corpus). Always service type + postcode.
- **Reviews**: real Google reviews with first name + town + date (beat generic badges by 15–30%); floating reviews widget opening the real profile; NEVER fabricated; no self-serving aggregateRating schema (Google ignores it since 2019; marking up imported Google/Trustpilot reviews risks manual action).
- **Pricing**: "guide from" ranges + monthly-finance framing (£1,500+ jobs: +12–20% contact rate; financed tickets 4.5x); FAQ block answering "how much does X cost" on every service page (+8–15%); no fixed price lists (except dental — see MUSTs); CMA pushes transparency, bans drip pricing and fake urgency.
- **Photos**: real jobs/crew only. Stock kills credibility; 46% of consumers now suspicious of AI content — AI "work photos" are a trust liability. Atmosphere/texture generation stays legitimate; fake proof never. (Matches existing Honesty Law.)
- **Speed-to-lead layer**: instant auto-acknowledgement (SMS/email) on every enquiry; booking/callback widget on the thank-you screen; push alert to owner. 5-min response = 21x; 78% buy from first responder; TITAN should sell this stat.
- **Local SEO**: service-area pages ONLY for towns with real evidence (jobs/reviews); each SAP needs ≥3 town-unique elements (local job photo, town-tagged review, housing-stock/weather copy, town FAQ, landmark) or it doesn't publish — doorway pages are the #1 risk. Schema: LocalBusiness subtype (RoofingContractor etc.) on home; Service+areaServed per service page; FAQPage; single canonical NAP string everywhere. Title template: "{Service} in {Town} | {differentiator}".

## 4. PER-TRADE PLAYBOOKS

### Roofing / Emergency roofing & drainage
- Emergency = distress purchase: dedicated emergency landing page, call-first layout, red/amber accents, van/crew photos, "24/7 … in {Town}" + response promise (only if operationally true; tiered presets: "on-site within 2 hours" / "same-day" / "answered in 60 seconds").
- "We answer" positioning: 62% of calls to small firms go unanswered; 67% of unanswered callers dial a competitor. Trust strip: "Speak to a real person, not voicemail."
- Storm-damage & insurance-claim content module (proven US differentiator, UK analogue underserved).
- Trust stack: NFRC/TrustMark/CompetentRoofer + Insurance-Backed Guarantee, stated as text above the fold.
- Secondary emergency CTA: "Send photos of the damage" (photo-attach form).
- Portfolio: drone/aerial shots differentiate; before/after sliders with identical angles.

### Driveways & paving
- Structure: hero → filterable gallery → material cards (block/resin/tarmac) → process timeline (dig-out, sub-base, drainage) → FAQs → survey CTA.
- **"Show the boring bits"**: sub-base/drainage/SuDS-compliance photos read as premium; no UK competitor does this systematically — genuine white space.
- Before/after slider, caption schema {problem, solution, material/spec, duration, town}; every project tagged to a town and embedded in that town's SAP.
- Multi-step quote wizard; finance framing ("from £X/month").
- Trust: Marshalls/Brett approved-installer badges.

### Solar & battery
- **Savings calculator as primary CTA**: interactive calculators convert 15–25% vs 3–5% static forms. Rules: ask monthly bill £ (not kWh), one question per screen, show a ±15–20% range BEFORE asking contact details, booking widget on results.
- Certification bar (MUST-level): MCS (verify number before rendering the mark — misuse is enforced) + RECC/HIES + TrustMark + NICEIC/NAPIT.
- Case-study template with REAL numbers: kWp, cost, annual kWh, £ saved, bill before/after, payback years, CO₂ — "actual results, not projections."
- Warranty as headline differentiator (20-yr workmanship pattern); finance pages need FCA-compliant representative APR examples.

### Private dentistry (clinical template)
- Header: phone + "Book Online," both sticky mobile; ≤3 clicks to booking from anywhere; 72% prefer online booking, 40% of bookings out-of-hours; reminders automation (−35–40% no-shows).
- One page per revenue treatment: problem → process → price-from + monthly finance → FAQs → gallery → treatment-specific booking (converts ~60% better than generic).
- Fees page: full price list (GDC expectation), plan-vs-PAYG comparison, 0% finance (Tabeo-style), membership plan.
- Patient language in nav ("Straighten Your Teeth," not "Orthodontics").
- Smile gallery consent-gated (see MUSTs).

### Carpet cleaning / general appointment trades
- Same universal fold + before/after pairs + booking-first CTA; multi-step quote (rooms → property → contact); town-tagged results photos; Trustpilot/Google review volume as the trust anchor.

## 5. COMPLIANCE MUSTS (generator hard requirements)

### Dental/clinical (GDC · CQC · ASA · MHRA)
- Practice name, address, email, phone; "regulated by the GDC" + gdc-uk.org link; complaints procedure; "last updated" date; NHS-vs-private clarity.
- Per clinician: full registered name, GDC number, qualifications + country obtained.
- CQC: display rating (official widget) within 21 days once rated; always link the CQC profile.
- "Specialist" titles ONLY if on the GDC specialist list; banned words: best/expert/finest/leading without proof.
- Before/after: signed dated consent, unmanipulated, identical conditions, originals retained, "results vary."
- Testimonials: genuine + evidenced + consented; can't substantiate efficacy claims.
- **POM brand names (e.g. "Botox") hard-blocked in public copy** — MHRA law.
- Cookie consent: prior blocking of non-essential, granular, no pre-ticks; health-data forms = special-category consent language.

### Solar
- MCS mark only with verified MCS number; RECC/HIES consumer code; finance promos need FCA representative examples.

### All trades
- No drip pricing, no fake countdowns/perpetual offers; genuine prior price for any "% off"; 14-day cooling-off on online bookings.
- **Compliance linter runs at generation time**: banned-claims words, POM names, specialist titles, fake urgency, self-serving review schema, uncosted "free" claims.

## 6. ENFORCEMENT (the gate that makes it permanent)

1. Lighthouse CI (mobile, 3-run median) on every renderer PR against preview: score floors + byte budgets (§2). Bytes gate merges; scores alert.
2. Nightly fleet sampler over live sites; any site <95 alerts the Command Centre timeline.
3. Media pipeline rejects over-budget assets (film >2.5MB, poster >150KB) at the review gate.
4. Compliance linter blocks publish, not just warns, for MUST-level items on clinical/solar templates.
5. Budgets ratchet down only; every exception is a written ADR note.

## 7. ADOPTION ROADMAP (suggested order)

1. **PR 1 — JS diet**: CSS motion stack replaces framer-motion; hydration cut to form+beacon+film-loader. (Biggest single lever: TBT →,~100ms.)
2. **PR 2 — Media law**: Ken Burns default hero; film budget + AV1 pipeline + poster-LCP loader; immutable cache headers + upload-time AVIF renditions. (Kills 20MB payload + 15.7MB caching flag.)
3. **PR 3 — Gate**: Lighthouse CI + budgets + nightly sampler; static serving of published snapshots; contrast token; portfolio image-sizing bug.
4. **PR 4 — Conversion pass**: sticky call bar, single-CTA folds, FAQ-pricing blocks, review presentation, speed-to-lead acknowledgement + thank-you booking.
5. **PR 5 — Per-trade modules**: emergency landing page, driveway process/SuDS sections, solar calculator, dental compliance manifest + linter.
6. **Codex ingestion**: this dossier enters the Codex; blueprint builder prompts reference its LAWS by section so every future strategy generation obeys them.

*Caveat carried from research: vendor conversion multipliers (e.g. "3.2x", "+50–70%") are directionally consistent but not peer-reviewed — use for prioritisation, never quote to clients. Regulatory items are verified against primary sources (GDC, CQC, ASA, MCS, Google) and are non-negotiable.*
