/**
 * What the small label above a section heading says (ADR-061).
 *
 * It used to say the primitive's REGISTRY NAME, in both modes. On a live
 * driveways page that meant a visitor read "Lead Capture" above the enquiry
 * form, "Process Journey Map" above the steps, "Reassurance FAQ" above the
 * questions and "Portfolio Showcase" above the imagery. "Lead Capture"
 * reached 100% of pages.
 *
 * Preview keeps the primitive name — the founder is looking at scaffolding
 * and the name is the fastest way to know which primitive they are editing.
 * Public gets language a customer would use. Where no public label is
 * mapped, the eyebrow is omitted entirely rather than guessed at, which is
 * the ADR-034 instinct applied to a label: absence beats internal vocabulary.
 */

import type { SectionBlueprint } from "@/core/website-blueprint";
import type { RenderMode } from "./types";
import { primitiveName } from "../primitives/atoms";
import { publicEyebrow } from "./showcase-copy";

export function sectionEyebrow(
  section: SectionBlueprint,
  mode: RenderMode,
): string {
  if (mode !== "public") return primitiveName(section);
  return publicEyebrow(section.identifier) ?? "";
}
