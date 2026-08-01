/**
 * deriveMediaPlan (ADR-033): the complete, deterministic list of media
 * slots a blueprint wants filled — heroes, coherent before/after PAIRS,
 * portfolio frames, per-surface textures, area-page heroes, FAQ/process
 * support. "Every empty frame accounted for" is a function, not a hope.
 *
 * Every slot is still PLANNED. What changed with ADR-060 is who may fill
 * one: an evidentiary slot (`sourcing: "customer-photo"`) carries no prompt,
 * so it is a shot brief for the founder to collect rather than something a
 * provider can be asked for. See `./sourcing.ts` for why the rule lives on
 * the slot reference.
 */

import type { PageBlueprint, WebsiteBlueprint } from "@/core/website-blueprint";
import type { MediaModality } from "./model";
import { buildFilmPrompt, buildMediaPrompt, seedFrom } from "./prompt";
import {
  atmosphereSlot,
  type MediaSourcing,
  projectFrameCount,
  showcaseSlot,
  sourcingForSlot,
} from "./sourcing";

export interface MediaPlanItem {
  slotRef: string;
  brief: string;
  /**
   * The final generation prompt (authenticity clauses applied).
   *
   * UNDEFINED on `sourcing: "customer-photo"` slots — there is no prompt
   * because there is nothing to generate. The optionality is the point: any
   * code path that wants to commission this slot has to narrow the type
   * first, and the narrowing is where it discovers it must not.
   */
  prompt?: string;
  /** Who may fill this slot (ADR-060). Derived from the slot reference. */
  sourcing: MediaSourcing;
  modality: MediaModality;
  width: number;
  height: number;
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

  /**
   * The single choke point. `sourcing` is DERIVED from the slot reference
   * rather than passed in, and an evidentiary slot has its prompt stripped
   * here even if a caller supplied one — so a new evidentiary slot family
   * is one regex edit away from being safe, not an audit of call sites.
   */
  const push = (item: Omit<MediaPlanItem, "sourcing">) => {
    if (seen.has(item.slotRef)) return;
    seen.add(item.slotRef);
    const sourcing = sourcingForSlot(item.slotRef);
    const { prompt, ...rest } = item;
    items.push(
      sourcing === "customer-photo"
        ? { ...rest, sourcing }
        : { ...rest, sourcing, ...(prompt ? { prompt } : {}) },
    );
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

      // EVIDENCE (ADR-060). A before/after comparison is a claim about a
      // specific job on a specific property. It used to be commissioned as a
      // seed-matched generated pair; it is now the customer's own two
      // photographs, and until both exist the section renders its
      // illustrative `.atmosphere` instead of a fabricated comparison.
      if (section.identifier === "story.transformation-arc") {
        push({
          slotRef: `${baseRef}.before`,
          brief:
            "Customer's OWN photograph — the job BEFORE work started. Shot from a fixed viewpoint the after photo can repeat exactly: same position, same height, same framing. Both halves are needed before this section appears.",
          modality: "image",
          width: 1344,
          height: 768,
        });
        push({
          slotRef: `${baseRef}.after`,
          brief:
            "Customer's OWN photograph — the SAME job finished, from the identical viewpoint as the before shot. Dry, tidied, similar light and time of day if possible.",
          modality: "image",
          width: 1344,
          height: 768,
        });
        // ILLUSTRATIVE (ADR-060): what the section shows until that pair
        // exists. A single atmospheric image of the trade's finished work in
        // general — no before, no after, no claim that this property was
        // theirs. The comparison replaces it the moment both halves arrive.
        push({
          slotRef: atmosphereSlot(baseRef),
          brief: `Atmospheric backdrop for the ${context.trade} story section`,
          prompt: buildMediaPrompt(
            `A wide, calm editorial photograph of ${context.trade} work at its best — the finished standard as an atmosphere rather than a specific job: materials, light across a surface, considered detail. Generous negative space in the upper third for a headline.`,
            context,
          ),
          modality: "image",
          width: 1600,
          height: 900,
        });
      }

      if (
        section.identifier === "proof.portfolio-showcase" &&
        section.extensions?.variant === "before-after-reveal"
      ) {
        // The variant's headline comparison — a SECOND real job, so it must
        // not repeat the story arc's property.
        push({
          slotRef: `${baseRef}.pair-before`,
          brief:
            "Customer's OWN photograph — a SECOND job (different property from the transformation section), BEFORE work started. Fixed viewpoint the after photo repeats.",
          modality: "image",
          width: 1344,
          height: 768,
        });
        push({
          slotRef: `${baseRef}.pair-after`,
          brief:
            "Customer's OWN photograph — that second job FINISHED, identical viewpoint to its before shot.",
          modality: "image",
          width: 1344,
          height: 768,
        });
      }

      if (
        section.identifier === "proof.portfolio-showcase" ||
        section.identifier === "gallery.immersive-grid"
      ) {
        // The renderer's own count — see projectFrameCount. Planning fewer
        // than the layout draws is how frames end up unfillable.
        const frames = projectFrameCount(
          section.identifier,
          typeof section.extensions?.variant === "string"
            ? section.extensions.variant
            : undefined,
        );
        for (let index = 1; index <= frames; index += 1) {
          push({
            slotRef: `${baseRef}.frame-${index}`,
            brief: `Customer's OWN photograph of a finished job — ${index} of ${frames}. A different property each frame, in daylight, shot square-on with the whole job in view. Supplying these switches the section from illustrative to "our recent work".`,
            modality: "image",
            width: 1152,
            height: 864,
          });
          // ILLUSTRATIVE (ADR-060): the same frame, dressed. These carry no
          // provenance claim — the section renders them under a "what we
          // install" heading with material alt text — so they may be
          // generated, and they are what makes a brand-new site look
          // finished. A customer photograph in the matching frame-N slot
          // takes the position instead.
          push({
            slotRef: showcaseSlot(baseRef, index),
            brief: `Illustrative ${context.trade} finish ${index} of ${frames} — the standard, not a specific job`,
            prompt: buildMediaPrompt(
              `Editorial close-to-mid photograph illustrating ${context.trade} workmanship, variation ${index} of ${frames} — the MATERIAL and the FINISH as the subject: texture, edge detail, joints, the quality of the surface. Composed like a premium product photograph in situ, not a portrait of a house, and clearly distinct from the other ${frames - 1} variations.`,
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
  return items;
}

export { seedFrom };
