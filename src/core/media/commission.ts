/**
 * commissionFilm (ADR-036): generate ONE hero ambience clip from an explicit
 * creative brief, born in REVIEW under the founder gate. This is how the two
 * takes per demo are ordered — same hero film slot, two directions, the
 * founder approves the one with the better taste. Reused by the CRM action
 * and one-off commissions; the generic `deriveMediaPlan` film slot uses the
 * strategy-derived brief instead.
 */

import type { Business, BusinessSpineRepositories } from "@/core/business";
import type { MediaGenerationProvider, VideoModelKey } from "./model";
import { VIDEO_MODELS } from "./model";
import type { MediaStorage } from "./generate";
import { buildFilmPrompt, buildMorphFilmPrompt } from "./prompt";

export interface FilmCommission {
  /** The hero IMAGE slot; the film targets `${heroSlotRef}.film`. */
  heroSlotRef: string;
  /** Creative direction for this take. */
  brief: string;
  durationSeconds?: number;
  /** Which model tier to render — standard, native-4K, … (ADR-039). */
  videoModel?: VideoModelKey;
}

export interface FilmCommissionResult {
  slotRef: string;
  recordId: string;
  costUsd: number;
}

/** 16:9 pixel dimensions we record for a given model's resolution. */
function filmDimensions(videoModel: VideoModelKey): { width: number; height: number } {
  if (videoModel === "hero-4k") return { width: 3840, height: 2160 };
  if (videoModel === "morph") return { width: 1920, height: 1080 };
  return { width: 1344, height: 768 };
}

export async function commissionFilm(
  spine: BusinessSpineRepositories,
  provider: MediaGenerationProvider,
  storage: MediaStorage,
  business: Business,
  commission: FilmCommission,
): Promise<FilmCommissionResult> {
  const filmSlot = `${commission.heroSlotRef}.film`;
  const videoModel: VideoModelKey = commission.videoModel ?? "standard";
  const duration = Math.min(
    commission.durationSeconds ?? 5,
    VIDEO_MODELS[videoModel].maxDurationSeconds,
  );
  const records = await spine.media.listForBusiness(business.id);
  const attempt = records.filter((record) => record.slotRef === filmSlot).length;

  const prompt = buildFilmPrompt(commission.brief, {
    trade: business.trade,
    location: business.location,
  });
  const generated = await provider.generate({
    modality: "video",
    videoModel,
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
  const { width, height } = filmDimensions(videoModel);
  const record = await spine.media.create({
    businessId: business.id,
    slotRef: filmSlot,
    brief: commission.brief,
    modality: "video",
    url: stored.url,
    ...(poster?.lqip ? { lqip: poster.lqip } : {}),
    ...(poster ? { posterUrl: poster.url } : {}),
    durationSeconds: duration,
    width,
    height,
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

export interface MorphFilmCommission {
  /** Where the film lands, e.g. "morph.storm-roof.film". */
  slotRef: string;
  brief: string;
  /** The start (first) keyframe — raw storm / loose slate. */
  startImageUrl: string;
  /** The end (last) keyframe — the finished seated roof. */
  endImageUrl?: string;
  durationSeconds?: number;
}

/**
 * Commission a MORPH film (ADR-039): Kling O1 animates the transformation
 * between a start frame and an end frame — the storm-to-roof Transformium as
 * 4K-grade film. Born in REVIEW under the founder gate; the start frame is the
 * poster so first paint matches the film's opening frame.
 */
export async function commissionMorphFilm(
  spine: BusinessSpineRepositories,
  provider: MediaGenerationProvider,
  storage: MediaStorage,
  business: Business,
  commission: MorphFilmCommission,
): Promise<FilmCommissionResult> {
  const slot = commission.slotRef;
  const duration = Math.min(
    commission.durationSeconds ?? 5,
    VIDEO_MODELS.morph.maxDurationSeconds,
  );
  const records = await spine.media.listForBusiness(business.id);
  const attempt = records.filter((record) => record.slotRef === slot).length;

  const prompt = buildMorphFilmPrompt(commission.brief, {
    trade: business.trade,
    location: business.location,
  });
  const generated = await provider.generate({
    modality: "video",
    videoModel: "morph",
    prompt,
    startImageUrl: commission.startImageUrl,
    ...(commission.endImageUrl ? { endImageUrl: commission.endImageUrl } : {}),
    durationSeconds: duration,
    format: "mp4",
  });
  const response = await fetch(generated.url);
  if (!response.ok) {
    throw new Error(`morph film download failed HTTP ${response.status}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const stored = await storage.save(
    business.id,
    attempt > 0 ? `${slot}.take-${attempt + 1}` : slot,
    bytes,
    generated.format,
  );
  const record = await spine.media.create({
    businessId: business.id,
    slotRef: slot,
    brief: commission.brief,
    modality: "video",
    url: stored.url,
    // The start frame is the poster — first paint matches the opening frame.
    posterUrl: commission.startImageUrl,
    durationSeconds: duration,
    width: 1920,
    height: 1080,
    provenance: {
      provider: generated.provider,
      model: generated.model,
      prompt,
      costUsd: generated.costUsd,
      generatedAt: new Date().toISOString(),
    },
  });
  return { slotRef: slot, recordId: record.id, costUsd: generated.costUsd };
}
