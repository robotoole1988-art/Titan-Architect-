# PRD-008: Call Tracking & Enquiry Capture

Supporting documents in this directory: the
[UK compliance brief](./call-tracking-uk-compliance-brief.md) (legal review
pending — nothing records until its GO/NO-GO gate passes) and the
[Twilio architecture](./call-tracking-architecture.md).

## Goals
1. Every client gets a local tracking number for their target area; every call is announced, recorded (where enabled), diverted to their real number, and lands in the TITAN enquiry pipeline as a `call` enquiry with recording, duration and outcome.
2. No missed call dies: instant, non-promotional rescue SMS from the number the caller dialled.
3. A structured enquiry form (name, address, email, phone, description, optional photos) feeding the same pipeline.
4. Compliance is structural: recording cannot be enabled without the announcement, retention and erasure are automated, and the DOC 1 GO/NO-GO gate is passed before the first recorded call.

## Non-goals (v1)
- Transcription or AI call analysis (dual-channel recording keeps the door open).
- WhatsApp.
- Number porting (in or out).
- Outbound dialler / click-to-call, PCI pause/resume, multi-destination ring groups, voicemail capture.

## User stories
- **Founder (TITAN):** provision a number for a client area in under 5 minutes; see per-client call volumes, answer rates, rescue conversions and cost; prove ROI ("your ads made the phone ring 43 times"); sleep at night on compliance (gate checklist enforced in-product).
- **Trade customer (client):** my phone rings as normal; the whisper tells me it's a TITAN lead and that the call is recorded; I press 1 and talk; missed calls text the customer back before I've wiped my hands; I see every call, playable, next to my form enquiries; I can delete a recording if a customer asks.
- **End caller (consumer):** I ring a local number from an ad; a short message tells me the call is recorded and why; I'm connected quickly; if no one answers I get a text within seconds telling me the business will call back — and replying works.

## Consent / announcement UX
- Announcement wording locked to the DOC 1 §4 recommendation ("is recorded", purposes stated); rendered per client with business name; recording toggle and announcement asset are one atomic config — enabling recording without a published announcement is impossible.
- Whisper to the client always states "this call is recorded" (covers their staff, and the reg 4 "every person who may use the system" duty).
- Onboarding wizard blocks go-live until: contract signed (Art 28 + recording instruction), privacy-notice template confirmed published, retention period chosen, ICO fee attestation checked.

## CRM surfacing
- Calls appear in the enquiry list beside form enquiries: badge (`answered` / `missed` / `rescued`), caller number, duration, area/number dialled, inline recording player (signed URL streaming, playback logged).
- Response-time metrics feed the existing speed-to-lead metrics: time-to-answer, missed-call rate, rescue-SMS latency (target < 60 s), time from missed call to first reply/callback event.
- Per-caller tools: export (SAR) and delete (erasure) actions on every call record.

## Rollout plan
1. **Test number (internal):** TITAN-owned number in a test area; verify announcement gating, dual-channel recording, dial-result taxonomy against real mobile voicemail, rescue SMS, retention delete job, SAR export. Exit: GO/NO-GO checklist items 1–13 demonstrably pass.
2. **Founder's own line:** founder's real business number behind a tracking number for 2 weeks; live compliance wording check, whisper ergonomics, CLI mode A usability. Exit: solicitor sign-off (item 14) obtained in parallel.
3. **First client:** one friendly client, recording default per the commercial decision below, weekly review of call outcomes and rescue conversion; then template the onboarding.

## Open questions for the founder
1. **Commercial:** who pays for numbers and usage — absorbed in TITAN's plan price, or passed through per client (~£6–£19/mo at DOC 2 estimates)? One number per client, or per campaign/area?
2. **Recording default:** default-on for all clients (needs the always-on proportionality position from DOC 1 §1.2) or per-client opt-in at onboarding? Recommendation: per-client explicit opt-in in the contract — cleaner legally, near-zero friction.
3. **Announcement voice/brand:** professional VO vs TTS (e.g. Polly UK voices); one TITAN house voice or per-client recordings; does TITAN get named ("calls are handled by TITAN on behalf of…")? Any client-name pronunciation review step?
4. **CLI mode:** confirm tracking-number presentation (Mode A) as default; is caller-number pass-through (Mode B) worth the legal review this quarter?
5. **Rescue SMS:** exact copy sign-off; send window (immediately 24/7, or hold overnight calls until 8 am as a courtesy — not legally required for service messages [PRACTICE])?
6. **Retention default:** accept 6 months recordings / 24 months metadata, or align to trade dispute cycles (12 months)?
7. **Churn policy:** what happens to a client's number when they leave — quarantine message duration, and do we ever release numbers that appeared on printed ads?
8. **Bundle identity:** are numbers provisioned with TITAN or the client as the Twilio regulatory end-user (DOC 2 §1 — affects onboarding data we must collect)?
