# TITAN Dossier — Volume 3: Design Craft & Customer Acquisition
**Date:** 26 July 2026 · **Status:** research complete, awaiting implementation
**Companion volumes:** Vol 1 — Site Excellence (performance, media, conversion laws) · Vol 2 — Trade Playbooks (all ~35 trades)

**Scope of this volume:** front-end design & graphic craft (tokens, colour, type, imagery, identity, accessibility) plus the full customer-acquisition layer — Google Ads & Local Services Ads, SEO, GEO (AI-search visibility), Google Business Profile, reviews, and Meta Ads — researched across the current 2025–26 UK landscape for every trade TITAN serves.

---

## Executive synthesis — the ten decisions this volume forces

1. **Compete on refinement of the familiar, not novelty.** Google's own research: perceived beauty = low complexity + high prototypicality; pages with <10 salient elements convert ~2×. Every trade template must read as "obviously a [trade] site" at 50ms, with a novelty budget of ≤1 signature element per page. This is precisely what a one-renderer/N-brands token architecture is best at.
2. **One brand hex in → a guaranteed-accessible theme out.** Adopt the OKLCH pipeline: brand colour → 11-step fixed-lightness ramp → warm-matched neutrals → contrast-validated semantic pairings (WCAG 2.2 AA shipped, APCA as internal QA), Adobe Leonardo-style contrast-first generation. Three token tiers (primitive → semantic → component); the renderer reads only semantic+component, so 35 trade themes × infinite brand primitives stays tractable.
3. **Utopia fluid type everywhere:** two modular scales (1.2 @320px → 1.333 @1500px, base 18–20px) interpolated with clamp(); exactly 2 variable-font families per brand from ~6 curated pairings mapped to three brand voices (Trust / Premium / Friendly).
4. **Imagery is a system, not a slot:** the wide/mid/macro triad on every page; three-tier auto-treatment to unify mixed customer photos (grade → tint+grain → full duotone); AI imagery only for ambience, never fake portfolio work, and prompted to avoid the AI look (overcast UK light, 35mm documentary framing, asymmetry).
5. **LSAs are TITAN's cheapest lead source for emergency trades** (UK live nationwide; "Google Verified" badge; ~£10–30/lead; automated dispute credits; ProvideLeadFeedback API). Emergency trades run LSA-first + Search 24/7; considered home-improvement trades run Search-first; dental/legal are Search-only (no UK LSA outside London legal/estate pilots).
6. **Search ads discipline:** SKAGs are dead — one campaign per service line; call ads sunset Feb 2026→2027 (plan RSA + call assets now); master negative list platform-wide; CPL target ≤10–15% of average job value; PMax is a default-no for local lead-gen. Consent Mode v2 + dynamic number insertion + daily offline-conversion import are non-negotiable plumbing.
7. **GEO is not a separate product.** AI-answer visibility correlates with branded mentions (0.664), review-site presence and classic rankings; llms.txt is hype and schema doesn't drive citations. The work is the same work: rankings, directories/listicles, brand PR, reviews — re-weighted.
8. **Reviews are a legal surface now.** The DMCC Act (in force 6 Apr 2025) makes review gating and undisclosed incentives ILLEGAL in the UK with fines up to 10% of global turnover — TITAN's review engine must be compliant by design. Velocity matters: recency cliffs appear around an 18-day gap; steady drip beats bursts.
9. **Meta has a strict trade hierarchy:** visual-transformation trades (driveways, landscaping, roofing, cleaning) are primary; big-ticket considered works with quality controls; professional trades are offer-led with social proof; emergency trades skip Meta entirely. The 2026 stack: one Leads campaign, broad ad set in a town+8-mile geo, 6+ creatives refreshed monthly (Andromeda treats creative as targeting), Higher-intent instant forms with 2 qualifiers and autofill off, sub-60-second automated SMS/WhatsApp response, Conversion Leads CAPI feedback.
10. **TITAN's structural moats are platform-level:** creative volume harvested from job photos, speed-to-lead as a product feature, pooled per-vertical conversion data no individual tradesman could accumulate, a finance-copy compliance firewall, and fleet-wide protection against the two shared risks (scaled-content classification and DMCC review non-compliance).

---

# PART I — DESIGN CRAFT (graphic, visual, brand)

# TITAN Design-Craft Research (Track: Graphic/Visual/Brand)

## 1. Trends & Timeless Principles for High-Trust Local Sites (2025–26)

