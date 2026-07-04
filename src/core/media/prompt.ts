/**
 * Briefs → prompts (ADR-033). The blueprint's media briefs are already art
 * direction; this module makes them generation prompts and enforces the
 * authenticity LAW in code, not author discipline: UK-true scenes,
 * photorealism, never faces, never text or logos.
 */

export interface PromptContext {
  trade: string;
  location: string;
}

/** Appended to EVERY prompt — the law. */
const AUTHENTICITY_CLAUSES = [
  "Setting: authentic United Kingdom — typical UK housing stock, region-plausible streets, gardens and planting around {location}.",
  "Light: natural, weather-true British light; overcast or golden-hour as the scene demands — never tropical or staged studio light.",
  "Style: photorealistic professional photography, shallow depth where appropriate, magazine quality.",
  "Constraints: no people and no faces anywhere in frame; no text, no signage, no watermarks, no logos.",
].join(" ");

export function buildMediaPrompt(brief: string, context: PromptContext): string {
  const clauses = AUTHENTICITY_CLAUSES.replaceAll("{location}", context.location);
  return `${brief.trim().replace(/\.?$/, ".")} Trade context: ${context.trade}. ${clauses}`;
}

/**
 * A film brief → a cinematic ambient-video prompt (ADR-036). The same
 * authenticity law applies; the treatment asks for slow, atmospheric,
 * loopable camera motion — hero ambience, not a stills slideshow.
 */
export function buildFilmPrompt(brief: string, context: PromptContext): string {
  const treatment = `${brief.trim().replace(/\.?$/, "")} — a short cinematic ambient film for a hero background: slow, smooth, atmospheric camera motion (a gentle drone drift or a slow tracking move), volumetric weather-true light, filmic colour, a calm continuous loop with no hard cuts.`;
  return buildMediaPrompt(treatment, context);
}

export interface PairPrompts {
  before: string;
  after: string;
  /** One seed → the provider renders a coherent pair. */
  seed: number;
}

/** Deterministic seed from a string (stable across runs — no randomness). */
export function seedFrom(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % 2147483647;
}

/**
 * A before/after PAIR: the same property, the same camera angle — one
 * coherent transformation, not two unrelated photos.
 */
export function buildPairPrompts(
  brief: string,
  context: PromptContext,
): PairPrompts {
  const scene = `${brief.trim().replace(/\.?$/, "")} — a single UK residential property. Both photographs show the SAME PROPERTY from the SAME CAMERA ANGLE at the same distance, consistent framing.`;
  return {
    before: buildMediaPrompt(
      `${scene} State: BEFORE the work — worn, tired, weathered and cracked surfaces, moss and staining, in need of the trade's help`,
      context,
    ),
    after: buildMediaPrompt(
      `${scene} State: AFTER the work — newly finished, pristine, completed to a premium standard, immaculate detailing`,
      context,
    ),
    seed: seedFrom(`${brief}|${context.trade}|${context.location}`),
  };
}
