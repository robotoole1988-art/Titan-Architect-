/**
 * Guardrail tier machinery (ADR-052).
 *
 * The catalogue declares each action's default tier. Promotion to `auto` is
 * a FOUNDER decision recorded in the learning feed — a `tier_promoted`
 * observation with `source: "founder"` — never a code default. This module
 * resolves the effective tier by reading those records; anything else in the
 * feed (including a department or the Brain itself claiming a promotion) is
 * ignored.
 */

import type { Observation } from "@/core/memory-spine";
import { getCommandAction } from "./catalogue";
import type { CommandActionId, GuardrailTier } from "./model";

const TIERS: ReadonlyArray<GuardrailTier> = [
  "auto",
  "recommend_first",
  "approval_required",
];

/** The feed kind that records a founder tier decision. */
export const TIER_PROMOTED_KIND = "tier_promoted";

/**
 * The effective tier for an action: the catalogue default unless the founder
 * has recorded a promotion/demotion in the learning feed. Observations are
 * expected newest-first (the feed's list order); the newest founder decision
 * wins.
 */
export function effectiveTier(
  actionId: CommandActionId,
  observations: ReadonlyArray<Observation>,
): GuardrailTier {
  const action = getCommandAction(actionId);
  if (!action) throw new Error(`Unknown command action "${actionId}"`);
  for (const observation of observations) {
    if (observation.kind !== TIER_PROMOTED_KIND) continue;
    // Only the founder reclassifies tiers — the constitution, enforced.
    if (observation.source !== "founder") continue;
    if (observation.payload?.actionId !== actionId) continue;
    const tier = observation.payload?.tier;
    if (typeof tier === "string" && (TIERS as readonly string[]).includes(tier)) {
      return tier as GuardrailTier;
    }
  }
  return action.tier;
}
