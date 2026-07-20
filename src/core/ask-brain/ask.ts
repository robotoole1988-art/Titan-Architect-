/**
 * The ask engine (ADR-048): deterministic parse → intent → evidence, with
 * the LLM invited only where it cannot do harm — mapping unmapped phrasings
 * onto the catalog (validated before anything runs) and narrating non-empty
 * results (never absence). Confidence is derived from HOW the question was
 * understood, not from vibes.
 */

import { INTENT_CATALOG, runIntent } from "./intents";
import type {
  AskContext,
  BrainAnswer,
  BrainReasoner,
  EvidenceRecord,
  IntentResult,
} from "./model";
import { parseQuestion, resolveBusinessByName } from "./parse";

/** No LLM at all: patterns parse, templates narrate. The honest floor. */
export const deterministicReasoner: BrainReasoner = {
  async parseIntent() {
    return null;
  },
  async composeAnswer() {
    return null;
  },
};

/** Validate an LLM-proposed intent against the catalog. Reject ≠ trust. */
function validateParsedIntent(parsed: {
  intentId: string;
  params: Record<string, unknown>;
}): { intentId: string; params: Record<string, unknown> } | null {
  const intent = INTENT_CATALOG.find((candidate) => candidate.id === parsed.intentId);
  if (!intent) return null;
  const params: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.params ?? {})) {
    // Only parameters the intent declares survive (plus a pre-resolved
    // businessId, which read-only intents treat as a lookup key); types
    // stay primitive. Everything else is dropped unread.
    if (!(key in intent.params) && key !== "businessId") continue;
    if (typeof value === "number" || typeof value === "string") params[key] = value;
  }
  return { intentId: intent.id, params };
}

/** The honest miss: say what the Brain CAN answer today. */
function unmappedAnswer(question: string): BrainAnswer {
  const examples = INTENT_CATALOG.map((intent) => `"${intent.examples[0]}"`).join(", ");
  return {
    question,
    answer: `I can't map that to what the memory spine knows yet. Try asking: ${examples}.`,
    confidence: "low",
    records: [],
    derivation:
      "No deterministic pattern matched and no valid intent could be resolved — answered honestly rather than guessed.",
    isEmpty: true,
  };
}

async function answerFromResult(
  question: string,
  result: IntentResult,
  reasoner: BrainReasoner,
  confidence: "high" | "medium",
  parseNote: string,
): Promise<BrainAnswer> {
  // Absence is narrated by the deterministic template ONLY — the LLM is
  // never invited to turn nothing into something.
  const narrated = result.isEmpty
    ? null
    : await reasoner.composeAnswer({ question, result }).catch(() => null);
  return {
    question,
    answer: narrated ?? result.summary,
    confidence,
    intentId: result.intentId,
    records: result.records,
    derivation: `${parseNote} ${result.derivation}`,
    isEmpty: result.isEmpty,
  };
}

export async function askBrain(
  question: string,
  context: AskContext,
  reasoner: BrainReasoner,
): Promise<BrainAnswer> {
  const outcome = parseQuestion(question, context.graph);

  if (outcome?.kind === "ambiguous") {
    const records = outcome.candidates.map<EvidenceRecord>((candidate) => ({
      label: candidate.name,
      href: `/crm/${candidate.id}`,
      ref: { kind: "business", id: candidate.id },
      provenance: "businesses (memory spine)",
    }));
    return {
      question,
      answer: `Which business did you mean? ${outcome.candidates.map((candidate) => candidate.name).join(" or ")}?`,
      confidence: "high",
      intentId: outcome.intentId,
      records,
      derivation:
        "Deterministic parse matched the intent, but the business name matches more than one record — asking, not guessing.",
      isEmpty: false,
    };
  }

  if (outcome?.kind === "intent") {
    const result = runIntent(outcome.intentId, context, outcome.params);
    return answerFromResult(
      question,
      result,
      reasoner,
      "high",
      "Deterministic parse →",
    );
  }

  // The deterministic layer couldn't map it — the LLM's first job.
  const proposed = await reasoner
    .parseIntent(question, INTENT_CATALOG)
    .catch(() => null);
  const validated = proposed ? validateParsedIntent(proposed) : null;
  if (!validated) return unmappedAnswer(question);

  // The LLM names businesses, never ids — resolve the fragment ourselves,
  // and return ambiguity as a question, exactly like the deterministic path.
  if (typeof validated.params.business === "string") {
    const resolved = resolveBusinessByName(context.graph, validated.params.business);
    if (!resolved) return unmappedAnswer(question);
    if (resolved.kind === "ambiguous") {
      return {
        question,
        answer: `Which business did you mean? ${resolved.candidates.map((candidate) => candidate.name).join(" or ")}?`,
        confidence: "medium",
        intentId: validated.intentId,
        records: resolved.candidates.map<EvidenceRecord>((candidate) => ({
          label: candidate.name,
          href: `/crm/${candidate.id}`,
          ref: { kind: "business", id: candidate.id },
          provenance: "businesses (memory spine)",
        })),
        derivation:
          "LLM-parsed intent; the business name matches more than one record — asking, not guessing.",
        isEmpty: false,
      };
    }
    delete validated.params.business;
    validated.params.businessId = resolved.id;
  }

  const result = runIntent(validated.intentId, context, validated.params);
  return answerFromResult(
    question,
    result,
    reasoner,
    "medium",
    "LLM-parsed intent (validated against the catalog) →",
  );
}
