/**
 * The Replicate adapter (ADR-033 image, ADR-036 video).
 *
 * Server-side REPLICATE_API_TOKEN only, injectable transport for tests,
 * NEVER called in CI (no token there → resolveMediaProvider returns null
 * long before any network).
 *
 * - IMAGE (Flux 1.1 Pro): synchronous `Prefer: wait` (≤60s).
 * - VIDEO (Kling v2.1): predictions take minutes, so it CREATES a
 *   prediction and POLLS to a terminal state. The no-people/no-text law
 *   rides both the prompt and Kling's `negative_prompt`. Model/mode/
 *   duration are injectable so the founder can swap models without a code
 *   change (ADR-036).
 */

import type {
  GeneratedMedia,
  MediaGenerationProvider,
  MediaGenerationRequest,
} from "./model";
import { estimateGenerationCostUsd, videoModelCostUsd } from "./model";
import { VIDEO_NEGATIVE_PROMPT } from "./prompt";

const DEFAULT_IMAGE_MODEL = "black-forest-labs/flux-1.1-pro";
// The text-to-video variant (kling-v2.1 base is image-to-video, needs a
// start_image; the *-master* model is pure T2V, prompt-only — ADR-036).
const DEFAULT_VIDEO_MODEL = "kwaivgi/kling-v2.1-master";

type TransportResponse = {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
};
type Transport = (
  url: string,
  init: { method: string; headers: Record<string, string>; body?: string },
) => Promise<TransportResponse>;

interface ReplicatePrediction {
  id?: string;
  status?: string;
  output?: string | string[];
  error?: string;
  urls?: { get?: string };
}

export function createReplicateProvider(config: {
  token: string;
  /** Image model (Flux by default). */
  model?: string;
  /** Video model (Kling v2.1 by default) — injectable to swap providers. */
  videoModel?: string;
  transport?: Transport;
  /** Injectable delay for the video poll loop (tests pass a no-op). */
  sleep?: (ms: number) => Promise<void>;
  pollIntervalMs?: number;
  pollTimeoutMs?: number;
}): MediaGenerationProvider {
  const transport: Transport = config.transport ?? fetch;
  const model = config.model ?? DEFAULT_IMAGE_MODEL;
  const videoModel = config.videoModel ?? DEFAULT_VIDEO_MODEL;
  const sleep =
    config.sleep ?? ((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)));
  const pollIntervalMs = config.pollIntervalMs ?? 4000;
  const pollTimeoutMs = config.pollTimeoutMs ?? 10 * 60 * 1000;

  const authHeaders = {
    Authorization: `Bearer ${config.token}`,
    "Content-Type": "application/json",
  };

  async function generateImage(
    request: MediaGenerationRequest,
  ): Promise<GeneratedMedia> {
    const response = await transport(
      `https://api.replicate.com/v1/models/${model}/predictions`,
      {
        method: "POST",
        headers: { ...authHeaders, Prefer: "wait" },
        body: JSON.stringify({
          input: {
            prompt: request.prompt,
            width: request.width ?? 1344,
            height: request.height ?? 768,
            output_format: request.format ?? "webp",
            output_quality: 80,
            prompt_upsampling: true,
            safety_tolerance: 2,
            ...(request.seed !== undefined ? { seed: request.seed } : {}),
          },
        }),
      },
    );
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(
        `Replicate error HTTP ${response.status}: ${JSON.stringify(body)}`,
      );
    }
    const body = (await response.json()) as ReplicatePrediction;
    const output = Array.isArray(body.output) ? body.output[0] : body.output;
    if (!output) {
      throw new Error(
        `Replicate returned no output (status ${body.status}): ${body.error ?? "unknown"}`,
      );
    }
    return {
      url: output,
      format: request.format ?? "webp",
      costUsd: estimateGenerationCostUsd("image"),
      provider: "replicate",
      model,
    };
  }

  async function generateVideo(
    request: MediaGenerationRequest,
  ): Promise<GeneratedMedia> {
    const duration = request.durationSeconds ?? 5;
    // Create the prediction (no Prefer: wait — video takes minutes).
    const created = await transport(
      `https://api.replicate.com/v1/models/${videoModel}/predictions`,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          input: {
            prompt: request.prompt,
            duration,
            negative_prompt: VIDEO_NEGATIVE_PROMPT,
            ...(request.seed !== undefined ? { seed: request.seed } : {}),
          },
        }),
      },
    );
    if (!created.ok) {
      const body = await created.json().catch(() => ({}));
      throw new Error(
        `Replicate video create HTTP ${created.status}: ${JSON.stringify(body)}`,
      );
    }
    let prediction = (await created.json()) as ReplicatePrediction;
    const pollUrl =
      prediction.urls?.get ??
      (prediction.id
        ? `https://api.replicate.com/v1/predictions/${prediction.id}`
        : undefined);

    const deadline = Date.now() + pollTimeoutMs;
    const terminal = new Set(["succeeded", "failed", "canceled"]);
    while (!terminal.has(prediction.status ?? "") && pollUrl) {
      if (Date.now() > deadline) {
        throw new Error(`Replicate video timed out after ${pollTimeoutMs}ms.`);
      }
      await sleep(pollIntervalMs);
      // No body on GET — fetch rejects a GET/HEAD request that carries one.
      const polled = await transport(pollUrl, {
        method: "GET",
        headers: authHeaders,
      });
      if (!polled.ok) {
        throw new Error(`Replicate video poll HTTP ${polled.status}.`);
      }
      prediction = (await polled.json()) as ReplicatePrediction;
    }
    if (prediction.status !== "succeeded") {
      throw new Error(
        `Replicate video ${prediction.status ?? "failed"}: ${prediction.error ?? "unknown"}`,
      );
    }
    const output = Array.isArray(prediction.output)
      ? prediction.output[0]
      : prediction.output;
    if (!output) {
      throw new Error("Replicate video succeeded but returned no output URL.");
    }
    return {
      url: output,
      format: "mp4",
      costUsd: videoModelCostUsd("standard", duration),
      provider: "replicate",
      model: videoModel,
    };
  }

  return {
    name: "replicate",
    async generate(request: MediaGenerationRequest): Promise<GeneratedMedia> {
      if (typeof window !== "undefined") {
        throw new Error("The Replicate provider is server-side only.");
      }
      return request.modality === "video"
        ? generateVideo(request)
        : generateImage(request);
    },
  };
}
