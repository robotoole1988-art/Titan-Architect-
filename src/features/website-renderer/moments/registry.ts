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

/** Context every moment may compose with (ADR-033: real hero imagery). */
export interface MomentProps {
  /** True when a real photograph sits beneath the moment layer. */
  hasBackdrop?: boolean;
}
import { GravelToResin } from "./gravel-to-resin";
import { StormCloudNewRoof } from "./storm-cloud-new-roof";

const SIGNATURE_MOMENTS: Readonly<Record<string, ComponentType<MomentProps>>> = {
  "storm-cloud-new-roof": StormCloudNewRoof,
  "gravel-to-resin": GravelToResin,
};

/** Crafted component for a catalogue id; null (dev-warned) otherwise. */
export function resolveSignatureMoment(
  id: string | undefined,
): ComponentType<MomentProps> | null {
  if (!id) return null;
  const moment = SIGNATURE_MOMENTS[id];
  if (!moment && process.env.NODE_ENV !== "production") {
    console.warn(`[website-renderer] Unknown signature moment "${id}" — nothing rendered.`);
  }
  return moment ?? null;
}

/**
 * MORPH RETREAT (ADR-032 addendum, founder decision 2026-07-04): the v1
 * vector morphs are below the quality bar and are RETIRED from public
 * output — clean cinematic heroes stand alone. The engine and catalogue
 * remain; moments render only on PREVIEW surfaces, and only behind the
 * reference flag, until the Tier-3 WebGL particle morphs land.
 */
export function signatureMomentsEnabled(mode: "preview" | "public"): boolean {
  return (
    mode === "preview" &&
    process.env.NEXT_PUBLIC_PREVIEW_SIGNATURE_MOMENTS === "1"
  );
}
