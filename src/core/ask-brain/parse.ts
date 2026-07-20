/**
 * The deterministic parser (ADR-048): canonical phrasings → intents, with
 * ZERO LLM involvement. Conservative by design — a question that doesn't
 * clearly match a pattern returns null (the LLM layer's job), and an
 * ambiguous business name comes back as a question, never a guess.
 */

import type { Business } from "@/core/business";
import type { KnowledgeGraph } from "@/core/memory-spine";
import type { ParseOutcome } from "./model";

/** Strip punctuation/possessives a captured name fragment drags along. */
function cleanFragment(fragment: string): string {
  return fragment
    .trim()
    .replace(/[?.!,;:]+$/g, "")
    .replace(/['’]s$/i, "")
    .trim();
}

export type BusinessResolution =
  | { kind: "match"; id: string; name: string }
  | { kind: "ambiguous"; candidates: ReadonlyArray<{ id: string; name: string }> }
  | null;

/** Conservative name resolution: unique substring match or honesty. */
export function resolveBusinessByName(
  graph: KnowledgeGraph,
  fragment: string,
): BusinessResolution {
  const needle = cleanFragment(fragment).toLowerCase();
  if (!needle) return null;
  const candidates = Object.values(graph.nodes)
    .filter((node) => node.ref.kind === "business")
    .map((node) => node.record as Business)
    .filter((business) => business.name.toLowerCase().includes(needle))
    .map((business) => ({ id: business.id, name: business.name }));
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return { kind: "match", ...candidates[0] };
  const exact = candidates.find((candidate) => candidate.name.toLowerCase() === needle);
  if (exact) return { kind: "match", ...exact };
  return { kind: "ambiguous", candidates };
}

/** Extract a day count: "in 10 days", "a week", "this month" — default 7. */
function parseDays(question: string): number {
  const explicit = question.match(/(\d+)\s*days?/i);
  if (explicit) return Number.parseInt(explicit[1], 10);
  if (/a week|this week|last week/i.test(question)) return 7;
  if (/a fortnight|two weeks/i.test(question)) return 14;
  if (/this month|last month|a month/i.test(question)) return 30;
  return 7;
}

function businessIntent(
  graph: KnowledgeGraph,
  question: string,
  intentId: string,
  fragment: string,
  extraParams: Record<string, unknown> = {},
): ParseOutcome {
  const resolved = resolveBusinessByName(graph, fragment);
  if (!resolved) return null;
  if (resolved.kind === "ambiguous") {
    return { kind: "ambiguous", intentId, question, candidates: resolved.candidates };
  }
  return {
    kind: "intent",
    intentId,
    params: { businessId: resolved.id, ...extraParams },
  };
}

export function parseQuestion(
  question: string,
  graph: KnowledgeGraph,
): ParseOutcome {
  const q = question.trim();

  // Promises / recorded observations for a business — checked FIRST so
  // "what did we promise X" doesn't fall through to a weaker match.
  const promised = q.match(/promise[sd]?\s+(?:to\s+|for\s+)?(.+)$/i);
  if (promised) {
    return businessIntent(graph, q, "recorded_for", promised[1], { kind: "promise" });
  }
  const recorded = q.match(/record(?:ed)?\s+(?:for|about|on)\s+(.+)$/i);
  if (recorded) {
    return businessIntent(graph, q, "recorded_for", recorded[1]);
  }

  // Enquiries for a business.
  const enquiries = q.match(/enquir(?:y|ies)\s+(?:for|from)\s+(.+)$/i);
  if (enquiries) {
    return businessIntent(graph, q, "enquiries_for", enquiries[1]);
  }

  // Leads gone quiet.
  if (/(?:haven'?t|hasn'?t|not)\s+been\s+contacted|gone\s+quiet|no\s+contact\s+(?:in|for)/i.test(q)) {
    return { kind: "intent", intentId: "leads_not_contacted", params: { days: parseDays(q) } };
  }

  // Builds needing attention.
  if (/builds?\b.*\b(stalled|stuck|waiting|review)|(?:stalled|stuck)\s+builds?/i.test(q)) {
    return { kind: "intent", intentId: "builds_attention", params: {} };
  }

  // Pipeline overview.
  if (/pipeline/i.test(q)) {
    return { kind: "intent", intentId: "pipeline_by_stage", params: {} };
  }

  // Site performance.
  if (/(sites?|websites?)\b.*\b(visits?|traffic|enquir|busiest|performance)|most\s+visit/i.test(q)) {
    return { kind: "intent", intentId: "top_sites", params: { days: parseDays(q) } };
  }

  return null;
}
