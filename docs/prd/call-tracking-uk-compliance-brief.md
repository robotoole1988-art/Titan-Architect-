# UK Call Recording Compliance Brief — TITAN Call Tracking

**Status:** Draft for legal review. Prepared 2026-08-02.
**Scope:** TITAN provisions a UK local number, records all calls, and diverts them to a trade business's own number. Callers are consumers; TITAN operates the system; the trade business receives the calls.

**Labelling convention used throughout:**
- **[VERIFIED]** — confirmed against a primary source (ico.org.uk, legislation.gov.uk, ofcom.org.uk), URL given.
- **[PRACTICE]** — common, defensible industry practice; not a stated legal requirement.
- **[NEEDS-REVIEW]** — interpretation or unverified point; must be confirmed by a solicitor before launch.

Nothing in this document is legal advice. It is a structured brief for TITAN's solicitor to confirm.

---

## 1. The two legal regimes that apply

Recording a phone call in the UK engages **two separate regimes simultaneously**. Satisfying one does not satisfy the other.

### 1.1 Interception law — Investigatory Powers Act 2016

- **[VERIFIED]** Intentionally intercepting a communication in the course of transmission on a public or private telecommunication system without lawful authority is a **criminal offence** — on indictment, up to 2 years' imprisonment or a fine, or both. Source: IPA 2016 s.3, https://www.legislation.gov.uk/ukpga/2016/25/section/3
- **[VERIFIED]** s.46 IPA 2016 gives businesses a route to lawful authority: interception "for monitoring or keeping a record of — (a) communications by means of which transactions are entered into in the course of the relevant activities, or (b) other communications relating to the relevant activities", carried out "using apparatus or services provided by or to the person carrying on the relevant activities for use (whether wholly or partly) in connection with those activities", under regulations made by the Secretary of State. Source: https://www.legislation.gov.uk/ukpga/2016/25/section/46
- **[VERIFIED]** Those regulations are the **Investigatory Powers (Interception by Businesses etc. for Monitoring and Record-keeping Purposes) Regulations 2018 (SI 2018/356)**. Regulation 3 authorises monitoring/recording to (among others) **establish the existence of facts**, **verify compliance with regulatory or self-regulatory practices**, and **ascertain/demonstrate standards achieved** (quality/training), plus crime prevention, detecting unauthorised use, and ensuring effective system operation. Source: https://www.legislation.gov.uk/uksi/2018/356/made
- **[VERIFIED]** Regulation 4 attaches conditions. The recording must be "effected by or with the express consent of the system controller"; the system must be "provided for use wholly or partly in connection with" the relevant business activities; and — the critical one:

  > "the system controller has made all reasonable efforts to inform every person who may use the telecommunication system that communications transmitted by means of that system may be intercepted."

  Source: SI 2018/356 reg 4(1), https://www.legislation.gov.uk/uksi/2018/356/made
- **[NEEDS-REVIEW]** Whether the external caller is a "person who may use the telecommunication system" (so that the reg 4 notification duty extends to them), or whether the duty covers only the business's own users, is an interpretive question. TITAN should not rely on the narrow reading: **the design assumption is that every party to the call — caller, tradesperson, and any TITAN staff who later listen — is informed.** The pre-call announcement plus the callee whisper achieve this regardless of which reading is correct.
- **[NEEDS-REVIEW]** Who counts as the "system controller" in TITAN's architecture. TITAN operates the Twilio system and holds the number, so TITAN plausibly is the system controller, with the trade business's signed order/ToS constituting the "express consent" and confirming the system is provided in connection with the client's business. Confirm this characterisation, and ensure the client contract contains an explicit instruction/consent to record.

### 1.2 Data protection law — UK GDPR / DPA 2018

A call recording containing a person's voice, name, address, and description of their job is personal data. Everything below applies regardless of the IPA position.

