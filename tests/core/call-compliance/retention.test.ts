import { describe, expect, it } from "vitest";
import {
  DEFAULT_RETENTION_POLICY,
  isPastRetention,
  METADATA_RETENTION_DAYS,
  RECORDING_RETENTION,
  retentionDueAt,
  validateRetentionPolicy,
} from "@/core/call-compliance";

/**
 * RETENTION IS CHOSEN, JUSTIFIED AND ENFORCED (PRD-008, gate 7).
 *
 * UK GDPR sets no fixed periods — which is exactly why TITAN's chosen ones
 * are pinned: the brief's §5 PRACTICE defaults (6 months recordings inside
 * a 30-day–24-month cap; 24 months metadata) are the documented policy,
 * and a quiet edit to any of them should have to explain itself here.
 */

describe("the brief's figures, pinned", () => {
  it("recordings: default 6 months inside a 30-day–24-month cap", () => {
    expect(RECORDING_RETENTION).toEqual({
      minDays: 30,
      maxDays: 730,
      defaultDays: 180,
    });
    expect(DEFAULT_RETENTION_POLICY.recordingDays).toBe(180);
  });

  it("metadata: 24 months", () => {
    expect(METADATA_RETENTION_DAYS).toBe(730);
  });
});

describe("validateRetentionPolicy — inside the cap or named problems", () => {
  it("accepts the default and both bounds", () => {
    for (const recordingDays of [30, 180, 730]) {
      expect(validateRetentionPolicy({ recordingDays })).toEqual({
        valid: true,
        problems: [],
      });
    }
  });

  it("names every violation", () => {
    expect(validateRetentionPolicy({ recordingDays: 29 }).problems).toEqual([
      "below-30-day-floor",
    ]);
    expect(validateRetentionPolicy({ recordingDays: 731 }).problems).toEqual([
      "above-24-month-cap",
    ]);
    expect(validateRetentionPolicy({ recordingDays: 90.5 }).problems).toEqual([
      "not-an-integer",
    ]);
    expect(validateRetentionPolicy({ recordingDays: Number.NaN }).problems).toEqual([
      "not-an-integer",
    ]);
  });
});

describe("the deletion clock", () => {
  const DAY = 24 * 60 * 60 * 1000;
  const recordedAt = 1_700_000_000_000;

  it("due exactly recordingDays later", () => {
    expect(retentionDueAt(recordedAt, { recordingDays: 180 })).toBe(
      recordedAt + 180 * DAY,
    );
  });

  it("past retention at and after the due instant, never before", () => {
    const policy = { recordingDays: 30 };
    const due = retentionDueAt(recordedAt, policy);
    expect(isPastRetention(recordedAt, due - 1, policy)).toBe(false);
    expect(isPastRetention(recordedAt, due, policy)).toBe(true);
    expect(isPastRetention(recordedAt, due + DAY, policy)).toBe(true);
  });
});
