"use server";

/**
 * Lab dome generation (ADR-035 v2) — through OUR media engine, founder gate
 * applying: every dome is born in REVIEW under the internal lab business
 * and is approved/rejected at /crm/<lab>/media. Rejection reopens the slot
 * (retakes get their own stored object), exactly like customer media.
 */

import { revalidatePath } from "next/cache";
import { resolveBusinessSpine } from "@/core/business";
import {
  buildMediaPrompt,
  createLocalDiskStorage,
  createLqip,
  createSupabaseStorage,
  resolveMediaProvider,
} from "@/core/media";
import { DOME_SPECS, ensureLabBusiness } from "./environment";

export async function generateLabDomes(): Promise<void> {
  const provider = resolveMediaProvider();
  if (!provider) {
    throw new Error(
      "REPLICATE_API_TOKEN is not set — add it to .env.local to generate domes (ADR-033).",
    );
  }
  const spine = await resolveBusinessSpine();
  const business = await ensureLabBusiness(spine);
  const records = await spine.media.listForBusiness(business.id);
  const storage =
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createSupabaseStorage({
          url: process.env.SUPABASE_URL,
          serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        })
      : createLocalDiskStorage();

  let generated = 0;
  let totalCost = 0;
  for (const spec of DOME_SPECS) {
    const existing = records.filter((record) => record.slotRef === spec.slotRef);
    if (existing.some((record) => record.status !== "rejected")) continue;
    const prompt = buildMediaPrompt(spec.brief, {
      trade: "Roofing",
      location: "Manchester",
    });
    try {
      // Equirect wants 2:1; Flux dims are multiples of 32 → 1440×704.
      const result = await provider.generate({
        modality: "image",
        prompt,
        width: 1440,
        height: 704,
        format: "webp",
      });
      const response = await fetch(result.url);
      if (!response.ok) throw new Error(`dome download HTTP ${response.status}`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      const attempt = existing.length;
      const stored = await storage.save(
        business.id,
        attempt > 0 ? `${spec.slotRef}.take-${attempt + 1}` : spec.slotRef,
        bytes,
        result.format,
      );
      const lqip = await createLqip(Buffer.from(bytes));
      await spine.media.create({
        businessId: business.id,
        slotRef: spec.slotRef,
        brief: spec.brief,
        modality: "image",
        url: stored.url,
        ...(lqip ? { lqip } : {}),
        width: 1440,
        height: 704,
        provenance: {
          provider: result.provider,
          model: result.model,
          prompt,
          costUsd: result.costUsd,
          generatedAt: new Date().toISOString(),
        },
      });
      generated += 1;
      totalCost += result.costUsd;
      console.info(`[morph-lab] dome ${spec.slotRef} generated ($${result.costUsd.toFixed(2)})`);
    } catch (error) {
      console.error(`[morph-lab] dome ${spec.slotRef} FAILED:`, error);
    }
  }
  await spine.activity.log({
    businessId: business.id,
    kind: "note",
    message: `Morph Lab domes: ${generated} generated ($${totalCost.toFixed(2)}) — awaiting founder review`,
    meta: { generated, totalCost },
  });
  revalidatePath("/experience-studio/morph-lab");
  revalidatePath(`/crm/${business.id}/media`);
}
