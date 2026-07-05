/**
 * Particle material registry (ADR-038).
 *
 * The founder's verdict on v2 was blunt: the tiles read as "blue confetti"
 * — low metalness plus a bright blue emissive made them glow like plastic.
 * The truth of the material is TRADE-SPECIFIC and PHYSICAL: a roof morph is
 * slate — dark blue-grey stone with a metallic sheen that catches the sun as
 * it seats; a driveway morph is resin-bound gravel; a patio is honed stone.
 * Each is a real PBR surface, keyed by trade so the morph always dresses in
 * the material it is actually building. Emissive is a whisper of internal
 * heat during the dissolve only — never the base colour.
 *
 * Pure config: no three.js here, so the registry stays testable and the
 * heavy scene imports it without pulling the renderer into the bundle.
 */

export type ParticleMaterialKey = "slate" | "resin" | "stone";

export interface ParticleMaterialSpec {
  key: ParticleMaterialKey;
  label: string;
  /** Base albedo (hex). Dark, honest stone — this is what the eye reads. */
  color: string;
  /** 0..1 — the sheen. Slate reads as premium wet stone catching light. */
  metalness: number;
  roughness: number;
  /** A deep, low-saturation emissive — internal heat during the dissolve,
   *  NOT a colour cast. Kept dark so the swarm never reads as confetti. */
  emissive: string;
  /** How hard the material samples the sky/dome — the seated slate glints. */
  envMapIntensity: number;
}

export const PARTICLE_MATERIALS: Record<ParticleMaterialKey, ParticleMaterialSpec> = {
  slate: {
    key: "slate",
    label: "Welsh slate",
    color: "#39434f", // dark blue-grey stone, neutral — not a blue cast
    metalness: 0.55,
    roughness: 0.42,
    emissive: "#1b2740", // deep, near-black blue; only rises in the dissolve
    envMapIntensity: 1.4,
  },
  resin: {
    key: "resin",
    label: "Resin-bound gravel",
    color: "#6b5a45", // warm aggregate
    metalness: 0.2,
    roughness: 0.62,
    emissive: "#241a12",
    envMapIntensity: 0.9,
  },
  stone: {
    key: "stone",
    label: "Honed stone",
    color: "#5a5751", // cool grey flag
    metalness: 0.15,
    roughness: 0.7,
    emissive: "#1e1c19",
    envMapIntensity: 0.8,
  },
};

/** Map a free-text trade to its build material; slate is the roof default. */
export function resolveParticleMaterial(trade?: string): ParticleMaterialSpec {
  const t = (trade ?? "").toLowerCase();
  if (/(drive|resin|gravel|tarmac|asphalt)/.test(t)) return PARTICLE_MATERIALS.resin;
  if (/(patio|paving|flag|landscap|stone)/.test(t)) return PARTICLE_MATERIALS.stone;
  // Roofing — and anything unclassified — is slate. The storm→roof morph is
  // the canonical Tier-3 moment, so slate is the honest default.
  return PARTICLE_MATERIALS.slate;
}
