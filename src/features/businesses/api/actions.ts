"use server";

/**
 * Businesses server actions (ADR-023/024). Stage moves run through the spine
 * workflow so the rules hold everywhere: history + activity recorded, and the
 * Build created exactly once when a business is won.
 */

import { revalidatePath } from "next/cache";
import {
  ALL_LIFECYCLE_STATES,
  resolveBusinessSpine,
  transitionBusinessStage,
  type LifecycleStage,
} from "@/core/business";

export async function setBusinessStage(
  businessId: string,
  stage: string,
): Promise<void> {
  if (!(ALL_LIFECYCLE_STATES as readonly string[]).includes(stage)) {
    throw new Error(`Unknown lifecycle stage "${stage}"`);
  }
  const spine = await resolveBusinessSpine();
  await transitionBusinessStage(spine, businessId, stage as LifecycleStage);
  revalidatePath(`/businesses/${businessId}`);
  revalidatePath("/businesses");
  revalidatePath("/business-intake");
  revalidatePath("/crm");
  revalidatePath("/crm/build-queue");
  revalidatePath("/crm/accounts");
  revalidatePath(`/crm/${businessId}`);
}
