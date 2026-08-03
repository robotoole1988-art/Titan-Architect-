# TITAN Call Tracking — Twilio Architecture

Stack: Next.js 16 (App Router route handlers under `src/app/api/*`, thin, delegating to feature modules) + Supabase + Twilio. Feature module: `src/features/call-tracking/`.

## 1. Number pool

- One or more **UK local (geographic) numbers per client area**, purchased on TITAN's Twilio account, mapped `tracking_number -> business_id` in Postgres. Out-of-area allocation is permitted by Ofcom where the end user requests the area code (see DOC 1 §7), but product policy is: number area code matches the client's advertised service area.
- **GB regulatory bundle:** query the Regulations resource dynamically before provisioning — do not hardcode requirements, they change (`GET https://numbers.twilio.com/v2/RegulatoryCompliance/Regulations?IsoCountry=GB&NumberType=local&EndUserType=business`). If a bundle is required, provisioning fails without an approved bundle; flow is End-User -> Supporting Documents -> Bundle -> ItemAssignments -> Evaluation -> submit -> provision with `bundle_sid`. (Per twilio-regulatory-compliance-bundles skill.)
- **Open compliance decision (flag to founder + Twilio support):** the ISV rule in the bundles skill is that "End-User records must reflect the actual end-user (your customer), not you" — Twilio audits this. If numbers are provisioned on behalf of client businesses, each client may need its own bundle (Bundle Clones API helps at scale). If TITAN is genuinely the service operator/end-user, one TITAN bundle may suffice. Resolve before buying number #2. Some countries also require locality-matching addresses — check what GB's regulation actually returns rather than assuming.
- Number lifecycle: `provisioning -> active -> quarantine (client churn; keep 90 days answering with a "this business has moved" message) -> release`. [PRACTICE]

## 2. Inbound call flow (TwiML)

Route: `POST /api/twilio/voice` (thin handler -> `features/call-tracking/inbound.ts`).

1. **Validate `X-Twilio-Signature`** (see §6). Reject 403 on failure.
2. Look up `To` (tracking number) -> client config (real number, announcement asset, CLI mode, recording on/off).
3. Respond with TwiML — announcement first, then **Record-on-Dial** (the correct pattern: `<Dial record>`, never the `<Record>` verb, which is voicemail-style caller-only capture):

```xml
<Response>
  <Play>https://cdn.titan.app/announcements/{businessId}.mp3</Play>
  <Dial record="record-from-answer-dual"
        recordingStatusCallback="https://app.titan.uk/api/twilio/recording-status"
        recordingStatusCallbackEvent="completed"
        answerOnBridge="true"
        timeout="20"
        action="https://app.titan.uk/api/twilio/dial-result"
        callerId="{tracking_number_or_caller}">
    <Number url="https://app.titan.uk/api/twilio/whisper?call={CallSid}">+447700900123</Number>
  </Dial>
</Response>
```

Why these attributes:
- `record="record-from-answer-dual"` — recording starts **only when the tradesperson answers**, so the announcement has always fully played before any audio is captured (compliance property, enforced structurally), missed calls produce no recording and no recording cost, and dual-channel puts caller and tradesperson on separate channels for QA/future analytics. `record-from-ringing[-dual]` exists if ring-time capture is ever wanted — rejected for v1 for the same compliance reason. (Per twilio-call-recordings skill.)
- `<Play>` of a pre-rendered MP3 (or `<Say>` with a UK voice as fallback) — brandable, exact wording controlled centrally; the announcement asset is generated from the locked compliance wording in DOC 1 §4 and cannot be disabled while recording is on.
- Whisper via `<Number url>` — plays to the tradesperson before bridging: "TITAN lead for [Business]. This call is recorded. Press 1 to accept." The `<Gather>` in the whisper doubles as **human-answer confirmation**: if a mobile voicemail answers, nobody presses 1, the leg is not bridged, and `DialCallStatus` correctly reports no-answer — without this, mobile voicemail makes missed calls look answered and silently kills missed-call rescue. [PRACTICE — verify whisper+gather behaviour against current Twilio `<Number>` docs during build]
- `action="/api/twilio/dial-result"` — where missed-call detection happens.

## 3. Divert CLI presentation — trade-offs

| Mode | What tradesperson sees | Pros | Cons |
|---|---|---|---|
| **A. Tracking number (default)** | The TITAN tracking number | Clean Ofcom position — the presentation number is assigned to TITAN's account (authority to use is unambiguous; "valid, dialable, uniquely identifies" satisfied); tradesperson knows it's a TITAN lead and answers professionally; callbacks to the number can be routed/tracked later | Tradesperson can't see the real caller; callback from their mobile presents their own number and bypasses tracking |
| **B. Caller's real number (pass-through)** | The end caller's number | Tradesperson can call back directly; missed-call recognition on their handset | Callback bypasses tracking (attribution loss); presenting a number not assigned to TITAN/client sits in the diverted-call/presentation-number territory of Ofcom's CLI guidance (the 2024 guidance's Type 4 covers "onward transmission of the originating number" in private-network break-out scenarios, and Type 5 requires contractual authority for call centres; the anti-spoofing regime is tightening, with a new guidance version effective 15 July 2027) — Twilio supports caller-ID pass-through on forwarded inbound calls, but confirm the current Twilio rules and Ofcom text before enabling. NEEDS-REVIEW |

