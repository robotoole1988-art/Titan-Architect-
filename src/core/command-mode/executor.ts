/**
 * The Command Mode executor (ADR-052): approve → execute → verify → learn.
 *
 * Runs ONLY on an explicit founder approval (v1 policy: no auto tier).
 * Every execution writes through the Business Spine repositories, verifies
 * by re-reading what it wrote, and appends its outcome to the learning feed
 * with a full trace. Failure honesty: what failed and why, marked failed in
 * the feed, and NEVER a silent retry. Multi-write actions that land only
 * part of their writes report `partial` — exactly what landed, exactly what
 * didn't.
 */

import type {
  BuildItemKind,
  BuildItemStatus,
  BusinessSpineRepositories,
} from "@/core/business";
import { buildItemLabel } from "@/core/business";
import type { LearningFeed } from "@/core/memory-spine";
import { getCommandAction } from "./catalogue";
import type {
  CommandOutcome,
  CommandRequestRecord,
  CommandTrace,
  CommandTraceStep,
} from "./model";
import { COMMAND_OUTCOME_KINDS } from "./queue";

export interface CommandExecutionDeps {
  spine: BusinessSpineRepositories;
  feed: LearningFeed;
  /** Injectable clock — deterministic tests. */
  now(): string;
  /** Who clicked Approve. */
  approvedBy: string;
}

/** The follow-up email draft payload (artifact kind "email_draft"). */
export interface EmailDraftPayload {
  enquiryId: string;
  to: string;
  subject: string;
  body: string;
  /** Constitutional: drafts are for founder review; sending is not built. */
  neverSent: true;
}

interface StepResult {
  changes: string[];
  revert?: string;
  /** Set when a later write failed after an earlier one landed. */
  partialError?: string;
}

class CommandFailure extends Error {}

function step(
  steps: CommandTraceStep[],
  now: () => string,
  label: string,
  detail?: string,
): void {
  steps.push({ label, at: now(), ...(detail ? { detail } : {}) });
}

function param(params: Record<string, unknown>, key: string): string {
  return typeof params[key] === "string" ? (params[key] as string).trim() : "";
}

async function requireBusiness(
  deps: CommandExecutionDeps,
  steps: CommandTraceStep[],
  businessId: string,
) {
  const business = await deps.spine.businesses.get(businessId);
  if (!business) {
    throw new CommandFailure(`Business "${businessId}" not found in the spine.`);
  }
  step(steps, deps.now, "Resolved business", business.name);
  return business;
}

// ---------------------------------------------------------------------------
// The five runners. Each: execute → verify (re-read) → report changes.
// ---------------------------------------------------------------------------

async function runCreateNextAction(
  request: CommandRequestRecord,
  deps: CommandExecutionDeps,
  steps: CommandTraceStep[],
): Promise<StepResult> {
  const businessId = param(request.params, "businessId");
  const text = param(request.params, "text");
  const dueBy = param(request.params, "dueBy");
  const business = await requireBusiness(deps, steps, businessId);

  const promise = await deps.feed.append({
    kind: "promise",
    businessId,
    summary: text,
    payload: {
      requestId: request.requestId,
      ...(dueBy ? { dueBy } : {}),
    },
    source: "command-mode",
  });
  step(steps, deps.now, "Recorded promise in the learning feed", promise.id);

  let partialError: string | undefined;
  let activityChange = "";
  try {
    const entry = await deps.spine.activity.log({
      businessId,
      kind: "note",
      message: `Next action: ${text}${dueBy ? ` (due ${dueBy})` : ""}`,
      meta: { requestId: request.requestId, command: request.actionId },
    });
    step(steps, deps.now, "Logged CRM activity note", entry.id);
    // Verify: the entry is readable back from the spine.
    const entries = await deps.spine.activity.list(businessId);
    if (!entries.some((candidate) => candidate.id === entry.id)) {
      throw new Error("Activity entry did not read back from the spine.");
    }
    step(steps, deps.now, "Verified activity entry by re-read");
    activityChange = `CRM activity note added to ${business.name}.`;
  } catch (error) {
    partialError = `The promise was recorded in the learning feed, but the CRM activity note failed: ${error instanceof Error ? error.message : String(error)}`;
  }

  return {
    changes: [
      `Next action recorded for ${business.name}: "${text}"${dueBy ? ` (due ${dueBy})` : ""}.`,
      ...(activityChange ? [activityChange] : []),
    ],
    revert:
      "Annotation only — nothing external changed. Supersede it with a later note; the feed itself is append-only by design.",
    ...(partialError ? { partialError } : {}),
  };
}

