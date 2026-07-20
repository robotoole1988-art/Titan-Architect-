/**
 * The Command Mode action catalogue (ADR-052) — policy as data.
 *
 * Five actions, all internal and reversible. v1 policy: NO action is tier
 * `auto` — everything is `recommend_first` or `approval_required`, and
 * promotion to auto is a founder decision recorded in the learning feed
 * (see tiers.ts), never a code default. Excluded by constitution: anything
 * customer-visible, anything spending money, anything deleting data.
 */

import type { Business, Enquiry } from "@/core/business";
import {
  BUILD_ITEM_KINDS,
  BUILD_ITEM_STATUSES,
  buildItemLabel,
  type BuildItemKind,
  type BuildItemStatus,
} from "@/core/business";
import type { KnowledgeGraph } from "@/core/memory-spine";
import type {
  CommandActionDefinition,
  CommandActionId,
  CommandPreview,
} from "./model";

function businessOf(
  graph: KnowledgeGraph,
  params: Record<string, unknown>,
): Business | null {
  const id = typeof params.businessId === "string" ? params.businessId : "";
  const node = graph.nodes[`business:${id}`];
  return node ? (node.record as Business) : null;
}

function text(params: Record<string, unknown>, key: string): string {
  return typeof params[key] === "string" ? (params[key] as string).trim() : "";
}

const createNextAction: CommandActionDefinition = {
  id: "create_next_action",
  title: "Create next action",
  description:
    "Record a next action (promise) on a business — appears in the CRM activity trail and the Brain's promise queries.",
  tier: "recommend_first",
  internal: true,
  reversible: true,
  params: {
    businessId: "The business the action is for (required).",
    text: "What must happen, plain English (required).",
    dueBy: "Optional ISO date the action is due by.",
  },
  examples: ["create a task to chase Bright Smile"],
  validate(params, graph) {
    const problems: string[] = [];
    if (!businessOf(graph, params)) problems.push("Unknown business.");
    if (!text(params, "text")) problems.push("The next action needs text.");
    return problems;
  },
  preview(params, graph): CommandPreview {
    const business = businessOf(graph, params)!;
    const dueBy = text(params, "dueBy");
    return {
      businessId: business.id,
      lines: [
        `Record next action on ${business.name}: "${text(params, "text")}"${dueBy ? ` (due ${dueBy})` : ""}.`,
        "Writes one promise to the learning feed and one note to the CRM activity trail. Nothing customer-visible.",
      ],
    };
  },
};

const appendBusinessNote: CommandActionDefinition = {
  id: "append_business_note",
  title: "Append note",
  description:
    "Append a structured note/observation to a business record (CRM activity + learning feed).",
  tier: "recommend_first",
  internal: true,
  reversible: true,
  params: {
    businessId: "The business the note concerns (required).",
    note: "The note text (required).",
  },
  examples: ["add a note to Rapid Roofing: prefers calls after 5pm"],
  validate(params, graph) {
    const problems: string[] = [];
    if (!businessOf(graph, params)) problems.push("Unknown business.");
    if (!text(params, "note")) problems.push("The note needs text.");
    return problems;
  },
  preview(params, graph): CommandPreview {
    const business = businessOf(graph, params)!;
    return {
      businessId: business.id,
      lines: [
        `Append note to ${business.name}: "${text(params, "note")}".`,
        "Writes to the CRM activity trail and the learning feed. Nothing customer-visible.",
      ],
    };
  },
};

