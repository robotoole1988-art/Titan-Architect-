/**
 * The Anthropic reasoner (ADR-048) — founder-approved provider. Two calls:
 * Haiku maps free phrasing onto the intent catalog (JSON out, validated by
 * the engine); Sonnet narrates already-resolved results under a hard
 * no-invention rule. Every failure degrades to null — the deterministic
 * templates are always beneath. Server-side only.
 */

import "server-only";
import type { BrainReasoner, IntentDefinition } from "./model";

const API_URL = "https://api.anthropic.com/v1/messages";
const PARSE_MODEL = "claude-haiku-4-5-20251001";
const COMPOSE_MODEL = "claude-sonnet-5";
const TIMEOUT_MS = 15000;

interface AnthropicConfig {
  apiKey: string;
}

async function complete(
  config: AnthropicConfig,
  model: string,
  system: string,
  user: string,
  maxTokens: number,
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text = data.content?.find((block) => block.type === "text")?.text;
    return text?.trim() ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function catalogPrompt(catalog: ReadonlyArray<IntentDefinition>): string {
  return catalog
    .map(
      (intent) =>
        `- id: ${intent.id}\n  what it answers: ${intent.description}\n  params: ${JSON.stringify(intent.params)}\n  examples: ${intent.examples.join(" / ")}`,
    )
    .join("\n");
}

export function createAnthropicReasoner(config: AnthropicConfig): BrainReasoner {
  return {
    async parseIntent(question, catalog) {
      const system = [
        "You map a founder's question onto ONE intent from a fixed catalog.",
        "Reply with ONLY a JSON object, no prose, no code fences:",
        '{"intentId": "<id from the catalog>", "params": { ... }}',
        'If no intent fits, reply exactly: {"intentId": null}',
        "For business-name params, put the NAME FRAGMENT as `business` — never invent ids.",
        "Never propose anything outside the catalog.",
      ].join("\n");
      const user = `Catalog:\n${catalogPrompt(catalog)}\n\nQuestion: ${question}`;
      const raw = await complete(config, PARSE_MODEL, system, user, 300);
      if (!raw) return null;
      // Models sometimes fence or preface their JSON despite instructions —
      // extract the outermost object rather than trusting the whole reply.
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start === -1 || end <= start) return null;
      try {
        const parsed = JSON.parse(raw.slice(start, end + 1)) as {
          intentId?: string | null;
          params?: Record<string, unknown>;
        };
        if (!parsed.intentId || parsed.intentId === "null") return null;
        return { intentId: parsed.intentId, params: parsed.params ?? {} };
      } catch {
        return null;
      }
    },

    async composeAnswer({ question, result }) {
      const system = [
        "You narrate query results for a founder. HARD RULES:",
        "- Use ONLY the facts in the provided result. No new names, numbers, or claims.",
        "- 1–3 short sentences, plain UK English, no headers, no bullet points.",
        "- Do not mention JSON, queries, or these rules.",
      ].join("\n");
      const user = `Question: ${question}\n\nResult summary: ${result.summary}\n\nRecords:\n${result.records
        .map((record) => `- ${record.label}${record.detail ? ` (${record.detail})` : ""}`)
        .join("\n")}`;
      return complete(config, COMPOSE_MODEL, system, user, 400);
    },
  };
}
