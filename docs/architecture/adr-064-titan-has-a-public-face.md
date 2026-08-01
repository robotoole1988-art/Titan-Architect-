# ADR-064 — TITAN has a public face

- **Status:** Accepted
- **Date:** 2026-08-01
- **Prompted by:** Google Ads API case [5-6004000040948], returned incomplete
  on 23 July 2026
- **Builds on:** ADR-022 (multiple root layouts), ADR-054 (founder auth),
  ADR-057 (the Command Centre), ADR-059/060 (never generate a verifiable fact)

## Context

`titan-architect.vercel.app/` resolved to `requireFounder()`. Logged out, the
entire domain was one sentence — *"Sign in to TITAN Architect · Founder access
only"* — over a meta description reading *"The internal operating system for
designing, managing and evolving the TITAN ecosystem."*

On 23 July, Google's Ads API compliance team returned TITAN's Basic Access
application as incomplete, for exactly one reason:

> Your **company website** https://titan-architect.vercel.app does not have
> content related to your application.

They were right, and the failure was not the application's. A reviewer sent to
check whether a real business stood behind the request found a locked door
with a sign on it saying *internal tool*. There was no evidence TITAN sold
anything to anyone, because there was no page that said so.

The same gap blocks three other things already on the critical path:

- **Meta business verification** requires a live website that references the
  legal entity (API Applications Pack §3).
- **Google Business Profile API** requires a verified profile that *lists a
  website* (§2) — and the 60-day clock on that profile has not started.
- Every prospective customer. TITAN cannot sell websites from behind a login.

One missing surface, four blocked tracks. The email had been sitting unread
for nine days.

## Decision

**TITAN's root URL serves TITAN's public company site. The founder's room
moves to `/command`.**

A product's front door belongs to the people it is sold to. The Command Centre
owning `/` was an artefact of TITAN being the only thing TITAN had.

### The routing

1. New root layout group `src/app/(public)/` — four pages: `/`,
   `/advertising`, `/about`, `/privacy`. All `force-static`: no session read,
   no database, nothing to revalidate.
2. `src/app/(command)/page.tsx` → `src/app/(command)/command/page.tsx`.
   `COMMAND_CENTRE_PATH` lands in `src/config/routes.ts`, a deliberately
   dependency-free module, because four places must agree on it — the sign-in
   redirect, the already-signed-in bounce, the ⌘K palette's *am I home?*
   check, and the navigation registry — and three of them agreeing is how the
   founder would have discovered the fourth. Sign-in lands on `/command`, so
   the founder's actual journey (click the magic link, arrive in the room) is
   unchanged.
3. `isProtectedAppPath()` gains `PUBLIC_COMPANY_SITE_PATHS` — an **exact-match
   Set, not a prefix**. Every other public rule in that function is a
   `startsWith` and each one needed a look-alike test to prove `/sitesX` stays
   shut. A Set needs no such proof: a page is public because its exact
   pathname appears in a diff somebody approved. This is the one surface where
   a mistake is world-readable, and the gate stays deny-by-default everywhere
   else.

### The content

**Nothing on TITAN's site may be something TITAN would refuse to generate for
a customer.** ADR-059 and ADR-060 stop the *generator* inventing an
accreditation, a review or a photograph of work. The company site is
hand-written, so none of those choke points cover it: it is the one page in
the repository where a person could simply type *"NFRC approved · 500 happy
customers"* and nothing would stop them.

`tests/features/company-site/honesty-law.test.tsx` is that stop. It renders
the real markup of all four pages and fails on trade-body names, star ratings,
quoted testimonials, and the fabricated-count shapes a thin marketing page
reaches for. Two of those assertions failed on first run against copy written
minutes earlier — which is the argument for having written them.

Numbers are **derived, never typed**: the trade count is `TRADE_TAXONOMY.length`
and the performance floor is read from `law.json`, so the marketing site cannot
advertise a standard looser than the build enforces.

`/advertising` carries a second obligation. Google's reviewer reads it against
the filed application, so it states the operating model plainly — client
accounts under TITAN's manager account, spend billed to the customer, no
resale of API access, campaigns created paused, and honesty that execution is
a manual Ads Editor import today and API access replaces that step. Tests pin
each of those claims, because a copy rewrite that dropped one would desync the
site from the application silently, and the symptom would arrive weeks later
as a second rejection.

**And the site says TITAN is early.** No case studies, no logos, no
testimonials, in a section that is not hidden at the bottom. TITAN has none
that are real, and a company selling *"everything on your website is true"*
cannot be the one caught decorating its own. The disarming sentence is pinned
by a test too, because it is the first thing a future rewrite would cut and
the whole page depends on it.

## Consequences

### Positive
- The Ads API application can be answered with a URL instead of an excuse, and
  Meta verification and the GBP 60-day clock stop being blocked on a page that
  does not exist.
- TITAN can be shown to a prospective customer.
- The honesty law now applies to TITAN itself and is enforced the same way it
  is enforced on customers — by a test, not by remembering.

### Negative / Trade-offs
- The founder's muscle memory changes: `/` is now marketing. Mitigated by
  sign-in landing on `/command`, which is how he actually arrives.
- Four hand-written pages sit outside the primitive registry and the
  Performance Law's audited paths. They are static, image-free and ship no
  client component, so the risk is low — but they are not measured, and
  `law.json` should gain `/` once the fleet clears its floors.
- The footer's entity line is a placeholder until incorporation completes.
  Meta and Google advertiser verification both read the legal entity off it,
  so it is a known follow-up, not a finished sentence.

### Neutral
- No migration, no schema change, no new dependency. One route moved, one
  route group added.