v1 default: **Mode A**, per-client override to Mode B after the CLI review. The whisper compensates for Mode A's anonymity by announcing the lead source.

## 4. Missed-call detection and rescue SMS

`POST /api/twilio/dial-result` receives `DialCallStatus` (`completed | no-answer | busy | failed | canceled`).

- `completed` -> update call outcome `answered`; respond `<Hangup/>`.
- Anything else -> outcome `missed`; respond with a courtesy close ("Sorry, we can't take your call right now — we've got your number and will call you straight back."); then trigger rescue:
  1. Guardrails: caller CLI present and not withheld; caller is not on the business's opt-out list; max 1 rescue SMS per caller per 24h; UK mobile check via Lookup line-type (don't SMS landlines). [PRACTICE]
  2. Send via a **Messaging Service** whose sender pool contains the client's tracking number (same number the caller dialled -> reply threading, dialable sender; do not use alphanumeric senders — they can't receive replies). Messaging Services also give automatic STOP/opt-out keyword handling — confirm advanced opt-out is enabled for UK traffic. (Per skills; UK has no A2P 10DLC — that is US-only.)
  3. Template (locked, non-promotional — PECR analysis in DOC 1 §1.3): `"Sorry we missed your call to {BusinessName}. We'll ring you back as soon as we can. If it's urgent, reply here with a good time. Reply STOP to opt out."`
  4. Record `message_sid`, track delivery via `POST /api/twilio/sms-status`.
- `POST /api/twilio/inbound-sms` — replies to the rescue SMS land in the enquiry timeline; STOP handled by the Messaging Service and mirrored to TITAN's opt-out table.

## 5. Recording callbacks and storage

`POST /api/twilio/recording-status` (`RecordingStatus=completed|failed`): validate signature (recording callbacks are signed like all Twilio webhooks — an unvalidated endpoint lets attackers POST fake recording URLs), then idempotent upsert keyed on `RecordingSid`, storing `CallSid`, duration, URL.

**Storage strategy:**
- **Phase 1 (launch):** Twilio-hosted. Store the recording SID/URL only; playback always proxied through TITAN's backend with Twilio credentials server-side (`…/Recordings/{sid}.mp3` fetched with account auth); never hand Twilio media URLs to the browser. Lock down media access in Twilio Voice settings so recordings are not fetchable without auth. [NEEDS-REVIEW: confirm the exact console setting]
- **Phase 2 (target, within weeks of launch):** on `completed`, a queued job downloads the MP3, writes to private Supabase Storage bucket `call-recordings/{businessId}/{callSid}.mp3` (UK/EU region), verifies checksum/size, then **deletes the Twilio copy** (`client.recordings(sid).delete()`). Single retention point, straightforward UK GDPR erasure, no indefinite Twilio retention (Twilio keeps recordings indefinitely unless deleted or auto-deletion is configured — per skill).
- Retention: nightly job deletes storage objects and nulls pointers past the client's retention setting (default 6 months); deletion logged minimally.
- Cost note: dual-channel files are ~2x mono size (per skill); Twilio storage is billed per recorded minute — at Phase 2 Twilio storage cost drops to ~zero and Supabase storage (pennies/GB) takes over. 3-min dual-channel MP3 ≈ 1.5–3 MB. [PRACTICE estimate]

## 6. Webhook architecture into TITAN

Routes (all thin, delegating to `src/features/call-tracking/`):

```
src/app/api/twilio/voice/route.ts             -> TwiML: announcement + Dial
src/app/api/twilio/whisper/route.ts           -> TwiML: whisper + Gather
src/app/api/twilio/dial-result/route.ts       -> outcome + rescue trigger
src/app/api/twilio/recording-status/route.ts  -> recording upsert + export job
src/app/api/twilio/sms-status/route.ts        -> rescue delivery status
src/app/api/twilio/inbound-sms/route.ts       -> replies -> enquiry timeline
```

