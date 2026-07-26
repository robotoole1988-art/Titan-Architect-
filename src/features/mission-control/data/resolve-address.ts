import "server-only";

/**
 * The situation address seam (ADR-056). Deterministic composition from the
 * live briefing + health + approval queue, then the ADR-048 reasoner may
 * REPHRASE it — same facts, better voice. Calm and precise: a narration
 * with an exclamation mark, hedging, or bloat is rejected and the
 * deterministic line stands. Never blocks the surface.
 */

import {
  brainReasonerBackend,
  resolveBrainReasoner,
} from "@/core/ask-brain";
import {
  composeSituationAddress,
  type Briefing,
  type SituationAddress,
} from "@/core/mission-control";
import { loadCommandCentre, loadDepartmentHealth } from "@/features/brain";

export interface ResolvedAddress extends SituationAddress {
  /** Reasoner phrasing over the deterministic line, when it delivered. */
  narrated?: string;
}

/** Reject narrations that break the voice contract (Law §1). Exported
 * for the guard's own tests — unvetted LLM text must never open the page. */
export function acceptableNarration(text: string, quiet: boolean): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 220) return false;
  if (trimmed.includes("!")) return false;
  // A quiet world must stay quiet — no invented urgency.
  if (quiet && /\b(urgent|now|immediately|breach)\b/i.test(trimmed)) return false;
  return true;
}

export async function resolveSituationAddress(
  briefing: Briefing,
): Promise<ResolvedAddress> {
  const [healthPayload, commandCentre] = await Promise.all([
    loadDepartmentHealth(),
    loadCommandCentre(),
  ]);
  const address = composeSituationAddress({
    briefing,
    health: healthPayload.healths,
    pendingApprovals: commandCentre.pending.length,
  });

  if (brainReasonerBackend() !== "anthropic") return address;
  try {
    const reasoner = await resolveBrainReasoner();
    const narrated = await reasoner.composeAnswer({
      question:
        "Address the founder with the one-line situation opening. One sentence, calm and precise, no exclamation marks, no headers — state only the facts given.",
      result: {
        intentId: "situation_address",
        params: {},
        summary: address.line,
        records: [],
        isEmpty: address.quiet,
        derivation:
          "Composed deterministically from the live briefing: SLA breaches, waiting enquiries, department bands, stale proposals, the review gate, and pending approvals (ADR-056; test artifacts excluded per Law §7).",
      },
    });
    if (narrated && acceptableNarration(narrated, address.quiet)) {
      return { ...address, narrated: narrated.trim() };
    }
  } catch {
    // The deterministic address stands — narration never breaks the surface.
  }
  return address;
}
