/**
 * Provider resolution (ADR-039). ONE seam the rest of the app talks to; the
 * backend is swappable. Images and the standard hero clip stay on Replicate;
 * the premium film tiers (native-4K, O1 morph) go to fal.ai. A composite
 * router keeps that split invisible to callers — modality + model in, one
 * GeneratedMedia out.
 */

import type {
  GeneratedMedia,
  MediaGenerationProvider,
  MediaGenerationRequest,
  VideoModelKey,
} from "./model";
import { VIDEO_MODELS } from "./model";
import { createReplicateProvider } from "./replicate";
import { createFalProvider } from "./fal";

/** Route each request to the backend that owns its modality + model tier. */
export function createCompositeProvider(backends: {
  replicate: MediaGenerationProvider | null;
  fal: MediaGenerationProvider | null;
}): MediaGenerationProvider {
  async function generate(request: MediaGenerationRequest): Promise<GeneratedMedia> {
    if (request.modality === "image") {
      if (!backends.replicate) {
        throw new Error("REPLICATE_API_TOKEN is not set — image generation is unavailable.");
      }
      return backends.replicate.generate(request);
    }
    const key: VideoModelKey = request.videoModel ?? "standard";
    const backend = VIDEO_MODELS[key].backend;
    if (backend === "fal") {
      if (!backends.fal) {
        throw new Error(
          `FAL_KEY is not set — the ${VIDEO_MODELS[key].label} film tier needs it (ADR-039).`,
        );
      }
      return backends.fal.generate(request);
    }
    if (!backends.replicate) {
      throw new Error("REPLICATE_API_TOKEN is not set — film generation is unavailable.");
    }
    return backends.replicate.generate(request);
  }
  return { name: "titan-media", generate };
}

/**
 * Env-driven resolution. Null only when NEITHER backend is configured (and
 * always null in CI — no keys there — long before any network).
 */
export function resolveMediaProvider(): MediaGenerationProvider | null {
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  const falKey = process.env.FAL_KEY;
  const replicate = replicateToken ? createReplicateProvider({ token: replicateToken }) : null;
  const fal = falKey ? createFalProvider({ key: falKey }) : null;
  if (!replicate && !fal) return null;
  return createCompositeProvider({ replicate, fal });
}

/** Which film tiers can be commissioned right now, given the configured keys. */
export function availableVideoModels(): VideoModelKey[] {
  const models: VideoModelKey[] = [];
  if (process.env.REPLICATE_API_TOKEN) models.push("standard");
  if (process.env.FAL_KEY) models.push("hero-4k", "morph");
  return models;
}
