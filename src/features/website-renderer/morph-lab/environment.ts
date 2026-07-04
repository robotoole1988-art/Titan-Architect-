/**
 * Lab environment domes (ADR-035 v2): 360° equirectangular panoramas
 * generated through OUR media engine, owned by an internal lab business so
 * the FOUNDER GATE applies — domes are reviewed at /crm/<lab>/media like
 * any other asset. The lab (an internal preview surface) may display
 * review-status domes with an honest status chip; REJECTED domes never
 * render anywhere.
 */

import type {
  Business,
  BusinessSpineRepositories,
  MediaRecord,
} from "@/core/business";

export const LAB_BUSINESS_NAME = "TITAN Morph Lab (internal)";

export type DomeTimeOfDay = "golden-hour" | "dusk" | "overcast";
export type DomeKind = "calm" | "storm";

export interface DomeSpec {
  slotRef: string;
  kind: DomeKind;
  /** Calm domes carry a time of day; the storm dome is the storm. */
  timeOfDay?: DomeTimeOfDay;
  label: string;
  brief: string;
}

const PANO_PREFIX =
  "A full 360 degree equirectangular panorama, seamless horizon, ";
const PANO_SUFFIX =
  " Photographic, premium archviz quality, natural colour, no people, no text.";

export const DOME_SPECS: readonly DomeSpec[] = [
  {
    slotRef: "lab/dome-golden-hour",
    kind: "calm",
    timeOfDay: "golden-hour",
    label: "Golden hour",
    brief: `${PANO_PREFIX}a quiet UK suburban residential street at golden hour: front gardens, trimmed hedges, warm low sun, long soft shadows across the road.${PANO_SUFFIX}`,
  },
  {
    slotRef: "lab/dome-dusk",
    kind: "calm",
    timeOfDay: "dusk",
    label: "Dusk",
    brief: `${PANO_PREFIX}a quiet UK suburban residential street at dusk: deep blue hour sky, warm street lamps and lit windows, gardens in soft shadow.${PANO_SUFFIX}`,
  },
  {
    slotRef: "lab/dome-overcast",
    kind: "calm",
    timeOfDay: "overcast",
    label: "Overcast",
    brief: `${PANO_PREFIX}a quiet UK suburban residential street under a soft overcast sky: even grey light, green gardens, damp road.${PANO_SUFFIX}`,
  },
  {
    slotRef: "lab/dome-storm",
    kind: "storm",
    label: "Storm",
    brief: `${PANO_PREFIX}a UK suburban residential street under a brooding storm: heavy dark rain clouds, cold dramatic light breaking at the horizon, wind-bent trees, wet road.${PANO_SUFFIX}`,
  },
];

/** Find-or-create the internal lab business (idempotent by exact name). */
export async function ensureLabBusiness(
  spine: BusinessSpineRepositories,
): Promise<Business> {
  const existing = (await spine.businesses.list()).find(
    (business) => business.name === LAB_BUSINESS_NAME,
  );
  if (existing) return existing;
  return spine.businesses.create({
    name: LAB_BUSINESS_NAME,
    trade: "Internal — Morph Lab environments",
    location: "TITAN",
  });
}

export interface LabDome {
  slotRef: string;
  kind: DomeKind;
  timeOfDay?: DomeTimeOfDay;
  label: string;
  url: string;
  lqip?: string;
  status: "review" | "approved";
}

/** Pure mapping: dome records → lab domes. Rejected never renders. */
export function mapDomeRecords(records: readonly MediaRecord[]): LabDome[] {
  const domes: LabDome[] = [];
  for (const spec of DOME_SPECS) {
    // Newest non-rejected record for the slot wins (retakes supersede).
    const record = [...records]
      .reverse()
      .find(
        (candidate) =>
          candidate.slotRef === spec.slotRef && candidate.status !== "rejected",
      );
    if (!record) continue;
    domes.push({
      slotRef: spec.slotRef,
      kind: spec.kind,
      ...(spec.timeOfDay ? { timeOfDay: spec.timeOfDay } : {}),
      label: spec.label,
      url: record.url,
      ...(record.lqip ? { lqip: record.lqip } : {}),
      status: record.status as "review" | "approved",
    });
  }
  return domes;
}

export interface LabEnvironment {
  businessId: string;
  domes: LabDome[];
  missingSlotRefs: string[];
}

export async function resolveLabEnvironment(
  spine: BusinessSpineRepositories,
): Promise<LabEnvironment> {
  const business = await ensureLabBusiness(spine);
  const records = await spine.media.listForBusiness(business.id);
  const domes = mapDomeRecords(records);
  const present = new Set(domes.map((dome) => dome.slotRef));
  return {
    businessId: business.id,
    domes,
    missingSlotRefs: DOME_SPECS.filter((spec) => !present.has(spec.slotRef)).map(
      (spec) => spec.slotRef,
    ),
  };
}

/**
 * Everything the lab ROUTE needs, behind the feature boundary — app routes
 * never import core (the architecture charter's hard rule).
 */
export async function resolveMorphLab(): Promise<{
  environment: LabEnvironment;
  canGenerate: boolean;
}> {
  const [{ resolveBusinessSpine }, { resolveMediaProvider }] = await Promise.all([
    import("@/core/business"),
    import("@/core/media"),
  ]);
  const spine = await resolveBusinessSpine();
  return {
    environment: await resolveLabEnvironment(spine),
    canGenerate: resolveMediaProvider() !== null,
  };
}
