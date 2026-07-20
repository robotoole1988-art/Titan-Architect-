import { beforeEach, describe, expect, it } from "vitest";
import {
  createMemoryBusinessSpine,
  type BusinessSpineRepositories,
} from "@/core/business";
import {
  executeCommand,
  type CommandExecutionDeps,
  type CommandRequestRecord,
  type EmailDraftPayload,
} from "@/core/command-mode";
import {
  createMemoryLearningFeed,
  type LearningFeed,
} from "@/core/memory-spine";

/**
 * ADR-052 §4: approve → execute → verify → learn, against the real
 * in-memory spine. Deterministic clock; every outcome lands in the feed
 * with a full trace; failures are honest and never retried.
 */

function clock(startIso = "2026-07-20T12:00:00.000Z"): () => string {
  let tick = 0;
  const start = Date.parse(startIso);
  return () => new Date(start + tick++ * 1000).toISOString();
}

function request(
  actionId: CommandRequestRecord["actionId"],
  params: Record<string, unknown>,
  requestId = "r-1",
): CommandRequestRecord {
  return {
    requestId,
    actionId,
    params,
    previewLines: ["preview"],
    tier: "recommend_first",
    via: "brain-workspace",
  };
}

describe("the executor", () => {
  let spine: BusinessSpineRepositories;
  let feed: LearningFeed;
  let deps: CommandExecutionDeps;
  let businessId: string;

  beforeEach(async () => {
    spine = createMemoryBusinessSpine();
    feed = createMemoryLearningFeed();
    deps = { spine, feed, now: clock(), approvedBy: "founder" };
    const business = await spine.businesses.create({
      name: "Rapid Roofing",
      trade: "Emergency Roofing",
      location: "Leeds",
    });
    businessId = business.id;
  });

  async function feedKinds(): Promise<string[]> {
    return (await feed.list()).map((observation) => observation.kind);
  }

  it("create_next_action: promise + CRM note, verified, executed, fully traced", async () => {
    const outcome = await executeCommand(
      request("create_next_action", { businessId, text: "chase the quote", dueBy: "2026-07-22" }),
      deps,
    );
    expect(outcome.status).toBe("executed");
    expect(outcome.trace.approvedBy).toBe("founder");
    expect(outcome.trace.approvedAt).toBe("2026-07-20T12:00:00.000Z");
    expect(outcome.trace.finishedAt > outcome.trace.startedAt).toBe(true);
    expect(outcome.trace.steps.map((step) => step.label)).toContain(
      "Verified activity entry by re-read",
    );
    expect(outcome.trace.changes[0]).toContain("Rapid Roofing");
    expect(outcome.trace.changes[0]).toContain("chase the quote");
    expect(outcome.trace.revert).toBeTruthy();

    const promises = await feed.list({ kind: "promise" });
    expect(promises).toHaveLength(1);
    expect(promises[0].businessId).toBe(businessId);
    expect(promises[0].payload?.dueBy).toBe("2026-07-22");
    const activity = await spine.activity.list(businessId);
    expect(activity[0].message).toContain("chase the quote");
    expect(await feedKinds()).toContain("command_executed");
  });

  it("create_next_action: unknown business fails honestly — nothing written, no retry", async () => {
    const outcome = await executeCommand(
      request("create_next_action", { businessId: "ghost", text: "x" }),
      deps,
    );
    expect(outcome.status).toBe("failed");
    expect(outcome.error).toContain('"ghost" not found');
    expect(await feed.list({ kind: "promise" })).toHaveLength(0);
    const kinds = await feedKinds();
    expect(kinds).toContain("command_failed");
    expect(kinds).not.toContain("command_executed");
  });

  it("append_business_note: partial when the feed mirror fails AFTER the CRM note landed", async () => {
    const flakyFeed: LearningFeed = {
      async append(draft) {
        if (draft.kind === "note") throw new Error("feed offline");
        return feed.append(draft);
      },
      list: (filter) => feed.list(filter),
    };
    const outcome = await executeCommand(
      request("append_business_note", { businessId, note: "prefers mornings" }),
      { ...deps, feed: flakyFeed },
    );
    expect(outcome.status).toBe("partial");
    expect(outcome.error).toContain("CRM note landed");
    expect(outcome.error).toContain("feed offline");
    // The CRM write that succeeded is reported, not hidden.
    const activity = await spine.activity.list(businessId);
    expect(activity[0].message).toBe("prefers mornings");
    expect(await feedKinds()).toContain("command_partial");
  });

  it("draft_follow_up: saves a versioned email_draft that is never sent", async () => {
    const publication = await spine.publications.publish(businessId, 1, "rapid-roofing");
    const enquiry = await spine.enquiries.create({
      businessId,
      publicationId: publication.id,
      name: "Dana Homeowner",
      contact: "dana@example.com",
      message: "Water coming through the ceiling",
      sourcePage: "/",
    });
    const outcome = await executeCommand(
      request("draft_follow_up", { enquiryId: enquiry.id }),
      deps,
    );
    expect(outcome.status).toBe("executed");
    const draft = await spine.artifacts.latest<EmailDraftPayload>(businessId, "email_draft");
    expect(draft?.version).toBe(1);
    expect(draft?.payload.to).toBe("dana@example.com");
    expect(draft?.payload.neverSent).toBe(true);
    expect(draft?.payload.body).toContain("Dana");
    expect(outcome.trace.changes.join(" ")).toContain("NOT sent");
  });

  it("draft_follow_up: unknown enquiry fails honestly", async () => {
    const outcome = await executeCommand(
      request("draft_follow_up", { enquiryId: "ghost" }),
      deps,
    );
    expect(outcome.status).toBe("failed");
    expect(outcome.error).toContain('Enquiry "ghost" not found');
  });

  it("update_build_item: legal transition executes, verifies, and records revert info", async () => {
    await spine.builds.createForBusiness(businessId);
    const outcome = await executeCommand(
      request("update_build_item", {
        businessId,
        itemKind: "website",
        status: "building",
      }),
      deps,
    );
    expect(outcome.status).toBe("executed");
    expect(outcome.trace.changes[0]).toContain("queued → building");
    expect(outcome.trace.revert).toContain('"queued"');
    const build = await spine.builds.getForBusiness(businessId);
    expect(build?.items.find((item) => item.kind === "website")?.status).toBe("building");
  });

  it("update_build_item: the ADR-024 gate refusal is the failure report — and the item is untouched", async () => {
    await spine.builds.createForBusiness(businessId);
    const outcome = await executeCommand(
      request("update_build_item", {
        businessId,
        itemKind: "website",
        status: "live",
      }),
      deps,
    );
    expect(outcome.status).toBe("failed");
    expect(outcome.error).toMatch(/founder approval|Illegal build item transition/);
    const build = await spine.builds.getForBusiness(businessId);
    expect(build?.items.find((item) => item.kind === "website")?.status).toBe("queued");
    expect(await feedKinds()).toContain("command_failed");
  });

  it("delegate_recommendation: records and verifies the delegation marker", async () => {
    const outcome = await executeCommand(
      request("delegate_recommendation", {
        recommendationId: "stale_deal:b-1",
        summary: "Chase the decision",
        delegatedTo: "Sam",
      }),
      deps,
    );
    expect(outcome.status).toBe("executed");
    const delegations = await feed.list({ kind: "recommendation_delegated" });
    expect(delegations).toHaveLength(1);
    expect(delegations[0].payload?.recommendationId).toBe("stale_deal:b-1");
    expect(delegations[0].payload?.delegatedTo).toBe("Sam");
  });

  it("every outcome — including failure — lands in the feed with the full trace", async () => {
    await executeCommand(request("create_next_action", { businessId: "ghost", text: "x" }), deps);
    const failures = await feed.list({ kind: "command_failed" });
    expect(failures).toHaveLength(1);
    const trace = failures[0].payload?.trace as { approvedBy?: string; approvedAt?: string };
    expect(trace.approvedBy).toBe("founder");
    expect(trace.approvedAt).toBeTruthy();
    expect(failures[0].summary).toContain("Failed");
  });
});
