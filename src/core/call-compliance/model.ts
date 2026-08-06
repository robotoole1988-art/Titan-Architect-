/**
 * Call-recording compliance — the GO/NO-GO gate as a structure (PRD-008).
 *
 * `docs/prd/call-tracking-uk-compliance-brief.md` §8 ends with the law this
 * module makes structural: **nothing records until every box is ticked.**
 * A checklist that lives in a document is a promise somebody must remember;
 * this one is a typed list a function refuses to pass until it is complete.
 *
 * Scope, deliberately narrow: this is the READINESS gate — may recording be
 * enabled for this platform and this client at all. The in-call ordering
 * law (the pre-recording announcement must finish before recording can
 * start, gate 3) is enforced where the call flow is built, in the
 * call-tracking feature's TwiML construction — a runtime sequence cannot be
 * proven from here, and pretending otherwise would be exactly the false
 * comfort this codebase keeps refusing (ADR-062: behaviour is declared,
 * never inferred).
 *
 * Every gate's text and basis label is carried verbatim from the brief,
 * which cites primary sources (legislation.gov.uk, ico.org.uk, ofcom.org.uk)
 * for each. Gates whose basis is NEEDS-REVIEW stay in the list — solicitor
 * sign-off is itself gate 14, so the checklist cannot be completed on
 * unreviewed legal analysis. No IO, no Twilio, no dates: pure model.
 */

/** Stable ids for the fourteen gates of brief §8, in the brief's order. */
export type CallComplianceGateId =
  | "lawful-basis-lia"
  | "dpia-signed-off"
  | "announcement-in-platform"
  | "callee-whisper"
  | "client-contract"
  | "client-privacy-notice"
  | "retention-and-deletion"
  | "sar-and-erasure"
  | "ico-fee-status"
  | "twilio-dpa-and-media-lockdown"
  | "playback-access-controls"
  | "no-card-capture-policy"
  | "rescue-sms-non-promotional"
  | "solicitor-sign-off";

/** Where a gate must be satisfied: once for the platform, per client, or both. */
export type CallComplianceScope = "platform" | "client" | "both";

export interface CallComplianceGate {
  readonly id: CallComplianceGateId;
  /** The requirement, verbatim from brief §8. */
  readonly requirement: string;
  /** The brief's evidence label for this gate (VERIFIED / PRACTICE / NEEDS-REVIEW). */
  readonly basis: string;
  readonly scope: CallComplianceScope;
}

/**
 * Brief §8, as data. Order and wording match the document; a test pins the
 * count so a gate can never be quietly dropped in a refactor.
 */
export const CALL_COMPLIANCE_GATES: ReadonlyArray<CallComplianceGate> = [
  {
    id: "lawful-basis-lia",
    requirement:
      "Lawful basis decided and documented; LIA completed on TITAN's template, per client",
    basis: "VERIFIED requirement (lawful basis before processing)",
    scope: "client",
  },
  {
    id: "dpia-signed-off",
    requirement:
      "DPIA screening completed (full DPIA recommended) and signed off",
    basis: "PRACTICE / VERIFIED trigger",
    scope: "platform",
  },
  {
    id: "announcement-in-platform",
    requirement:
      "Pre-recording announcement implemented in the platform, unskippable, and recording technically cannot start before it has played; wording says \"is recorded\" + why",
    basis: "VERIFIED requirement (must tell callers, recorded message good practice)",
    scope: "platform",
  },
  {
    id: "callee-whisper",
    requirement:
      "Callee whisper informs the tradesperson the call is recorded",
    basis: "VERIFIED (reg 4 \"every person who may use the system\")",
    scope: "platform",
  },
  {
    id: "client-contract",
    requirement:
      "Client contract signed: Art 28 terms, instruction/express consent to record, client confirms staff informed, sub-processors authorised",
    basis: "VERIFIED requirement / drafting NEEDS-REVIEW",
    scope: "client",
  },
  {
    id: "client-privacy-notice",
    requirement:
      "Client privacy notice updated from TITAN template (purposes, LI, retention, TITAN/Twilio/Supabase, transfers, rights)",
    basis: "VERIFIED requirement",
    scope: "client",
  },
  {
    id: "retention-and-deletion",
    requirement:
      "Retention policy configured; automated deletion job tested end-to-end (Supabase + Twilio + DB)",
    basis: "VERIFIED principle / PRACTICE defaults",
    scope: "platform",
  },
  {
    id: "sar-and-erasure",
    requirement: "SAR export and per-caller erasure tools working",
    basis: "VERIFIED rights",
    scope: "platform",
  },
  {
    id: "ico-fee-status",
    requirement:
      "ICO fee status confirmed for TITAN; client fee status checked at onboarding",
    basis: "VERIFIED",
    scope: "both",
  },
  {
    id: "twilio-dpa-and-media-lockdown",
    requirement:
      "Twilio DPA executed; transfer mechanism confirmed; recording media access locked down (no unauthenticated media URLs)",
    basis: "NEEDS-REVIEW",
    scope: "platform",
  },
  {
    id: "playback-access-controls",
    requirement: "Recording playback access controls + audit logging live",
    basis: "PRACTICE",
    scope: "platform",
  },
  {
    id: "no-card-capture-policy",
    requirement:
      "Policy: no payment-card capture on recorded calls in v1 (no pause/resume built); clients instructed accordingly",
    basis: "PRACTICE (PCI, per compliance skill)",
    scope: "platform",
  },
  {
    id: "rescue-sms-non-promotional",
    requirement:
      "Rescue SMS template locked to non-promotional service wording; STOP handling live",
    basis: "VERIFIED (PECR reg 22 / ICO service-message guidance)",
    scope: "platform",
  },
  {
    id: "solicitor-sign-off",
    requirement:
      "Solicitor sign-off on: system-controller analysis, reg 4 scope, special category position, always-on proportionality, transfer mechanism",
    basis: "NEEDS-REVIEW",
    scope: "platform",
  },
];

/** The verdict, with every gap named — never just the first (ADR-031 house style). */
export interface CallRecordingVerdict {
  readonly go: boolean;
  /** Every unticked gate, in brief order. Empty exactly when `go`. */
  readonly missing: ReadonlyArray<CallComplianceGateId>;
}

/**
 * May recording be enabled? GO only when every one of the fourteen gates is
 * ticked. There is no override parameter and none will be added — a
 * checklist with a bypass is a decoration, not a gate.
 */
export function canRecordCalls(
  ticked: ReadonlySet<CallComplianceGateId>,
): CallRecordingVerdict {
  const missing = CALL_COMPLIANCE_GATES.filter(
    (gate) => !ticked.has(gate.id),
  ).map((gate) => gate.id);
  return { go: missing.length === 0, missing };
}