**The trust evidence base (use this, not vibes):**
- Users form aesthetic judgments in **~50ms** (Lindgaard et al., [Behaviour & IT](https://www.researchgate.net/publication/220208334_Attention_web_designers_You_have_50_milliseconds_to_make_a_good_first_impression_Behaviour_and_Information_Technology_252_115-126)), and Google's own research found perceived beauty is driven by **low visual complexity + high prototypicality** — sites that "look like what a [trade] site should look like" but simpler win; unusual layouts are penalized even when otherwise attractive ([research.google](https://research.google/blog/users-love-simple-and-familiar-designs-why-websites-need-to-make-a-great-first-impression/), [pub](https://research.google/pubs/the-role-of-visual-complexity-and-prototypicality-regarding-first-impression-of-websites-working-towards-understanding-aesthetic-judgments/)). This is a direct argument **against** brutalism/experimental layouts for TITAN and **for** a refined-classic system.
- 62–90% of initial product/brand assessment is colour-based within 90 seconds (Management Decision, via [Cube Creative](https://cubecreative.design/blog/small-business-marketing/color-psychology-home-service-success)); experimental work supports **blue > red for perceived trustworthiness** ([Trustworthy Blue or Untrustworthy Red](https://www.researchgate.net/publication/334550253_Trustworthy_Blue_or_Untrustworthy_Red_The_Influence_of_Colors_on_Trust)).
- From a 200+ UK trade-site analysis: pages with **fewer than ~10 distinct elements convert ~2×** cluttered ones; accreditation logos (Gas Safe, NICEIC, CIPHE) belong at the top of the homepage; real project photos beat stock ([Outcome Digital](https://outcomedigitalmarketing.com/blog/website-design-tradesmen-attract-customers)).

**Typography 2026:** direction is expressive-but-legible — large variable fonts, "chunky and confident" sans for trades, serif/sans pairing for premium, humanist rounded sans for friendly/clinical ([Memorable](https://memorable.design/brand-typography-trends/), [Figma trends](https://www.figma.com/resource-library/web-design-trends/), [DesignMonks](https://www.designmonks.co/blog/typography-trends-2026)). Font-psychology consensus (weakly evidenced but consistent across sources): serifs → tradition/authority (legal, established firms); geometric/heavy sans → strength/competence (roofing, construction); rounded sans → approachable/care (dental, cleaning) ([IBM Design study on font perception](https://medium.com/design-ibm/how-fonts-influence-users-perception-of-your-product-238874c593d7), [Todaymade](https://www.todaymade.com/blog/font-psychology)).

**Fluid type:** [Utopia.fyi](https://utopia.fyi/blog/designing-with-fluid-type-scales/) is the reference method — define two modular scales (e.g. **1.2 ratio @320px → 1.333 @1500px, base 18–20px**) and interpolate with `clamp()`; one system, no breakpoint soup ([Smashing](https://www.smashingmagazine.com/2021/04/designing-developing-fluid-type-space-scales/)).

**Layout:** bento grids remain the dominant modular pattern into 2026 — good for service/trust-signal cards because they impose order ([Line25](https://line25.com/articles/web-design-trends-2026/), [bento guide](https://gillian-sarah.com/bento-grid-web-design-trend-2025/)); brutalism is explicitly a niche/creative-industry play, wrong for prototypicality-sensitive local trades ([DART Studios](https://dartstudios.uk/blog/ui-design-trends-in-2025)).

**Dark vs light:** consensus across conversion write-ups: **light UI for lead-gen/local trust** (readability in daylight, prototypicality); dark works as a *premium accent theme* (hero/footer bands, premium trades like bespoke joinery, solar "tech" positioning) not as the default ([Outcrowd](https://www.outcrowd.io/blog/dark-mode-conversion-booster-or-marketing-disaster), [Entraw](https://entraw.com/insights/white-vs-dark-website-design-which-one-converts-better)). Dental exemplar "Arbor" shows dark-calm *can* read premium-clinical when airy ([Studio EightyEight](https://s8e8.com/articles/best-dental-websites)).

**Trade colour map** (from [Cube Creative](https://cubecreative.design/blog/small-business-marketing/color-psychology-home-service-success) + [Digitalways](https://www.digitalways.org/tradie-logo-design-branding-for-trades-and-contractors/) + [AETHUS UK](https://aethus.co.uk/posts/the-psychology-of-colour-in-uk-service-business-websites-enhancing-conversions)): plumbing deep-blue+orange; HVAC red/blue or teal+orange; electrical navy+bronze or yellow/black; cleaning white+blue or green+citrus; landscaping greens or teal+terracotta/sage+cream; premium/legal charcoal/navy+metallic accent; emergency CTA always warm (red/amber) against a cool trust base.

> **DESIGN LAWS for TITAN — Foundations**
> 1. **Prototypicality law:** every trade template must be recognisably "a [trade] site" at 50ms — hero photo of the work, name, accreditation strip, phone. Novelty budget ≤1 signature element per page.
> 2. **≤10 salient elements** per viewport-fold; whitespace is the default separator, borders/cards the exception.
> 3. **Type system:** exactly 2 families per brand from a curated matrix of ~6 pairings mapped to 3 brand voices — *Trust* (humanist sans + strong grotesque headings), *Premium* (high-contrast serif headings + neutral sans), *Friendly* (rounded sans throughout). Variable fonts only, 2 files max.
> 4. **Fluid scale:** Utopia-style `clamp()`, ratio 1.2→1.333, base 18px→20px, 6 steps (−1..4). Same spacing scale multipliers (0.75/1/1.5/2/3/4/6× base).
> 5. **Colour roles:** cool trust-base (hue per trade), warm action colour reserved *exclusively* for CTAs/emergency; never use the action hue decoratively. 60-30-10 distribution (neutral/brand/accent).
> 6. **Default light; dark only as sectional "premium band" or opt-in theme for premium-positioning trades.**
> 7. Layout kit = classic hero + bento trust-grid + editorial case-study rows. No brutalism.

## 2. Design Tokens & Multi-Brand Theming at Scale (TITAN's core problem)

**Canonical architecture — 3 tiers** ([Brad Frost](https://bradfrost.com/blog/post/the-many-faces-of-themeable-design-systems/), [Rangle](https://rangle.io/blog/using-figma-variables-to-build-a-multi-brand-design-system), [token-tier guides](https://honcho.agency/design-systems/glossary/token-tiers)):
- **Tier 1 primitives** (`blue-600`, `space-4`) → **Tier 2 semantic** (`color-action-bg`, `surface-raised`) → **Tier 3 component** (`button-primary-bg`). Components *only* consume tiers 2–3.
- Theming is **additive layering**: `core + trade-theme + business-brand-theme (+ campaign)`. Frost's white-label scenario is literally TITAN's model. Vodafone UK documents variable taxonomy for a complex multi-brand system in Figma ([Vodafone](https://medium.com/vodafone-uk-design-experience/figma-variables-at-vodafone-uk-how-we-structured-taxonomy-for-a-complex-multi-brand-design-system-693b1b95675f), [Figma blog](https://www.figma.com/blog/creating-multi-brand-design-systems/)).

**Automatic palette from one brand colour — solved problem, use these tools:**
- **OKLCH** gives perceptual uniformity: fixed lightness (L) steps ⇒ predictable contrast regardless of hue, so one L-ramp recipe works for all 35 trades' hues ([Evil Martians](https://evilmartians.com/chronicles/exploring-the-oklch-ecosystem-and-its-tools), [LogRocket](https://blog.logrocket.com/oklch-css-consistent-accessible-color-palettes)).
- **Adobe Leonardo** (`@adobe/leonardo-contrast-colors`) generates colours **from target contrast ratios** — input key brand colour(s) + desired ratios, get a guaranteed-accessible ramp; underpins Spectrum's adaptive colour ([GitHub](https://github.com/adobe/leonardo), [Nate Baldwin](https://medium.com/@NateBaldwin/leonardo-an-open-source-contrast-based-color-generator-92d61b6521d2), [Adaptive Color in Spectrum](https://medium.com/thinking-design/adaptive-color-in-spectrum-adobes-design-system-feeeec89a2c7)).
- **apcach** (JS) and **Harmonizer** generate APCA-safe combos in OKLCH; **APCA** is the WCAG-3-direction perceptual contrast model — use it as internal QA while shipping WCAG-2.2-compliant ratios for legal cover ([APCA intro](https://git.apcacontrast.com/documentation/APCAeasyIntro.html), [Designsystemet.no](https://designsystemet.no/en/best-practices/accessibility/contrast)).

> **DESIGN LAWS for TITAN — Token Architecture**
> 1. **Pipeline:** `brand.hex (1 input)` → convert to OKLCH → snap chroma to safe gamut → generate 11-step ramp at fixed L values (≈ 98/95/90/80/70/60/50/40/30/20/12) → derive neutral ramp by desaturating brand hue (C≈0.01–0.03, keeps neutrals "warm-matched" to brand) → derive accent = hue-rotated complement (or trade-preset accent). Validate every semantic pairing with WCAG 2.x math + APCA score; auto-nudge L until both pass (Leonardo's contrast-first generation is the model).
> 2. **Three collections, never skipped:** `primitive.{color|type|space|radius|shadow}` / `semantic.{surface, text, action, feedback, border, focus}` / `component.*`. Renderer reads only semantic+component. Brand switching = swapping one primitive+semantic JSON, zero component changes.
> 3. **Trade theme = preset semantic mapping + type pairing + imagery treatment + radius/density profile.** Business brand = primitives only (hue, logo, name). This keeps N×35 combinations tractable: 35 trade themes × ∞ brand primitives.
> 4. **Guaranteed invariants baked into semantic layer:** `text.body` on `surface.default` ≥ 4.5:1 always; `action.bg` vs adjacent surface ≥ 3:1 (non-text contrast); `focus.ring` = 2px, ≥3:1 vs all surfaces (pick from neutral ramp ends automatically).
> 5. Radius/density as tokens too: Premium profile (radius 2px, loose spacing ×1.25), Standard (8px), Friendly (16px, tighter). One number-set per trade voice.

## 3. Art Direction for Trade Imagery

**What makes trade photography premium** ([Coyle Studios marketer's guide](https://go.coylestudios.com/en-us/a-marketers-guide-to-construction-photography), [Aerial Southeast](https://aerialsoutheast.com/how-to-photograph-a-construction-site/)): golden-hour or overcast diffuse light; people-at-work candids over posed grins; the **triad = wide establishing (drone), mid action shot, macro detail/texture** (fixings, tile courses, weld beads — detail shots signal craft); clean sites, branded PPE; before/after pairs are the single most persuasive asset for UK trades ([Outcome Digital](https://outcomedigitalmarketing.com/blog/website-design-tradesmen-attract-customers)).

**Treatment system to unify mixed-quality customer photos:** duotone/monotone mapping is the classic normaliser — shadows→brand-dark, highlights→neutral-light, flattening white-balance and exposure inconsistencies ([99designs duotone guide](https://99designs.com/blog/trends/duotone-design/)); universities formalise this as tiered "photo colour treatments" in brand systems ([Univ. of Oregon brand](https://communications.uoregon.edu/uo-brand/visual-identity/photo-color-treatments)). Add scrim gradients for text-over-image, and subtle grain to mask compression artefacts.

**Avoiding the AI look** (for gap-filling imagery): the tells are "digital butter" skin, permanent golden-hour rim lighting, obsessive symmetry, over-saturation ([Dreamstime](https://www.dreamstime.com/blog/avoiding-ai-look-techniques-more-natural-results-77454), [Vofy](https://www.vofy.art/blog/why-ai-images-look-fake-photorealistic-solutions)). Fixes: prompt real camera/lens language (35mm, f/4, slight motion blur), "ugly" flat overcast UK light, cluttered authentic job-site context, visible texture/imperfection, off-centre composition — and prefer real photos as the base whenever any exist.

> **DESIGN LAWS for TITAN — Imagery**
> 1. **Every page needs the triad:** 1 wide (hero), 2–3 mid action, 2+ macro detail. Drone/wide for roofing/paving/solar; macro is mandatory for "craft" signalling in every trade.
> 2. **Three-tier auto-treatment for uploads:** Tier A (good photo) → colour-grade only (lift shadows, unify WB toward brand temperature); Tier B (mediocre) → brand-tinted overlay 10–20% + grain 2–4%; Tier C (poor/mismatched set) → full duotone in brand dark/neutral-light. Never mix tiers within one grid row.
> 3. Text over images only behind a scrim: linear-gradient brand-dark 60%→0%, verified to 4.5:1.
> 4. **AI imagery rules:** UK-specific context (brick terraces, scaffolding, hi-vis with realistic wear), overcast flat light, 35mm documentary framing, asymmetric composition, visible skin/material texture; ban golden-hour + centered-subject + shallow-DOF combos. Never AI-generate "finished work" that implies a real portfolio piece — use AI only for ambience/backgrounds.

## 4. Logo & Identity Generation for Small Trades

Credibility drivers ([Digitalways](https://www.digitalways.org/tradie-logo-design-branding-for-trades-and-contractors/), [The Logo Company](https://thelogocompany.net/tradesman/)): **wordmarks and icon+wordmark lockups read most professional**; badges/emblems suit heritage positioning (est.-date builders, legal) but fail at small sizes; monograms for long family names. 2–3 colours max; heavy clean sans = strength; must survive van livery, embroidery, and favicon. Kit must include: full-colour, single-colour, reversed, horizontal, stacked, icon-only — all vector. Common failure: excessive detail and literal clip-art tools. Automated pipelines (Looka et al.) work by pairing curated font/icon/colour libraries with layout permutation + preference learning, then exporting a full brand kit ([Looka how-it-works](https://looka.com/logo-maker/how-it-works/), [generator comparison](https://aitoolclaw.com/articles/best-ai-logo-generators/)).

> **DESIGN LAWS for TITAN — Identity**
> 1. Default generated identity = **wordmark** (curated heavy sans/serif per trade voice) + optional abstract geometric glyph (never literal wrench/tooth clip-art). Badge template offered only when "established YYYY" exists.
> 2. Auto-generate the 6-variant lockup set (horiz/stacked/icon/reversed/mono/favicon) as SVG from one template; test legibility at 24px and 3m-viewing-distance simulation (≥7:1 internal contrast for the mark).
> 3. Logo colour = brand-700 step on light, brand-100 on dark — from the same OKLCH ramp, so identity and site can never clash.

## 5. Accessibility as Design (WCAG 2.2 AA + law)

Visual-design-relevant criteria: **2.5.8 Target Size ≥24×24 CSS px** (or equivalent spacing) for all interactive targets; **2.4.11 Focus Not Obscured (Minimum)** — focused element can't be fully hidden by sticky bars (⚠ interacts with sticky call bars); plus carried-over 1.4.3 text contrast 4.5:1 (3:1 large), **1.4.11 non-text contrast 3:1** (icons, input borders, focus rings, chart elements), 1.4.10 reflow @320px, 1.4.12 text spacing tolerance ([Level Access checklist](https://www.levelaccess.com/blog/wcag-2-2-aa-summary-and-checklist-for-website-owners/), [Vision Australia](https://visionaustralia.org/business-consulting/digital-access/blog/the-new-requirements-for-wcag-2-2), [getwcag](https://getwcag.com/en/wcag-2-2-guidelines)). Focus Appearance (2.4.13) is AAA but cheap to meet: 2px ring, 3:1.

Law: **EAA in force since 28 June 2025** (existing services grace to 2030), based on WCAG 2.1 AA (EN 301 549); applies to UK businesses selling into the EU; **microenterprise exemption** = <10 employees AND <€2M turnover for services — most TITAN clients are exempt from EAA but **not** from the UK Equality Act 2010 "reasonable adjustments" duty, and platform-level compliance is a selling point ([Ballyhoo](https://ballyhoo.co.uk/eea-european-accessibility-act-affects-uk-websites/), [Accessible.org](https://accessible.org/eaa-ecommerce-services-requirements/), [Business Disability Forum](https://businessdisabilityforum.org.uk/resource/the-european-accessibility-act-eaa-what-businesses-need-to-know-and-do/)).

> **DESIGN LAWS for TITAN — A11y Baked-In**
> 1. Ship WCAG **2.2 AA** platform-wide (exceeds current legal minimum; future-proofs 2030 EAA horizon; marketable). QA additionally with APCA Lc≥60 body / Lc≥75 small text.
> 2. Tokens enforce: all tap targets ≥ **44px** on mobile CTAs (2.5.8 is 24px floor; call-to-action deserves Apple/Google's 44/48); icon strokes & form borders ≥3:1; focus ring token `2px solid` + `2px offset`, contrast-checked against every surface at palette-generation time.
> 3. Sticky call bar must reserve scroll-padding so focused elements are never obscured (2.4.11).
> 4. Never encode meaning by colour alone (emergency vs standard service = icon + label + colour).

## 6. Named References (best-in-class)

1. **Studio EightyEight** (s8e8.com) — dental-only agency; their [best-dental list](https://s8e8.com/articles/best-dental-websites) (Arbor, Boulder Smiles, Graceful Grins, Summit Dental Studio) defines "clinical calm premium": airy layouts, muted/pastel+teal palettes, serif-accent typography.
2. **Hook Agency** — US roofing/trades niche leader; their showcased sites (Genz Ryan, Thelen Mechanical, Northface Construction, AJ Alberts Plumbing) codify the trust formula: rating badges + certification logos + family imagery + single warm CTA ([Hook](https://hookagency.com/blog/home-services-web-design/)).
3. **Adobe Spectrum + Leonardo** — the reference implementation of contrast-first automatic theming ([Spectrum adaptive color](https://medium.com/thinking-design/adaptive-color-in-spectrum-adobes-design-system-feeeec89a2c7)).
4. **Vodafone UK design system** — documented multi-brand Figma variable taxonomy at scale ([writeup](https://medium.com/vodafone-uk-design-experience/figma-variables-at-vodafone-uk-how-we-structured-taxonomy-for-a-complex-multi-brand-design-system-693b1b95675f)).
5. **Utopia.fyi** — fluid type/space methodology to adopt wholesale ([utopia.fyi](https://utopia.fyi/blog/designing-with-fluid-type-scales/)).
6. **Designsystemet (Norway)** — public design system already migrating to APCA-informed contrast; good precedent doc ([designsystemet.no](https://designsystemet.no/en/best-practices/accessibility/contrast)).
7. **University of Oregon brand photo-treatment system** — the cleanest public spec for tiered image treatments that unify mixed photography ([UO](https://communications.uoregon.edu/uo-brand/visual-identity/photo-color-treatments)).
8. **Fit Design LDN / Loud Local / Tradesite.build** — UK trade-site specialists worth mining for UK-vernacular trust patterns (Gas Safe/NICEIC placement, service-area copy) ([Fit Design](https://www.fitdesignldn.com/sectors/websites-for-tradesmen), [Loud Local](https://www.loudlocal.co.uk/knowledge-hub-and-blog/web-design-guide-for-trades-businesses)).

**Single biggest strategic takeaway:** the Google prototypicality research + the 2× conversion of low-element pages means TITAN's design system should compete on *refinement of the familiar* (typographic quality, disciplined OKLCH colour, unified image treatment) rather than layout novelty — which conveniently is exactly what a 1-renderer/N-brands token architecture is best at delivering.

---

# PART II — GOOGLE PAID ACQUISITION (Search Ads + Local Services Ads)

# GOOGLE PAID ACQUISITION FOR UK TRADES — RESEARCH FOR TITAN

---

## 1. LOCAL SERVICES ADS (LSAs) IN THE UK, 2025–26

### UK availability & categories
- UK LSAs are live nationwide for **Home Services** — Google's UK help page lists **30+ categories** including plumbers, electricians, cleaners, roofers, handymen ([Google support, UK screening page](https://support.google.com/localservices/answer/12174778?hl=en&co=GENIE.CountryCode%3DGB)). UK agency sources count **24–46 eligible business types**: plumber, electrician, carpenter, roofer, house cleaning, handyman, general contractor, HVAC/heating, pest control, tree service, appliance repair, flooring, landscaping, junk removal ([Big Gun Digital](https://biggundigital.co.uk/bulletin/your-2025-guide-to-google-local-services-ads-lsas/), [BeeFound](https://beefound.agency/google-local-service-ads-uk/)).
- **Professional Services are Greater London only**: solicitors (16 legal specialties) + estate agents, a pilot since Sept 12, 2023 ([Google blog](https://blog.google/products/ads-commerce/a-new-way-for-legal-firms-and-estate-agents-to-reach-more-customers/), [Google support](https://support.google.com/localservices/answer/12174778?hl=en&co=GENIE.CountryCode%3DGB)).
- **Not available in the UK**: dental/healthcare LSAs (US-only vertical), solar as a distinct category, driveways/paving as a distinct category (map to general contractor/landscaping where possible) ([PrimeLSA category guide](https://www.primelsa.ai/post/what-industry-categories-can-advertise-on-google-local-services)). For TITAN's 35 trades: ~2/3 of the trade list is LSA-eligible; dental, solar, garages, and solicitors-outside-London must rely on Search.

### Verification (Google Guaranteed → "Google Verified")
- **Oct 20, 2025: Google consolidated Google Guaranteed / Google Screened / License Verified into a single "Google Verified" badge and DISCONTINUED the money-back guarantee** ([Coalmarch](https://www.coalmarch.com/resources/blog/google-lsa-automated-credits-verified-badge-updates), [ALM Corp](https://almcorp.com/news/google-local-services-ads-requirements-july-2026/)). Policies rename to "Local Services Ads requirements" on July 6, 2026 (no new restrictions).
- UK checks: business entity checks, **Public Liability Insurance** (Professional Indemnity for legal/estate), licence verification (e.g. Gas Safe), **verified Google Business Profile mandatory** (enforced Nov 2024), background checks on owners/field workers (historically CRB/DBS via **Onfido** in the UK) ([Google support](https://support.google.com/localservices/answer/12174778?hl=en&co=GENIE.CountryCode%3DGB), [Online Ownership](https://onlineownership.com/google-local-service-ads-in-the-uk-what-you-need-to-know/)). **Verification takes 3–4 weeks**; licence + insurance must be **re-verified annually** or the badge is auto-revoked ([ALM Corp](https://almcorp.com/news/google-local-services-ads-requirements-july-2026/)).

### Pricing (pay-per-lead)
- No keyword bidding — Google sets lead price by trade/market/competition; charged only on call/message contact. US benchmark from $6.72M spend across 888 contractors: **electrical $39, HVAC $51, plumbing $57, drain $59, water heater $71, blended $53 CPL; ~6–7% of spend comes back as credits** ([SearchLight Digital](https://searchlightdigital.io/google-local-service-ads-cost-per-lead/)).
- UK figures: **£10–£30/lead typical**, minimum monthly platform fee ~£40 ([BeeFound](https://beefound.agency/google-local-service-ads-uk/)); a published UK client did **£738 spend → 102 leads (95 charged) = £7.77/lead** ([Big Gun Digital](https://biggundigital.co.uk/bulletin/your-2025-guide-to-google-local-services-ads-lsas/)). LSAs are typically materially cheaper per lead than Search for emergency trades.

### Disputes → automated credits (big change)
- Mid-2024: manual disputes replaced by **automated credit system** — Google reviews leads within 72h, credits within 30 days. **"Job type not serviced" and "geo not serviced" are NO LONGER credited** — misconfigured job types/service areas now cost real money. Mitigation: configure job types and postcode service areas tightly, and submit the **Lead Feedback Survey on every lead** to train Google's classifier ([Coalmarch](https://www.coalmarch.com/resources/blog/google-lsa-automated-credits-verified-badge-updates)).

### Ranking factors (Google's own list)
Bid amount; bid mode (**Maximize Leads recommended** — Google says those using it "typically get more leads"); lead-conversion likelihood; **responsiveness ("missed calls may negatively affect your responsiveness")**; search context; business relevance/bio; **enabling message + booking leads (extends reach "during nights and weekends")**; profile quality = **rating, number of reviews, average response time, photo quality, verification checks completed** ([Google support: ad rankings](https://support.google.com/localservices/answer/7527305?hl=en)).

### LSA vs Search
LSAs capture **13.8% of all clicks** when present; LSA position 1 gets 2x+ the clicks of lower slots. LSAs win for emergency trades / tight service areas / strong review counts; Search wins for service-level precision, margin control, seasonal pushes and expansion. The right answer is both ([Hook Agency](https://hookagency.com/blog/google-ads-vs-local-service-ads-home-services/)).

### Managing LSAs at scale (agency mechanics)
- **Bulk account creation**: manager (MCC) accounts can upload **up to 100 providers per CSV** with automated validation ([Google support](https://support.google.com/localservices/answer/11348908?hl=en)).
- **Google Ads API**: LSA campaigns are now in Google Ads. Mutable: campaign status, budget amount, bidding (**ManualCpa with per-category bids, or MaximizeConversions**), ad schedule, geo targeting, service types (LocalServiceIdInfo). Read-only: **LocalServicesLead** (contact, status, charge), LeadConversation (call recordings/messages), VerificationArtifact (licence/insurance status), Employee. Lead feedback submittable via **ProvideLeadFeedback()**. You cannot create/remove LSA campaigns via API — onboarding is CSV/UI ([Google Ads API docs](https://developers.google.com/google-ads/api/docs/campaigns/local-service-campaigns)).

**LSA LAWS for TITAN**
1. Build a **document-collection pipeline** (public liability insurance cert, Gas Safe/NICEIC/licence numbers, owner ID for background check) into onboarding; expect 3–4 weeks to badge — run Search Ads as the bridge.
2. **Missed calls are a ranking penalty**: bundle call answering (human or AI) as part of the product; enable message + booking leads for night/weekend capture.
3. TITAN's review-generation engine is an LSA ranking lever (rating, count, response time all rank).
4. Configure job types + postcodes surgically at setup — wrong-area/wrong-job leads are no longer refunded.
5. Automate **ProvideLeadFeedback on 100% of leads** via API; monitor the ~6–7% credit rate as a health metric.
6. Default bid mode Maximize Leads; switch to ManualCpa per job category when a client needs CPL ceilings.
7. Run TITAN client accounts under one MCC; use LocalServicesLead API as the lead-sync source into TITAN's CRM.

---

## 2. GOOGLE SEARCH ADS FOR TRADES

### Campaign structure 2025–26: SKAGs are dead
- "SKAGs are largely a thing of the past" — micro-segmentation starves Smart Bidding; algorithms need **~30–50 conversions/campaign/month** to exit learning. Use **3–5 tightly themed ad groups per campaign**, consolidate match types, control with negatives ([Search Engine Land](https://searchengineland.com/how-campaign-structure-shapes-google-ads-performance-481332)).
- Home-services blueprint: **one campaign per service line** (boiler install ≠ boiler repair ≠ emergency callout — different urgency, ticket, CPL tolerance), 5–15 keywords per ad group, **dedicated landing page per ad group**, exact match as anchor + phrase for reach; broad match only once negatives + conversion volume exist (broad on trade terms triggers DIY/jobs/training queries at full CPC). Bidding ladder: **Max Clicks (<30 days) → tCPA/Max Conversions (30–90 days) → value-based with CRM offline import** ([Black Propeller](https://blackpropeller.com/blog/paid-search-home-services-strategy/)).

### UK CPC/CPL benchmarks
| Trade / vertical | CPC (UK) | CPL (UK) | Source |
|---|---|---|---|
| Emergency plumber | £4–£12; "emergency plumber near me" £9.52–£22 | £25–£60 | [SMC](https://wearesmc.co.uk/blog/google-ads-costs-for-plumbers/), [Onebase Media](https://onebasemedia.co.uk/how-much-do-google-ads-cost/), [SwiftLead](https://www.swiftlead.co.uk/blog/good-cost-per-lead-trades) |
| General plumber | £2–£6 ("plumber" ~£5, up to £14) | £20–£45 | same |
| Boiler/heating engineer | £3–£8 | £30–£65 (job value £200–£2,500) | SMC, SwiftLead |
| Electrician | £2.49–£8.23 | £20–£50 | Onebase, SwiftLead |
| Roofer | — | £35–£80 (jobs £500–£5,000+) | SwiftLead |
| Driveways/paving | — | £25–£60 (jobs £1,500–£8,000) | SwiftLead |
| Landscaper | — | £15–£40 | SwiftLead |
| Builder (extensions) | — | £40–£100 | SwiftLead |
| Locksmith | — | £20–£50 | SwiftLead |
| Cleaning (carpet/window) | — | £8–£25 | SwiftLead |
| Legal (conveyancing/solicitor) | **£8.25 avg** | high, long cycle | [Whito](https://whito.co.uk/research/uk-ppc-costs/) |
| Dental/healthcare | £2.80 avg | — | Whito |
| Home services blended | £1.50–£5.50 (avg £3.20) | — | Whito |

US 2025 sanity-check (LocaliQ, home services search): avg CPC $7.85, CVR 7.33%, **CPL $90.92**; roofing CPL $228 (CVR just 3.7%), plumbing $129, electricians $94, cleaning $47, handyman $54. CPCs rose for 75% of firms YoY; CVRs fell ~15% ([LocaliQ benchmarks](https://localiq.com/blog/home-services-search-advertising-benchmarks/)). **Rule: CPL should be ≤10–15% of average job value, assuming ~1-in-3 lead→job** ([SwiftLead](https://www.swiftlead.co.uk/blog/good-cost-per-lead-trades)).

### Call ads: SUNSET — plan around it
Announced Oct 3, 2025: **new call-ad creation blocked from Feb 2026; existing call ads stop serving Feb 2027**. Replacement = RSAs with call assets. Every ad group needs ≥1 RSA with call assets before Feb 2026; verify call conversion tracking survives migration ([PPC Land](https://ppc.land/google-ends-call-ads-in-february-2026-shifts-advertisers-to-rsa-format/), [Search Engine Land](https://searchengineland.com/google-to-phase-out-call-only-ads-by-2027-462983), [Google help](https://support.google.com/google-ads/answer/16619010?hl=en)).

### Assets & trust signals
Call asset + location asset (linked GBP) + sitelinks (per-service) + structured snippets + price assets. UK-specific: put **Gas Safe, NICEIC, NAPIT, TrustMark** in headlines/snippets — improves CTR and Quality Score ([Aimpro](https://aimpro.co.uk/google-ads-for-tradespeople-uk/)). Phone calls are worth **2–3x** web form fills for trades (Aimpro).

### Negative keywords (the trades waste-filter)
Five account-level categories: **jobs/careers** (jobs, hiring, salary, apprenticeship), **DIY/how-to** (how to, step by step, tutorial), **education** (course, training, certification), **budget signals** (free, cheap — test carefully for genuinely price-led trades), **research platforms** (youtube, reddit, forum). Plus campaign-level trade negatives: product/parts terms ("pipe", "Drano" → UK: "screwfix", "toolstation", "wickes", boiler brand + "manual"/"error code" queries for heating). Weekly search-term review for first 90 days, then monthly; mature accounts carry **150–400 negatives** ([Volado Labs](https://voladolabs.ai/the-complete-guide-to-google-ads-negative-keywords-for-home-services/), [Black Propeller](https://blackpropeller.com/blog/paid-search-home-services-strategy/)).

### Dayparting & seasonality
- Emergency trades (plumber, locksmith, drainage, electrician, boiler breakdown): run **24/7 only if calls get answered 24/7** — nights/weekends are the highest-value, lowest-competition auctions, but an unanswered £15 click is pure waste. Non-emergency/quoted trades (driveways, landscaping, kitchens): restrict to answerable hours, use forms overnight.
- Google **seasonality adjustments are for short events only (1–7 days, max 14)** — a cold-snap boiler surge, post-storm roofing spike — not whole seasons; Smart Bidding self-adapts to gradual seasonal shifts ([Google support](https://support.google.com/google-ads/answer/10369906?hl=en), [Grow My Ads](https://growmyads.com/seasonality-adjustments/)). Seasonal budget (not bid) planning: heating Oct–Feb, roofing post-storm + spring, driveways/landscaping Mar–Sep, solar spring.

**SEARCH LAWS for TITAN**
1. Template per trade: **1 campaign per service line, 3–5 theme ad groups, exact+phrase, dedicated LP per ad group**. Never SKAGs; never broad match at launch.
2. Bidding ladder codified: Max Clicks → tCPA at ~30 conversions → value-based once offline import runs. Small budgets: consolidate campaigns to hit 30–50 conv/month.
3. Ship a **master UK trades negative list (150–400 terms)** applied account-level to every client at day 0; auto-surface search-term anomalies weekly.
4. Build only RSAs + call assets (call ads die Feb 2026/2027).
5. Certification badges (Gas Safe/NICEIC/TrustMark) hardcoded into ad copy templates per trade.
6. Emergency trades: 24/7 schedule gated on answering capability; quoted trades: dayparted. Seasonality adjustments only for ≤14-day shocks.
7. Target CPL guardrail per trade = 10–15% of that trade's average job value.

---

## 3. PERFORMANCE MAX FOR LOCAL LEAD-GEN

- **The CPL mirage is documented**: one UK analysis showed PMax at £12/lead vs £28 on Search — but PMax leads converted to revenue at **0.3% vs 4.7%**. PMax "underperforms with budgets under £2,000/month" ([Trident](https://wearetrident.co.uk/blogs/performance-max-for-lead-generation-what-actually-works/)). Black Propeller flatly does **not recommend PMax for local home services** (diffuse targeting, loss of keyword control) ([Black Propeller](https://blackpropeller.com/blog/paid-search-home-services-strategy/)).
- Failure modes: loose audience signals (students/job-seekers/hobbyists), weak search themes (branded + informational bleed), missing negatives, generic asset groups (Trident).
- Guardrails if used: **offline conversion tracking ("the single most impactful change")**, customer lists of 1,000+ real revenue customers as signals, **account-level negative keywords (now supported; up to 10,000/campaign since 2025** — [Groas guide](https://groas.ai/post/performance-max-negative-keywords-2025-complete-guide-to-the-10-000-keyword-limit)), **brand exclusions**, URL expansion restricted to converting LPs, asset group per service line, form anti-spam (CAPTCHA, honeypot, freemail/disposable-domain blocking, qualifying questions). Ineffective: switching bid strategy, adding assets, raising budget ([Search Engine Land](https://searchengineland.com/how-to-reduce-low-quality-leads-from-performance-max-campaigns-468687)).

**PMAX LAWS for TITAN**
1. **Default = no PMax** for trade clients. Sequence: LSA + Search → exhaust impression share → only then test PMax.
2. Hard gates before any PMax launch: offline conversion import live, spend >£2k/month, brand exclusions on, negative lists applied, URL expansion off.
3. Judge PMax on **revenue-qualified CPL from the CRM, never platform CPL**.

---

## 4. LANDING PAGE + TRACKING DISCIPLINE

- **Call tracking**: Dynamic Number Insertion ties each call to the visitor's GCLID/keyword/session; this is what makes call-heavy trades measurable ([WhatConverts](https://www.whatconverts.com/blog/google-ads-offline-conversion-tracking/)). Google's native call reporting (forwarding numbers) covers ad-clicks only; DNI covers the site. On GBP, use a tracking number as "primary" with the real number as "secondary" to preserve NAP consistency ([Amplocal](https://amplocal.io/call-tracking-local-businesses-google-maps-ads-organic/), [Google help: measure calls](https://support.google.com/google-ads/answer/6197479?hl=en-GB)).
- **Offline conversion import (OCI)**: auto-tagging on → capture GCLID with every lead → mark qualified/quoted/won in CRM → **upload daily** ("upload conversions as soon as possible"); use value rules so Smart Bidding optimizes for jobs, not form fills — otherwise "automated bidding is optimizing for leads that fill out forms rather than leads that turn into high-value customers" ([WhatConverts](https://www.whatconverts.com/blog/google-ads-offline-conversion-tracking/), [Google OCI docs](https://support.google.com/google-ads/answer/2998031?hl=en)). Enhanced Conversions for Leads (hashed email/phone) is the GCLID-loss backstop.
- **Consent Mode v2 is mandatory for UK traffic** (deadline was March 6, 2024); Google began **disabling ad features for non-compliant accounts in July 2025**. Four signals: analytics_storage, ad_storage, ad_user_data, ad_personalization. Without it: no EEA/UK conversion tracking, remarketing lists don't populate. **Advanced mode** (tags fire with denied defaults, cookieless pings) enables conversion modelling recovering up to ~70% of lost conversions, subject to traffic thresholds ([Fresh Egg](https://www.freshegg.co.uk/blog/consent-mode-v2-what-you-need-to-know/), [Didomi](https://www.didomi.io/blog/google-consent-mode-v2-what-you-need-to-know)). ICO/PECR requires prior consent for non-essential cookies and the ICO has been actively enforcing cookie-banner compliance ([Usercentrics ICO guide](https://usercentrics.com/knowledge-hub/ico-pecr-cookie-guidance/)).

**TRACKING LAWS for TITAN**
1. Every TITAN site ships with: CMP + Consent Mode v2 (advanced mode), DNI call tracking, GCLID capture on all forms, GBP-safe number setup. Non-negotiable platform defaults.
2. **Daily OCI is the moat**: because TITAN owns the website + CRM + ads, the qualified/quoted/won feedback loop into Smart Bidding is the structural advantage single-channel agencies can't match.
3. Score calls: duration threshold (e.g. 30–60s+) = qualified conversion; import call outcomes, not raw calls.
4. Landing pages: one per service line, service-area confirmation copy (named towns/postcodes), click-to-call primary CTA for emergency trades, short quote form for considered trades.

---

## 5. BUDGET STRATEGY FOR SMALL TRADES

- UK minimums: **£500/month is the bare floor; £750–£1,500 typical; £2,000–£3,000+ for wide coverage** ([SMC](https://wearesmc.co.uk/blog/google-ads-costs-for-plumbers/)). Aimpro: **emergency trades £600–£1,000/month** starting budget in mid-size towns; **high-ticket considered trades (bathrooms, extensions, rewires) £1,000–£1,500/month** minimum ([Aimpro](https://aimpro.co.uk/google-ads-for-tradespeople-uk/)); Whito: £500–£1,000/month to test viability ([Whito](https://whito.co.uk/research/uk-ppc-costs/)).
- Budget math: at ~£5 CPC and 10–20% LP conversion, £10/day ≈ 1–2 leads/day ([Onebase Media](https://onebasemedia.co.uk/how-much-do-google-ads-cost/)). High-CPC verticals (legal £8.25, emergency plumbing up to £22/click) need proportionally more.
- **Geo: 10–15 mile radius around base** for local trades ([Aimpro](https://aimpro.co.uk/google-ads-for-tradespeople-uk/)); use "presence in" location setting; LSAs by postcode list covering the full catchment ([Big Gun Digital](https://biggundigital.co.uk/bulletin/your-2025-guide-to-google-local-services-ads-lsas/)).
- Schedule: 24/7 only for emergency trades with answering coverage (see §2).

**BUDGET LAWS for TITAN**
1. Trade-tiered minimums: emergency (plumbing/drainage/locksmith/electrical) **£600–£1,000/mo**; considered home improvement (roofing/driveways/landscaping) **£1,000–£1,500/mo**; professional (dental/solicitors/solar) **£1,500–£2,000+/mo**. Refuse sub-£500 spend — it can't buy enough clicks to learn.
2. Sanity-check budget vs math at onboarding: budget ÷ trade CPC must yield ≥150–200 clicks/month, and implied CPL must clear the 10–15%-of-job-value rule.
3. Default 12-mile radius; expand ring-by-ring only after impression share >80% in the core.
4. Split budget LSA-first for emergency trades (cheaper, pay-per-lead), Search-first for considered/professional trades and any LSA-ineligible trade (dental, solar, garages, non-London solicitors).

---

## 6. WHAT THE BEST TRADE-PPC OPERATORS PUBLISH (NUMBERS)

- **Aimpro (UK)**: West Midlands plumbing firm restructure took CPL **£117 → £34** — the delta came from service-line campaign splits + separate call/form tracking ([Aimpro](https://aimpro.co.uk/google-ads-for-tradespeople-uk/)).
- **SMC (UK)**: Videtta Heating & Plumbing at **£22 CPL**; the same article shows LP conversion rate is the biggest lever — **3% industry-average site vs 18.7% optimised site** = ~6x lead output per pound ([SMC](https://wearesmc.co.uk/blog/google-ads-costs-for-plumbers/)).
- **Big Gun Digital (UK, LSA)**: £738.29 → 102 leads = **£7.77/lead**, live within 48 hours of badge approval ([Big Gun Digital](https://biggundigital.co.uk/bulletin/your-2025-guide-to-google-local-services-ads-lsas/)).
- **SearchLight Digital (US, LSA)**: $6.72M across 888 contractor accounts — CPL $39–$71 by trade, 6–7% auto-credit rate ([SearchLight](https://searchlightdigital.io/google-local-service-ads-cost-per-lead/)).
- **SwiftLead (UK)**: full CPL-by-trade table (§2) + the two rules TITAN should adopt: CPL ≤10–15% of average job value; assume ~1-in-3 lead→job ([SwiftLead](https://www.swiftlead.co.uk/blog/good-cost-per-lead-trades)).
- **WhatConverts (roofing)**: argues roofing PPC benchmarks are meaningless without lead-quality classification — repair vs re-roof leads differ 10x in value under one "roofing" CPL ([WhatConverts](https://www.whatconverts.com/blog/why-roofing-ppc-benchmarks-break-down-without-lead-quality-data/)).
- Common playbook across Hook Agency, Black Propeller, Onebase, GrowthLine: **LSA + Search together, service-line campaigns, dedicated landing pages, call tracking + CRM feedback, review-generation as a paid-media multiplier** — i.e., exactly the integrated stack TITAN is building; the published wins all come from owning the page + phone + feedback loop, not from ad-platform tricks.

### Per-trade posture summary
- **Emergency (plumbing, drainage, locksmith, electrics, boiler breakdown)**: LSA-first + Search 24/7 with call assets; CPL £20–£60; responsiveness/answer-rate is the #1 lever.
- **Considered home improvement (roofing, driveways, landscaping, extensions)**: Search-first (LSA supplementary), quote-form LPs, longer windows, CPL £25–£100 justified by £1.5k–£50k jobs; lead-quality scoring via OCI essential (roofing CVR is the worst in home services at ~3.7%).
- **Professional/regulated (dental, solicitors, solar)**: no UK LSA (except London legal/estate) → Search-only; highest CPCs (legal £8.25 avg); longer nurture, forms > calls, enhanced conversions for leads and strict negatives (job-seekers, students, "free advice").

Sources: [Google LSA UK screening](https://support.google.com/localservices/answer/12174778?hl=en&co=GENIE.CountryCode%3DGB) · [Google LSA ad rankings](https://support.google.com/localservices/answer/7527305?hl=en) · [Google blog — London legal/estate LSAs](https://blog.google/products/ads-commerce/a-new-way-for-legal-firms-and-estate-agents-to-reach-more-customers/) · [Coalmarch LSA updates](https://www.coalmarch.com/resources/blog/google-lsa-automated-credits-verified-badge-updates) · [ALM Corp July 2026](https://almcorp.com/news/google-local-services-ads-requirements-july-2026/) · [SearchLight LSA CPL](https://searchlightdigital.io/google-local-service-ads-cost-per-lead/) · [Big Gun Digital](https://biggundigital.co.uk/bulletin/your-2025-guide-to-google-local-services-ads-lsas/) · [BeeFound](https://beefound.agency/google-local-service-ads-uk/) · [Online Ownership](https://onlineownership.com/google-local-service-ads-in-the-uk-what-you-need-to-know/) · [PrimeLSA](https://www.primelsa.ai/post/what-industry-categories-can-advertise-on-google-local-services) · [Hook Agency](https://hookagency.com/blog/google-ads-vs-local-service-ads-home-services/) · [LSA bulk creation](https://support.google.com/localservices/answer/11348908?hl=en) · [Google Ads API LSA](https://developers.google.com/google-ads/api/docs/campaigns/local-service-campaigns) · [Search Engine Land — structure](https://searchengineland.com/how-campaign-structure-shapes-google-ads-performance-481332) · [Black Propeller](https://blackpropeller.com/blog/paid-search-home-services-strategy/) · [LocaliQ benchmarks](https://localiq.com/blog/home-services-search-advertising-benchmarks/) · [Whito UK PPC costs](https://whito.co.uk/research/uk-ppc-costs/) · [Onebase Media](https://onebasemedia.co.uk/how-much-do-google-ads-cost/) · [SMC plumber costs](https://wearesmc.co.uk/blog/google-ads-costs-for-plumbers/) · [SwiftLead CPL](https://www.swiftlead.co.uk/blog/good-cost-per-lead-trades) · [Aimpro](https://aimpro.co.uk/google-ads-for-tradespeople-uk/) · [PPC Land — call ads end](https://ppc.land/google-ends-call-ads-in-february-2026-shifts-advertisers-to-rsa-format/) · [SEL — call-only phase-out](https://searchengineland.com/google-to-phase-out-call-only-ads-by-2027-462983) · [Volado Labs negatives](https://voladolabs.ai/the-complete-guide-to-google-ads-negative-keywords-for-home-services/) · [Trident PMax](https://wearetrident.co.uk/blogs/performance-max-for-lead-generation-what-actually-works/) · [SEL — PMax lead quality](https://searchengineland.com/how-to-reduce-low-quality-leads-from-performance-max-campaigns-468687) · [Groas PMax negatives](https://groas.ai/post/performance-max-negative-keywords-2025-complete-guide-to-the-10-000-keyword-limit) · [WhatConverts OCI](https://www.whatconverts.com/blog/google-ads-offline-conversion-tracking/) · [Amplocal call tracking](https://amplocal.io/call-tracking-local-businesses-google-maps-ads-organic/) · [Fresh Egg Consent Mode v2](https://www.freshegg.co.uk/blog/consent-mode-v2-what-you-need-to-know/) · [Usercentrics ICO/PECR](https://usercentrics.com/knowledge-hub/ico-pecr-cookie-guidance/) · [Google seasonality adjustments](https://support.google.com/google-ads/answer/10369906?hl=en) · [WhatConverts roofing benchmarks](https://www.whatconverts.com/blog/why-roofing-ppc-benchmarks-break-down-without-lead-quality-data/)

---

# PART III — SEO, GEO, REVIEWS & GOOGLE BUSINESS PROFILE

# TITAN Research Layer 2: GEO/AI Search, Local Organic Depth, Content, Reviews Engine, GBP Advanced

---

## 1. GEO / AI Search Optimization (2025–26)

### What the actual studies show

**Google's official position:** There is no special GEO trick. Google's AI features doc says ranking in search is the entry ticket and "no special schema.org structured data" or AI-specific files are needed ([Google Search Central AI features doc](https://developers.google.com/search/docs/appearance/ai-features), [Partoo summary](https://www.partoo.co/en/blog/google-official-guide-appearing-ai-overviews/)).

**But rank alone is weakening as a predictor.** Ahrefs (billions of data points): AI Overview citations from top-10 pages fell from **76% to 38%** between July 2025 and March 2026; the remainder split ~31% positions 11–100 and ~31% beyond 100. Cause: **query fan-out** — Google splits the query into sub-queries and cites pages appearing across many sub-query results. Implication: covering a topic from many angles beats holding one #1 ranking ([SEJ on the Ahrefs data](https://www.searchenginejournal.com/google-ai-overview-citations-from-top-ranking-pages-drop-sharply/568637/)). Earlier baselines: seoClarity found ~99% AIO/organic overlap in 2024 ([Search Engine Land](https://searchengineland.com/google-ai-overviews-organic-results-overlap-99-445374), [seoClarity](https://www.seoclarity.net/research/aio-rankings-overlap)); BrightEdge now ~54% ([BrightEdge](https://www.brightedge.com/resources/weekly-ai-search-insights/rank-overlap-after-16-months-of-aio)). Direction of travel is clear: rank correlation is decaying.

**Brand mentions are the #1 measurable GEO lever.** Ahrefs' 75,000-brand correlation study: **branded web mentions correlate 0.664** with AI Overview visibility vs backlinks at just 0.218 (branded anchors 0.527, branded search volume 0.392, DR 0.326). Top-quartile brands by web mentions averaged 169 AIO citations — 10x the next tier; bottom 50% are essentially invisible ([Ahrefs study](https://ahrefs.com/blog/ai-overview-brand-correlation/), [SEJ coverage](https://www.searchenginejournal.com/ahrefs-data-shows-brand-mentions-boost-ai-search-rankings/559938/)).

**Local-intent queries mostly DON'T trigger AI Overviews — informational ones do.** Whitespark's local AIO study: AIOs appear on only **15% of local-intent queries** ("plumbers in Phoenix" — local pack shows 93% of the time) but **92% of informational** ("how much do lawyers charge?") and **97% of hybrid** queries. For plumber queries in Houston, **60% of AIO citations were third-party publishers** (Reddit, Yelp, Thumbtack, Indeed) and 40% individual business sites. CTR drops ~34.5% when an AIO appears ([Whitespark case study](https://whitespark.ca/blog/case-study-the-prevalence-of-ai-overviews-in-local-search/)).

**ChatGPT local = Bing Places + review sites + listicles.** Whitespark reverse-engineered ChatGPT local recommendations via Bing Places (its local backend): the review sources that matter most are **Facebook (dominant in 10/18 categories), Yelp, Tripadvisor**, plus category-specific players (Porch for garage doors, Angi, Yellowpages) ([Whitespark research](https://whitespark.ca/blog/want-to-rank-in-chatgpt-focus-on-these-review-sites-new-research/)). US-only study — UK equivalents are Checkatrade, Trustpilot, Which? Trusted Traders, TrustATrader, MyBuilder, Yell. TSEG confirms the Bing dependency mechanism ([TSEG](https://www.tseg.com/how-chatgpt-ranks-local-businesses-using-bing-and-what-that-means-for-your-firms-clients/)).

**Citation sources are volatile and platform-specific.** Semrush tracked 230k prompts / 100M+ citations over 13 weeks: Reddit went from ~60% of ChatGPT responses to ~10% in six weeks (after Google killed the num=100 parameter); Wikipedia 55%→<20% on ChatGPT but only 2% on Google AI Mode; AI Mode favours Google-owned properties; Perplexity leans Reddit/LinkedIn ([Semrush most-cited domains study](https://www.semrush.com/blog/most-cited-domains-ai/)). Don't build a strategy on any single third-party platform.

**llms.txt is hype.** John Mueller: no AI system uses it; benefit "purely speculative"; Google confirms no implementation ([SEJ](https://www.searchenginejournal.com/google-says-llms-txt-is-purely-speculative-for-now/577576/), [Search Engine Roundtable](https://www.seroundtable.com/google-does-not-endorse-llms-txt-40789.html)). Harmless to add, zero evidenced return.

**Schema does NOT drive AI citations.** Daniel Cheung's systematic review of 10 studies: every study claiming a positive schema→citation effect lacked controls; every controlled study (Ahrefs: citations *fell* 4.6% for pages adding JSON-LD vs matched controls; SearchAtlas; Otterly's planted-fact test; Fischman 2026) found null or slightly negative. Retrieval position dominates: position 1 gets cited 43–58%, position 7+ drops to 5–14% ([evidence review](https://www.danielkcheung.com/musings/schema-ai-citations-evidence-review)). Schema is still worth doing for Google rich-result eligibility and entity disambiguation — just don't sell it as a GEO lever.

**Whitespark 2026 ranking factors — AI visibility pillar:** on-page signals 24%, review signals 16%, **citation signals 13%** (citations re-entered the top five for answer-engine visibility, after years of decline for pack rankings) ([Whitespark 2026 report](https://whitespark.ca/local-search-ranking-factors/), [Advice Local summary](https://www.advicelocal.com/blog/2026-local-search-ranking-factors-maps-organic-ai/)).

### GEO LAWS for TITAN
1. **AI visibility for a local trade = (a) rank organically, (b) be present on the review sites/directories LLMs retrieve, (c) accumulate branded web mentions.** In that order of certainty. There is no fourth secret.
2. **Win the informational/cost query layer** — that's where AIOs fire 92–97% of the time for trades. Cost guides and "is X worth it" content are TITAN's AIO citation surface; the GBP/local pack still owns "near me."
3. **Every TITAN client needs the UK directory footprint LLMs quote:** Checkatrade, Trustpilot, Which? Trusted Traders, TrustATrader, MyBuilder, Yell, Facebook — with reviews on them, not bare listings. Bing Places is mandatory (ChatGPT backend) — this is the cheapest GEO win nobody does.
4. **Get clients INTO "best X in [town]" listicles** (local press, bloggers, directory best-of pages) — fan-out queries repeatedly surface these, and they're the third-party 60% of local AIO citations.
5. **Ship llms.txt if trivial, promise nothing for it. Ship schema for rich results/entities, promise nothing for AI citations.** Put the saved effort into mentions and rankings.
6. **Build the brand entity:** consistent name everywhere, an about page that states who/where/what plainly, Wikipedia-grade third-party corroboration where possible, branded search demand (signage, vans, ads → people googling the name). Branded search volume correlates 0.392 with AI visibility.
7. **Publish first-party numbers as citation bait** ("average cost of 2,400 boiler installs we did in Kent, 2025") — LLMs and journalists cite unique statistics; this doubles as PR for mention-building. (Mechanism inferred from fan-out + mention data, not a controlled study — position it that way.)

---

## 2. Local Organic Beyond Basics

### Findings

**Whitespark 2026 weights:** Local pack — GBP signals 32%, review signals 20%, on-page 15%. Local organic — on-page 33%, links 24%, behavioral 10% ([Advice Local](https://www.advicelocal.com/blog/2026-local-search-ranking-factors-maps-organic-ai/)).

**Review velocity/recency is real and strong.** Sterling Sky × Places Scout analyzed **8,186 businesses in 200 cities** (plumbing, HVAC, locksmith, garage doors, lawn care): monthly review velocity mattered more than lifetime count. A client getting 60+ reviews/month dominated; when reviews stopped for **18 days rankings "fell off a cliff."** Reviews with text beat star-only ratings; text-less 1-star reviews don't even display in Maps ([Sterling Sky near-me study](https://www.sterlingsky.ca/what-gets-you-ranking-for-near-me-2025/)). Consumer side: 22% of consumers only read reviews from the last two weeks, 26% last month ([BrightLocal review stats](https://www.brightlocal.com/resources/online-reviews-statistics/)). Count thresholds exist but plateau: crossing ~10 reviews gives a measurable Maps bump; gains flatten after ~16–31 ([Sterling Sky reviews case study](https://www.sterlingsky.ca/number-of-reviews-impact-ranking/)).

**Same study, contrarian finding on SABs:** businesses **showing** their address outranked those hiding it — despite Google telling service-area businesses to hide it. (Handle with care vs suspension policy — see §5.)

**GBP posts: no ranking effect.** Controlled 9-week/441-keyword Sterling Sky test — zero ranking movement; average post CTR is ~0.5%. Posts are a conversion/justification tool only ([Sterling Sky](https://www.sterlingsky.ca/do-google-posts-impact-ranking/)).

**Photo geotagging is a confirmed myth.** Whitespark and Sterling Sky both tested; Google strips EXIF anyway ([Whitespark](https://whitespark.ca/blog/geotagging-photos-is-a-local-seo-myth/), [Search Engine Land](https://searchengineland.com/geotagging-photos-google-business-profile-rank-453525)). Photo *quantity* had negligible ranking effect in trades (garage doors) though it helps in visual categories; photos do lift engagement/leads ([Sterling Sky images study](https://www.sterlingsky.ca/do-images-impact-ranking-on-google/)).

**GBP services DO impact ranking** (2022 retest, effects within 24–72h, predefined services > custom) ([Sterling Sky services test](https://www.sterlingsky.ca/services-in-google-business-profile-impact-ranking/)).

**Justifications** ("Provides: leak repair", review snippets, "Their website mentions...") are won by: target keywords appearing in customer review text, in the GBP services list, and on the linked landing page; posts justifications from recent posts ([Dalton Luka guide](https://daltonluka.com/blog/local-justifications), [Birdeye](https://birdeye.com/blog/google-local-justifications/)).

**GBP Q&A:** no evidence of ranking impact; value is pre-sale objection handling and controlling the answer space (anyone can answer otherwise). Seed 5–10 real questions (pricing, coverage area, emergency availability, guarantees) and answer from the owner account ([Reputation.com best practices](https://reputation.com/resources/articles/google-qa-best-practices)).

**Citations 2026:** consensus = a one-time hygiene layer with fast diminishing returns for pack rankings, **but revalued as an AI-visibility signal (13% weight, top-5 factor for answer engines)** ([Whitespark 2026](https://whitespark.ca/local-search-ranking-factors/), [BrightLocal local link building](https://www.brightlocal.com/learn/local-seo/local-search-optimization/local-link-building/)). Core set + trade-specific + AI-quoted platforms; no monthly "citation building" retainers.

**Local links for trades:** links are 24% of local organic. Proven UK-workable inventory: grassroots sports club sponsorships (club sites link sponsors), charity event sponsorships, Chamber of Commerce membership pages, supplier/manufacturer "approved installer" pages (Worcester Bosch, Vaillant, GAF/Marley for roofers, brand "find an installer" tools), trade association member directories, local press quotes ([Link Building Journal — sponsorships](https://linkbuildingjournal.co.uk/sponsorship-link-building/), [construction link building](https://linkbuildingjournal.co.uk/construction-link-building/), [BrightLocal tactics](https://www.brightlocal.com/learn/local-seo/local-search-optimization/local-link-building/)).

### LAWS for TITAN
1. **Velocity beats totals: engineer a steady drip (target 4–15+/month by trade competitiveness), never a burst then silence.** An 18-day gap is measurable. This makes TITAN's review engine a *ranking* product, not just reputation.
2. **Push keywords into review text** (ask "mention the service and town if you're happy to") — powers both rankings and review justifications. Never script the review itself (see §4 CMA).
3. **Fill GBP services exhaustively, predefined first, per trade taxonomy** — one of the few GBP fields with tested ranking impact. Bake a 35-trade services matrix into onboarding.
4. **Posts = weekly conversion/justification asset, sold honestly** (offers, recent jobs). Never claim ranking benefit. Same for Q&A: seed the top 8 buyer questions at onboarding.
5. **Kill geotagging from the playbook forever.** Real photos of real jobs, uploaded regularly, for engagement/Street-cred — not rank.
6. **Citations: one-time core stack + UK trade directories + Bing Places, then stop.** Reframe the line item as "AI answer-engine presence," which is where the 2026 evidence says it now pays.
7. **Standard link play per client per quarter:** one sponsorship (sports club/charity), one supplier/accreditation link (Gas Safe register presence, manufacturer installer pages), one chamber/BID membership, one local press mention. Cheap, repeatable, defensible.

---

## 3. Content Strategy for Trades (post-HCU)

### Findings

- **Cost/price content is the AIO battleground:** informational cost queries trigger AI Overviews 92% of the time ([Whitespark](https://whitespark.ca/blog/case-study-the-prevalence-of-ai-overviews-in-local-search/)) — the cost guide now has two jobs: rank AND be the cited source. Structure that wins (synthesis of ranking pages + They Ask You Answer precedent, [Marcus Sheridan](https://marcussheridan.com/they-ask-you-answer/)): real number in the first 100 words (answer-first for extraction), UK price-range table by job size/spec, factor-by-factor cost drivers, regional variance, "what affects your quote" transparency, FAQ block, updated-date shown, written/reviewed by the named tradesperson. Fan-out finding means the guide should be a **cluster**: cost + "how long does it take" + "is it worth it" + comparisons + problems/signs — pages appearing across sub-queries get cited ([SEJ/Ahrefs fan-out](https://www.searchenginejournal.com/google-ai-overview-citations-from-top-ranking-pages-drop-sharply/568637/)).
- **Scaled content abuse (March 2024 spam policy)** targets "many pages... little or no value" *regardless of how produced* — AI or human. Templated mass-generated pages with swapped variables are the named pattern; sites lost 90%+ visibility, some entirely deindexed ([Search Engine Roundtable](https://www.seroundtable.com/google-march-2024-spam-updates-37002.html), [Digital Applied analysis](https://www.digitalapplied.com/blog/scaled-content-abuse-google-march-update-ai-pages-decimated)). For TITAN this is the existential platform risk: 35 trades × N towns × same template = the exact fingerprint. Mitigation = per-page unique value (real local jobs, local reviews, local pricing, staff, area-specific detail) — which is also the anti-doorway rule you already have.
- **E-E-A-T for trade sites:** make the tradesperson the author entity — name, photo, credentials (Gas Safe number, NICEIC, MCS, TrustMark, GDC for dental, SRA for solicitors), years on tools, `Person` schema with `sameAs` to their profiles; first-person experience markers ("we fitted 340 boilers last year", real job photos with commentary) are what separates post-HCU winners from generic AI copy ([LocalSEOSkills E-E-A-T for local](https://localseoskills.com/eeat-local-seo/), [Midland Marketing UK](https://midlandmarketing.co.uk/blog/seo/why-e-e-a-t-for-local-business-credibility-is-essential-for-long-term-growth/)).
- **Topical clusters per trade:** hub (service) → spokes (cost, problems, comparisons, regulations e.g. Part P / building regs, seasonal) with tight internal linking; for local service businesses depth-per-service beats breadth-of-blog ([TechBullion 90-day topical authority plan](https://techbullion.com/how-to-build-topical-authority-local-service-businesses-seo-services/), [Path Digital](https://pathdigitalservices.com/post/content-clusters-topical-authority/)).

### LAWS for TITAN
1. **Every trade gets a "money cluster": cost guide + 4–6 sibling intents.** Real numbers up front, UK ranges table, named-author tradesperson, visible update date. This is simultaneously the HCU play, the AIO citation play, and the lead-gen play.
2. **Prices must be real-ish and regional.** A platform-wide identical price table across 500 client sites is scaled-content fingerprint AND useless for citation. Inject client-specific/regional pricing at build time.
3. **Author entity = the business owner, with verifiable UK credentials** (Gas Safe/NICEIC/MCS/GDC/SRA numbers linked to the official registers). This is E-E-A-T trades can actually prove and competitors' AI sludge can't.
4. **Hard cap programmatic generation: no page ships without ≥30–40% client-unique substance** (jobs, photos, reviews, local specifics). Track template similarity across the TITAN fleet as a platform health metric — one spam classification pattern could hit many clients at once.
5. **Content depth over blog frequency:** complete one service cluster fully before starting the next. Fan-out rewards clusters; HCU punishes thin breadth.

---

## 4. Reviews Engine (Acquisition + UK Law)

### Findings — UK CMA / DMCC Act (in force 6 April 2025)

Banned outright ([CMS Law summary](https://cms.law/en/gbr/legal-updates/no-more-faux-five-stars-the-dmcc-act-bans-fake-reviews), [Greenberg Traurig](https://www.gtlaw.com/en/insights/2025/7/uk-competition-and-markets-authority-enforces-ban-on-fake-reviews), [techUK](https://www.techuk.org/resource/fake-reviews-and-the-dmcc-act-what-the-cma-s-actions-mean-for-uk-businesses.html)):
- Submitting/commissioning reviews not based on genuine experience.
- Publishing **incentivised reviews without prominent labelling** (money, discounts, freebies — concealed incentive = banned; labelled genuine-experience incentivised reviews are technically permitted, but Google's own policy bans incentivised reviews entirely, so for Google: never incentivise).
- **Publishing reviews in a misleading way — explicitly including suppressing negatives / cherry-picking positives.** This makes **review gating illegal in the UK**, not merely a Google-policy violation ([Google's policy also prohibits "discouraging or prohibiting negative reviews or selectively soliciting positive reviews"](https://www.reviewtrackers.com/blog/review-gating-google/)).
- Facilitation services (review swap groups, detection-evasion help) banned.
- **Publishers of reviews must take "reasonable and proportionate" steps**: policy, risk assessment, proactive detection, investigation, removal/sanctions. Fines: **up to 10% of global turnover**, civil enforcement by CMA directly. The CMA's 3-month grace period ended July 2025; enforcement sweep began ([Osborne Clarke](https://www.osborneclarke.com/insights/cma-puts-fake-reviews-and-endorsements-uk-under-spotlight)).

**Critical TITAN exposure:** if TITAN displays reviews on client sites or operates the review-request funnel, TITAN itself likely counts as a "publisher"/facilitator with its own DMCC duties — filter-then-display flows and "happy customers → Google, unhappy → private form" flows are now legal risk, not just policy risk.

### Findings — acquisition mechanics

- **87% of consumers have written/would write a review if asked; only 13% never would** ([BrightLocal](https://www.brightlocal.com/resources/online-reviews-statistics/)).
- **~70% of reviews originate from post-transaction email asks**; SMS CTR has declined (8%→6%, 2023→24) amid spam fatigue, but SMS wins on immediacy. Best pattern: **SMS immediately on job completion (tradesperson still on the doorstep = highest conversion moment) + email follow-up 1–2 days later** ([Birdeye SMS vs email 2025](https://birdeye.com/blog/sms-vs-email-review-requests-2025/), [BrightLocal](https://www.brightlocal.com/resources/online-reviews-statistics/)).
- **Responding:** 80% of consumers expect a response within 2 weeks; 48% say brand responses to reviews make purchase more likely; a 0.1-star rating lift drives conversions up meaningfully (Uberall: crossing rating thresholds boosted conversion up to 25%) ([Uberall study](https://uberall.com/en-us/company/press-releases/study-brick-and-mortar-businesses-small-increase-in-online-ratings-boosts-conversion-by-25-percent)).
- Velocity/recency ranking effects: see §2 (Sterling Sky 18-day cliff; 22% of consumers only trust ≤2-week-old reviews).

### LAWS for TITAN
1. **Ask everyone, every job, no filtering — hard-code it.** The compliant funnel: SMS on completion → review link direct to Google → email nudge at 24–48h → one reminder. No sentiment pre-screen that routes negatives away from public review. (An internal "how did we do" *service-recovery* survey is fine only if it doesn't replace or condition the public review ask.)
2. **Never incentivise Google reviews.** No prize draws, discounts, or "£10 off for a review" — breaches Google policy and, unlabelled, DMCC. Full stop across 35 trades.
3. **TITAN needs a DMCC compliance layer as a product feature:** written fake-review policy, detection/flagging of suspicious reviews it displays on client sites, takedown process, audit trail. Sell it as "CMA-compliant reviews engine" — genuine differentiator vs US-built review tools that still ship gating.
4. **Response SLA ≤ 1 week, 100% coverage** (templated-but-personalised; AI-drafted, human-approved). Cheap, expected by 80% of consumers, and conversion-positive.
5. **Meter the drip:** route asks to Google until velocity target is met, then diversify to Checkatrade/Trustpilot/Facebook/Which? Trusted Traders — those platforms are the AI-citation surface (§1) and DMCC-safe as long as asks are unconditional.

---

## 5. GBP Advanced

### Findings

- **Services**: ranking-impactful (§2). **Products section**: no ranking evidence — use as visual service tiles with photos + UTM'd links for SERP real estate.
- **Messaging/chat is DEAD**: Google killed GBP chat and call history **31 July 2024** ([Search Engine Roundtable](https://www.seroundtable.com/google-business-profile-call-history-deprecating-37465.html)). Don't build features or reporting on it; WhatsApp/SMS links on the website replace it.
- **Booking/appointment links**: supported field; for trades, point at the quote-request/booking form ([Signpost guide](https://www.signpost.com/blog/step-by-step-adding-a-booking-link-to-your-google-business-profile/)).
- **UTM tagging**: GBP traffic otherwise pollutes "google / organic" in GA4. Tag website link, appointment link, products, posts distinctly (e.g. `utm_source=GBP&utm_medium=organic&utm_campaign=gbp-website|gbp-appointment|gbp-post`). Claire Carlile's guide is the canonical reference ([clairecarlilemarketing.com UTM guide](https://www.clairecarlilemarketing.com/resources/utm-tagging-guide), [Search Engine Land guide](https://searchengineland.com/guide/utms-for-google-business-profile)). Note: UTMs on the GBP website field do not affect rankings; keep them stable once set.
- **Spam fighting is an offensive ranking tactic in trades** (locksmiths/garage doors/plumbing are the worst-hit categories): keyword-stuffed fake names, fake SAB listings, lead-gen fronts. Weapons: "Suggest an edit" for name violations, the **Business Redressal Complaint Form** for fraudulent listings, documenting evidence; removing 2–3 spam listings above you = a ranking improvement no optimization could buy ([Sterling Sky's ultimate spam-fighting guide](https://www.sterlingsky.ca/ultimate-guide-fighting-spam-google-maps/), [report a business — Google](https://support.google.com/maps/answer/16109801)). Google is now suing fake-listing networks, and there's a newer complaint form ([Foster Web Marketing](https://www.fosterwebmarketing.com/blog/you-can-now-report-fakes-and-fraudsters-in-google-maps.cfm)).
- **SAB suspension triggers** (trades are the highest-suspension vertical): keyword-stuffed business name, address shown for an SAB that shouldn't display one (or a residential/virtual address that fails verification), editing core fields (name/address/categories/hours) in bulk or frequently, creating multiple listings per service area, re-verification after edits, agency access changes ([Sterling Sky suspension playbook](https://www.sterlingsky.ca/top-reasons-google-my-business-suspended-your-listing/), [GBC Digital for contractors](https://gbcdigitalmarketing.com/google-business-profile-suspensions-in-2025-how-to-protect-your-contracting-business/)). Video verification is now standard for SABs — clients need signage, vehicle branding, tools, and proof of work location on hand.
- **Tension to manage:** Sterling Sky's data says showing an address correlates with better near-me rankings (§2), but an SAB displaying an address it doesn't staff violates guidelines → suspension. Only show address where there's a genuine staffed premises/yard with signage.

### LAWS for TITAN
1. **Onboarding checklist per client: primary category (done), full predefined services, products-as-services tiles, booking link, Bing Places, video-verification evidence pack** (signage/van/tools footage prepped before Google asks).
2. **Platform-wide UTM standard on every GBP surface from day one** — TITAN's ROI reporting depends on separating GBP traffic from organic; retrofitting breaks history.
3. **Never keyword-stuff client business names** — the #1 suspension trigger and now also DMCC-adjacent misrepresentation. Real name only, even when spammers outrank you doing it.
4. **Change-freeze discipline:** batch GBP edits, avoid touching name/address/category more than necessary, document everything (registration, utility bills, insurance) in a per-client "suspension recovery kit" so appeals take days not months.
5. **Quarterly spam sweep as a productized service:** map-scan each client's category+city, file redressal complaints on fake/stuffed listings, track removals. In trades this is one of the highest-ROI recurring actions available.
6. **Address logic:** staffed premises with signage → show address (ranking evidence favours it); home-based SAB → hide address, define service areas honestly (≤ ~2-hour radius), never fabricate offices.

---

### Cross-cutting synthesis for TITAN
The evidence converges on one architecture: **rankings + review velocity + third-party presence (directories/listicles/press) + branded mentions** feed *both* classic local SEO and AI answers — there is no separate "GEO product," only a re-weighting (citations/directories and brand PR matter more again; schema/llms.txt matter less than the market claims). The two platform-level risks that could hurt many clients simultaneously are **scaled-content classification** (template fingerprint across the fleet) and **DMCC review non-compliance** (gating/incentives baked into a funnel) — both are TITAN's responsibility, not the individual tradesperson's, and both are avoidable by design.

---

# PART IV — META ADS (Facebook / Instagram / WhatsApp)

# META PAID ACQUISITION FOR UK LOCAL TRADES — RESEARCH REPORT (TITAN)

---

## 1. Do Meta ads work for trades — and for which?

**The demand split.** Google = demand capture (they search, you harvest); Meta = demand generation (they weren't searching, you interrupt with a transformation they suddenly want). Every agency comparison lands the same way: Google wins when intent is pre-formed and urgent, Meta wins when the purchase is visual, discretionary and postponable ([Swydo](https://www.swydo.com/blog/google-ads-vs-facebook-ads/), [LeadsBridge](https://leadsbridge.com/blog/google-ads-vs-facebook-ads/), [Wise Agency](https://wise-agency.co.uk/facebook-vs-google-ads-for-dentists-2025-roi-guide/)).

**Per-trade-family verdict (evidence-backed):**

| Trade family | Meta fit | Evidence |
|---|---|---|
| **Visual transformation** (driveways, resin, artificial grass, landscaping, exterior/pressure cleaning, garden rooms) | **Best on Meta — Meta can be primary channel** | Pressure washing: $25–40 CPL, 15–25% lead→booked job, 4–6x ROAS ([Elev8](https://www.elev8operations.com/blog/facebook-ads-pressure-washing)); landscaping CPL $30–50 with worked funnel of $4k spend → 100 leads → 15 jobs → $45k (11x) ([Savant](https://www.savantmarketingagency.com/are-facebook-ads-worth-it-for-landscapers-in-2025)); UK premium landscaping ran Meta at £0.38 CPC alongside Google at £7.22 CPL on a £21.50/day combined budget, 2–3 qualified leads/week ([Leads365 UK case study](https://www.leads365.co.uk/case-study-landscaping.html)) |
| **Big-ticket considered** (roofing, solar, windows, garages/conversions) | **Strong on Meta, but lead quality management is the whole game** | Roofing Meta benchmark ~$30 CPL, healthy range $25–60 exclusive ([CinchLocal](https://www.cinchlocal.com/the-ultimate-2026-guide-to-meta-advertising-for-roofers)); UK solar CPL £20–80, worked 6:1 ROI at £50 CPL ([Phantom Digital UK](https://phantomdigital.co.uk/solar-panel-facebook-ads/)); Facebook "still dominates" UK solar lead gen ([Imperio Leads](https://www.imperioleads.com/blogs/imperioleads-blog/why-facebook-ads-still-dominate-solar-leads-generation-in-the-uk)) |
| **Emergency/reactive** (plumbers, drainage, locksmiths, emergency roof repair) | **Weak on Meta for the emergency job itself** — nobody scrolls Instagram with a burst pipe. Google/LSA capture that. Meta role: brand priming + boiler-service/maintenance-plan offers (plannable purchases) | Implied across all Google-vs-Meta comparisons ([Swydo](https://www.swydo.com/blog/google-ads-vs-facebook-ads/)); exception: post-storm roof-repair ads get ~50% higher engagement in a 6–72h response window ([CinchLocal](https://www.cinchlocal.com/the-ultimate-2026-guide-to-meta-advertising-for-roofers)) — weather-reactive is the one "emergency" play that works on Meta |
| **Professional/consideration** (dental, legal, accountancy) | **Split by offer.** Dental cosmetic (Invisalign, whitening, implants-awareness) works on Meta at £8–35 CPL vs £45–120 on Google — but Google leads convert better for high-ticket; cost per booked patient £120–250 general, £250–450 implants/Invisalign ([Wise Agency UK](https://wise-agency.co.uk/facebook-vs-google-ads-for-dentists-2025-roi-guide/)). Legal on Meta is surprisingly cheap (US CPL $18.17, 10.5% CVR — [WordStream 2025](https://www.wordstream.com/blog/facebook-ads-benchmarks-2025)) but works for plannable matters (wills, conveyancing, family) not distress ones |

**Baseline US benchmarks (lead campaigns, [WordStream 2025](https://www.wordstream.com/blog/facebook-ads-benchmarks-2025)):** Home & Home Improvement CPL **$41.26** (CTR 1.94%, CPC $2.23, CVR 5.22%); Dental CPL **$76.71** (CPC $9.78 — dental clicks are the priciest); Attorneys CPL **$18.17**; Personal Services (incl. cleaning) CPL **$30.57**.

**LAWS FOR TITAN #1**
- **L1.1** Meta is the *primary* paid channel for visual-transformation trades, a *secondary* quality-managed channel for big-ticket considered trades, a *retargeting/offer* channel for dental/legal, and **not a launch channel for emergency trades** (Google/LSA first; Meta only for maintenance-plan offers).
- **L1.2** The product sold on Meta is never "roofing services" — it's a specific visualisable outcome ("this driveway, £X, 3 days"). Trades with a before/after photo have a structural Meta advantage; TITAN's 35-trade taxonomy should carry a `meta_fit` score.
- **L1.3** Expect Meta CPL at roughly 30–60% of Google CPL in the same trade, and lead-to-job conversion at roughly half. Price the channel on cost-per-booked-job, not CPL.

---

## 2. Campaign architecture 2025–26

**Advantage+ leads ("tailored leads") vs manual:** Jon Loomer's teardown: tailored leads campaigns are "nothing unique, special, or powerful" — just a manual leads campaign with settings locked (Highest Volume bid forced, Advantage+ placements forced, **no Website conversion location** — only Instant Forms, Messenger, Instagram, Calls) ([Jon Loomer](https://www.jonloomer.com/should-you-create-a-tailored-leads-campaign-over-the-manual-setup/)). For a platform like TITAN building campaigns programmatically, **manual Leads-objective campaigns with broad targeting give the same delivery plus control**. ASC-style consolidated structures beat fragmentation: post-Andromeda recommendation is ~60–70% budget in the consolidated scaling campaign, 20–25% creative testing, 10–15% retargeting, and ASC-type automation delivering ~17% lower CPA than manual in Meta's own comparisons ([Jetfuel](https://jetfuel.agency/metas-2026-algorithm-update-what-andromeda-changed-and-how-to-adapt-your-ads/)).

**Objective choice:** Leads objective (instant forms or website leads) for quote-based trades; Calls objective is a legitimate variant for phone-first demographics (older homeowners, roofing); never Traffic objective for lead gen — it optimises for clickers, not enquirers (consensus across [Benly](https://benly.ai/learn/meta-ads/lead-generation-ads), Loomer).

**Instant forms vs website conversion — the tradeoff** ([Katie Robson](https://katierobson.uk/blog/meta-lead-ads-instant-forms-or-website/)): instant forms = cheaper CPL, zero landing-page dependency, lower quality by default (autofill makes submission accidental-grade easy); website = higher CPL, higher intent, needs pixel + good landing page. For TITAN (which *owns* the client's website) the endgame is website conversion campaigns optimised on CRM events — but instant forms are the correct day-one default because they work without any landing-page conversion history.

**Fixing instant-form quality — the known stack** ([Qwestyon's 7 fixes](https://www.qwestyon.com/blog/why-are-my-meta-lead-form-leads-so-bad-7-fixes-that-usually-improve-quality), [The Digital Exchange](https://www.thedigitalexchange.co/blog/meta-ads-instant-forms), [Herd Marketing UK](https://www.herdmarketing.co.uk/how-to-optimise-lead-generation-forms-on-meta-quality-over-quantity/)):
1. Form type **"Higher intent"** (adds a review step) instead of "More volume" — CPL rises, junk drops.
2. **2–3 custom qualifying questions** with conditional logic: postcode/area, service wanted, timeline ("ready in next 30 days?"), budget band. Multiple-choice beats free text.
3. **Disable autofill on email/phone** — forces fresh, correct contact data.
4. Ad copy that **repels** bad fits: state the area, price floor ("driveways from £4,500"), and who it's for.
5. Graduate to **Conversion Leads performance goal**: CRM connected via Conversions API, lead stages fed back daily; requirements ~**200+ leads/month, 1–40% stage-conversion within 28 days**; Meta claims ~**19% lower cost per *quality* lead** ([LeadsBridge](https://leadsbridge.com/blog/conversion-leads-optimization-facebook/), [Meta developers doc](https://developers.facebook.com/documentation/ads-commerce/conversions-api/conversion-leads-integration)). At 200 leads/mo this is out of reach for one tradesman — **but reachable for TITAN if lead-stage data is pooled per-vertical across clients** (a genuine platform moat).

**Speed-to-lead wiring:** stats in circulation: 5-minute response = **391% conversion lift**, 78% of buyers choose the firm that responds first ([Barham Marketing](https://barhammarketing.com/how-to-automate-instant-sms-replies-for-meta-lead-gen-ads-6-step-guide-2026/)). The standard stack: Meta Lead Ads webhook → CRM + instant SMS/WhatsApp to the lead + push alert to the tradesman; via Zapier it costs <$30/100 leads (Zapier Starter + Twilio at ~$0.008–0.02/SMS; format numbers to E.164 — 22% of automated SMS fail on bad country codes) ([Barham](https://barhammarketing.com/how-to-automate-instant-sms-replies-for-meta-lead-gen-ads-6-step-guide-2026/), [Zapier](https://zapier.com/apps/facebook-lead-ads/integrations/sms), [LeadSync](https://leadsync.me/blog/leadsync-vs-zapier/)). Best practice adds a same-minute AI/automated qualification conversation, not just a "we got your enquiry" text.

**LAWS FOR TITAN #2**
- **L2.1** One account per client: **one Leads campaign, one broad ad set, 6+ creatives** (see §3). No interest-stacked multi-ad-set structures — they fragment learning at trade-sized budgets.
- **L2.2** Start every client on **instant forms in "Higher intent" mode + 2 conditional qualifiers + autofill off for phone**. Move to website-conversion campaigns only after the TITAN site has form-conversion history.
- **L2.3** Build lead-stage feedback (contacted → quoted → won) into TITAN's CRM from day one and push it to Meta via CAPI — first for signal hygiene, then to unlock Conversion Leads optimisation on pooled vertical data.
- **L2.4** Speed-to-lead is a product feature, not client behaviour: **auto-SMS/WhatsApp the lead within 60 seconds and ring/notify the tradesman simultaneously.** This is the single highest-leverage fix for "Meta leads are rubbish" churn ([Qwestyon fix #5](https://www.qwestyon.com/blog/why-are-my-meta-lead-form-leads-so-bad-7-fixes-that-usually-improve-quality)).
- **L2.5** Never use Traffic objective; use Calls objective as a B-test for 55+ skewing trades (roofing, driveways in retirement-heavy areas).

---

## 3. Creative strategy

**What wins for trades (converging evidence):**
- **Before/after transformation** is the apex format for visual trades — with specifics attached ("this driveway took 2 hours/3 days", the town name, the price band) ([Elev8](https://www.elev8operations.com/blog/facebook-ads-pressure-washing), [Pipeline On](https://pipelineon.com/blog/landscaping-ad-ideas/)).
- **Raw process video beats polish**: 15–30s authentic on-the-job footage outperforms produced promos ([Elev8](https://www.elev8operations.com/blog/facebook-ads-pressure-washing)); founder-led authentic content delivers **2–3x the ROAS of polished brand creative** post-Andromeda ([Jetfuel](https://jetfuel.agency/metas-2026-algorithm-update-what-andromeda-changed-and-how-to-adapt-your-ads/)); "people buy from people, not faceless brands" ([Savant](https://www.savantmarketingagency.com/are-facebook-ads-worth-it-for-landscapers-in-2025)).
- **Carousels outperform single images by ~30%** for roofing/construction (before→after sequence, material options, process steps) ([CinchLocal](https://www.cinchlocal.com/the-ultimate-2026-guide-to-meta-advertising-for-roofers)).
- **Customer testimonial / review-as-creative** for trust-gated trades (dental, legal, solar) — see §6.
- Solar-specific winning angles: ROI calculators, neighbourhood social-proof maps ("12 installs in [town]"), grant/deadline urgency, £1,200–2,400/yr savings claims, UK-weather myth-busting ([Phantom Digital](https://phantomdigital.co.uk/solar-panel-facebook-ads/)).

**Volume & cadence under Andromeda (creative IS the targeting):** Meta's Andromeda ranking update made creative diversity the main delivery lever. Benchmarks: accounts testing **20+ new ads/month see ~65% higher ROAS** than those testing <10; minimum **6 meaningfully different creatives per ad set**, 15–20 active concurrently at strong accounts; mix ≈ **50% new concepts / 30% iterations of winners / 20% keep winners running**; refresh on fatigue signals (CPM rising without scale), not calendar ([Jetfuel](https://jetfuel.agency/metas-2026-algorithm-update-what-andromeda-changed-and-how-to-adapt-your-ads/), [Segwise](https://segwise.ai/blog/meta-andromeda-update-creative-strategy-2026), [Chatterbuzz](https://www.chatterbuzzmedia.com/blog/meta-andromeda-creative-targeting/)). A one-man driveway firm cannot produce 20 ads/month — **TITAN can**, templated from job photos.

**LAWS FOR TITAN #3**
- **L3.1** TITAN's creative engine per trade family: *visual trades* → before/after carousel + timelapse reel + drone finish shot; *big-ticket* → founder-to-camera ("I'm Dave, we've done 300 roofs in Kent") + testimonial + process; *professional* → patient/client story + review card + offer statics. Every ad names the **town** and a **price/time anchor**.
- **L3.2** Ship **6 diverse creatives at launch, 4–8 new/month per client**, harvested automatically from job-completion photo uploads (make photo upload a workflow step in the TITAN app — it feeds both the website gallery and the ad engine).
- **L3.3** Hook diversity > variant diversity: differ by angle (price anchor / transformation / social proof / seasonal urgency / founder), not by recolouring the same image — Andromeda treats near-duplicates as one.
- **L3.4** Kill/replace on signal: creative CPM up + results flat for 7 days → swap in next concept.

---

## 4. Targeting 2026

- **Special Ad Categories: standard home-services ads are NOT restricted.** Housing category covers property sales/rentals/insurance — not contractors ([Medium/Mediastrobe guide](https://mediastrobe.medium.com/meta-housing-ads-2026-the-complete-guide-to-geo-targeting-under-special-ad-category-restrictions-c008de7252ca), [Jon Loomer](https://www.jonloomer.com/special-ad-categories-meta-ads/)). **The trap: "0% finance" / "buy now pay later" offers — endemic in driveways, windows, solar, dental — trigger the Financial Products & Services category**, which forces 18–65+ all-genders, bans lookalikes/saved audiences, and imposes a **15-mile minimum radius with no postcode targeting** (UK included) ([Jon Loomer](https://www.jonloomer.com/special-ad-categories-meta-ads/), [Mediastrobe](https://mediastrobe.medium.com/meta-housing-ads-2026-the-complete-guide-to-geo-targeting-under-special-ad-category-restrictions-c008de7252ca)). Don't try to dodge the declaration — account bans ([Loomer](https://www.jonloomer.com/special-ad-categories-meta-ads/)).
- **Radius reality:** technical pin-drop minimum is 1 mile, but radii under ~5 miles get auction-penalised (3–5x CPM, delivery caps, frequency death-spiral). Practical minimum **3–5 miles; city + 7–10 mile radius is the sweet spot** for local services ([Thread Transfer](https://thread-transfer.com/blog/2026-06-17-meta-ads-location-targeting-radius-minimum/)).
- **Broad + creative-as-targeting is the doctrine.** Broad/Advantage+ Audience with strong creative beats 1% lookalikes; the algorithm's behavioural data outstrips seed lists. Exception: accounts under ~$5k/month with thin conversion history can temporarily use 2–3% lookalikes ([Jetfuel](https://jetfuel.agency/metas-2026-algorithm-update-what-andromeda-changed-and-how-to-adapt-your-ads/), [Conversios](https://www.conversios.io/blog/meta-advantage-audience-vs-detailed-targeting-2026-guide/)). Where light shaping is wanted (e.g. roofers avoiding renters), use homeowner-proxy interests — "Home Improvement & DIY", "Home Insurance", "Real Estate & Landscaping" — as Advantage+ *suggestions*, not hard constraints ([CinchLocal](https://www.cinchlocal.com/the-ultimate-2026-guide-to-meta-advertising-for-roofers)); life-event targeting (recently moved) still works for landscaping/cleaning ([Savant](https://www.savantmarketingagency.com/are-facebook-ads-worth-it-for-landscapers-in-2025)).
- **Retargeting:** keep ~10–15% of budget on warm audiences only — site visitors, form-openers-non-submitters, video viewers, engagers ([Jetfuel](https://jetfuel.agency/metas-2026-algorithm-update-what-andromeda-changed-and-how-to-adapt-your-ads/)). Instant-form "opened but didn't submit" is a native engagement audience — the cheapest high-intent retargeting pool a trade has.

**LAWS FOR TITAN #4**
- **L4.1** Default geo = client's real service area as **town/city list + 8–10 mile radius**, never a 1–3 mile pin. Rural trades: stack multiple town radii.
- **L4.2** Default audience = **fully broad within geo**, age/gender open; the creative does the targeting. No interest stacks in the main ad set.
- **L4.3** **Finance-offer firewall in the TITAN ad builder:** any copy mentioning finance/credit/monthly-payments auto-flags the campaign into the Financial Products category (and warns the client of the 15-mile/no-narrowing consequences) — or better, keeps finance messaging off Meta and on the website only.
- **L4.4** Stand up the two evergreen retargeting audiences on every account at launch: website visitors 30d (TITAN owns the pixel) + form-abandoners 14d, served testimonial/review creative.

---

## 5. Budgets & benchmarks

**UK cost levels:** UK all-industry Meta CPL ran **£17–60 across Jul 2025–Jul 2026, 13-month median ~£37.80** (peaks Dec & Feb, a 69% CPL collapse into March — i.e. spring is cheap inventory exactly when outdoor-trade demand wakes) ([SuperAds UK data](https://www.superads.ai/facebook-ads-costs/cost-per-lead/united-kingdom)). UK SME guides put typical Meta CPC at £0.30–1.00 and lead-gen CPL £5–50 by sector ([Adlarion](https://www.adlarion.com/blog/facebook-ads-cost-uk), [ServiceWorld](https://serviceworlduk.com/blog/facebook-advertising-costs-in-the-uk-what-uk-businesses-budget/)).

**Working per-trade CPL planning table (Meta, instant forms, blended UK/US sources):**

| Trade | Planning CPL | Source |
|---|---|---|
| Exterior cleaning / pressure washing | £15–30 ($25–40) | [Elev8](https://www.elev8operations.com/blog/facebook-ads-pressure-washing) |
| Landscaping / driveways / artificial grass | £20–40 ($30–50) | [Savant](https://www.savantmarketingagency.com/are-facebook-ads-worth-it-for-landscapers-in-2025), [Leads365](https://www.leads365.co.uk/case-study-landscaping.html) |
| Roofing | £25–50 ($25–60) | [CinchLocal](https://www.cinchlocal.com/the-ultimate-2026-guide-to-meta-advertising-for-roofers) |
| Solar | £20–80 | [Phantom Digital](https://phantomdigital.co.uk/solar-panel-facebook-ads/) |
| Dental (cosmetic offers) | £8–35 (but £250–450/booked patient for implants/Invisalign) | [Wise Agency](https://wise-agency.co.uk/facebook-vs-google-ads-for-dentists-2025-roi-guide/) |
| Legal (plannable matters) | £15–25 ($18 US) | [WordStream](https://www.wordstream.com/blog/facebook-ads-benchmarks-2025) |

**Minimum viable budgets & learning phase:** Meta's technical minimums ($1 impressions / $5 conversions per day) are irrelevant; the algorithm wants **~50 conversion events per ad set per week** to exit learning. Formula: target CPL × 50 ÷ 7 = daily budget to exit learning in a week ([Stackmatix](https://www.stackmatix.com/blog/facebook-ads-minimum-budget-requirements)). At £25 CPL that's ~£180/day — no small trade spends that, so **most TITAN clients will live permanently in Learning Limited, which costs 20–50% higher CPA** ([Stackmatix](https://www.stackmatix.com/blog/facebook-ads-minimum-budget-requirements), [Lebesgue](https://lebesgue.io/facebook-ads/facebook-ads-learning-phase-what-you-need-to-know-2024-update)). Mitigations: one campaign/one ad set (consolidate signal), optimise on the higher-volume event if lead volume is tiny, never restart campaigns (resets learning), scale in 20–30% steps every 3–5 days. Practical floors seen in the trade guides: **£15–35/day (£450–1,000/mo) to start, £50–100/day when scaling** ([CinchLocal](https://www.cinchlocal.com/the-ultimate-2026-guide-to-meta-advertising-for-roofers) $500–1,000/mo start; [Phantom](https://phantomdigital.co.uk/solar-panel-facebook-ads/) £500–1,000 test → £1,500–3,000 active; [Elev8](https://www.elev8operations.com/blog/facebook-ads-pressure-washing) $20–30/day).

**Seasonality:** outdoor trades pulse hard into spring — UK driveway installers themselves market spring/summer as install season ([Daniel Moquet](https://www.daniel-moquet.co.uk/driveways-courtyards-patios/driveway_designers_news_why-spring-is-the-best-time-to-install-a-new-driveway.phtml), [Smart Surfacing](https://smartsurfacingsolutions.co.uk/planning-a-new-driveway-why-spring-or-summer-works-best-in-the-uk/)); recommended annual split for cleaning-type trades ≈ **40% spring / 35% summer / 20% autumn / 5% winter** ([Elev8](https://www.elev8operations.com/blog/facebook-ads-pressure-washing)); and UK CPM/CPL data shows March is the cheapest buying month ([SuperAds](https://www.superads.ai/facebook-ads-costs/cost-per-lead/united-kingdom)). Roofing runs counter-cyclically on storms (6–72h reactive window, +50% engagement — [CinchLocal](https://www.cinchlocal.com/the-ultimate-2026-guide-to-meta-advertising-for-roofers)).

**LAWS FOR TITAN #5**
- **L5.1** Product tiers: **Starter £20/day, Growth £35/day, Scale £70/day**. Below £15/day, decline to run Meta lead gen for big-ticket trades — the maths doesn't close.
- **L5.2** Accept Learning Limited as the normal state for SMB budgets; design for it (single ad set, no restarts, judge on 30-day cost-per-booked-job, not weekly CPL).
- **L5.3** Hard-code seasonal budget curves per trade: ramp outdoor trades in **late Feb–March** (cheap CPMs + waking demand = the year's best arbitrage), taper Nov–Jan or switch to "book your spring slot" deposit offers; gutter/roof-check offers in autumn; storm-trigger templates for roofers.
- **L5.4** Set client CPL expectations off the table above ±50%, and quote them cost-per-booked-job = CPL ÷ (contact rate × quote rate × close rate) — sell the funnel, not the lead.

---

## 6. Local awareness & social-proof plays

- **Review-driven ads:** turning 5-star Google reviews into ad creative (review-card statics, testimonial carousels, review + before/after pairings) is a documented high-converting local play; tools like NiceJob/Birdeye templatise it, with the caveats: get customer permission, keep the claim verbatim ([NiceJob](https://get.nicejob.com/resources/use-reviews-for-facebook-ads), [Birdeye](https://birdeye.com/blog/create-effective-facebook-ads/), [AdShark](https://adshark.com/blog/testimonial-facebook-ads/), [LeadEnforce on legality](https://leadenforce.com/blog/how-to-use-customer-review-content-in-product-ads-legally-and-effectively)). Since TITAN already syncs GBP reviews for websites, auto-generating "★★★★★ + job photo + town" ad units is near-free inventory.
- **Facebook local dynamics:** Facebook is still the #1 platform for UK tradespeople — 45M UK users, and local community groups + recommendation threads are where homeowners actually ask "anyone know a good roofer?" ([Tradesman Saver](https://www.tradesmansaver.co.uk/tradesman-insights/the-best-social-media-platform-for-tradespeople/)). Ads can't target groups, but they land in the same feed — meaning **an active, review-rich Facebook Page is the landing context for every ad click** (users click through to the Page to vet you). Organic posting in local groups is a client-behaviour play TITAN can script (post the before/after in the town group the day the ad launches).
- **WhatsApp click-to-message (CTWA):** the CTA opens a WhatsApp chat instead of a form — ideal for **quote-by-photo trades** (cleaning, gutters, garden maintenance, small roofing repairs: "WhatsApp us a photo of your driveway for a same-day price"). Reported: 12–25% of clickers send the pre-filled message, 30–50% of conversations → qualified leads with automated first response, 2–3x click-to-conversion vs landing pages ([BotMitra](https://botmitra.com/blog/whatsapp-click-to-chat-ads/)); Meta's pricing gives CTWA-originated conversations a **free 72-hour messaging window** ([Meta WhatsApp pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing), [Twilio CTWA guide](https://www.twilio.com/en-us/blog/products/2026-guide-to-create-ads-that-click-to-whatsapp-with-twilio)). Requires WhatsApp Business (API for automation) and a sub-5-minute first reply to work.

**LAWS FOR TITAN #6**
- **L6.1** Ship a **"Review Ads" auto-unit**: newest 5-star GBP review + matching job photo + town name, refreshed monthly, permanently running as the retargeting layer. Permission checkbox in TITAN's review-response flow.
- **L6.2** Treat the Facebook Page as landing infrastructure: TITAN should auto-post completed jobs to the client's Page weekly (ad-click vetting + group-share ammunition). An ad from a dead Page underperforms the same ad from a living one.
- **L6.3** For low-ticket/quote-by-photo trades (cleaning, gutters, grounds maintenance), **test CTWA against instant forms** — "send us a photo, get a price today" collapses the quote funnel; auto-reply within the free 72h window. For big-ticket trades keep forms (WhatsApp invites tyre-kicking on £8k driveways).
- **L6.4** For dental/legal, social proof isn't optional creative — it's the campaign: testimonial video + review cards + practitioner-to-camera, with Meta doing awareness/cosmetic offers and Google capturing the high-ticket search ([Wise Agency](https://wise-agency.co.uk/facebook-vs-google-ads-for-dentists-2025-roi-guide/)).

---

## The one-page synthesis

Meta works for TITAN's trades in a strict hierarchy: **transformation trades (build the whole engine here) → big-ticket considered (works with quality controls + CRM feedback) → professional (offer-led + social proof, Google still primary) → emergency (skip)**. The 2026 winning stack for a single trade client is: one Leads campaign, one broad ad set inside a town+8-mile geo, 6+ town-named before/after and founder creatives refreshed monthly from job photos, Higher-intent instant form with 2 conditional qualifiers and autofill off, sub-60-second automated WhatsApp/SMS response, lead stages fed back via CAPI, £20–70/day, spring-weighted pacing — with TITAN's structural edges being (a) creative volume from job-photo harvesting, (b) speed-to-lead as product, (c) pooled per-vertical Conversion Leads data no individual tradesman could ever accumulate, and (d) a finance-offer compliance firewall competitors will trip over.

Sources: [WordStream](https://www.wordstream.com/blog/facebook-ads-benchmarks-2025) · [SuperAds UK](https://www.superads.ai/facebook-ads-costs/cost-per-lead/united-kingdom) · [Wise Agency](https://wise-agency.co.uk/facebook-vs-google-ads-for-dentists-2025-roi-guide/) · [Phantom Digital](https://phantomdigital.co.uk/solar-panel-facebook-ads/) · [Savant](https://www.savantmarketingagency.com/are-facebook-ads-worth-it-for-landscapers-in-2025) · [Elev8](https://www.elev8operations.com/blog/facebook-ads-pressure-washing) · [CinchLocal](https://www.cinchlocal.com/the-ultimate-2026-guide-to-meta-advertising-for-roofers) · [Leads365](https://www.leads365.co.uk/case-study-landscaping.html) · [Jon Loomer (tailored leads)](https://www.jonloomer.com/should-you-create-a-tailored-leads-campaign-over-the-manual-setup/) · [Jon Loomer (special ad categories)](https://www.jonloomer.com/special-ad-categories-meta-ads/) · [Jetfuel/Andromeda](https://jetfuel.agency/metas-2026-algorithm-update-what-andromeda-changed-and-how-to-adapt-your-ads/) · [Qwestyon](https://www.qwestyon.com/blog/why-are-my-meta-lead-form-leads-so-bad-7-fixes-that-usually-improve-quality) · [Katie Robson](https://katierobson.uk/blog/meta-lead-ads-instant-forms-or-website/) · [The Digital Exchange](https://www.thedigitalexchange.co/blog/meta-ads-instant-forms) · [LeadsBridge (Conversion Leads)](https://leadsbridge.com/blog/conversion-leads-optimization-facebook/) · [Barham Marketing](https://barhammarketing.com/how-to-automate-instant-sms-replies-for-meta-lead-gen-ads-6-step-guide-2026/) · [Stackmatix](https://www.stackmatix.com/blog/facebook-ads-minimum-budget-requirements) · [Thread Transfer](https://thread-transfer.com/blog/2026-06-17-meta-ads-location-targeting-radius-minimum/) · [Mediastrobe](https://mediastrobe.medium.com/meta-housing-ads-2026-the-complete-guide-to-geo-targeting-under-special-ad-category-restrictions-c008de7252ca) · [BotMitra](https://botmitra.com/blog/whatsapp-click-to-chat-ads/) · [Meta WhatsApp pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing) · [Twilio](https://www.twilio.com/en-us/blog/products/2026-guide-to-create-ads-that-click-to-whatsapp-with-twilio) · [Tradesman Saver](https://www.tradesmansaver.co.uk/tradesman-insights/the-best-social-media-platform-for-tradespeople/) · [NiceJob](https://get.nicejob.com/resources/use-reviews-for-facebook-ads) · [Birdeye](https://birdeye.com/blog/create-effective-facebook-ads/) · [AdShark](https://adshark.com/blog/testimonial-facebook-ads/) · [LeadEnforce](https://leadenforce.com/blog/how-to-use-customer-review-content-in-product-ads-legally-and-effectively) · [Herd Marketing](https://www.herdmarketing.co.uk/how-to-optimise-lead-generation-forms-on-meta-quality-over-quantity/) · [Adlarion](https://www.adlarion.com/blog/facebook-ads-cost-uk) · [ServiceWorld UK](https://serviceworlduk.com/blog/facebook-advertising-costs-in-the-uk-what-uk-businesses-budget/) · [Lebesgue](https://lebesgue.io/facebook-ads/facebook-ads-learning-phase-what-you-need-to-know-2024-update) · [Swydo](https://www.swydo.com/blog/google-ads-vs-facebook-ads/) · [LeadsBridge (Google vs FB)](https://leadsbridge.com/blog/google-ads-vs-facebook-ads/) · [Conversios](https://www.conversios.io/blog/meta-advantage-audience-vs-detailed-targeting-2026-guide/) · [Segwise](https://segwise.ai/blog/meta-andromeda-update-creative-strategy-2026) · [Chatterbuzz](https://www.chatterbuzzmedia.com/blog/meta-andromeda-creative-targeting/) · [Imperio Leads](https://www.imperioleads.com/blogs/imperioleads-blog/why-facebook-ads-still-dominate-solar-leads-generation-in-the-uk) · [Pipeline On](https://pipelineon.com/blog/landscaping-ad-ideas/) · [Daniel Moquet](https://www.daniel-moquet.co.uk/driveways-courtyards-patios/driveway_designers_news_why-spring-is-the-best-time-to-install-a-new-driveway.phtml) · [Smart Surfacing](https://smartsurfacingsolutions.co.uk/planning-a-new-driveway-why-spring-or-summer-works-best-in-the-uk/) · [Zapier](https://zapier.com/apps/facebook-lead-ads/integrations/sms) · [LeadSync](https://leadsync.me/blog/leadsync-vs-zapier/) · [Benly](https://benly.ai/learn/meta-ads/lead-generation-ads) · [Meta CAPI docs](https://developers.facebook.com/documentation/ads-commerce/conversions-api/conversion-leads-integration)
