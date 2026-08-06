/**
 * TITAN Call Compliance — public API (PRD-008).
 *
 * The UK call-recording GO/NO-GO gate from
 * `docs/prd/call-tracking-uk-compliance-brief.md` §8, as a typed structure
 * with a resolver that refuses until every box is ticked. Pure model — no
 * Twilio, no IO. The in-call announcement-before-recording ordering law is
 * enforced in the call-tracking feature when it is built.
 */

export {
  CALL_COMPLIANCE_GATES,
  canRecordCalls,
} from "./model";
export type {
  CallComplianceGate,
  CallComplianceGateId,
  CallComplianceScope,
  CallRecordingVerdict,
} from "./model";
export {
  RESCUE_SMS_TEMPLATE,
  buildRescueSms,
  canSendRescueSms,
} from "./rescue-sms";
export type {
  RescueSmsContext,
  RescueBlockReason,
  RescueSmsVerdict,
} from "./rescue-sms";
export {
  RECORDING_RETENTION,
  METADATA_RETENTION_DAYS,
  DEFAULT_RETENTION_POLICY,
  validateRetentionPolicy,
  retentionDueAt,
  isPastRetention,
} from "./retention";
export type {
  RetentionPolicy,
  RetentionProblem,
  RetentionValidation,
} from "./retention";
