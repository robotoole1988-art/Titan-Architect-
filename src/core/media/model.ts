/**
 * The media pipeline model (ADR-033) — MULTI-MODAL from day one.
 *
 * Persistence contracts (MediaRecord, MediaRepository) live with the spine
 * (core/business) alongside every other repository; this module owns the
 * GENERATION side: the provider seam covering image now and video next.
 */

export type {
  MediaModality,
  MediaProvenance,
  MediaRecord,
  MediaRecordDraft,
  MediaRepository,
  MediaReviewStatus,
} from "@/core/business";
import type { MediaModality } from "@/core/business";

export interface MediaGenerationRequest {
  modality: MediaModality;
  prompt: string;
  width?: number;
  height?: number;
  /** Video only. */
  durationSeconds?: number;
  /** Provider seed — pairs share one for coherence. */
  seed?: number;
  /** Output format hint ("webp", "mp4", …). */
  format?: string;
}

export interface GeneratedMedia {
  /** The provider's asset URL (downloaded into permanent storage after). */
  url: string;
  format: string;
  costUsd: number;
  provider: string;
  model: string;
}

/** The seam every generation backend implements — image today, video next. */
export interface MediaGenerationProvider {
  name: string;
  generate(request: MediaGenerationRequest): Promise<GeneratedMedia>;
}