/** Latest enquiry recorded for a business, from the graph. */
export function latestEnquiryFor(
  graph: KnowledgeGraph,
  businessId: string,
): Enquiry | null {
  const enquiries = Object.values(graph.nodes)
    .filter((node) => node.ref.kind === "enquiry")
    .map((node) => node.record as Enquiry)
    .filter((enquiry) => enquiry.businessId === businessId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return enquiries[0] ?? null;
}

const draftFollowUp: CommandActionDefinition = {
  id: "draft_follow_up",
  title: "Draft follow-up email",
  description:
    "Draft (never send) a follow-up email for an enquiry, saved as a versioned email_draft artifact for founder review.",
  tier: "recommend_first",
  internal: true,
  reversible: true,
  params: {
    enquiryId: "The enquiry to follow up (required).",
  },
  examples: ["draft a follow-up for Rapid Roofing"],
  validate(params, graph) {
    const id = text(params, "enquiryId");
    const node = graph.nodes[`enquiry:${id}`];
    return node ? [] : ["Unknown enquiry."];
  },
  preview(params, graph): CommandPreview {
    const enquiry = graph.nodes[`enquiry:${text(params, "enquiryId")}`]!
      .record as Enquiry;
    const business = graph.nodes[`business:${enquiry.businessId}`]?.record as
      | Business
      | undefined;
    return {
      businessId: enquiry.businessId,
      lines: [
        `Draft a follow-up email to ${enquiry.name} (${enquiry.contact}) about their enquiry${business ? ` for ${business.name}` : ""}.`,
        "Saved as a draft artifact for your review. It is NEVER sent — sending is not implemented anywhere in the platform.",
      ],
    };
  },
};

const updateBuildItem: CommandActionDefinition = {
  id: "update_build_item",
  title: "Update build item",
  description:
    "Advance/annotate a build-queue item through the ADR-024 transition guard (the review gate is law).",
  tier: "approval_required",
  internal: true,
  reversible: true,
  params: {
    businessId: "The business whose build to update (required).",
    itemKind: `One of: ${BUILD_ITEM_KINDS.join(", ")} (required).`,
    status: `Target status, one of: ${BUILD_ITEM_STATUSES.join(", ")} (required).`,
    note: "Optional note stored on the item (e.g. a send-back reason).",
  },
  examples: [],
  validate(params, graph) {
    const problems: string[] = [];
    if (!businessOf(graph, params)) problems.push("Unknown business.");
    const kind = text(params, "itemKind");
    if (!(BUILD_ITEM_KINDS as readonly string[]).includes(kind)) {
      problems.push(`Unknown build item kind "${kind}".`);
    }
    const status = text(params, "status");
    if (!(BUILD_ITEM_STATUSES as readonly string[]).includes(status)) {
      problems.push(`Unknown build status "${status}".`);
    }
    return problems;
  },
  preview(params, graph): CommandPreview {
    const business = businessOf(graph, params)!;
    const note = text(params, "note");
    return {
      businessId: business.id,
      lines: [
        `Move ${business.name}'s ${buildItemLabel(text(params, "itemKind") as BuildItemKind)} build item to "${text(params, "status") as BuildItemStatus}"${note ? ` with note: "${note}"` : ""}.`,
        "The ADR-024 review gate still applies — illegal transitions are refused and reported.",
      ],
    };
  },
};

const delegateRecommendation: CommandActionDefinition = {
  id: "delegate_recommendation",
  title: "Delegate recommendation",
  description:
    "Mark a Decision Engine recommendation as delegated — it stops re-issuing (like accepted/dismissed) and the delegation is remembered.",
  tier: "approval_required",
  internal: true,
  reversible: true,
  params: {
    recommendationId: "The recommendation id (rule:subject) (required).",
    summary: "The recommendation's action text, for the record (required).",
    delegatedTo: "Optional: who it was delegated to.",
  },
  examples: [],
  validate(params) {
    const problems: string[] = [];
    if (!text(params, "recommendationId")) problems.push("Missing recommendation id.");
    if (!text(params, "summary")) problems.push("Missing recommendation summary.");
    return problems;
  },
  preview(params): CommandPreview {
    const to = text(params, "delegatedTo");
    return {
      lines: [
        `Mark recommendation "${text(params, "summary")}" as delegated${to ? ` to ${to}` : ""}.`,
        "It stops appearing in the Brain's recommendations; the delegation is recorded in the learning feed. The underlying condition stays visible in department health and the CRM.",
      ],
    };
  },
};

/** The v1 catalogue. Order is display order. */
export const COMMAND_CATALOGUE: ReadonlyArray<CommandActionDefinition> = [
  createNextAction,
  appendBusinessNote,
  draftFollowUp,
  updateBuildItem,
  delegateRecommendation,
];

export function getCommandAction(id: string): CommandActionDefinition | null {
  return COMMAND_CATALOGUE.find((action) => action.id === id) ?? null;
}

export function isCommandActionId(id: string): id is CommandActionId {
  return getCommandAction(id) !== null;
}
