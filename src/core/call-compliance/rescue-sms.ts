/**
 * The rescue SMS — locked template and guardrails (PRD-008; gate 13).
 *
 * When a diverted call goes unanswered, one service message goes to the
 * caller. Its wording is LOCKED to the non-promotional service template
 * the compliance brief's PECR analysis approved (DOC 1 §1.3, PECR reg 22):
 * a missed-call notice is a service message only while it stays one — the
 * day somebody adds "ask about our spring discount" it becomes direct
 * marketing without consent. So the template is a constant, the tests pin
 * its exact wording, and the send decision runs through guardrails that
 * report every failure at once. No Twilio here; the messaging feature
 * consumes these.
 */

/**
 * Verbatim from `docs/prd/call-tracking-architecture.md` §4.3. The STOP
 * instruction is part of the template, not an option — a service message
 * that cannot be declined is one complaint away from being marketing.
 */
export const RESCUE_SMS_TEMPLATE =
  "Sorry we missed your call to {businessName}. We'll ring you back as " +
  "soon as we can. If it's urgent, reply here with a good time. " +
  "Reply STOP to opt out.";

/**
 * Fill the template for a business, or null when there is no honest name
 * to fill it with. No other interpolation exists — the template has one
 * hole by design.
 */
export function buildRescueSms(businessName: string): string | null {
  const name = businessName.trim();
  if (name.length === 0) return null;
  return RESCUE_SMS_TEMPLATE.replace("{businessName}", name);
}

/** The architecture doc's §4.1 preconditions, as a structure. */
export interface RescueSmsContext {
  /** Caller presented a CLI (not withheld/anonymous). */
  readonly callerNumberPresent: boolean;
  /** Caller is on the business's opt-out list (STOP received before). */
  readonly callerOptedOut: boolean;
  /** A rescue SMS already went to this caller in the last 24 hours. */
  readonly rescuedInLast24h: boolean;
  /** Twilio Lookup line type — only mobiles are texted. */
  readonly lineType: "mobile" | "landline" | "voip" | "unknown";
}

export type RescueBlockReason =
  | "no-caller-number"
  | "caller-opted-out"
  | "already-rescued-24h"
  | "not-a-mobile";

export interface RescueSmsVerdict {
  readonly send: boolean;
  /** Every failed guardrail, never just the first. Empty exactly when `send`. */
  readonly blocked: ReadonlyArray<RescueBlockReason>;
}

/**
 * May the rescue SMS go? All four guardrails or nothing — and like the
 * recording gate, there is no override parameter.
 */
export function canSendRescueSms(context: RescueSmsContext): RescueSmsVerdict {
  const blocked: RescueBlockReason[] = [];
  if (!context.callerNumberPresent) blocked.push("no-caller-number");
  if (context.callerOptedOut) blocked.push("caller-opted-out");
  if (context.rescuedInLast24h) blocked.push("already-rescued-24h");
  if (context.lineType !== "mobile") blocked.push("not-a-mobile");
  return { send: blocked.length === 0, blocked };
}
