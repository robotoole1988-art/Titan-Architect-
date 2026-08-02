/**
 * Where the primary call to action actually goes (ADR-062).
 *
 * Every CTA on the site pointed at `#callback` — the on-page form — including
 * the emergency archetype's, whose label is "Call now" and which renders with
 * a phone icon beside it. A homeowner with water coming through the ceiling
 * tapped a button that said Call now and got scrolled to a contact form. The
 * only working `tel:` link on the whole site was in the header.
 *
 * The decision comes from the CTA's DECLARED intent, set by the trade profile
 * and carried through the blueprint. It is never inferred from the label.
 * `ctaIntent()` used to do exactly that — `label.toLowerCase().includes("call")`
 * — which is the same shape of bug that put roofing FAQs on a damp-proofing
 * site (ADR-061) and roofing accreditations on it before that (ADR-059).
 */

import type { WebsiteBlueprint } from "@/core/website-blueprint";
import type { RenderContact } from "./types";

/** The on-page lead form. Every non-call CTA routes here. */
export const CALLBACK_ANCHOR = "#callback";

/**
 * A dialable href. Strips everything a phone cannot dial — spaces, brackets,
 * hyphens — while keeping a leading `+` so international format survives.
 */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/(?!^\+)[^\d]/g, "")}`;
}

/**
 * The primary CTA's destination for this site.
 *
 * Falls back to the form when the CTA is a call but the business has not
 * supplied a phone number yet — a button that dials nothing is worse than a
 * button that scrolls, and TITAN publishes plenty of sites before the founder
 * has finished collecting details.
 */
export function primaryCtaHref(
  blueprint: WebsiteBlueprint,
  contact: RenderContact | undefined,
): string {
  if (blueprint.conversion?.ctas?.[0]?.intent !== "call") return CALLBACK_ANCHOR;
  const phone = contact?.phone?.trim();
  return phone ? telHref(phone) : CALLBACK_ANCHOR;
}

/** True when the primary CTA will dial — callers use it to pick an icon. */
export function primaryCtaDials(
  blueprint: WebsiteBlueprint,
  contact: RenderContact | undefined,
): boolean {
  return primaryCtaHref(blueprint, contact).startsWith("tel:");
}
