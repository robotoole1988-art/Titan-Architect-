import {
  resolveBusinessSpine,
  type Build,
  type Publication,
} from "@/core/business";
import {
  buildBriefing,
  type Briefing,
  type MissionControlData,
} from "@/core/mission-control";

/**
 * The data SEAM for Mission Control (ADR-042).
 *
 * Reads the Business Spine (ADR-023) into the plain `MissionControlData`
 * snapshot the pure engine reasons over. This is the ONLY piece that touches a
 * repository — the memory spine (a later milestone) will re-point the briefing
 * by replacing THIS function, and neither the engine nor the UI will change.
 *
 * `now` is injectable so the surface (and tests) stay deterministic.
 */
export async function resolveBriefing(
  now: string = new Date().toISOString(),
): Promise<Briefing> {
  const spine = await resolveBusinessSpine();
  const businesses = await spine.businesses.list();

  const details = await Promise.all(
    businesses.map(async (business) => {
      const [enquiries, metrics, build, publication] = await Promise.all([
        spine.enquiries.listForBusiness(business.id),
        spine.metrics.listForBusiness(business.id),
        spine.builds.getForBusiness(business.id),
        spine.publications.current(business.id),
      ]);
      return { enquiries, metrics, build, publication };
    }),
  );

  const data: MissionControlData = {
    businesses,
    enquiries: details.flatMap((d) => d.enquiries),
    metrics: details.flatMap((d) => d.metrics),
    builds: details
      .map((d) => d.build)
      .filter((build): build is Build => build !== null),
    publications: details
      .map((d) => d.publication)
      .filter((publication): publication is Publication => publication !== null),
  };

  return buildBriefing(data, { now });
}
