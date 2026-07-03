"use server";

/**
 * Business Intake server actions (ADR-023): the intake form writes through
 * the Business Spine repository — never a database client, never the browser.
 * Creating an intake IS creating the Business record (stage: lead).
 */

import { revalidatePath } from "next/cache";
import { resolveBusinessSpine, type Business } from "@/core/business";
import type { BusinessIntakeDraft } from "../model/types";

function revalidateSpineViews(): void {
  revalidatePath("/business-intake");
  revalidatePath("/businesses");
}

export async function createBusinessFromIntake(
  draft: BusinessIntakeDraft,
): Promise<Business> {
  const spine = await resolveBusinessSpine();
  const business = await spine.businesses.create({
    name: draft.businessName.trim(),
    trade: draft.trade.trim(),
    tradeId: draft.tradeId,
    location: draft.location.trim(),
    coverageAreas: draft.coverageAreas
      .split(",")
      .map((area) => area.trim())
      .filter(Boolean),
    services: draft.services.trim() || undefined,
    targetCustomer: draft.targetCustomer.trim() || undefined,
    goal: draft.mainGoal,
    budget: draft.monthlyMarketingBudget,
    urgency: draft.urgencyLevel,
    currentWebsiteUrl: draft.currentWebsiteUrl.trim() || undefined,
  });
  revalidateSpineViews();
  return business;
}

export async function removeBusiness(id: string): Promise<void> {
  const spine = await resolveBusinessSpine();
  await spine.businesses.remove(id);
  revalidateSpineViews();
}
