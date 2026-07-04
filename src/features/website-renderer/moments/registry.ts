/**
 * The signature-moment catalogue (ADR-032). The blueprint carries an ID;
 * the craft lives here. Unknown ids resolve to NOTHING — a moment can never
 * be free-generated (the SIGNATURE-MOMENTS.md registry law).
 *
 * Authoring law for morph pairs: both SVG path states must share an
 * IDENTICAL command structure (same commands, same count) so the engine
 * interpolates them number-for-number.
 */

import type { ComponentType } from "react";
import { GravelToResin } from "./gravel-to-resin";
import { StormCloudNewRoof } from "./storm-cloud-new-roof";

const SIGNATURE_MOMENTS: Readonly<Record<string, ComponentType>> = {
  "storm-cloud-new-roof": StormCloudNewRoof,
  "gravel-to-resin": GravelToResin,
};

/** Crafted component for a catalogue id; null (dev-warned) otherwise. */
export function resolveSignatureMoment(
  id: string | undefined,
): ComponentType | null {
  if (!id) return null;
  const moment = SIGNATURE_MOMENTS[id];
  if (!moment && process.env.NODE_ENV !== "production") {
    console.warn(`[website-renderer] Unknown signature moment "${id}" — nothing rendered.`);
  }
  return moment ?? null;
}
