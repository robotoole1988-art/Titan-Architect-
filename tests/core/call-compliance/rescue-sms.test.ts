import { describe, expect, it } from "vitest";
import {
  buildRescueSms,
  canSendRescueSms,
  RESCUE_SMS_TEMPLATE,
  type RescueSmsContext,
} from "@/core/call-compliance";

/**
 * THE RESCUE SMS STAYS A SERVICE MESSAGE (PRD-008, gate 13; PECR reg 22).
 *
 * The wording is locked to the template the compliance brief's PECR
 * analysis approved. These tests pin it verbatim: a rewrite that adds an
 * offer, drops the STOP line, or grows a second interpolation hole fails
 * here first — which forces the conversation the law requires, instead of
 * a marketing message shipping inside a service message's clothing.
 */

const SEND_OK: RescueSmsContext = {
  callerNumberPresent: true,
  callerOptedOut: false,
  rescuedInLast24h: false,
  lineType: "mobile",
};

describe("the template is locked", () => {
  it("is the architecture doc's wording, verbatim", () => {
    expect(RESCUE_SMS_TEMPLATE).toBe(
      "Sorry we missed your call to {businessName}. We'll ring you back " +
        "as soon as we can. If it's urgent, reply here with a good time. " +
        "Reply STOP to opt out.",
    );
  });

  it("ends with the opt-out and carries no promotional shape", () => {
    expect(RESCUE_SMS_TEMPLATE).toMatch(/Reply STOP to opt out\.$/);
    expect(
      /%|discount|offer|sale|deal|voucher|quote today|book now/i.test(
        RESCUE_SMS_TEMPLATE,
      ),
    ).toBe(false);
  });

  it("has exactly one interpolation hole — the business name", () => {
    expect(RESCUE_SMS_TEMPLATE.match(/\{[a-zA-Z]+\}/g)).toEqual([
      "{businessName}",
    ]);
  });

  it("builds for a real name and refuses an empty one", () => {
    expect(buildRescueSms("Summit Roofing Rescue")).toBe(
      "Sorry we missed your call to Summit Roofing Rescue. We'll ring you " +
        "back as soon as we can. If it's urgent, reply here with a good " +
        "time. Reply STOP to opt out.",
    );
    expect(buildRescueSms("   ")).toBeNull();
  });
});

describe("guardrails — all four or nothing, every failure named", () => {
  it("sends only when every guardrail passes", () => {
    expect(canSendRescueSms(SEND_OK)).toEqual({ send: true, blocked: [] });
  });

  it("a withheld number blocks — there is nobody to text", () => {
    const verdict = canSendRescueSms({ ...SEND_OK, callerNumberPresent: false });
    expect(verdict.send).toBe(false);
    expect(verdict.blocked).toEqual(["no-caller-number"]);
  });

  it("STOP means stopped — an opted-out caller is never texted again", () => {
    const verdict = canSendRescueSms({ ...SEND_OK, callerOptedOut: true });
    expect(verdict.blocked).toEqual(["caller-opted-out"]);
  });

  it("one rescue per caller per 24 hours", () => {
    const verdict = canSendRescueSms({ ...SEND_OK, rescuedInLast24h: true });
    expect(verdict.blocked).toEqual(["already-rescued-24h"]);
  });

  it("landlines and unknown lines are never texted", () => {
    for (const lineType of ["landline", "voip", "unknown"] as const) {
      expect(canSendRescueSms({ ...SEND_OK, lineType }).blocked, lineType).toEqual([
        "not-a-mobile",
      ]);
    }
  });

  it("every failure is reported at once, never just the first", () => {
    const verdict = canSendRescueSms({
      callerNumberPresent: false,
      callerOptedOut: true,
      rescuedInLast24h: true,
      lineType: "landline",
    });
    expect(verdict.blocked).toEqual([
      "no-caller-number",
      "caller-opted-out",
      "already-rescued-24h",
      "not-a-mobile",
    ]);
  });
});
