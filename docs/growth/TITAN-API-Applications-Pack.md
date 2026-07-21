# TITAN — API Applications Pack (v2)

> Rebuilt 21 July 2026 after v1 was lost to chat history. This version is banked in
> `docs/growth/` so git owns it. Verified against current (2026) application flows —
> see Sources at the bottom. Supersedes the v1 pack referenced in the v3 handover.

## Why this is THE critical path

Three external approvals gate four TITAN departments (Ads-execution, GBP, Meta, Reputation).
Review queues are dead time we cannot compress — every day unsubmitted is a day added to launch.
Everything below is paste-ready; Robert's clicks are sign-ins and Submit buttons.

**Strategy update (Feb 2026, verified):** Google now offers **Explorer Access** on new
developer tokens, which per Google's own developer blog "provides the same campaign
management and reporting features as Basic and Standard levels" — only quotas differ.
This likely un-gates pilot-scale ads execution MUCH earlier than the v1 plan assumed
(which waited on ~$1k MCC history for Standard). Plan: run the pilot on Explorer/Basic,
apply for Standard once MCC spend history exists.

---

## 1. Google Ads API — developer token

**Goal:** token with Explorer access immediately; Basic access application submitted; Standard later (post-pilot spend).

**Prerequisites**
- [ ] Google Ads **Manager account (MCC)** — create at ads.google.com/home/tools/manager-accounts (free)
- [ ] Pilot client account (Liberty Contractors) created and **linked as child** under the MCC — strengthens the application per Google's Feb 2026 guidance
- [ ] **Advertiser verification** completed on the MCC — also called out as strengthening the application
- [ ] Google Cloud project number to hand (same project as OAuth consent screen if already verified)

**Steps**
1. Sign in to the MCC → Tools & Settings → API Center.
2. Accept API terms → developer token is issued (Explorer access immediately).
3. Apply for Basic Access from the API Center using the use-case text below.
4. Reviews are taking days-to-weeks (Google added reviewers to clear a backlog, Feb 2026); apply now, build meanwhile on Explorer.

**Paste-ready use case (Basic Access application)**
> TITAN is a business operating system for UK trade businesses (roofing, driveways and
> 33 further trades). It generates each client's website, measures enquiries first-party,
> and builds Google Ads campaigns from real cost-per-lead intelligence. We currently
> export Ads Editor CSV build sheets; API access replaces this manual step with direct
> campaign creation, budget management and performance reporting for client accounts
> managed under our MCC. Access level today is insufficient because [Explorer quota
> exceeded / client accounts are live and require automated management]. One platform,
> one token; all client accounts are children of our manager account. We do not resell
> API access.

**Notes**
- The Required Minimum Functionality (RMF) rules only bind Standard access — Basic is exempt.
- API is free at all levels.

## 2. Google Business Profile API

**Goal:** Basic API access approved (0 → 300 QPM quota).

**Hard prerequisites — check before applying (v1 pack missed these)**
- [ ] The applying Google account must be **owner or manager of a verified GBP that has been active 60+ days**
- [ ] That profile must list a **website**
- [ ] Google Cloud project created; note the **Project Number** (Cloud Console → project dashboard)

> ⚠️ Decision needed: which profile do we apply with? Options: (a) Robert's own business
> profile if one exists and is 60+ days verified; (b) get owner/manager access on Liberty
> Contractors' GBP now — the 60-day clock on manager status may apply, so do this on
> pilot-signing day regardless. If no qualifying profile exists yet, this application
> queues behind that fix — start the clock immediately.

**Steps**
1. Cloud Console → note Project Number.
2. Open the GBP API contact/request form (support.google.com/business — "Applying for Google Business Profile API access").
3. Dropdown: **"Application for Basic API Access"**.
4. Submit with the use-case text below; watch quota in Cloud Console (300 QPM = approved; follow-up email also sent).

**Paste-ready use case**
> TITAN manages the online presence of UK trade businesses. On behalf of client
> businesses whose profiles we manage, we need the Business Profile APIs to keep
> business information accurate (hours, services, service areas), publish updates,
> and respond to reviews from one dashboard. Profiles are managed with the owner's
> explicit authorisation under manager access. Initial scale: single-digit profiles,
> growing with our client base.

## 3. Meta — Business Verification (gate for Marketing API / app review)

**Goal:** Business Manager verified; then app review for Marketing API access can follow.

**Prerequisites — documents (UK)**
- [ ] Meta Business Manager account (business.facebook.com)
- [ ] Legal business name + registration: Companies House certificate of incorporation (or sole-trader HMRC docs)
- [ ] Proof of address: utility bill / bank statement matching the legal name
- [ ] Business phone or email on the business domain for the confirmation step
- [ ] Business website (TITAN's own site) — must be live and reference the legal entity

> ⚠️ Decision needed: which legal entity is TITAN operating as? Verification is done
> against the entity's documents. If the company isn't registered yet, that's the
> long pole — registration is same-week at Companies House and unlocks this whole track.

**Steps**
1. Business Manager → Settings → Security Centre → **Start Verification**.
2. Enter legal details exactly as registered; upload documents; complete phone/email confirmation.
3. After verification passes, submit App Review for the Marketing API permissions the Meta department needs (ads_management, ads_read) with a screencast of TITAN's founder-gated flow.

## Sequencing (all three run in parallel — none blocks another)

| # | Application | Robert's part | Waiting on |
|---|-------------|---------------|-----------|
| 1 | Google Ads token | Create MCC, verify advertiser, accept API terms, submit Basic form | Google review (days–weeks) |
| 2 | GBP API | Confirm qualifying profile (see ⚠️), submit form | 60-day profile rule + review |
| 3 | Meta verification | Gather entity docs, run verification wizard | Meta review |

**Unblocks:** 1 → Ads-execution department (Explorer may unblock it immediately);
2 → GBP department; 3 → Meta + Reputation departments.

## Sources (verified 21 Jul 2026)
- Google Ads API access levels: developers.google.com/google-ads/api/docs/productionize/access-levels
- Feb 2026 developer-token update (Explorer access, application tips, backlog): ads-developers.googleblog.com/2026/02/an-update-on-google-ads-api-developer.html
- Developer token policy: developers.google.com/google-ads/api/docs/api-policy/developer-token
- GBP API prerequisites: developers.google.com/my-business/content/prereqs
- GBP access request workflow: support.google.com/business/workflow/16726127
- Meta app review / business verification: developers.facebook.com/docs/resp-plat-initiatives/individual-processes/app-review