async function runAppendBusinessNote(
  request: CommandRequestRecord,
  deps: CommandExecutionDeps,
  steps: CommandTraceStep[],
): Promise<StepResult> {
  const businessId = param(request.params, "businessId");
  const note = param(request.params, "note");
  const business = await requireBusiness(deps, steps, businessId);

  const entry = await deps.spine.activity.log({
    businessId,
    kind: "note",
    message: note,
    meta: { requestId: request.requestId, command: request.actionId },
  });
  step(steps, deps.now, "Logged CRM activity note", entry.id);
  const entries = await deps.spine.activity.list(businessId);
  if (!entries.some((candidate) => candidate.id === entry.id)) {
    throw new CommandFailure("Activity entry did not read back from the spine.");
  }
  step(steps, deps.now, "Verified activity entry by re-read");

  let partialError: string | undefined;
  try {
    await deps.feed.append({
      kind: "note",
      businessId,
      summary: note,
      payload: { requestId: request.requestId },
      source: "command-mode",
    });
    step(steps, deps.now, "Mirrored note into the learning feed");
  } catch (error) {
    partialError = `The CRM note landed, but mirroring into the learning feed failed: ${error instanceof Error ? error.message : String(error)}`;
  }

  return {
    changes: [`Note appended to ${business.name}: "${note}".`],
    revert:
      "Annotation only — nothing external changed. Supersede it with a later note.",
    ...(partialError ? { partialError } : {}),
  };
}

async function runDraftFollowUp(
  request: CommandRequestRecord,
  deps: CommandExecutionDeps,
  steps: CommandTraceStep[],
): Promise<StepResult> {
  const enquiryId = param(request.params, "enquiryId");
  const enquiry = await deps.spine.enquiries.get(enquiryId);
  if (!enquiry) {
    throw new CommandFailure(`Enquiry "${enquiryId}" not found in the spine.`);
  }
  step(steps, deps.now, "Resolved enquiry", `${enquiry.name} (${enquiry.contact})`);
  const business = await requireBusiness(deps, steps, enquiry.businessId);

  // Deterministic draft — no LLM in the execution path (ADR-052). The
  // founder edits/sends by hand; the platform cannot send email to leads.
  const firstName = enquiry.name.split(/\s+/)[0] ?? enquiry.name;
  const payload: EmailDraftPayload = {
    enquiryId,
    to: enquiry.contact,
    subject: `Your ${business.trade.toLowerCase()} enquiry — ${business.name}`,
    body: [
      `Hi ${firstName},`,
      "",
      `Thanks for getting in touch about "${enquiry.message.slice(0, 120)}".`,
      `Just following up to see if you'd like to take the next step — happy to talk it through whenever suits you.`,
      "",
      `Best,`,
      business.name,
    ].join("\n"),
    neverSent: true,
  };
  const saved = await deps.spine.artifacts.save({
    businessId: business.id,
    kind: "email_draft",
    payload,
    meta: { requestId: request.requestId, enquiryId },
  });
  step(steps, deps.now, "Saved email draft artifact", `v${saved.version}`);

  const readBack = await deps.spine.artifacts.latest<EmailDraftPayload>(
    business.id,
    "email_draft",
  );
  if (!readBack || readBack.version !== saved.version || readBack.payload.enquiryId !== enquiryId) {
    throw new CommandFailure("The saved draft did not read back as the latest email_draft artifact.");
  }
  step(steps, deps.now, "Verified draft by re-read", `v${readBack.version}`);

  return {
    changes: [
      `Follow-up draft for ${enquiry.name} saved as email_draft v${saved.version} on ${business.name}.`,
      "The draft was NOT sent — sending is not implemented anywhere in the platform.",
    ],
    revert:
      "A draft artifact awaiting your review; simply don't use it. Artifact history is versioned and append-only.",
  };
}

async function runUpdateBuildItem(
  request: CommandRequestRecord,
  deps: CommandExecutionDeps,
  steps: CommandTraceStep[],
): Promise<StepResult> {
  const businessId = param(request.params, "businessId");
  const itemKind = param(request.params, "itemKind") as BuildItemKind;
  const status = param(request.params, "status") as BuildItemStatus;
  const note = param(request.params, "note");
  const business = await requireBusiness(deps, steps, businessId);

  const build = await deps.spine.builds.getForBusiness(businessId);
  if (!build) {
    throw new CommandFailure(`${business.name} has no build in the queue.`);
  }
  const item = build.items.find((candidate) => candidate.kind === itemKind);
  if (!item) {
    throw new CommandFailure(`${business.name}'s build has no "${itemKind}" item.`);
  }
  const previous = item.status;
  step(steps, deps.now, "Read current item status", `${itemKind}: ${previous}`);

  // The ADR-024 gate throws BuildTransitionError on illegal moves — that
  // error is the honest failure report, verbatim.
  await deps.spine.builds.setItemStatus(build.id, itemKind, status, note || undefined);
  step(steps, deps.now, "Applied status transition", `${previous} → ${status}`);

  const after = await deps.spine.builds.getForBusiness(businessId);
  const updated = after?.items.find((candidate) => candidate.kind === itemKind);
  if (updated?.status !== status) {
    throw new CommandFailure("The item did not read back in the requested status.");
  }
  step(steps, deps.now, "Verified transition by re-read");

  return {
    changes: [
      `${business.name} · ${buildItemLabel(itemKind)}: ${previous} → ${status}${note ? ` (note: "${note}")` : ""}.`,
    ],
    revert: `Move the item back to "${previous}" — transitions are permissive except the founder gate (live only from approved, approved only from review).`,
  };
}

