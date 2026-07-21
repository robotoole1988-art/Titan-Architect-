"use server";

/**
 * Demo mode founder actions (ADR-055). Prep assembles the Before; saving a
 * variant is the ONLY path from a preview render to persisted artifacts —
 * new versions through the artifact law, never overwrites.
 */

import { revalidatePath } from "next/cache";
import {
  BusinessNotFoundError,
  resolveBusinessSpine,
  recordArtifactGenerated,
} from "@/core/business";
import {
  ARCHETYPE_ALTERNATES,
  classifyArchetype,
  generateExperienceStrategy,
  type ExperienceStrategy,
  type TradeArchetype,
} from "@/core/experience-strategy";
import {
  buildWebsiteBlueprint,
  type WebsiteBlueprint,
} from "@/core/website-blueprint";
import {
  createLocalDiskStorage,
  createSupabaseStorage,
} from "@/core/media";
import { resolveLearningFeed } from "@/core/memory-spine";
import { prepareDemo } from "./prepare";

/** revalidate is a request-scope API; direct invocations (tests) skip it. */
function revalidateDemo(businessId: string): void {
  try {
    revalidatePath(`/demo/${businessId}`);
  } catch {
    // Outside a request context — nothing to revalidate.
  }
}

function mediaStorage() {
  return process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createSupabaseStorage({
        url: process.env.SUPABASE_URL,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      })
    : createLocalDiskStorage();
}

/** Assemble the Before so the live pitch never waits (ADR-055). */
export async function prepareDemoAction(businessId: string): Promise<void> {
  const [spine, feed] = await Promise.all([
    resolveBusinessSpine(),
    resolveLearningFeed(),
  ]);
  const business = await spine.businesses.get(businessId);
  if (!business) throw new BusinessNotFoundError(businessId);
  await prepareDemo(business, { spine, feed, storage: mediaStorage() });
  revalidateDemo(businessId);
}

export interface SaveVariantState {
  ok: boolean;
  message: string;
}

/**
 * The founder chose a direction from the comparison: persist it as NEW
 * strategy + blueprint versions (artifact law — never overwrite).
 */
export async function saveVariantAction(
  businessId: string,
  archetype: TradeArchetype,
): Promise<SaveVariantState> {
  const spine = await resolveBusinessSpine();
  const business = await spine.businesses.get(businessId);
  if (!business) throw new BusinessNotFoundError(businessId);
  const primary = classifyArchetype(business.trade.toLowerCase());
  if (archetype !== primary && !ARCHETYPE_ALTERNATES[primary].includes(archetype)) {
    return { ok: false, message: `"${archetype}" is not an offered direction for this trade.` };
  }

  const strategy = generateExperienceStrategy({
    businessName: business.name,
    trade: business.trade,
    location: business.location,
    ...(archetype !== primary ? { archetypeOverride: archetype } : {}),
  });
  const strategyArtifact = await spine.artifacts.save<ExperienceStrategy>({
    businessId,
    kind: "strategy",
    payload: strategy,
    meta: { demoVariant: archetype },
  });
  const blueprint = buildWebsiteBlueprint({
    strategy,
    coverageAreas: business.coverageAreas,
    ...(archetype !== primary ? { archetypeOverride: archetype } : {}),
  });
  const blueprintArtifact = await spine.artifacts.save<WebsiteBlueprint>({
    businessId,
    kind: "blueprint",
    payload: blueprint,
    meta: { strategyVersion: strategyArtifact.version, demoVariant: archetype },
  });
  await recordArtifactGenerated(spine, businessId, "blueprint", blueprintArtifact.version);
  revalidateDemo(businessId);
  return {
    ok: true,
    message: `Saved as strategy v${strategyArtifact.version} + blueprint v${blueprintArtifact.version} — the ${archetype} direction is now the latest.`,
  };
}