- **[VERIFIED]** You must determine your lawful basis **before** starting to process, and document it. The ICO now lists seven bases (the six Article 6 bases plus the new "recognised legitimate interests" basis introduced by the Data (Use and Access) Act 2025). Source: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/
- **[VERIFIED]** The ICO's position on recording business calls (stated in its employment/monitoring guidance, the closest ICO guidance on point): **"You must tell these people that you are recording the call and why. A recorded message is good practice."** And where a recorded message is not feasible, staff must be instructed to tell callers. Source: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment/monitoring-workers/specific-data-protection-considerations-for-different-ways-or-methods-of-monitoring-workers/
- **[VERIFIED]** Same source: **"It is not usually proportionate to monitor or record the content of calls in all cases."** This is a direct challenge to "all calls recorded, always". TITAN needs a documented proportionality justification (see LIA below) and should offer per-client controls. **[NEEDS-REVIEW]** whether blanket always-on recording across all clients survives the proportionality analysis, or whether recording should be a per-client documented decision.
- **[VERIFIED]** Privacy information must be provided **at the time you collect the data** from the individual, and must include purposes, retention periods, and who data is shared with; it must be "concise, transparent, intelligible, easily accessible" in "clear and plain language"; layered and just-in-time notices are recommended. Source: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/

### 1.3 PECR

- **[VERIFIED]** PECR (SI 2003/2426) governs the **missed-call rescue SMS**, not the recording itself. Regulation 22 prohibits transmitting "unsolicited communications for the purposes of direct marketing by means of electronic mail" (which covers SMS) without prior consent, subject to the reg 22(3) "soft opt-in" (details obtained "in the course of the sale or negotiations for the sale of a product or service"; marketing of "similar products and services only"; simple, free refusal offered at collection and in every message). Source: https://www.legislation.gov.uk/uksi/2003/2426/regulation/22
- **[VERIFIED]** A message that is purely administrative/customer-service is a **service message**, outside the marketing rules — but "If your service message has elements that are direct marketing, even if that is not the main purpose of your message, then it will count as direct marketing." Source: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/direct-marketing-guidance/identify-direct-marketing/
- **Consequence for the rescue SMS [NEEDS-REVIEW as applied]:** a text that says only "Sorry we missed your call — we'll ring you back shortly" in response to the caller's own inbound call is strongly arguable as a solicited service message. The moment it adds promotional content ("check out our summer boiler deals"), it is direct marketing and the soft opt-in is doubtful — because a missed call gives no opportunity to offer the refusal "at the time that the details were initially collected". **Design rule: the v1 rescue SMS is strictly non-promotional and identifies the business the caller rang.** Confirm with counsel.
- **[NEEDS-REVIEW]** The claim that PECR imposes no notification duty on the recording itself (recording duties arising instead under IPA/UK GDPR) is the standard analysis but is a negative claim we did not exhaustively verify; counsel to confirm no other PECR provisions (e.g. traffic data rules aimed at communications providers) bite on TITAN.

---

## 2. Controller / processor analysis

- **[VERIFIED]** Controller = "the natural or legal person… which, alone or jointly with others, determines the purposes and means of the processing"; processor = one that "processes personal data on behalf of the controller"; a processor that starts determining purposes for itself becomes a controller. Source: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/controllers-and-processors/controllers-and-processors/what-are-controllers-and-processors/

**Recommended allocation [PRACTICE, NEEDS-REVIEW]:**

| Processing | Controller | Processor |
|---|---|---|
| Recording content, caller details, enquiry data — used for the trade business's QA, records, lead handling | **Trade business** | TITAN (and Twilio, Supabase as sub-processors) |
| Platform operations data — call metadata for billing, service metrics, abuse prevention | **TITAN** (own controller purposes) | Twilio |
| Any future TITAN cross-client analytics on recording *content* | Would make TITAN a controller (possibly joint) for that purpose — **out of scope for v1; do not do it without fresh legal analysis** | — |

Required paperwork before launch:
1. **Article 28 processing terms** in TITAN's client contract (subject matter, duration, nature/purpose, data types, controller instructions — including the instruction to record, sub-processor authorisation for Twilio/Supabase, deletion on termination). **[PRACTICE** — Article 28 content itself is statutory; exact drafting for counsel. **NEEDS-REVIEW]**
2. **International transfers [NEEDS-REVIEW]:** Twilio is a US company; recordings may be processed/stored outside the UK by default. Execute Twilio's DPA, confirm the transfer mechanism (UK IDTA/Addendum), and evaluate Twilio regional data-residency options, or export recordings promptly to UK/EU-hosted Supabase storage and delete from Twilio (see DOC 2 §7).
3. **ICO registration fee:** organisations, including sole traders, that use personal information must pay the data protection fee unless exempt — Tier 1 £52 (turnover ≤ £632k or ≤ 10 staff), Tier 2 £78, Tier 3 £3,763, £5 direct-debit discount. Both TITAN **and each trade-business client** are controllers. **[VERIFIED]** Source: https://ico.org.uk/for-organisations/data-protection-fee/data-protection-fee/ and https://ico.org.uk/for-organisations/data-protection-fee/ (legal basis: Data Protection (Charges and Information) Regulations 2018). Most trade businesses already owe this regardless of TITAN; TITAN onboarding should check it.

