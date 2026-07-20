/**
 * Natural commands (ADR-052): imperative phrasings → catalogued actions,
 * through ADR-048's validated seam (conservative business-name resolution;
 * ambiguity comes back as a question, never a guess). The parser NEVER
 * executes — its output is a request that lands as a pending approval,
 * regardless of phrasing.
 */

import { resolveBusinessByName } from "@/core/ask-brain";
import type { KnowledgeGraph } from "@/core/memory-spine";
import { getCommandAction, latestEnquiryFor } from "./catalogue";
import type { CommandActionId } from "./model";

export type CommandParseOutcome =
  | { kind: "command"; actionId: CommandActionId; params: Record<string, unknown> }
  | {
      kind: "ambiguous";
      actionId: CommandActionId;
      question: string;
      candidates: ReadonlyArray<{ id: string; name: string }>;
    }
  | { kind: "invalid"; actionId: CommandActionId; problems: string[] }
  | null;

type Resolution =
  | { kind: "match"; id: string; name: string }
  | { kind: "ambiguous"; candidates: ReadonlyArray<{ id: string; name: string }> }
  | null;

/** Words that can never BE a business name on their own. */
const STOP_WORDS = new Set([
  "a", "an", "and", "about", "for", "from", "in", "of", "on",
  "our", "re", "the", "their", "to", "with",
]);

function isStopFragment(words: ReadonlyArray<string>): boolean {
  return words.every((word) => STOP_WORDS.has(word.toLowerCase()));
}

/**
 * Find a business name inside free text by trying contiguous word-windows,
 * longest first ("chase Bright Smile about the proposal" → tries the whole
 * tail, then every shorter window, so trailing context can't break the
 * match). Unique match wins; ambiguity is surfaced; stop-word-only windows
 * never match. Unique match or honesty.
 */
function resolveBusinessInText(graph: KnowledgeGraph, tail: string): Resolution {
  const words = tail.split(/\s+/).filter(Boolean);
  for (let length = words.length; length >= 1; length -= 1) {
    let ambiguous: Extract<Resolution, { kind: "ambiguous" }> | null = null;
    for (let start = 0; start + length <= words.length; start += 1) {
      const window = words.slice(start, start + length);
      if (isStopFragment(window) || window.join(" ").length < 2) continue;
      const resolved = resolveBusinessByName(graph, window.join(" "));
      if (resolved?.kind === "match") return resolved;
      if (resolved?.kind === "ambiguous" && !ambiguous) ambiguous = resolved;
    }
    // The longest window that resolved at all is the honest answer — even
    // when that answer is "which one do you mean?".
    if (ambiguous) return ambiguous;
  }
  return null;
}

function resolveOr(
  actionId: CommandActionId,
  graph: KnowledgeGraph,
  fragment: string,
  onMatch: (match: { id: string; name: string }) => CommandParseOutcome,
): CommandParseOutcome {
  const resolved = resolveBusinessInText(graph, fragment);
  if (!resolved) return null;
  if (resolved.kind === "ambiguous") {
    return {
      kind: "ambiguous",
      actionId,
      question: `Which business do you mean: ${resolved.candidates
        .map((candidate) => candidate.name)
        .join(", ")}?`,
      candidates: resolved.candidates,
    };
  }
  return onMatch(resolved);
}

/**
 * Deterministic command parsing. Conservative: only clearly imperative
 * phrasings match; everything else returns null and stays a question for
 * Ask the Brain.
 */
export function parseCommand(
  input: string,
  graph: KnowledgeGraph,
): CommandParseOutcome {
  const q = input.trim().replace(/[.!]+$/, "");

  // "add a note to <business>: <text>" / "record a note on <business> saying <text>"
  const note = q.match(
    /^(?:add|append|record)\s+(?:a\s+)?note\s+(?:to|on|for|about)\s+(.+?)(?:\s*:\s*|\s+saying\s+)(.+)$/i,
  );
  if (note) {
    return resolveOr("append_business_note", graph, note[1], (match) => ({
      kind: "command",
      actionId: "append_business_note",
      params: { businessId: match.id, note: note[2].trim() },
    }));
  }

  // "create a task to chase <business>" / "add a reminder to call <business>"
  const task = q.match(
    /^(?:create|add|set|make)\s+(?:a\s+)?(?:task|next\s+action|reminder|to-?do)\s+(?:to\s+|for\s+)?(.+)$/i,
  );
  if (task) {
    const text = task[1].trim();
    return resolveOr("create_next_action", graph, text, (match) => ({
      kind: "command",
      actionId: "create_next_action",
      params: { businessId: match.id, text },
    }));
  }

  // "draft a follow-up (email) for <business>"
  const draft = q.match(
    /^draft\s+(?:a\s+)?follow[\s-]?up(?:\s+email)?\s+(?:for|to)\s+(.+)$/i,
  );
  if (draft) {
    return resolveOr("draft_follow_up", graph, draft[1], (match) => {
      const enquiry = latestEnquiryFor(graph, match.id);
      if (!enquiry) {
        return {
          kind: "invalid",
          actionId: "draft_follow_up",
          problems: [
            `${match.name} has no enquiries recorded — nothing to follow up.`,
          ],
        };
      }
      return {
        kind: "command",
        actionId: "draft_follow_up",
        params: { enquiryId: enquiry.id },
      };
    });
  }

  return null;
}

/** Validate a parsed command against the catalogue (the same seam the UI uses). */
export function validateParsedCommand(
  outcome: Extract<CommandParseOutcome, { kind: "command" }>,
  graph: KnowledgeGraph,
): string[] {
  return getCommandAction(outcome.actionId)!.validate(outcome.params, graph);
}
