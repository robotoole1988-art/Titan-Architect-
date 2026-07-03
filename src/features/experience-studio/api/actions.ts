"use server";

/**
 * Pipeline persistence actions (ADR-023). Strategies and Blueprints are saved
 * artifacts linked to their Business — versioned: every (re)generation creates
 * version n+1, never overwrites. A blueprint records the strategy version it
 * was built from. Generation stays in core; these actions only orchestrate.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  BusinessNotFoundError,
  resolveBusinessSpine,
  type Business,
  type BusinessSpineRepositories,
} from "@/core/business";
import {
  generateExperienceStrategy,
  type ExperienceStrategy,
} from "@/core/experience-strategy";
import {
  buildWebsiteBlueprint,
  type WebsiteBlueprint,
} from "@/core/website-blueprint";

function revalidateJourney(businessId: string): void {
  revalidatePath("/experience-studio");
  revalidatePath("/experience-studio/blueprint");
  revalidatePath("/experience-studio/preview");
  revalidatePath(`/businesses/${businessId}`);
  revalidatePath("/businesses");
}

async function requireBusiness(
  spine: BusinessSpineRepositories,
  businessId: string,
): Promise<Business> {
  const business = await spine.businesses.get(businessId);
  if (!business) throw new BusinessNotFoundError(businessId);
  return business;
}

async function saveStrategyVersion(
  spine: BusinessSpineRepositories,
  business: Business,
) {
  const strategy = generateExperienceStrategy({
    businessName: business.name,
    trade: business.trade,
    location: business.location,
  });
  return spine.artifacts.save<ExperienceStrategy>({
    businessId: business.id,
    kind: "strategy",
    payload: strategy,
  });
}

/** Generate (or regenerate) the strategy — new version, then show it. */
export async function generateStrategyArtifact(businessId: string): Promise<void> {
  const spine = await resolveBusinessSpine();
  const business = await requireBusiness(spine, businessId);
  await saveStrategyVersion(spine, business);
  revalidateJourney(businessId);
  redirect(`/experience-studio?businessId=${businessId}`);
}

/**
 * Generate (or regenerate) the blueprint from the LATEST stored strategy —
 * chaining a strategy v1 automatically if none exists yet.
 */
export async function generateBlueprintArtifact(businessId: string): Promise<void> {
  const spine = await resolveBusinessSpine();
  const business = await requireBusiness(spine, businessId);

  const strategyArtifact =
    (await spine.artifacts.latest<ExperienceStrategy>(businessId, "strategy")) ??
    (await saveStrategyVersion(spine, business));

  const blueprint = buildWebsiteBlueprint({ strategy: strategyArtifact.payload });
  await spine.artifacts.save<WebsiteBlueprint>({
    businessId,
    kind: "blueprint",
    payload: blueprint,
    meta: { strategyVersion: strategyArtifact.version },
  });
  revalidateJourney(businessId);
  redirect(`/experience-studio/blueprint?businessId=${businessId}`);
}
