# ADR-030: Lead Flow v1 — instant notifications, speed-to-lead, measurement

- **Status:** Accepted
- **Date:** 2026-07-09
- **Deciders:** Robert O'Toole
- **Tags:** core, notifications, measurement, crm, publishing
- **Supersedes:** — (activates the ADR-027 notification seam)
- **Superseded by:** —

## Context

Published sites capture enquiries but notify no one; the Account performance
panel is an honest-but-empty scaffold. A lead answered in five minutes and a
lead answered tomorrow are different businesses — **speed-to-lead is the
north-star metric**, and it cannot be improved until it is measured.

## Decision

### Notifications: a channel seam, not a provider commitment

`core/notifications` defines `NotificationChannel { send(message) }` — the
ONE seam every future channel plugs into (the seam ADR-027 reserved):

- **Email adapter (Resend):** activated ONLY by server-side env
  (`RESEND_API_KEY`, `RESEND_FROM`); transport injected for tests; **never
  called in CI**. Runtime `typeof window` guard (the ADR-026 lesson — no
  `server-only` in dynamically-imported modules).
- **Dev fallback:** a console channel that logs the full message — no key,
  no network — so the loop is verifiable on any machine. The in-app inbox is
  the enquiry store itself (a `new` enquiry IS the notification; no parallel
  notifications table to drift).
- **SMS:** deferred — provider decision sits with the founder; the channel
  interface is the seam it will implement.
- **Delivery failures are logged, never thrown and never silent** — an
  enquiry must never be lost because an email bounced.

New enquiry → immediate send to the account's `ownerEmail` (new Business
field) and the founder (`TITAN_FOUNDER_EMAIL`), containing who, contact,
message, source page, and a one-tap deep link to the enquiry in TITAN.

### Speed-to-lead: the enquiry lifecycle

Enquiries gain `status: new → seen → contacted → qualified | disqualified`
with timestamps (`seenAt`, `contactedAt`, `outcomeAt`). Transitions are core
workflows that also write the activity log. **Response time = contactedAt −
createdAt**, computed per enquiry and averaged per account — the first real
number on the performance panel and the founding metric of the future
revenue-attribution loop. Mark-as-contacted is one click from the enquiry
panel (which the notification deep link opens, highlighted).

### Measurement: first-party, privacy-sane, aggregate-only

Published pages send three events — `view`, `form_start`, `form_submit` —
via `navigator.sendBeacon` to `/api/metrics`. **No cookies, no fingerprints,
no third-party trackers, no per-visitor records:** the store is a DAILY
AGGREGATE per business × path × event (one counter row), which is all the
panel needs and the least data that answers the question. Previews never
send. The panel shows visits, enquiries, conversion per page, top pages, and
average response time — provenance-labelled "measured first-party by TITAN".
**GA4 is an optional per-site hook** (`ga4MeasurementId` on the Business,
default absent → no script injected) for customers who ask for it.

## Consequences

### Positive
- No enquiry can arrive unseen: email + in-app within seconds of submission.
- The performance panel stops being a promise ("measurement coming") and
  starts being small, true numbers.
- Speed-to-lead becomes a managed number per account.

### Negative / Trade-offs
- Daily aggregates cannot answer per-visitor questions (sessions, journeys)
  — deliberately; that data isn't needed yet and carries privacy weight.
- Email deliverability depends on the founder configuring a verified Resend
  sender; until then the console/dev channel carries the loop.

### Neutral
- Migration `20260708000000_lead_flow_v1.sql`: businesses gain
  `owner_email` + `ga4_measurement_id`; enquiries gain status + timestamps;
  new `site_metrics` aggregate table. Spine shape version bumped.
- Out of scope, recorded: SMS/call tracking, revenue attribution (needs
  outcome data — next), weekly digests, customer-facing app.

## Alternatives Considered

- **GA4 as the default analytics** — third-party by default on customers'
  sites, cookie/consent weight, and TITAN's own panel would depend on
  Google's numbers. First-party aggregates by default; GA4 opt-in. Rejected
  as default.
- **A notifications table for the in-app inbox** — a second copy of the
  enquiry that can drift from it. The enquiry's own status IS the unread
  state. Rejected.
- **Per-event visitor logs** — more future flexibility, materially worse
  privacy posture, no current question needs it. Rejected for v1.

## References

- ADR-027 (enquiry entity + notification seam), ADR-025 (provenance rule).
- `src/core/notifications/`, `src/core/business/{model,workflows}.ts`,
  `src/app/api/metrics/`, `supabase/migrations/20260708000000_lead_flow_v1.sql`.
