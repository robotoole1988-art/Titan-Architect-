/**
 * The active reasoner for this server process (ADR-048): the Anthropic
 * adapter when the founder-approved key is configured, the deterministic
 * reasoner otherwise. Same env-selected, global-cached pattern as every
 * provider seam (ADR-023/046).
 */

import { deterministicReasoner } from "./ask";
import type { BrainReasoner } from "./model";

const GLOBAL_KEY = Symbol.for("titan.brain-reasoner.v1");

interface ReasonerGlobal {
  backend: "anthropic" | "deterministic";
  reasoner: BrainReasoner;
}

export async function resolveBrainReasoner(): Promise<BrainReasoner> {
  const holder = globalThis as { [GLOBAL_KEY]?: ReasonerGlobal };
  const backend = process.env.ANTHROPIC_API_KEY ? "anthropic" : "deterministic";
  if (holder[GLOBAL_KEY]?.backend === backend) {
    return holder[GLOBAL_KEY].reasoner;
  }
  const reasoner =
    backend === "anthropic"
      ? (await import("./anthropic-reasoner")).createAnthropicReasoner({
          apiKey: process.env.ANTHROPIC_API_KEY!,
        })
      : deterministicReasoner;
  holder[GLOBAL_KEY] = { backend, reasoner };
  return reasoner;
}

/** Which backend answered — surfaced honestly in the UI. */
export function brainReasonerBackend(): "anthropic" | "deterministic" {
  return process.env.ANTHROPIC_API_KEY ? "anthropic" : "deterministic";
}
