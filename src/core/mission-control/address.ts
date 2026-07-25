/**
 * The situation address (ADR-056, Cockpit Law §1): the one composed line
 * Mission Control opens with. Deterministic first — up to three clauses
 * ranked by consequence, plus the approval clause — from the (already
 * test-filtered) briefing payload. The reasoner may rephrase it (same
 * facts, better voice); any decline and this text stands. Calm, precise,
 * never exclamatory. Honest absence: the quiet line renders only when
 * every input is zero — honest by construction.
 */

import type { DepartmentHealth } from "@/core/health-engine";
import type { Briefing } from "./model";

/** Small counts read as words — the calm voice. */
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
function count(n: number): string {
  return WORDS[n] ?? String(n);
}

function plural(n: number, singular: string, pluralForm: string): string {
  return n === 1 ? singular : pluralForm;
}

export interface SituationAddressInput {
  briefing: Briefing;
  health: ReadonlyArray<DepartmentHealth>;
  pendingApprovals: number;
}

export interface SituationAddress {
  /** The deterministic address — always safe to render. */
  line: string;
  /** True when the world is genuinely quiet (the crafted absence line). */
  quiet: boolean;
  /** The facts behind the line, for the narration payload + the ⓘ. */
  facts: ReadonlyArray<string>;
}

export function composeSituationAddress(
  input: SituationAddressInput,
): SituationAddress {
  const { briefing, health, pendingApprovals } = input;

  const breached = briefing.enquiriesNeedingAttention.filter(
    (attention) => attention.slaBreached,
  ).length;
  const waiting = briefing.enquiriesNeedingAttention.length - breached;
  const redDepartments = health.filter(
    (department) => department.scoreable && department.band === "red",
  );
  const staleDeals = briefing.pipeline.dealsNeedingAction.length;
  const reviewWaiting = briefing.buildQueue.inProgress.reduce(
    (sum, flag) => sum + flag.reviewWaiting.length,
    0,
  );

  // Ranked by consequence (ADR-056 Decision 2); at most three speak.
  const clauses: string[] = [];
  if (breached > 0) {
    clauses.push(
      `${count(breached)} ${plural(breached, "enquiry is", "enquiries are")} aging past SLA`,
    );
  }
  if (waiting > 0) {
    clauses.push(
      `${count(waiting)} new ${plural(waiting, "enquiry waits", "enquiries wait")}`,
    );
  }
  if (redDepartments.length === 1) {
    clauses.push(`${redDepartments[0].department} health is red`);
  } else if (redDepartments.length > 1) {
    clauses.push(`${count(redDepartments.length)} departments are red`);
  }
  if (staleDeals > 0) {
    clauses.push(
      `${count(staleDeals)} ${plural(staleDeals, "proposal has", "proposals have")} gone quiet`,
    );
  }
  if (reviewWaiting > 0) {
    clauses.push(
      `${count(reviewWaiting)} build ${plural(reviewWaiting, "item waits", "items wait")} on your review`,
    );
  }

  const spoken = clauses.slice(0, 3);
  const approvalClause =
    pendingApprovals === 0
      ? "nothing awaits your approval"
      : `${count(pendingApprovals)} ${plural(pendingApprovals, "action awaits", "actions await")} your approval`;

  if (spoken.length === 0 && pendingApprovals === 0) {
    return {
      line: "All quiet. Enquiries answered, nothing stalled, nothing awaiting your approval.",
      quiet: true,
      facts: ["No SLA breaches", "No waiting enquiries", "No red departments", "No stale proposals", "No review-gate items", "No pending approvals"],
    };
  }

  const body = [...spoken, approvalClause].join("; ");
  const line = `${body.charAt(0).toUpperCase()}${body.slice(1)}.`;
  return { line, quiet: false, facts: [...spoken, approvalClause] };
}
