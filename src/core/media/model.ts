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

/**
 * Which video model a film commission targets (ADR-039). Provider-agnostic
 * intent; the adapter maps each key to its own model id + input shaping.
 */
export type VideoModelKey = "standard" | "hero-4k" | "morph";

export interface VideoModelSpec {
  key: VideoModelKey;
  label: string;
  description: string;
  /** Text-to-video, or a start→end keyframe transformation. */
  kind: "text-to-video" | "first-last-frame";
  backend: "replicate" | "fal";
  /** fal.ai queue endpoint id (backend "fal"). */
  falEndpoint?: string;
  /** Replicate model id (backend "replicate"). */
  replicateModel?: string;
  /** Per-second billing (fal Kling v3 4K, O1); undefined → flat. */
  costPerSecondUsd?: number;
  /** Flat billing (Replicate Kling Master, short clips). */
  flatCostUsd?: number;
  maxDurationSeconds: number;
  resolution: string;
}

export const VIDEO_MODELS: Record<VideoModelKey, VideoModelSpec> = {
  standard: {
    key: "standard",
    label: "Standard — Kling v2.1 Master",
    description: "The ADR-036 hero-ambience clip: prompt-only, ~720p, fast and cheap.",
    kind: "text-to-video",
    backend: "replicate",
    replicateModel: "kwaivgi/kling-v2.1-master",
    flatCostUsd: 0.28,
    maxDurationSeconds: 10,
    resolution: "~720p",
  },
  "hero-4k": {
    key: "hero-4k",
    label: "Native 4K — Kling 3.0",
    description: "Kling's native-4K text-to-video — the quality-ceiling test, billed by the second.",
    kind: "text-to-video",
    backend: "fal",
    falEndpoint: "fal-ai/kling-video/v3/4k/text-to-video",
    costPerSecondUsd: 0.42,
    maxDurationSeconds: 15,
    resolution: "native 4K",
  },
  morph: {
    key: "morph",
    label: "Morph film — Kling O1 keyframes",
    description: "Kling O1 first→last frame: a start frame becomes an end frame, the transformation as film.",
    kind: "first-last-frame",
    backend: "fal",
    falEndpoint: "fal-ai/kling-video/o1/standard/image-to-video",
    costPerSecondUsd: 0.112,
    maxDurationSeconds: 10,
    resolution: "1080p",
  },
};

/** Per-render cost (USD), rounded to the cent — logged onto provenance. */
export function videoModelCostUsd(key: VideoModelKey, durationSeconds: number): number {
  const spec = VIDEO_MODELS[key];
  const raw =
    spec.costPerSecondUsd !== undefined
      ? spec.costPerSecondUsd * durationSeconds
      : (spec.flatCostUsd ?? 0);
  return Math.round(raw * 100) / 100;
}

/** Flat list price per generated image (Flux 1.1 Pro). */
const IMAGE_COST_USD = 0.04;

/** Cost estimate for the UI and telemetry — video honours the model + duration. */
export function estimateGenerationCostUsd(
  modality: MediaModality,
  options: { videoModel?: VideoModelKey; durationSeconds?: number } = {},
): number {
  if (modality === "video") {
    return videoModelCostUsd(options.videoModel ?? "standard", options.durationSeconds ?? 5);
  }
  return IMAGE_COST_USD;
}

export interface MediaGenerationRequest {
  modality: MediaModality;
  prompt: string;
  width?: number;
  height?: number;
  /** Video only. */
  durationSeconds?: number;
  /** Video only — which model tier to target (ADR-039). Default: standard. */
  videoModel?: VideoModelKey;
  /** Morph film only — the start (first) keyframe URL. */
  startImageUrl?: string;
  /** Morph film only — the end (last) keyframe URL. */
  endImageUrl?: string;
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
