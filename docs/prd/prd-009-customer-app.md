# PRD-009: The Customer App — your business, always in good hands

The third of the founder's three builds (2026-08-07): the Command Centre is
the founder's room, the company site is TITAN's face, and this is the
customer's window — the app a trade customer opens with one thumb, on site,
between jobs, and trusts.

Design source: the founder's approved mockup
(`docs/founder/approved-designs/mockup-3-customer-app.png`, preserved on the
founder-designs branch) — "Your business. Always in good hands." Deep-space
navy, the living brain, plain English, real numbers.

## Why this exists

The customer philosophy says they are not buying software — they are hiring
an AI growth company. An employee you never hear from is an employee you
stop paying. The app is how TITAN reports for work every day: what came in,
what it did about it, what it recommends next. Retention is the Companion's
pillar, and this is its first surface.

## Goals

1. **The morning answer.** Open the app → one screen answers "is everything
   okay and what happened?": status line, new enquiries, revenue recorded,
   site visitors, campaign health — every figure measured, none invented.
2. **Enquiries in the pocket.** Every enquiry (form today; calls when
   PRD-008 lands) listed, newest first, with status and one-tap
   call-back / reply. The speed-to-lead clock is shown, because speed wins
   jobs and TITAN measures what it preaches.
3. **The activity feed.** The AI Activity stream from the mockup — "Google
   Ads optimised", "New enquiry received", "Website updated" — sourced from
   real system events (the notification seam, ADR-030, feeding a feed
   instead of only an inbox). TITAN's work made visible, timestamped, never
   embellished.
4. **Today's opportunity.** One recommendation card, at most, from the
   intelligence layer — phrased as a proposal with its reasoning ("Jarvis
   proposes; the customer disposes"). Absent until the Brain has something
   honest to say.
5. **Plain-English health.** Website performance, campaign state and review
   standing in words first, numbers second — the mockup's "Performing
   Great · 97/100" pattern, backed by the same law.json the platform
   enforces on itself.

## Non-goals (v1)

- Native App Store / Play Store binaries. v1 is an installable PWA on the
  customer's own domain infrastructure — the store shells of the mockup are
  a later increment, once there are customers to install them.
- Invoicing, quoting, payments (Companion pillar, later PRDs).
- In-app chat with the Brain (command-mode is founder-only today).
- Push notifications beyond the existing email seam in increment 1;
  Web Push is increment 2, SMS rides PRD-008's rails.
- Any number the platform did not measure. If a metric has no source, the
  tile does not render — grace text instead ("Measurement begins with your
  first live campaign"), per THE-FEELING annotation 1.

## User stories

- **Trade customer:** on the scaffold at 7:40am, I thumb the app: everything
  is running, two enquiries overnight, one marked urgent. I tap, I call the
  customer back, the job is mine before my competitor has opened his van.
- **Trade customer, monthly:** revenue this month, what's pending, what the
  spend produced — in words I'd use myself. I stop wondering what I'm
  paying for, because I watch it work.
- **Founder (TITAN):** every customer sees the same honest surface I see in
  the Command Centre, scoped to their business; support conversations start
  from shared numbers, not arguments about them.

## Shape (increments, each behind the founder's judgment gate)

1. **The morning screen** — authenticated customer view (existing auth,
   scoped to their business): status, enquiry count, visitors, campaign
   state; enquiry list with call-back links. Server-rendered, phone-first,
   the site's performance discipline applied to the app itself.
2. **The activity feed + opportunity card** — event stream persisted behind
   the notification seam; Brain recommendation surfaced when one exists.
3. **Installability + Web Push** — PWA manifest, offline shell, push on new
   enquiry ("never miss a lead" made literal).
4. **Store presence** — only when real customers ask for it; the mockup's
   App Store badges become true then, not before.

## Open questions for the founder

1. **Domain:** app.titan… under the platform domain, or per-customer
   subdomain? (Affects auth cookies and the PWA scope.)
2. **The greeting:** "Good morning, John 👋" — first name, business name, or
   configurable? Emoji or not (the mockup says yes; the site's tone says
   maybe)?
3. **Revenue source of truth:** enquiry-attributed estimates are still
   estimates — show them labelled as such from day one, or hold the revenue
   tile until invoice data exists (Revenue Attribution idea, IDEAS.md)?
4. **Support surface:** the mockup's Call Us / WhatsApp / Email Us panel —
   which channels are real at launch? (WhatsApp is a PRD-008 non-goal.)
5. **Increment 1 pilot:** which friendly customer judges the morning screen
   with you?

## Success definition

A customer who opens the app most mornings, answers enquiries faster than
they did before TITAN, and — when asked what TITAN does for them — scrolls
the activity feed instead of reaching for an opinion.
