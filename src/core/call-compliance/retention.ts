/**
 * Recording retention — the storage-limitation law as a structure
 * (PRD-008; compliance gate 7).
 *
 * UK GDPR sets no fixed retention periods — the ICO's storage-limitation
 * guidance requires TITAN to choose, justify and document its own, then
 * delete on schedule (brief §5, [VERIFIED]). The brief's PRACTICE defaults
 * are what this module encodes; nothing here is invented:
 *
 * - Recordings: **default 6 months**, configurable per client within a
 *   **30-day to 24-month** hard cap. The justification on record: job
 *   disputes and record-keeping; the ICO itself keeps call logs (no audio)
 *   for 100 days, which the brief cites as the primary-source benchmark.
 * - Call metadata (number, time, duration, outcome — no audio):
 *   **24 months**, for pipeline metrics.
 *
 * Pure arithmetic and validation — the nightly deletion job (architecture
 * §5: delete storage objects, null pointers, log minimally) consumes these.
 * No clock is read here: callers pass `now`, so every function is
 * deterministic and testable to the millisecond.
 */

export const RECORDING_RETENTION = {
  /** Brief §5 hard floor: below 30 days the dispute purpose is hollow. */
  minDays: 30,
  /** Brief §5 hard cap: 24 months, encoded as 730 days (2 × 365). */
  maxDays: 730,
  /** Brief §5 recommended default: 6 months, encoded as 180 days. */
  defaultDays: 180,
} as const;

/** Call metadata (no audio) retention: 24 months (brief §5, PRACTICE). */
export const METADATA_RETENTION_DAYS = 730;

export interface RetentionPolicy {
  /** Days a call recording is kept before automated deletion. */
  readonly recordingDays: number;
}

export const DEFAULT_RETENTION_POLICY: RetentionPolicy = {
  recordingDays: RECORDING_RETENTION.defaultDays,
};

export type RetentionProblem =
  | "not-an-integer"
  | "below-30-day-floor"
  | "above-24-month-cap";

export interface RetentionValidation {
  readonly valid: boolean;
  /** Every problem, never just the first. Empty exactly when valid. */
  readonly problems: ReadonlyArray<RetentionProblem>;
}

/** A client's configured period must sit inside the brief's hard bounds. */
export function validateRetentionPolicy(
  policy: RetentionPolicy,
): RetentionValidation {
  const problems: RetentionProblem[] = [];
  if (!Number.isInteger(policy.recordingDays)) problems.push("not-an-integer");
  else {
    if (policy.recordingDays < RECORDING_RETENTION.minDays)
      problems.push("below-30-day-floor");
    if (policy.recordingDays > RECORDING_RETENTION.maxDays)
      problems.push("above-24-month-cap");
  }
  return { valid: problems.length === 0, problems };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** The instant a recording becomes due for deletion. */
export function retentionDueAt(
  recordedAtMs: number,
  policy: RetentionPolicy,
): number {
  return recordedAtMs + policy.recordingDays * DAY_MS;
}

/** Is this recording past its retention now? The nightly job's question. */
export function isPastRetention(
  recordedAtMs: number,
  nowMs: number,
  policy: RetentionPolicy,
): boolean {
  return nowMs >= retentionDueAt(recordedAtMs, policy);
}
