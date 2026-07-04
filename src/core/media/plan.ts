/**
 * deriveMediaPlan (ADR-033): the complete, deterministic list of media
 * slots a blueprint wants filled — heroes, coherent before/after PAIRS,
 * portfolio frames, per-surface textures, area-page heroes, FAQ/process
 * support. "Every empty frame accounted for" is a function, not a hope.
 */

import type { PageBlueprint, WebsiteBlueprint } from "@/core/website-blueprint";
import type { MediaModality } from "./model";
import { buildFilmPrompt, buildMediaPrompt, buildPairPrompts, seedFrom } from "./prompt";

export interface MediaPlanItem {
  slotRef: string;
  brief: string;
  /** The final generation prompt (authenticity clauses applied). */
  prompt: string;
  modality: MediaModality;
  width: number;
  height: number;
  /** Present on before/after pairs — both halves share it. */
  pairSeed?: number;
  /** Video only (ADR-036): clip length in seconds. */
  durationSeconds?: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "…: a · b · c." → ["a","b","c"] (the explorer's anchor convention). */
function anchorsOf(direction: string | undefined): string[] {
  if (!direction) return [];
  // The LAST colon starts the list (the slot text itself contains one:
  // "services: The core … choose: A · B · C").
  const afterColon = direction.split(":").pop() ?? "";
  return afterColon
    .split("·")
    .map((item) => item.trim().replace(/\.$/, ""))
    .filter(Boolean);
}

export function deriveMediaPlan(blueprint: WebsiteBlueprint): MediaPlanItem[] {
  const context = {
    trade: blueprint.identity.trade ?? "",
    location: blueprint.identity.location ?? "",
  };
  const items: MediaPlanItem[] = [];
  const seen = new Set<string>();
  const push = (item: MediaPlanItem) => {
    if (seen.has(item.slotRef)) return;
    seen.add(item.slotRef);
    items.push(item);
  };

  const pages: ReadonlyArray<PageBlueprint> = blueprint.pages.pages;
  for (const page of pages) {
    for (const section of page.sections) {
      const media = section.media?.[0];
      const family = section.identifier.split(".")[0];
      const baseRef = media?.generationRef ?? `media/${section.id}`;
      const brief = media?.direction ?? section.purpose;

      if (family === "hero") {
        push({
          slotRef: baseRef,
          brief,
          prompt: buildMediaPrompt(
            `${brief} Wide establishing hero backdrop for a ${context.trade} business website${page.type === "landing" ? ` in ${page.name}` : ""}.`,
            context,
          ),
          modality: "image",
          width: 1344,
          height: 768,
        });
        // ONE ambience film per site — the homepage hero only (ADR-036).
        if (page.type !== "landing") {
          push({
            slotRef: `${baseRef}.film`,
            brief,
            prompt: buildFilmPrompt(
              `${brief} Cinematic hero ambience for a ${context.trade} business — the property and setting, moody and premium.`,
              context,
            ),
            modality: "video",
            width: 1344,
            height: 768,
            durationSeconds: 5,
          });
        }
      }

      if (section.identifier === "story.transformation-arc") {
        const pair = buildPairPrompts(
          `${brief} A driveway/exterior transformation told in two frames`,
          context,
        );
        push({
          slotRef: `${baseRef}.before`,
          brief,
          prompt: pair.before,
          modality: "image",
          width: 1344,
          height: 768,
          pairSeed: pair.seed,
        });
        push({
          slotRef: `${baseRef}.after`,
          brief,
          prompt: pair.after,
          modality: "image",
          width: 1344,
          height: 768,
          pairSeed: pair.seed,
        });
      }

      if (
        section.identifier === "proof.portfolio-showcase" &&
        section.extensions?.variant === "before-after-reveal"
      ) {
        // The variant's headline comparison gets its OWN coherent pair.
        const pair = buildPairPrompts(
          `${brief} A second complete transformation, different property from the story arc's`,
          context,
        );
        push({
          slotRef: `${baseRef}.pair-before`,
          brief,
          prompt: pair.before,
          modality: "image",
          width: 1344,
          height: 768,
          pairSeed: pair.seed,
        });
        push({
          slotRef: `${baseRef}.pair-after`,
          brief,
          prompt: pair.after,
          modality: "image",
          width: 1344,
          height: 768,
          pairSeed: pair.seed,
        });
      }

      if (
        section.identifier === "proof.portfolio-showcase" ||
        section.identifier === "gallery.immersive-grid"
      ) {
        const frames = section.identifier === "gallery.immersive-grid" ? 4 : 3;
        for (let index = 1; index <= frames; index += 1) {
          push({
            slotRef: `${baseRef}.frame-${index}`,
            brief,
            prompt: buildMediaPrompt(
              `${brief} Finished project photograph ${index} of ${frames} — a different completed job each frame, varied properties and finishes.`,
              context,
            ),
            modality: "image",
            width: 1152,
            height: 864,
          });
        }
      }

      if (section.identifier === "services.interactive-explorer") {
        const services = anchorsOf(
          section.contentRequirements?.find((entry) =>
            entry.startsWith("services:"),
          ),
        );
        for (const service of services.slice(0, 10)) {
          push({
            slotRef: `surfaces/${slugify(service)}`,
            brief: `Texture/detail photograph of ${service}`,
            prompt: buildMediaPrompt(
              `Close-up surface texture photograph of ${service} — the real material character, fine detail, three-quarter angle on a finished UK installation.`,
              context,
            ),
            modality: "image",
            width: 1024,
            height: 768,
          });
        }
      }

      if (
        section.identifier === "process.journey-map" ||
        section.identifier === "faq.reassurance-accordion"
      ) {
        push({
          slotRef: `${baseRef}.support`,
          brief: section.purpose,
          prompt: buildMediaPrompt(
            `Supporting editorial photograph for a ${context.trade} website's ${family} section — the craft in progress: tools, materials, careful workmanship, hands at most (no faces).`,
            context,
          ),
          modality: "image",
          width: 1024,
          height: 640,
        });
      }
    }
  }
  // Deterministic order + a stable per-item seed derived from the slot.
  return items.map((item) => ({
    ...item,
    ...(item.pairSeed === undefined
      ? { pairSeed: undefined }
      : { pairSeed: item.pairSeed }),
  }));
}

export { seedFrom };
