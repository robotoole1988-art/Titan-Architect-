/**
 * The fal.ai adapter (ADR-039) — premium Kling video through fal's queue.
 *
 * Two model tiers ride this provider, both billed by the second:
 *   - hero-4k  → Kling v3 native-4K text-to-video (the quality-ceiling test).
 *   - morph    → Kling O1 first→last frame: a start keyframe becomes an end
 *                keyframe, the storm-to-roof transformation AS film.
 *
 * fal's REST queue: POST to submit → poll `status_url` to COMPLETED → GET
 * `response_url` for the output. Server-side FAL_KEY only, transport/sleep
 * injectable for tests. The no-people/no-text law rides the negative prompt.
 */

import type {
  GeneratedMedia,
  MediaGenerationProvider,
  MediaGenerationRequest,
} from "./model";
import { VIDEO_MODELS, videoModelCostUsd } from "./model";
import { VIDEO_NEGATIVE_PROMPT } from "./prompt";

type TransportResponse = {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
};
type Transport = (
  url: string,
  init: { method: string; headers: Record<string, string>; body?: string },
) => Promise<TransportResponse>;

interface FalSubmit {
  request_id?: string;
  status_url?: string;
  response_url?: string;
}
interface FalStatus {
  status?: string;
  error?: string;
}
interface FalResult {
  video?: { url?: string };
  detail?: string;
  error?: string;
}

const FAL_QUEUE = "https://queue.fal.run";

export function createFalProvider(config: {
  key: string;
  transport?: Transport;
  sleep?: (ms: number) => Promise<void>;
  pollIntervalMs?: number;
  pollTimeoutMs?: number;
}): MediaGenerationProvider {
  const transport: Transport = config.transport ?? (fetch as unknown as Transport);
  const sleep =
    config.sleep ?? ((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)));
  const pollIntervalMs = config.pollIntervalMs ?? 4000;
  const pollTimeoutMs = config.pollTimeoutMs ?? 12 * 60 * 1000;
  const headers = {
    Authorization: `Key ${config.key}`,
    "Content-Type": "application/json",
  };

  async function generate(request: MediaGenerationRequest): Promise<GeneratedMedia> {
    if (typeof window !== "undefined") {
      throw new Error("The fal.ai provider is server-side only.");
    }
    if (request.modality !== "video") {
      throw new Error("The fal.ai provider handles film only (image stays on Replicate).");
    }
    const key = request.videoModel ?? "hero-4k";
    const spec = VIDEO_MODELS[key];
    if (spec.backend !== "fal" || !spec.falEndpoint) {
      throw new Error(`Video model "${key}" is not a fal.ai model.`);
    }
    const duration = Math.min(
      Math.max(Math.round(request.durationSeconds ?? 5), 3),
      spec.maxDurationSeconds,
    );

    let input: Record<string, unknown>;
    if (spec.kind === "first-last-frame") {
      if (!request.startImageUrl) {
        throw new Error("A morph film needs a start frame (start_image_url).");
      }
      input = {
        prompt: request.prompt,
        start_image_url: request.startImageUrl,
        ...(request.endImageUrl ? { end_image_url: request.endImageUrl } : {}),
        duration: String(duration),
        negative_prompt: VIDEO_NEGATIVE_PROMPT,
        cfg_scale: 0.5,
      };
    } else {
      input = {
        prompt: request.prompt,
        duration: String(duration),
        aspect_ratio: "16:9",
        negative_prompt: VIDEO_NEGATIVE_PROMPT,
        generate_audio: false,
        cfg_scale: 0.5,
      };
    }

    // Submit to the queue.
    const submitRes = await transport(`${FAL_QUEUE}/${spec.falEndpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(input),
    });
    if (!submitRes.ok) {
      const body = await submitRes.json().catch(() => ({}));
      throw new Error(`fal submit HTTP ${submitRes.status}: ${JSON.stringify(body)}`);
    }
    const submit = (await submitRes.json()) as FalSubmit;
    const statusUrl =
      submit.status_url ??
      (submit.request_id
        ? `${FAL_QUEUE}/${spec.falEndpoint}/requests/${submit.request_id}/status`
        : undefined);
    const responseUrl =
      submit.response_url ??
      (submit.request_id
        ? `${FAL_QUEUE}/${spec.falEndpoint}/requests/${submit.request_id}`
        : undefined);
    if (!statusUrl || !responseUrl) {
      throw new Error("fal submit returned no request handle.");
    }

    // Poll to completion.
    const deadline = Date.now() + pollTimeoutMs;
    let status: FalStatus = {};
    while (status.status !== "COMPLETED") {
      if (Date.now() > deadline) {
        throw new Error(`fal job timed out after ${pollTimeoutMs}ms.`);
      }
      await sleep(pollIntervalMs);
      // No body on GET — fetch rejects a GET/HEAD request that carries one.
      const polled = await transport(statusUrl, { method: "GET", headers });
      if (!polled.ok) throw new Error(`fal status HTTP ${polled.status}.`);
      status = (await polled.json()) as FalStatus;
      if (status.status && !["IN_QUEUE", "IN_PROGRESS", "COMPLETED"].includes(status.status)) {
        throw new Error(`fal job ${status.status}: ${status.error ?? "unknown"}`);
      }
    }

    // Fetch the result.
    const resultRes = await transport(responseUrl, { method: "GET", headers });
    if (!resultRes.ok) throw new Error(`fal result HTTP ${resultRes.status}.`);
    const result = (await resultRes.json()) as FalResult;
    const url = result.video?.url;
    if (!url) {
      throw new Error(
        `fal returned no video: ${result.detail ?? result.error ?? status.error ?? "unknown"}`,
      );
    }
    return {
      url,
      format: "mp4",
      costUsd: videoModelCostUsd(key, duration),
      provider: "fal",
      model: spec.falEndpoint,
    };
  }

  return { name: "fal", generate };
}
