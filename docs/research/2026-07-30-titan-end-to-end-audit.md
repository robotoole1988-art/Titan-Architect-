# TITAN — End-to-End Audit

*Eleven domain audits, each stress-tested by an adversarial second pass. Where the second pass refuted a finding, it has been removed or corrected here. Every number below survived that process.*

---

## 1. The honest headline

TITAN today is one genuinely excellent website factory, plus a Google Ads *planner* that produces a spreadsheet a human imports by hand, plus a well-built internal sales tool that only you can use. That is the whole product. It is not yet an AI marketing platform, and the distance between the two is not a feature gap — it is most of the system. You believe you have seven channels; you have one automated and six done by hand, and two of those six (Google Business Profile, Meta) are blocked behind third-party approvals whose clocks have not started. You believe you have per-trade intelligence for 35 trades; you have eight templates with the trade name substituted in, producing 17 genuinely distinct documents, and the accreditation badges those templates print are invented by keyword-matching the trade name against a hardcoded list. You believe 245 agents are a design; the number 245 does not appear anywhere in the repository, there is no agent loop, no scheduler, and the entire AI surface is one file making two calls that reword results a deterministic engine already computed. The sites themselves are genuinely, measurably excellent — 91 to 99 on mobile Lighthouse against a Wix median of 62 — and that quality is real, hard-won, and the thing a competitor would find hardest to copy. But you have £0 revenue, one identified prospect, zero approaches made, and roughly 8,000 lines of build doctrine, which means you have spent your savings proving you can build in a market where building was never the constraint. The good news buried in all of this: almost every serious defect found is cheap to fix — most are hours, a few are days — and none of them is architectural. The bad news is that fixing them all still leaves you with the problem you have not started on, which is finding someone willing to pay.

---

## 2. The things that could kill this

Ranked by how likely each is to end the business, not by how technical it is.

### 1. You have not started selling, and that is the actual constraint

**What breaks.** Nothing in the codebase. The business simply runs out of money before it finds out whether anyone wants this.

