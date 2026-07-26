import { describe, expect, it } from "vitest";
import {
  createMemoryBusinessSpine,
  type Build,
  type Publication,
} from "@/core/business";
import {
  buildBriefing,
  projectMissionControlData,
  type MissionControlData,
} from "@/core/mission-control";
import { buildKnowledgeGraph, loadMemorySnapshot } from "@/core/memory-spine";

/**
 * ADR-046 regression proof: Mission Control re-pointed onto the memory spine
 * produces EXACTLY the briefing the direct spine reads produced. Same seeded
 * store, two paths, one truth.
 */

const NOW = "2026-07-08T12:00:00.000Z";

async function seededSpine() {
  const spine = createMemoryBusinessSpine();
  const summit = await spine.businesses.create({
    name: "Summit Roofing Rescue",
    trade: "Emergency Roofing",
    location: "Leeds",
  });
  await spine.businesses.updateStage(summit.id, "qualified");
  await spine.businesses.updateStage(summit.id, "proposed");
  await spine.businesses.updateStage(summit.id, "won");
  await spine.builds.createForBusiness(summit.id);
  await spine.businesses.updateStage(summit.id, "live");
  const publication = await spine.publications.publish(summit.id, 1, "summit");
  // A REAL-shaped contact: reserved domains (jane@example.com) are test
  // artifacts by definition (ADR-056) and would rightly vanish from the
  // projection — this test proves the projection MECHANICS, so its fixture
  // must look like a real customer.
  await spine.enquiries.create({
    businessId: summit.id,
    publicationId: publication.id,
    name: "Jane",
    contact: "jane@janes-lofts.co.uk",
    message: "Roof leak",
    sourcePage: "/",
  });
  // And one deliberate test artifact: direct reads keep it (CRM
  // findability), the projection must NOT (ADR-056, Law §7).
  await spine.enquiries.create({
    businessId: summit.id,
    publicationId: publication.id,
    name: "Go-Live Verification",
    contact: "verify@example.com",
    message: "verification row",
    sourcePage: "/",
  });
  await spine.metrics.record(summit.id, "/", "view", "2026-07-07");
  await spine.metrics.record(summit.id, "/", "view", "2026-07-07");
  await spine.metrics.record(summit.id, "/", "form_submit", "2026-07-07");

  await spine.businesses.create({
    name: "Kerbside Kings",
    trade: "Driveways",
    location: "Manchester",
  });
  return spine;
}

/** The OLD resolve path, verbatim: direct per-business reads. */
async function directData(
  spine: Awaited<ReturnType<typeof seededSpine>>,
): Promise<MissionControlData> {
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
  return {
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
}

describe("Mission Control on the memory spine (ADR-046)", () => {
  it("projection === direct reads: the briefing is unchanged", async () => {
    const spine = await seededSpine();

    const direct = await directData(spine);
    const snapshot = await loadMemorySnapshot(spine);
    const projected = projectMissionControlData(buildKnowledgeGraph(snapshot));

    // The projected snapshot carries the same records...
    expect(new Set(projected.businesses.map((b) => b.id))).toEqual(
      new Set(direct.businesses.map((b) => b.id)),
    );
    // Enquiries: identical MINUS test artifacts — the one intended
    // divergence (ADR-056): direct reads keep the verification row, the
    // projection never sees it.
    const realDirect = direct.enquiries.filter((e) => e.name !== "Go-Live Verification");
    expect(new Set(projected.enquiries.map((e) => e.id))).toEqual(
      new Set(realDirect.map((e) => e.id)),
    );
    expect(direct.enquiries.some((e) => e.name === "Go-Live Verification")).toBe(true);
    expect(projected.enquiries.some((e) => e.name === "Go-Live Verification")).toBe(false);
    expect(projected.metrics).toHaveLength(direct.metrics.length);
    expect(new Set(projected.builds.map((b) => b.id))).toEqual(
      new Set(direct.builds.map((b) => b.id)),
    );
    // ...including ONLY live publications, exactly like publications.current().
    expect(new Set(projected.publications.map((p) => p.id))).toEqual(
      new Set(direct.publications.map((p) => p.id)),
    );

    // ...and the pure engine distils both into the identical briefing —
    // compared over the REAL rows: the briefing is an operating surface,
    // so the test artifact must steer neither path (ADR-056).
    const before = buildBriefing({ ...direct, enquiries: realDirect }, { now: NOW });
    const after = buildBriefing(projected, { now: NOW });
    expect(after).toEqual(before);
    expect(after.isEmpty).toBe(false);
  });
});
