/**
 * commissionFilm (ADR-036): generate ONE hero ambience clip from an explicit
 * creative brief, born in REVIEW under the founder gate. This is how the two
 * takes per demo are ordered — same hero film slot, two directions, the
 * founder approves the one with the better taste. Reused by the CRM action
 * and one-off commissions; the generic `deriveMediaPlan` film slot uses the
 * strategy-derived brief instead.
 */

import type { Business, BusinessSpineRepositories } from "@/core/business";
import type { MediaGenerationProvider } from "./model";
import type { MediaStorage } from "./generate";
import { buildFilmPrompt } from "./prompt";

export interface FilmCommission {
  /** The hero IMAGE slot; the film targets `${heroSlotRef}.film`. */
  heroSlotRef: string;
  /** Creative direction for this take. */
  brief: string;
  durationSeconds?: number;
}

export interface FilmCommissionResult {
  slotRef: string;
  recordId: string;
  costUsd: number;
}

export async function commissionFilm(
  spine: BusinessSpineRepositories,
  provider: MediaGenerationProvider,
  storage: MediaStorage,
  business: Business,
  commission: FilmCommission,
): Promise<FilmCommissionResult> {
  const filmSlot = `${commission.heroSlotRef}.film`;
  const duration = commission.durationSeconds ?? 5;
  const records = await spine.media.listForBusiness(business.id);
  const attempt = records.filter((record) => record.slotRef === filmSlot).length;

  const prompt = buildFilmPrompt(commission.brief, {
    trade: business.trade,
    location: business.location,
  });
  const generated = await provider.generate({
    modality: "video",
    prompt,
    durationSeconds: duration,
    format: "mp4",
  });
  const response = await fetch(generated.url);
  if (!response.ok) {
    throw new Error(`film download failed HTTP ${response.status}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const stored = await storage.save(
    business.id,
    attempt > 0 ? `${filmSlot}.take-${attempt + 1}` : filmSlot,
    bytes,
    generated.format,
  );
  // Poster = the approved hero photograph (same scene, already the LCP).
  const poster = records.find(
    (record) =>
      record.slotRef === commission.heroSlotRef && record.status !== "rejected",
  );
  const record = await spine.media.create({
    businessId: business.id,
    slotRef: filmSlot,
    brief: commission.brief,
    modality: "video",
    url: stored.url,
    ...(poster?.lqip ? { lqip: poster.lqip } : {}),
    ...(poster ? { posterUrl: poster.url } : {}),
    durationSeconds: duration,
    width: 1344,
    height: 768,
    provenance: {
      provider: generated.provider,
      model: generated.model,
      prompt,
      costUsd: generated.costUsd,
      generatedAt: new Date().toISOString(),
    },
  });
  return { slotRef: filmSlot, recordId: record.id, costUsd: generated.costUsd };
}
