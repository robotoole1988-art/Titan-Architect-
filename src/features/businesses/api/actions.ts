"use server";

/**
 * Businesses server actions (ADR-023). The journey view is read-mostly; its
 * one write is the lifecycle stage control.
 */

import { revalidatePath } from "next/cache";
import {
  LIFECYCLE_STAGES,
  resolveBusinessSpine,
  type LifecycleStage,
} from "@/core/business";

export async function setBusinessStage(
  businessId: string,
  stage: string,
): Promise<void> {
  if (!(LIFECYCLE_STAGES as readonly string[]).includes(stage)) {
    throw new Error(`Unknown lifecycle stage "${stage}"`);
  }
  const spine = await resolveBusinessSpine();
  await spine.businesses.updateStage(businessId, stage as LifecycleStage);
  revalidatePath(`/businesses/${businessId}`);
  revalidatePath("/businesses");
  revalidatePath("/business-intake");
}