async function runDelegateRecommendation(
  request: CommandRequestRecord,
  deps: CommandExecutionDeps,
  steps: CommandTraceStep[],
): Promise<StepResult> {
  const recommendationId = param(request.params, "recommendationId");
  const summary = param(request.params, "summary");
  const delegatedTo = param(request.params, "delegatedTo");

  const recorded = await deps.feed.append({
    kind: "recommendation_delegated",
    summary: `Delegated: ${summary.slice(0, 200)}`,
    payload: {
      recommendationId,
      requestId: request.requestId,
      ...(delegatedTo ? { delegatedTo } : {}),
    },
    source: "command-mode",
  });
  step(steps, deps.now, "Recorded delegation in the learning feed", recorded.id);

  const readBack = await deps.feed.list({ kind: "recommendation_delegated" });
  if (!readBack.some((observation) => observation.payload?.recommendationId === recommendationId)) {
    throw new CommandFailure("The delegation did not read back from the feed.");
  }
  step(steps, deps.now, "Verified delegation by re-read");

  return {
    changes: [
      `Recommendation "${summary}" marked delegated${delegatedTo ? ` to ${delegatedTo}` : ""} — it stops re-issuing.`,
    ],
    revert:
      "Suppression marker in the append-only feed; the underlying condition stays visible in department health and the CRM.",
  };
}

const RUNNERS: Record<
  CommandRequestRecord["actionId"],
  (
    request: CommandRequestRecord,
    deps: CommandExecutionDeps,
    steps: CommandTraceStep[],
  ) => Promise<StepResult>
> = {
  create_next_action: runCreateNextAction,
  append_business_note: runAppendBusinessNote,
  draft_follow_up: runDraftFollowUp,
  update_build_item: runUpdateBuildItem,
  delegate_recommendation: runDelegateRecommendation,
};

/**
 * Execute an APPROVED request. The approval itself is the caller's evidence
 * (`approvedBy` + the clock); the outcome — executed, failed, or partial —
 * is appended to the learning feed with the full trace before returning.
 */
export async function executeCommand(
  request: CommandRequestRecord,
  deps: CommandExecutionDeps,
): Promise<CommandOutcome> {
  const action = getCommandAction(request.actionId);
  const approvedAt = deps.now();
  const steps: CommandTraceStep[] = [];
  const base = {
    requestId: request.requestId,
    actionId: request.actionId,
    approvedBy: deps.approvedBy,
    approvedAt,
    startedAt: approvedAt,
  };

  let outcome: CommandOutcome;
  if (!action) {
    outcome = {
      status: "failed",
      error: `Unknown command action "${request.actionId}".`,
      trace: { ...base, finishedAt: deps.now(), steps, changes: [] },
    };
  } else {
    try {
      const result = await RUNNERS[request.actionId](request, deps, steps);
      const trace: CommandTrace = {
        ...base,
        finishedAt: deps.now(),
        steps,
        changes: result.changes,
        ...(result.revert ? { revert: result.revert } : {}),
      };
      outcome = result.partialError
        ? { status: "partial", trace, error: result.partialError }
        : { status: "executed", trace };
    } catch (error) {
      // Failure honesty: report what failed and why. No retry, silent or
      // otherwise — re-running is a fresh founder decision.
      outcome = {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        trace: { ...base, finishedAt: deps.now(), steps, changes: [] },
      };
    }
  }

  await deps.feed.append({
    kind: COMMAND_OUTCOME_KINDS[outcome.status],
    summary:
      outcome.status === "executed"
        ? `Executed: ${outcome.trace.changes[0] ?? request.actionId}`
        : `${outcome.status === "failed" ? "Failed" : "Partially executed"}: ${action?.title ?? request.actionId} — ${outcome.error}`,
    payload: {
      requestId: request.requestId,
      actionId: request.actionId,
      trace: outcome.trace,
      ...(outcome.error ? { error: outcome.error } : {}),
    },
    source: "command-mode",
  });

  return outcome;
}
