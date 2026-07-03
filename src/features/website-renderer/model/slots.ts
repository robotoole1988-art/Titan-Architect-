/**
 * Content-slot parsing. Content slots are the ONLY source of business copy in
 * rendered primitives — zero hardcoded copy (ADR-022). The builder writes each
 * requirement as "slot: direction" (ADR-021); these helpers read them back.
 */

import type { SectionBlueprint } from "@/core/website-blueprint";

export type SlotMap = Readonly<Record<string, string>>;

/** Parse a section's contentRequirements into { slot → text }. */
export function parseSlots(section: SectionBlueprint): SlotMap {
  const slots: Record<string, string> = {};
  for (const requirement of section.contentRequirements ?? []) {
    const separator = requirement.indexOf(":");
    if (separator === -1) continue;
    slots[requirement.slice(0, separator).trim()] = requirement
      .slice(separator + 1)
      .trim();
  }
  return slots;
}

/** The variant the blueprint selected for a section (extensions.variant). */
export function sectionVariant(section: SectionBlueprint): string {
  const variant = section.extensions?.variant;
  return typeof variant === "string" ? variant : "";
}

/** Split a " · "-joined slot into items (builder's list convention). */
export function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split("·")
    .map((item) => item.trim().replace(/\.$/, ""))
    .filter(Boolean);
}

/**
 * The text after the FIRST em-dash. Slot directions read "context — content";
 * the content itself may contain further dashes ("We answer — fast").
 */
export function afterFirstDash(value: string | undefined): string {
  if (!value) return "";
  const dash = value.indexOf("—");
  return dash === -1 ? value : value.slice(dash + 1);
}

/** Split a "→"-joined narrative arc into stages. */
export function splitArc(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split("→")
    .map((stage) => stage.trim().replace(/\.$/, ""))
    .filter(Boolean);
}
