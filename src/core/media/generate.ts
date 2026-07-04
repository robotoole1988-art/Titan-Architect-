/**
 * The generation workflow (ADR-033): plan → prompt → provider → permanent
 * storage → MediaRecord born in REVIEW. Founder-triggered only; per-image
 * cost logged onto provenance; failures collected, never silent.
 */

import type { Business, BusinessSpineRepositories } from "@/core/business";
import type { WebsiteBlueprint } from "@/core/website-blueprint";
import type { MediaGenerationProvider } from "./model";
import { deriveMediaPlan, type MediaPlanItem } from "./plan";

export interface MediaStorage {
  /** Persist bytes; return the public URL/path the renderer will serve. */
  save(
    businessId: string,
    slotRef: string,
    bytes: Uint8Array,
    format: string,
  ): Promise<{ url: string }>;
}

/** Dev/demo storage: files under public/generated-media (served statically). */
export function createLocalDiskStorage(publicDir = "public"): MediaStorage {
  return {
    async save(businessId, slotRef, bytes, format) {
      if (typeof window !== "undefined") {
        throw new Error("Local disk storage is server-side only.");
      }
      const { mkdir, writeFile } = await import("node:fs/promises");
      const path = await import("node:path");
      const safeSlot = slotRef.replace(/[^a-z0-9.-]+/gi, "_");
      const relative = `/generated-media/${businessId}/${safeSlot}.${format}`;
      const absolute = path.join(process.cwd(), publicDir, relative);
      await mkdir(path.dirname(absolute), { recursive: true });
      await writeFile(absolute, bytes);
      return { url: relative };
    },
  };
}

/** Production storage: a Supabase Storage bucket (service key, server-side). */
export function createSupabaseStorage(config: {
  url: string;
  serviceRoleKey: string;
  bucket?: string;
}): MediaStorage {
  const bucket = config.bucket ?? "media";
  return {
    async save(businessId, slotRef, bytes, format) {
      if (typeof window !== "undefined") {
        throw new Error("Supabase storage is server-side only.");
      }
      const safeSlot = slotRef.replace(/[^a-z0-9.-]+/gi, "_");
      const objectPath = `${businessId}/${safeSlot}.${format}`;
      const response = await fetch(
        `${config.url}/storage/v1/object/${bucket}/${objectPath}`,
        {
          method: "POST",
          headers: {
            // New-style sb_secret_ keys need BOTH headers (the storage API
            // rejects Bearer-only as "Invalid Compact JWS").
            apikey: config.serviceRoleKey,
            Authorization: `Bearer ${config.serviceRoleKey}`,
            "Content-Type": `image/${format}`,
            "x-upsert": "true",
          },
          body: new Uint8Array(bytes),
        },
      );
      if (!response.ok) {
        throw new Error(`Supabase storage error HTTP ${response.status}`);
      }
      return {
        url: `${config.url}/storage/v1/object/public/${bucket}/${objectPath}`,
      };
    },
  };
}

export interface GenerateMediaSummary {
  planned: number;
  generated: number;
  skipped: number;
  failed: Array<{ slotRef: string; error: string }>;
  totalCostUsd: number;
}

/**
 * Generate every planned slot that has no record yet. Existing records
 * (any status — including rejected, which the founder can regenerate by
 * deleting later) are skipped, so re-runs are cheap and idempotent.
 */
export async function generateMissingMedia(
  spine: BusinessSpineRepositories,
  provider: MediaGenerationProvider,
  storage: MediaStorage,
  business: Business,
  blueprint: WebsiteBlueprint,
  options: { onProgress?: (item: MediaPlanItem, index: number, total: number) => void } = {},
): Promise<GenerateMediaSummary> {
  const plan = deriveMediaPlan(blueprint);
  const existing = new Set(
    (await spine.media.listForBusiness(business.id)).map(
      (record) => record.slotRef,
    ),
  );
  const summary: GenerateMediaSummary = {
    planned: plan.length,
    generated: 0,
    skipped: 0,
    failed: [],
    totalCostUsd: 0,
  };

  let index = 0;
  for (const item of plan) {
    index += 1;
    if (existing.has(item.slotRef)) {
      summary.skipped += 1;
      continue;
    }
    options.onProgress?.(item, index, plan.length);
    try {
      const generated = await provider.generate({
        modality: item.modality,
        prompt: item.prompt,
        width: item.width,
        height: item.height,
        seed: item.pairSeed,
        format: "webp",
      });
      const response = await fetch(generated.url);
      if (!response.ok) {
        throw new Error(`asset download failed HTTP ${response.status}`);
      }
      const bytes = new Uint8Array(await response.arrayBuffer());
      const stored = await storage.save(
        business.id,
        item.slotRef,
        bytes,
        generated.format,
      );
      await spine.media.create({
        businessId: business.id,
        slotRef: item.slotRef,
        brief: item.brief,
        modality: item.modality,
        url: stored.url,
        width: item.width,
        height: item.height,
        provenance: {
          provider: generated.provider,
          model: generated.model,
          prompt: item.prompt,
          costUsd: generated.costUsd,
          generatedAt: new Date().toISOString(),
        },
      });
      summary.generated += 1;
      summary.totalCostUsd = Math.round((summary.totalCostUsd + generated.costUsd) * 100) / 100;
      console.info(
        `[media] ${item.slotRef} generated ($${generated.costUsd.toFixed(2)}) — running total $${summary.totalCostUsd.toFixed(2)}`,
      );
    } catch (error) {
      summary.failed.push({
        slotRef: item.slotRef,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(`[media] ${item.slotRef} FAILED:`, error);
    }
  }
  return summary;
}