Per the webhook skill:
- **Signature validation on every route** with the SDK validator (`twilio.validateRequest`) — never hand-rolled; construct the URL from a canonical `PUBLIC_BASE_URL` env var (proxy/host-header safe), parse the form body to params. No IP allowlisting (Twilio IPs are dynamic).
- **TwiML routes must respond well inside the hard 15-second voice ceiling** — all lookups indexed; no external calls on the hot path; rescue SMS and recording export are queued, never inline.
- **No redirects on webhook URLs** — 301/302 makes Twilio follow with GET and drop POST params (`Digits`, `RecordingUrl`).
- **Idempotency:** delivery and order are not guaranteed. Composite idempotency keys — `CallSid+CallStatus`, `RecordingSid`, `MessageSid+MessageStatus` — enforced by unique indexes on a `call_events` ledger; honour the `I-Twilio-Idempotency-Token` header Twilio adds on retries.
- **Retry tuning via connection overrides** on status-callback URLs: `…/recording-status#rc=3&rp=ct,rt` (retry 3x on connect/read timeout). Status callbacks return 204 fast; processing is async.
- **Fallback URLs** (`voiceFallbackUrl`) point at a static, separately-hosted TwiML asset that plays the announcement and diverts **without recording** — degraded mode never records without the announcement pipeline, and never drops a lead call.
- Secrets: `TWILIO_AUTH_TOKEN` server-side only; REST calls via API key; optional HTTP basic auth embedded in webhook URLs as a second layer.

## 7. Events into the enquiry pipeline

Calls are first-class enquiries. Via the existing spine repository layer:

- On `dial-result`: `enquiries.create({ kind: 'call', business_id, contact: { phone: caller_e164 }, call: { call_sid, tracking_number_id, outcome: 'answered'|'missed', duration_s, started_at } })` — `call_sid` unique key makes creation idempotent.
- On `recording-status`: attach `{ recording_ref, recording_duration_s }` to the same enquiry.
- On rescue SMS send/delivery/reply: timeline events on the enquiry.
- Tables (new, owned by the module): `tracking_numbers`, `calls`, `call_events` (raw ledger), `rescue_messages`, plus `enquiries` rows of kind `call` through the spine. Playback endpoint: `GET /api/recordings/{callId}` -> authz (business scope + role) -> 302 to short-lived signed Supabase URL; every playback audit-logged.

## 8. Form spec (name, address, email, phone, description, photos)

- Public per-business form -> `POST /api/enquiries/form` -> spine `enquiries.create({ kind: 'form', … })`.
- Fields: name (required), address + postcode (required, UK postcode validated), email (required, RFC + MX-lite check), phone (required, normalised to E.164 with `libphonenumber-js`; optional Twilio Lookup validation), description (required, 10–2000 chars), photos (optional, max 10, 10 MB each, `jpeg/png/webp/heic` allowlist, magic-byte sniffed).
- Photos -> private Supabase bucket `enquiry-photos/{businessId}/{enquiryId}/{uuid}.{ext}` via short-lived signed upload URLs; EXIF GPS stripped on ingest [PRACTICE — photos of homes + GPS = precise address leakage]; CRM renders via signed read URLs.
- Anti-spam: rate limit per IP, honeypot field, optional Cloudflare Turnstile; consent line under submit: "We'll use these details to respond to your enquiry. See our privacy notice." — link to the business's notice.
- Same retention/erasure machinery as calls (enquiry-level delete cascades to photos).

## 9. Cost model per client/month — ESTIMATES

**All figures are estimates.** Unit prices fetched from Twilio's public pricing pages on 2026-08-02, quoted by Twilio in **USD**, converted at £1 = $1.27 (≈ ×0.79); Twilio states prices may change and carrier fees may apply. **Verify against https://www.twilio.com/en-us/voice/pricing/gb, https://www.twilio.com/en-us/sms/pricing/gb and https://www.twilio.com/en-us/phone-numbers/pricing/gb before pricing the product.** Unit anchors: UK local number $1.15–$3.50/mo (Twilio's SMS and voice pages showed different figures on fetch day — verify); receive on local number $0.0100/min; outbound to UK mobile $0.0305/min (landline $0.0158); recording $0.0025/min; recording storage $0.0005/min/mo; SMS out $0.056; SMS in $0.0075.

Assumptions: 3 min average answered call (+ ~0.5 min announcement/ring on the inbound leg), 80% answer rate, divert leg to a UK **mobile**, 1-segment rescue SMS per missed call, ~50% reply rate, dual-channel storage at 2x, 6-month recording retention (steady state).

| Volume | 30 calls/mo | 60 calls/mo | 150 calls/mo |
|---|---|---|---|
| Number rental | $3.50 | $3.50 | $3.50 |
| Inbound leg minutes | $0.90 | $1.80 | $4.50 |
| Diverted leg (mobile) | $2.20 | $4.39 | $10.98 |
| Recording | $0.18 | $0.36 | $0.90 |
| Recording storage (6-mo, dual) | $0.43 | $0.86 | $2.16 |
| Rescue SMS out + replies in | $0.36 | $0.72 | $1.79 |
| **Total USD** | **≈ $7.6** | **≈ $11.6** | **≈ $23.8** |
| **Total GBP (est.)** | **≈ £6** | **≈ £9** | **≈ £19** |

Sensitivities: divert-to-landline cuts the largest line ~48%; storage moves to Supabase in Phase 2 (negligible); Twilio list prices exclude VAT and any volume discounts. Rule of thumb: **~£6–£19/client/month at realistic trade volumes — comfortably below a single lead's value.**