---

## 3. Lawful basis: consent vs legitimate interests

**Recommendation: legitimate interests (Article 6(1)(f)), not consent.** The trade business (controller) relies on legitimate interests for recording; TITAN documents the Legitimate Interests Assessment template centrally.

- **[VERIFIED]** The legitimate interests basis requires the three-part test — purpose ("Are you pursuing a legitimate interest?"), necessity ("Is your use of personal information necessary for that purpose?"), balancing ("Do the person's interests override the legitimate interest?") — and you should keep a record of the LIA and include "details of your legitimate interests in your privacy information". It is most suitable where you "use people's information in ways that they would reasonably expect" with "minimal impact on their privacy". Source: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/legitimate-interests/
- **Why not consent [PRACTICE]:** consent must be capable of being refused and withdrawn without detriment. Operationally that means an IVR gate ("press 1 to accept recording") and a non-recorded path for refusers, plus per-caller consent records and withdrawal handling — heavy friction for a 30-second trade enquiry. The ICO's own framing (announced recording + LI where reasonably expected) is the established model for business QA recording. An announced recording of a business enquiry line is within reasonable caller expectations. **[PRACTICE]**
- **Purposes to document in the LIA** (chosen to map onto the SI 2018/356 reg 3 authorised purposes **[VERIFIED** list, above**]**): (a) keeping an accurate record of the enquiry and of facts relevant to any transaction (quotes, addresses, agreed scope of work); (b) quality assurance and training. Do **not** claim marketing-attribution analysis of recording content as a purpose in v1.
- **Special category data risk [NEEDS-REVIEW]:** callers may volunteer health or other special category data ("I need a ramp because of my disability"). Incidental capture in recordings needs an Article 9 position (or documented risk acceptance with minimisation: short retention, tight access, no content analytics). Counsel to advise.
- **DPIA [PRACTICE, grounded in VERIFIED trigger]:** a DPIA is required where processing is "likely to result in a high risk"; the ICO list includes innovative technologies and behaviour tracking combined with the European guidelines criteria (source: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/data-protection-impact-assessments-dpias/when-do-we-need-to-do-a-dpia/). Recording every consumer call, at scale, tied to marketing attribution sits close enough to the line that **TITAN should complete a DPIA screening, and prudently a full DPIA, before launch** and keep it versioned with the product.

---

## 4. The notification requirement and recommended wording

**Who must notify:** the trade business, as controller, owes callers transparency at the point of collection **[VERIFIED — right-to-be-informed source above]**; TITAN, as the (probable) system controller under SI 2018/356, must make "all reasonable efforts to inform every person who may use the system" **[VERIFIED — SI 2018/356 reg 4]**. One platform-enforced announcement satisfies both simultaneously; TITAN must make it **impossible to enable recording without the announcement**.

**Wording principle [VERIFIED-anchored]:** the ICO says tell people "that you **are** recording the call and why". Since TITAN records all calls on the line, do not say "may be recorded" — say "is recorded". ("May be" is only honest if recording is genuinely conditional.) **[PRACTICE** for the exact phrasing below**]**

**Recommended caller announcement (played before any recording starts, unskippable):**

> "Thanks for calling [Business Name]. This call is recorded so we have an accurate record of your enquiry, and for quality and training. Please hold while we connect you."

Short variant (where brand prefers brevity): "Calls are recorded for record-keeping, quality and training."

**Recommended callee whisper (played to the tradesperson before bridging):**

> "TITAN lead for [Business Name]. This call is recorded. Press 1 to accept the call."

