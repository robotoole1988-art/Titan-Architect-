/**
 * The Replicate adapter (ADR-033): image generation via Flux 1.1 Pro.
 * Server-side REPLICATE_API_TOKEN only, injectable transport for tests,
 * NEVER called in CI (no token there → resolveMediaProvider returns null
 * long before any network). Video is the next milestone — this adapter says
 * so loudly rather than pretending.
 */

import type {
  GeneratedMedia,
  MediaGenerationProvider,
  MediaGenerationRequest,
  MediaModality,
} from "./model";

const DEFAULT_MODEL = "black-forest-labs/flux-1.1-pro";

/** Cost telemetry table (USD) — logged onto every record's provenance. */
const COST_USD: Record<MediaModality, number> = {
  image: 0.04, // Flux 1.1 Pro list price per image
  video: 0.5, // placeholder for the next milestone's adapter
};

export function estimateGenerationCostUsd(modality: MediaModality): number {
  return COST_USD[modality];
}

type Transport = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

export function createReplicateProvider(config: {
  token: string;
  model?: string;
  transport?: Transport;
}): MediaGenerationProvider {
  const transport: Transport = config.transport ?? fetch;
  const model = config.model ?? DEFAULT_MODEL;
  return {
    name: "replicate",
    async generate(request: MediaGenerationRequest): Promise<GeneratedMedia> {
      if (typeof window !== "undefined") {
        throw new Error("The Replicate provider is server-side only.");
      }
      if (request.modality !== "image") {
        throw new Error(
          `Modality "${request.modality}" is not implemented yet — the video adapter is the next milestone (ADR-033).`,
        );
      }
      const response = await transport(
        `https://api.replicate.com/v1/models/${model}/predictions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.token}`,
            "Content-Type": "application/json",
            Prefer: "wait",
          },
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
      const body = (await response.json()) as {
        status?: string;
        output?: string | string[];
        error?: string;
      };
      const output = Array.isArray(body.output) ? body.output[0] : body.output;
      if (!output) {
        throw new Error(
          `Replicate returned no output (status ${body.status}): ${body.error ?? "unknown"}`,
        );
      }
      return {
        url: output,
        format: request.format ?? "webp",
        costUsd: COST_USD.image,
        provider: "replicate",
        model,
      };
    },
  };
}

/** Env-driven resolution: null without a token (and always null in CI). */
export function resolveMediaProvider(): MediaGenerationProvider | null {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;
  return createReplicateProvider({ token });
}