**The evidence.** Your own audit of 26 July records: *"Revenue: £0. One pilot built, none delivered, no live campaigns."* Liberty Contractors — the single pilot — has a complete site built through TITAN and an approach message that was drafted and never sent. In the week of 21–28 July, seven build pull requests merged (#21–#27) against that one unsent message. Of the twelve ranked items in your own audit, exactly one is customer acquisition; it ranks sixth, and it did not survive into the next session's agreed top five. There is no go-to-market document anywhere in `docs/`. There is no public marketing surface anywhere in `src/` — `src/core/auth/model.ts:43` gates everything except `/sites/*` and the login page behind founder auth. The product whose pitch is *"being invisible online is the disease TITAN cures"* is itself invisible online.

**When it bites.** Now, and every week. At a generous 3% cold-to-close rate, eight customers requires roughly 270 qualified conversations — about 13 weeks of outreach *after* it starts. Every week it does not start, first revenue moves a week later.

**What to do.** Stop building for 30 days. Pick one town and one trade. Build speculative sites before the calls. Target three paying customers at list price out of 100 named businesses. Record every objection verbatim — that transcript is worth more than the next ten architecture decisions. If you cannot close three out of 100 with a working product and two beautiful live sites, the problem is not the product, and no further building fixes it.

### 2. Every generated site publishes trade accreditations the business may not hold

**What breaks.** `accreditationsFor()` in `src/core/experience-strategy/trade-intelligence.ts:115-135` takes the *trade name*, matches it against ten hardcoded keyword buckets, and returns UK accreditation bodies — Gas Safe, MCS, NICEIC, FENSA, TrustMark, Which? Trusted Trader. It never touches the business record, because there is no field on the business record to hold the true answer. Those strings then render as shield-badge chips on the live page.

**The evidence.** Measured across all 35 trades by running the real pipeline: 35 of 35 publish at least one unverified accreditation. 22 of 35 render the literal string "TrustMark". Several are not merely unverified but impossible or wrong: EV Charger Installation gets "MCS certified" (MCS does not certify EV chargers — the real scheme is OZEV); Damp Proofing gets "NFRC member, CompetentRoofer" because the string "roof" hides inside "p-**roof**-ing"; a free-text "Window Cleaner" gets "FENSA / CERTASS registered", a double-glazing building-regulations scheme. Solicitors get "TrustMark, Which? Trusted Trader" instead of SRA authorisation. The same strings feed Google Ads headline candidates, so "MCS certified" would go into a live ad.

The law: DMCC Act 2024 Schedule 20 paragraph 3 bans *"displaying a trust mark, quality mark or equivalent without having obtained the necessary authorisation"*, and paragraph 4 bans falsely claiming approval by a body. These are *banned practices* — automatically unfair, no need to show any consumer was misled. In force since 6 April 2025. Section 237(7) makes it a criminal offence; CMA direct enforcement can fine the higher of 10% of global turnover or £300,000, and up to £300,000 personally for an individual who is an "accessory" to another business's infringement. That is you.

Your own research already says this. `docs/research/2026-07-26-trade-playbooks-vol2.md` line 7: *"No verified number = no badge."* The taxonomy file even carries a comment about "the substring trap" 400 lines away from the code that falls into it.

**When it bites.** First real customer publish. Today all live sites are fictional demos, so present consumer exposure is roughly zero — but TrustMark, NICEIC, FENSA and Gas Safe are registered trade marks whose owners send cease-and-desist letters as routine business.

**What to do today (one hour).** Make `accreditationsFor()` return an empty list. The renderer already collapses sections honestly when data is absent — that pattern exists and works. Then, properly (half a day to a day): add an accreditations field to the business record requiring a registration number, an evidence note and a check date, and render nothing without one.

### 3. AI-generated photographs are published as the trader's own completed work

**What breaks.** `src/core/media/plan.ts:158-163` literally instructs the image model to produce *"Finished project photograph N of N — a different completed job each frame."* The renderer then captions them `Completed project 1` under the heading *"The work speaks first"*, and the before/after pair as `Before the work` / `After the work — the finished result`. Nothing distinguishes generated from customer-supplied imagery: the renderer's resolved-asset type drops the provenance field entirely, so no component *could* disclose it even if you wanted to.

**The evidence.** Seven fabricated "completed work" images on a project-archetype homepage, nine on premium. Verified live on `titan-architect.vercel.app/sites/kerbside-kings`, indexed, no disclaimer. The relevant law is misleading *presentation* (DMCCA 2024 s.226 — covers information which, although true, is presented in a misleading way), not a missing AI label. That matters for the fix: adding "AI-generated" under "Completed project 1" would arguably still breach it. The ASA's own guidance is that the Code is media-neutral and the advertiser stays fully responsible for AI output.

One correction worth knowing, because it changes the shape: the earlier claim that this is a hard regulatory stop for dental practices is **wrong**. The `care` archetype (which is where dentists land) contains no portfolio section and no before/after section — TITAN never generates them for dental. The exposure is real for the 27 of 35 trades that do carry a portfolio, not for the regulated clinical ones.

**When it bites.** First customer publish, with no code change required. Trade competitors are the largest single source of ASA complaints in home improvement, and ASA rulings are permanently published and search-indexed against the trader's name.

**What to do.** Draw the line in code: any slot whose meaning asserts *"this is our work"* — portfolio frames, before/after, gallery — becomes customer-photo-only and collapses when empty. Generated imagery stays for atmosphere, hero and texture, where it is defensible. This is a small change to `plan.ts` and it removes the category of risk rather than managing it.

### 4. You cannot prove the ads worked, and the window to start capturing that closes permanently

**What breaks.** There is no attribution of any kind. Search the whole repository for `gclid`, `utm_`, `gbraid`, `wbraid`, `msclkid`, `fbclid` or `referrer` and you get zero hits in application code. The enquiry form sends only `window.location.pathname`, discarding the query string — so even a hand-tagged ad URL loses its tracking parameters before anything is stored. The enquiry record has no channel, no job value and no "won" state. Separately, there is no Google Ads conversion tag anywhere, so Google records zero conversions forever and the campaign plan's own instruction ("switch to Target CPA at ~30 conversions") can never fire.

**The evidence.** Google refuses offline conversions uploaded more than **90 days** after the click (63 days for enhanced conversions). Attribution is not retroactively recoverable — every lead that lands between ads going live and this being fixed is permanently unattributable.

**Worse, and separately.** Phone calls — the dominant conversion for trades — are entirely unmeasured, and on emergency trades there is no way to make one. Across the whole renderer there are **nine** call-to-action buttons pointing at `#callback` (the web form) against **one** `tel:` link, in the footer. Four of those nine render a phone icon. On an emergency plumber's site the primary call-to-action label is literally *"Call now"* and it scrolls to a form. That is not a measurement gap; it is lost revenue on the archetype whose entire strategy is one-tap calling.

**When it bites.** Month two or three of the first ads customer, at the renewal conversation you have no evidence for.

**What to do before customer 1.** (a) Make the "Call now" button actually dial, and fire a `call_click` metric — the routing signal (`intent: "call"`) and the phone number are both already computed and sitting unused in the renderer. (b) Capture click IDs and UTM parameters on landing into a hidden form field, and add `gclid`, `channel`, `quoted`, `won`, `jobValue` and `jobPostcode` to the enquiry record. None of this is hard. All of it is unrecoverable if skipped.

### 5. The delivery ceiling is roughly 15–40 customers, and the automation that lifts it is blocked externally

**What breaks.** `isManualBuildKind()` returns true for six of seven channels. Measured against the price list, the only automated line item (`website_build`, £49/mo) is **8.3%** of the Launch bundle's value, **4.9%** of Dominate's, **3.3%** of TITAN's. So 92–97% of recurring revenue is attached to work you do by hand. The sharpest consequence: revenue per founder-hour *inverts* as customers upgrade — roughly £150–248/hr on Launch, £92–161 on Dominate, £79–118 on the TITAN bundle. Every upsell dilutes your margin per hour.

At a realistic 10 touches per customer per month (weekly GBP posts, review responses, search-term review, monthly report), the solo ceiling is about 36–60 Launch customers or 10–15 TITAN-bundle customers.

**The harder part.** `src/core/command-mode/catalogue.ts:5-8` states as policy: *"NO action is tier `auto`… Excluded by constitution: anything customer-visible, anything spending money."* The agentic layer is architecturally barred from exactly the channels you monetise. And the API access that would lift the ceiling is not in your control: Google Business Profile requires TITAN's own profile verified for 60+ days (clock not started as of 26 July, so GBP-managed delivery cannot begin before roughly end of September), and Meta requires Companies House registration (~£50, unfiled).

**What to do.** File at Companies House and create TITAN's GBP this week — both are cheap and both start clocks you cannot compress later. Then automate the two highest-frequency touches that need *no* external approval: GBP post drafting and search-term-review triage. And decide consciously whether to cap sales or hire; there is no third option.

### 6. Money mechanics: VAT, float, and no way to stop the meter when someone leaves

Three separate cash risks, all decided by one choice.

**VAT.** If you buy media in TITAN's name and recharge it, that recharge is turnover, not a pass-through (HMRC's disbursement conditions fail on two counts: you set the price, and the client isn't contractually liable to Google). Separately, Google Ads is supplied from Ireland, and services you reverse-charge count toward the £90,000 registration threshold. Measured against your own catalogue at the seed median CPL: registration lands at **3.3 customers** on the TITAN bundle or **4.6 on Launch**. If instead the client's own card is on the client's own Google Ads account, it lands at ~13. Missing it is expensive: HMRC backdates registration and assesses VAT on gross receipts, plus a 10–30% failure-to-notify penalty.

**Float.** As principal you pay Google as spend accrues and bill monthly, carrying up to a month of every client's media. At 50 customers that is £20k–£40k on your personal credit. Google's monthly invoicing (the credit line that removes this) requires one year registered *and* $5,000+/month spend in three of the last twelve months, per account — you qualify for neither. Both Google and Meta also now add 2% UK surcharges *after* delivery, which your billing model absorbs.

**The meter.** There is no churned/cancelled state on the customer ladder, and nothing withdraws service on a lost transition. A customer who stops paying keeps their live site *and* keeps their Google Ads running on your account: £400–£3,200/month of your money, or 1–8x the fee you stopped collecting.

**One correction, in your favour.** An earlier finding claimed churn is "unmeasurable by construction". That was refuted — `stage_history` is append-only and every deal artifact is versioned, so churn rate, tenure and cohort retention are a query away, not a schema rebuild. Adding a `churned` stage is roughly a day's work. And "no way to take money" is true of the repo but false of the business: GoCardless Direct Debit is no-code onboarding and ships churn/MRR reporting for free.

### 7. Legal paperwork that does not exist but is publicly claimed

Every generated site publishes, to the world: *"This website is operated on behalf of [business] by TITAN, which acts as a data processor under [business]'s instructions."* Article 28(3) of UK GDPR makes a written contract mandatory whenever a controller uses a processor. Search the repo and docs for "DPA", "Article 28" or "sub-processor": zero hits. That published sentence is a dated, indexed, written admission of a relationship with no contract behind it.

It is also incomplete in a way that matters: every enquiry's name, phone and message is copied to your inbox, and enquiry names and message text are sent to the Anthropic API by the Brain's narration layer. Neither is disclosed, and neither is processor behaviour.

The realistic penalty is a reprimand, not a fine — no ICO fine has ever been issued for a missing Article 28 contract standing alone. The realistic *cost* is commercial: the first dentist, solicitor or franchise you approach will ask for a DPA at procurement and the deal stalls. Budget £1,500–£3,000 with a solicitor for three reusable documents: an Article 28 DPA, a terms-of-business allocating responsibility for client-supplied facts, and a client sign-off form. That third one is your primary personal liability shield under the DMCC accessory regime — right now you are approving accreditation claims, price ranges and insurance assertions about businesses you have not verified, with no record of the client ever confirming any of it.

---

### Things that were flagged as terrifying and are not

Worth knowing so you don't spend money on them:

- **"245 agents will cost £13k–£159k a month."** Refuted. There is no agent loop, no scheduler, and the number 245 appears nowhere in the repository (a whole-repo search returns only a CSS colour value). Build items are per-customer rows that cascade-delete with the customer, so whatever this eventually costs scales *with* revenue, not independently of it. The related "you'll blow Anthropic's rate limits 2.45x on every tick" is refuted for the same reason, and the Batch API would have handled it anyway.
- **"£495/month is uncompetitive."** Refuted. That compared your three-service bundle against a competitor's single service. Like-for-like your £395 lead-gen SKU sits between DPOM's £295 and £445 tiers, and the audit's own second market source puts UK trade Google Ads management at £800–£1,200/month — you are *below* market. Pricing is not your problem.
- **"The research corpus is inert."** Refuted, and this is the most encouraging finding in the whole audit. Volume 1 went from written to enforced code in **one day**, and moved a live site from mobile Lighthouse **64 → 86 → 92** across three pull requests. The chain (research → law document → `law.json` → CI gate) is real and works.

---

## 3. The gap between vision and reality, honestly sized

| What it says on the tin | What is actually there | Size of the gap |
|---|---|---|
| **7 channels** | 1 automated (`website`). `isManualBuildKind()` returns true for the other six. Google Ads *setup* is genuinely automated — a 268-line deterministic planner plus Google Ads Editor CSV export — it's the ongoing loop that's manual. GBP and Meta are externally blocked. LSA has no UK category for ~10 of your 35 trades and needs 3–4 weeks of Google verification even where it does. | 1 of 7 automated; 2 of 7 not even startable this quarter. |
| **35 trades of ad knowledge** | `TRADE_NEGATIVES` has five keys, one of which (`solar-battery-ev`) is not a trade in your taxonomy — so **4 of 35** trades have trade-specific negative keywords. The base list is 14 terms against a researched target of 150–400. Six of 35 trades emit keywords containing characters Google rejects (parentheses, commas), so those ad groups import with ads and **zero keywords** — including the highest-value service for both plumbing and electricians. | ~11% of the target negative list; 4 of 35 trades tuned; 6 of 35 partly broken. |
| **Research written but not implemented** | **Half true, and the half that's true is the important half.** Volume 1 (performance/design) is implemented and enforced by CI. Volume 3 (acquisition — 25 numbered "LAWS") is roughly **8%** implemented: one law fully, one dangerously (the accreditation badges), one partially. Zero code reads `docs/research` directly, by design — the flow is prose → law document → data file → gate, and that chain exists for performance and not for acquisition. | Performance: done. Acquisition: ~2 of 25 laws. |
| **245 agents (35 trades × 7 channels) that learn** | Does not exist as a design or as code. Nearest real artefacts: 19 cross-cutting "specialists" in a document that disclaims itself as non-committal, and five "future AI departments" in the vision doc. Production AI is one file (`anthropic-reasoner.ts`) making two calls to reword deterministic output. `industry-dna` is 300 lines of type definitions with zero instances; `knowledge-kernel` is a working database layer that has never stored a fact in production. | 0% built, and the arithmetic behind the number was never load-bearing. |
| **"Every site visually distinct, top-1% design"** | **7 distinct site designs for 35 trades.** Section order is a pure function of archetype (8 hardcoded arrays); theme is a pure function of archetype (5 token sets, 4 visually distinct palettes, one shared font pairing). No per-business seeding anywhere. No logo support at all — no field, no slot, no element. Measured: two roofers in the same town render **99.6% identical markup** and identical H1s. A dentist and a roofer are 64.3% identical. Only 7 of the 8 archetypes are reachable, so by the pigeonhole principle **customer #8 guarantees** two customers sharing a template. | "Bespoke, built for your trade" is defensible. "No two sites look the same" is measurably false. |
| **"Live on all channels"** | Website: live and genuinely good. Google Ads: a spreadsheet you import by hand, with no conversion tracking, so it cannot be optimised or proven. Everything else: a status badge. | 1 live, 1 half-live, 5 badges. |

Two smaller gaps worth naming because they will surface in front of a customer:

- **There is no way to change a word.** The only input to a site is business name, trade, location and coverage areas. "Regenerate" on unchanged inputs produces byte-identical output. If a headline is wrong, your options are to change the business name or edit the database. Customer #2 will ask for a word change.
- **What was sold never reaches the build queue.** `Deal.includedServices` is collected, validated and stored — and then read by nothing. Every won business gets all seven build items regardless of package, so a £495 Launch customer's board shows six manual items they did not buy.

---

## 4. What is genuinely good

Short, specific, and true.

**The sites are fast, and that is measured, not claimed.** Mobile Lighthouse 91–99 on live sites, 99 on a fresh scaffold, against a Wix median of 62 and Squarespace 30. Warm time-to-first-byte of 13ms. CSS-only motion with no animation library in the bundle, correct heading order, zero dangling accessibility attributes.

**You turned research into enforced quality in 48 hours.** The corpus → performance law → `law.json` → Lighthouse CI gate chain took a live site from 64 to 92. That is the single best evidence in the whole audit that you can convert knowledge into shipped improvement, and it is exactly the capability the acquisition half of the research still needs.

**Honesty decisions most competitors do not make.** Reviews cannot be fabricated — a database constraint makes the who/how/when attestation all-or-nothing, and the section collapses in public when there are no verified reviews. JSON-LD refuses to invent ratings. Nothing publishes without your approval. The site generator is fully deterministic, so a site costs roughly £0 in AI tokens and produces the same output twice.

**The architecture is sound where it counts.** Immutable publication snapshots pinned to an exact blueprint version, so regenerating cannot mutate a live site. Customer domains never receive a cookie — the middleware returns before any auth code runs. Database row-level security is deny-by-default. Two storage adapters held to the same contract tests. 663+ tests green. Instant one-command rollback.

**The 35-trade service vocabulary.** Four to ten genuinely trade-specific service names per trade — described by the audit that examined it as "the single best piece of real per-trade content in the codebase." It is also the one thing that makes blueprints differ meaningfully between trades today.

**The sales tooling.** The ROI calculator and Deal Builder work as one stateful unit with a locked, server-re-derived CPL and soft price floors that require a recorded reason to breach. Your own earlier audit scored "The Reveal" 10/9 and called it the one surface already at the bar. That is close infrastructure, and it is built.

**The ADRs are honest.** Repeatedly across eleven audits, the adversarial pass found the code accurately documenting its own limitations — "v1 honesty: only the website pipeline is automated", "read-modify-write: racing beacons may drop the odd count", "the substring trap". Most codebases lie to themselves. Yours does not.

---

## 5. What to build next, in order

The ordering principle: before customer 1, do only the things that make it *legal, honest and sellable*, plus the data you can never go back and collect. Nothing on that list is a feature. Then go sell. Everything else waits for evidence that someone will pay.

### Before the first paying customer — target: under two weeks of work

1. **Make the accreditations empty.** One hour. Return an empty list; let the section collapse. This is the single largest legal exposure and the cheapest fix in the document.
2. **Stop generating "completed project" and before/after imagery.** Half a day. Restrict generated media to hero, atmosphere and texture slots; make evidentiary slots customer-photo-only and collapse when empty. Removes an entire category of risk instead of managing it.
3. **The four embarrassment bugs — under a day, all four.** (a) Change `/roof/i` to `/\broof/i` in the FAQ matcher, so damp-proofers stop publishing roofing prices — four characters, full test suite still green. (b) Stop printing internal vocabulary as section headings; "Lead Capture" currently appears on 100% of published pages, along with "Review Wall" and "Transformation Arc" — 1–2 hours across 11 call sites. (c) Stop falling back to internal SEO pillars as the customer's service list, so off-taxonomy trades stop advertising "Hull & area pages" as a service they offer — ~3 lines. (d) Add a display name to the taxonomy so H1s stop reading "solar pv" and "garage — clutch/cambelt/wetbelt" — 12 of 35 trades affected, 2–4 hours.
4. **Make the phone button dial.** The intent signal and the phone number are already computed and unused. Add a `call_click` metric at the same time. This is a live revenue leak on emergency trades, not a nice-to-have.
5. **Capture the data you can never backfill.** Click IDs and UTM parameters into a hidden field on the form; `channel`, `quoted`, `won`, `jobValue`, `jobPostcode` on the enquiry. The 90-day Google window means anything not captured at the moment of the click is gone.
6. **Decide principal vs agent, and put the client's card on the client's own Google Ads account.** This one decision moves your VAT threshold from ~4 customers to ~13, removes the float entirely, and caps an unpaid invoice at the fee rather than fee-plus-media.
7. **Fix the takedown path.** All three cache-invalidation calls currently match nothing — measured zero of fifteen possible tag matches — and the caching header means an unpublished site can serve indefinitely on a low-traffic domain. You cannot currently take a site offline on demand, which matters the first time someone asks you to.
8. **The paperwork and the plumbing.** Solicitor: DPA, terms of business, client sign-off form (£1,500–£3,000). GoCardless for collection (no code). Supabase Pro (£25/month — you currently have *no database backups at all*, and a bad migration would take every site, every blueprint and every lead with it). Vercel Pro (the Hobby licence is non-commercial, so this is a compliance issue before it's a limits issue). Companies House filing (~£50) and TITAN's own Google Business Profile — both start clocks you cannot compress.

**Then stop and sell.** One town, one trade, 100 named businesses, speculative sites built before the call.

### Before customer 10 — the "stop drowning" list

- **Automate the ongoing Google Ads loop** (weekly search-term review, negative keyword additions). This is where your manual hours actually go, and it needs no external approval. Ship the 150+ term master negative list at the same time — a few hours that directly protects client money in week one.
- **A slot-override layer** so you can change a sentence in 30 seconds. Roughly a day if done as a key-value override map rather than a page builder. Customer #2 will need it.
- **The per-trade content transcription.** ~25 hours converting the trade playbooks into structured data records. This is the only asset in the repo a competitor cannot rebuild in a weekend, and it is the fix for the 96%-identical problem, the archetype-mismatch problem and the missing-FAQ problem simultaneously.
- **A monthly customer report showing promised vs delivered.** Nothing currently compares enquiries to the lead target you sold. 48% of departing agency clients cite delivery dissatisfaction, which is usually an attribution failure rather than a performance failure.
- **Error tracking and one synthetic uptime check per live site.** Your nightly Lighthouse job already does availability checking — but only for two hardcoded slugs, covering 2 of 8 archetypes and **zero** of the custom-domain path. Extend `archetypePaths` to every live site plus one hostname URL; that's a one-line config change against a check you already built. Then split the availability signal out from the performance gate so an outage and a Lighthouse wobble aren't the same red X.
- **Media pipeline fixes.** The hero film is item 2 of 25 in the generation plan and polls for up to 10 minutes inside a function that dies at 5 — so it times out and the remaining 23 images are permanently unreachable. The media pipeline is non-functional in the deployed app today. Also: gate the film behind its own feature flag (you're paying ~$1.40 per site for an asset the renderer is configured never to display — 64% of your real per-site media spend), and fix the pricing (Kling is $0.28 *per second*, not per clip, so your cost display understates by 5x).
- **Add `blocked_external` to the build ladder and `churned` to the customer ladder**, and make a lost transition stop the ads. One day, and it closes the largest ongoing cash leak.
- **Cap the database reads.** Five list queries have no limit against a backend that silently truncates at 1,000 rows. The metrics one is the live risk — it's the only one with no sort order, so truncation drops the *most recent* days, meaning your dashboards quietly under-report the current week. Add a date window. Also validate the `path` field on `/api/metrics`, which is currently an unauthenticated endpoint where any string mints a new row — about four minutes to poison a customer's numbers.

### Before customer 100 — the "make it a product" list

- **Break the 99.6%.** Logo upload plus one brand colour at intake, accent colours derived with a contrast-safe algorithm, a pool of display faces seeded from business ID, and per-trade section-order overrides. The performance law is not the constraint here — colour, type and layout cost zero bytes.
- **The query patterns.** The founder home page issues 1 + 10N database round trips, *twice per render*, refreshed every 60 seconds by a client-side timer. At 100 businesses that's ~2,000 requests per render and a measured peak of 945 concurrent connections against a database budgeted for 60. It's unusable somewhere between 50 and 100 customers.
- **Domain automation** via the Vercel API, with per-domain status in the CRM. Also fix the hostname fallback that serves a site whenever any unmapped domain's first label matches a published slug — that's a cross-tenant serving hazard, not just a convenience.
- **The real moat: pooled conversion data and offline conversion import.** Be honest with yourself about timing — meaningful per-trade signal needs roughly 20 customers per trade. Instrument it from customer 1 anyway; the flywheel only starts if the wheel is measured from the first turn. Do not sell it as a present-tense benefit.
- **Service pages.** You have per-trade service lists and a working multi-page mechanism (area pages prove it). One page per service beats the entire area-page programme organically — and today's area pages are 94–98% textually identical, which is Google's own definition of a doorway page.
- **Consent management** if and only if you commit to paid social.

---

## 6. Decisions only you can make

Each of these changes what gets built. None of them is mine to answer.

**1. Whose card pays Google?** *If TITAN's:* VAT registration at ~4 customers, £20k–£40k of float on your credit at 50 customers, and an unpaid invoice costs you fee plus media. *If the client's:* VAT at ~13 customers, no float, media off your balance sheet — but you lose the "one simple number" pitch and the client sees the raw Google spend. This is the highest-leverage single decision in the document.

**2. Sole trader in a van, or the 2–5 van operator?** At £1,554/month including VAT, Launch consumes a sole trader's *entire* marketing budget, which makes every sale a rip-and-replace of Checkatrade — the hardest sale there is. The 2–5 van operator can afford you but is a different animal: longer cycle, asks for case studies you don't have, often already has an agency. You cannot serve both with one price and one pitch. If you pick the sole trader, you need a genuine on-ramp (the £2,995 + £49/month website-only SKU already in your catalogue, or a £99–149/month site + GBP tier).

**3. Five trades properly, or 35 shallowly?** Five trades with real per-trade content, verified badges and correct FAQs produces sites you can charge for and show twice. Thirty-five archetype-templated trades produces 17 documents and a demo that falls apart the moment a prospect looks at two portfolio examples.

**4. Genuinely cookieless, or consent-managed measurement?** You currently claim the first in the footer and privacy notice of every site, and have the code path for the second sitting one database field away from making both statements false. Cookieless is a real, saleable differentiator and keeps the footer honest — but it means no Meta pixel and no remarketing, ever. Pick one and make the legal copy a function of what the site actually loads, not a constant.

**5. Will you let sections collapse rather than fill them with fabrications?** Every compliance fix in section 2 depends on answering yes. It means a customer's site launches with fewer trust badges, fewer portfolio images and no FAQ until they supply real ones. That is a sales conversation you will have to be willing to have.

**6. Cap sales, or hire?** The solo ceiling is 36–60 Launch customers or 10–15 on the full bundle, and the automation that lifts it depends on Google and Meta approvals you don't control. There is no third option. Decide the number now so you know when to stop selling.

**7. Will clients ever see or touch an ads screen inside TITAN?** Answer before you write any Google Ads API code. "No" plausibly qualifies you for Google's internal-use exemption and saves you from rebuilding the Google Ads console to meet Required Minimum Functionality — many months of work. "Yes" adds those months.

**8. Do solicitors and dentists stay in the dropdown?** They carry the heaviest regulatory load (SRA Transparency Rules, GDC, CQC, FCA financial-promotion rules on the "0% finance" line currently in your dental FAQ bank), and TITAN generates non-compliant content for both today. Deferring them until per-trade compliance exists is the disciplined call.

**9. Will you sell on outcome?** A first-90-days lead floor with money back. You have the CRM and the measurement to back it; almost no UK trades agency will make that promise. It is the fastest way to beat a £145/month competitor without cutting your price — but only after finding #4 above is fixed, because otherwise you cannot count the leads you'd be guaranteeing.

---

## 7. What we still do not know

Each of these is one query, one invoice, one phone call, or one hour with a professional.

| Unknown | Why it matters | How to settle it |
|---|---|---|
| **Your runway and monthly burn.** Not in the repo anywhere. | Determines whether "stop building, go sell" is urgent or merely correct — and how many customers you need to survive. | You already know. Write it down next to the break-even count. |
| **Are you a limited company? Do you hold professional indemnity insurance, and does it exclude AI-generated content?** | Determines whether the DMCC £300,000 accessory penalty lands on the company or on you personally. AI-content exclusions are becoming standard in PI policies. | Check the policy wording. File at Companies House (~£50) if you haven't. |
| **Are you VAT registered?** The app currently prints "Figures include VAT at 20%" on every quote view. | If you're not registered, the quote is wrong by 20% in your favour today and wrong by 20% against you the day you register. | You know. Then add a `vatRegistered` flag and replace the five hardcoded 20% multipliers. |
| **What did Replicate actually charge last month, line by line?** | Compare against the sum of logged costs. Validates or destroys the entire media cost model in ten minutes. Nothing in the codebase has ever been reconciled against a real bill. | One invoice, one SQL sum. |
| **The pixel dimensions of a generated hero image.** | The code requests 1344×768 but never sends the parameter that makes Replicate honour it, so every image is probably a 1024×1024 square with half the desktop frame cropped away. Two-minute check; changes the whole rendition strategy. | Open any hero in the Supabase storage bucket and read its dimensions. |
| **Vercel plan: Hobby or Pro?** | Changes the domain cap (50 vs unlimited), cron frequency (daily-only vs any), log retention (1 hour vs 1 day), and whether you're licensed for commercial use at all. | Look at the dashboard. |
| **Your media reject rate.** Recorded exactly once (a van with garbled fake branding). | Determines whether the review gate is a 20-minute job per customer or a 60-minute one — which sets your real ceiling. | One SQL query against `media_assets`. |
| **TITAN's own site conversion rate.** No baseline exists; every CPL in the system rests on a 3% assumption, and your own research cites a 3% vs 18.7% spread. | This one number moves lead volume by 6x and every deal you quote. | Thirty days of the first customer's traffic. |
| **LSA eligibility per trade against Google's live UK list.** Ten of your 35 trades look definitively ineligible; ten more have no clean category. | You are currently able to sell LSA management to businesses Google will not let in. | An hour against the live category list, then encode it as a hard gate. |
| **Whether Google grants API access at the tier you need, and whether internal-use exemption applies.** | Gates all ads automation. The developer token application is the long pole and costs nothing to start. | Apply this week. Ask Google directly about internal-use in the application. |
| **Whether either live demo site currently has a GA4 ID set in the database.** | If so, the "No tracking cookies" statement in that site's footer and privacy notice is false right now. | One row lookup. |

---

**The one-line version:** the craft is real and the compliance holes are cheap to close — but you have built a delivery engine for a business whose bottleneck was always distribution, and until three strangers have paid you, nothing else on this list is the most important thing.