**Supporting layers [VERIFIED requirement to provide full privacy information; PRACTICE for the mechanics]:**
- The trade business's privacy notice must be updated to cover: recording, purposes, legitimate interests relied on, retention period, recipients/processors (TITAN, Twilio, Supabase categories), international transfers, and rights. TITAN supplies a template clause at onboarding.
- The trade business must inform its own staff: "You must make sure you inform workers of any call monitoring in your privacy information." **[VERIFIED]** Source: ICO monitoring-workers page above. The whisper covers ad-hoc answerers; the client's staff privacy information covers the rest.
- If TITAN staff can listen to recordings for support/QA, that must appear in the privacy notice. (Benchmark: the ICO's own notice discloses that "Other ICO staff may also listen in during your call for training or quality assurance purposes." Source: https://ico.org.uk/global/privacy-notice/how-you-can-contact-us/)

---

## 5. Retention, storage and access

- **[VERIFIED]** UK GDPR sets **no fixed retention periods**: "The UK GDPR does not set specific time limits for different types of data. This is up to you" — but you must justify and document standard retention periods, and erase or anonymise when no longer needed. Source: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/
- **Recommended defaults [PRACTICE]:** recordings **6 months** (configurable per client, 30 days–24 months hard cap), call metadata (number, time, duration, outcome — no audio) **24 months** for pipeline metrics, deletion fully automated. Benchmark from a primary source: the ICO itself retains call logs (CLI, date, time, duration — it does not record audio) for **100 days** (source: ICO privacy notice above). Longer recording retention must be justified by the dispute/record-keeping purpose; align the default with what clients actually need for job disputes.
- **Where stored [PRACTICE]:** Twilio-hosted short-term, exported to a private Supabase Storage bucket (UK/EU region) then deleted from Twilio — one place to enforce retention and honour erasure. Twilio default retention is indefinite unless you delete or configure auto-deletion, and recordings can be deleted via API (source: twilio-call-recordings skill). **[NEEDS-REVIEW]** Twilio-side residual logs: Twilio retains message logs for 400 days regardless of deletion requests (source: twilio-compliance-traffic skill) — reflect this in the privacy notice's processor disclosure.
- **Subject access:** individuals are entitled to "a copy of their personal information… as well as other supplementary information" — this includes their call recordings. **[VERIFIED]** Source: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/right-of-access/what-is-the-right-of-access/. Response deadline is one calendar month under UK GDPR Art 12(3) **[NEEDS-REVIEW — deadline and extension mechanics not directly quoted from ICO pages during this research; confirm in the ICO SAR guidance]**. TITAN must give clients a per-caller export (audio + metadata) and a per-caller deletion tool so a small trade business can actually comply.
- **Erasure:** individuals have the right to erasure of data no longer needed; deletion means removing from Supabase, Twilio, and DB pointers, with a minimal deletion log. **[VERIFIED** principle — storage-limitation/right-to-erasure sources above; **PRACTICE** for mechanics**]**

---

## 6. Dual-channel QA implications

- Dual-channel recording (caller on one channel, tradesperson on the other) is the correct QA pattern and required for any future speech analytics; dual-channel files are ~2x the size of mono — factor into storage cost and retention decisions. (Source: twilio-call-recordings skill.)
- The tradesperson's side is equally personal data, and using recordings to assess staff performance engages the ICO's worker-monitoring expectations: workers must be informed via privacy information, and blanket content monitoring is "not usually proportionate". **[VERIFIED]** Source: ICO monitoring-workers page above.
- Access controls **[PRACTICE]:** role-based playback scoped to the owning business; TITAN staff access only on support grounds, logged; no bulk download; streaming via short-lived signed URLs; playback audit trail.

---

## 7. Ofcom position on numbers, diversion and CLI (summary — detail in DOC 2)

- **[VERIFIED]** General Condition C6 requires CLI data to include "a valid, dialable telephone number which uniquely identifies the caller"; a Presentation Number must be valid (E.164, designated and allocated in the UK numbering plan), dialable ("in service and can be used to make a return or subsequent call"), a number the user has "authority to use, either because it is a number which has been assigned to the user or because the user has been given permission… by a third party who has been assigned that number", and not an 09 number. Source: Ofcom CLI Guidance (2024 update, applies from 29 Jan 2025): https://www.ofcom.org.uk/siteassets/resources/documents/consultations/category-2-6-weeks/276698---further-action-to-tackle--scam-calls/associated-documents/annex-2-cli-guidance-2024-update.pdf — note Ofcom's CLI page (updated 15 July 2026) references a further version taking effect 15 July 2027; re-check before launch: https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/calling-line-identification **[NEEDS-REVIEW]**
- **[VERIFIED]** Out-of-area use of geographic (01/02) numbers is permitted where the end user requests that area code (Ofcom decided in March 2022 to "maintain the existing Numbering Plan rules on geographic significance and continue to permit… out-of-area use of geographic numbers (where requested by the end user)"). Source: https://www.ofcom.org.uk/siteassets/resources/documents/consultations/category-1-10-weeks/144159-future-of-telephone-numbers/associated-documents/future-of-numbering-statement-on-geographic-numbering.pdf — so a Manchester tracking number for a Manchester-targeting client is unambiguously fine, and even out-of-area allocation is permitted. **[PRACTICE]** Still match the number to the advertised area — it is the product's entire point and avoids consumer-confusion complaints.
- Most CLI obligations bind communications providers (Twilio), not TITAN directly **[NEEDS-REVIEW** — TITAN's exact regulatory status as a reseller of number-based services should be confirmed, including whether any Ofcom general conditions apply to TITAN itself**]**.

---

## 8. GO / NO-GO checklist — nothing records until every box is ticked

| # | Gate | Label |
|---|---|---|
| 1 | Lawful basis decided and documented; LIA completed on TITAN's template, per client | VERIFIED requirement (lawful basis before processing) |
| 2 | DPIA screening completed (full DPIA recommended) and signed off | PRACTICE / VERIFIED trigger |
| 3 | Pre-recording announcement implemented **in the platform**, unskippable, and recording technically cannot start before it has played; wording says "is recorded" + why | VERIFIED requirement (must tell callers, recorded message good practice) |
| 4 | Callee whisper informs the tradesperson the call is recorded | VERIFIED (reg 4 "every person who may use the system") |
| 5 | Client contract signed: Art 28 terms, instruction/express consent to record, client confirms staff informed, sub-processors authorised | VERIFIED requirement / drafting NEEDS-REVIEW |
| 6 | Client privacy notice updated from TITAN template (purposes, LI, retention, TITAN/Twilio/Supabase, transfers, rights) | VERIFIED requirement |
| 7 | Retention policy configured; automated deletion job tested end-to-end (Supabase + Twilio + DB) | VERIFIED principle / PRACTICE defaults |
| 8 | SAR export and per-caller erasure tools working | VERIFIED rights |
| 9 | ICO fee status confirmed for TITAN; client fee status checked at onboarding | VERIFIED |
| 10 | Twilio DPA executed; transfer mechanism confirmed; recording media access locked down (no unauthenticated media URLs) | NEEDS-REVIEW |
| 11 | Recording playback access controls + audit logging live | PRACTICE |
| 12 | Policy: no payment-card capture on recorded calls in v1 (no pause/resume built); clients instructed accordingly | PRACTICE (PCI, per compliance skill) |
| 13 | Rescue SMS template locked to non-promotional service wording; STOP handling live | VERIFIED (PECR reg 22 / ICO service-message guidance) |
| 14 | Solicitor sign-off on: system-controller analysis, reg 4 scope, special category position, always-on proportionality, transfer mechanism | NEEDS-REVIEW |

**Primary sources index:** IPA 2016 s.3 https://www.legislation.gov.uk/ukpga/2016/25/section/3 · s.46 https://www.legislation.gov.uk/ukpga/2016/25/section/46 · SI 2018/356 https://www.legislation.gov.uk/uksi/2018/356/made · PECR reg 22 https://www.legislation.gov.uk/uksi/2003/2426/regulation/22 · ICO lawful basis https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/ · ICO legitimate interests https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/legitimate-interests/ · ICO monitoring workers https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment/monitoring-workers/specific-data-protection-considerations-for-different-ways-or-methods-of-monitoring-workers/ · ICO controllers/processors https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/controllers-and-processors/controllers-and-processors/what-are-controllers-and-processors/ · ICO storage limitation https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/ · ICO right to be informed https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/ · ICO right of access https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/right-of-access/what-is-the-right-of-access/ · ICO direct marketing identification https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/direct-marketing-guidance/identify-direct-marketing/ · ICO DPIA https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/data-protection-impact-assessments-dpias/when-do-we-need-to-do-a-dpia/ · ICO fee https://ico.org.uk/for-organisations/data-protection-fee/data-protection-fee/ · ICO contact privacy notice https://ico.org.uk/global/privacy-notice/how-you-can-contact-us/ · Ofcom CLI guidance 2024 (PDF linked above) and landing page https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/calling-line-identification · Ofcom geographic numbering statement 2022 (PDF linked above).
