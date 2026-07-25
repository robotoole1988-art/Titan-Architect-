import { describe, expect, it } from "vitest";
import {
  resolveBusinessSpine,
  type BusinessSpineRepositories,
} from "@/core/business";
import { computeDepartmentHealth } from "@/core/health-engine";
import {
  buildKnowledgeGraph,
  loadMemorySnapshot,
} from "@/core/memory-spine";
import {
  buildBriefing,
  projectMissionControlData,
} from "@/core/mission-control";
import { getNotificationFeed } from "@/features/crm/api/notification-feed";

/**
 * ADR-056 end-to-end (Cockpit Law §7): with REAL and TEST enquiries mixed
 * on a real business — plus an internal business with its own enquiry —
 * no test artifact steers the briefing, top actions, health inputs,
 * counts, or the notification bell. (Memory spine: no env in tests.)
 */

const NOW = "2026-07-25T12:00:00.000Z";

async function seedMixedWorld(spine: BusinessSpineRepositories) {
  const real = await spine.businesses.create({
    name: `Hygiene Real ${crypto.randomUUID().slice(0, 6)}`,
    trade: "Roofing",
    location: "Leeds",
  });
  const internal = await spine.businesses.create({
    name: "Hygiene Lab (internal)",
    trade: "Roofing",
    location: "Leeds",
  });
  const publication = await spine.publications.publish(real.id, 1, `hyg-${crypto.randomUUID().slice(0, 8)}`);
  const internalPub = await spine.publications.publish(internal.id, 1, `hyg-int-${crypto.randomUUID().slice(0, 8)}`);

  // One REAL new enquiry (past SLA → should steer), created 90 min ago.
  await spine.enquiries.create({
    businessId: real.id,
    publicationId: publication.id,
    name: "Dana Homeowner",
    contact: "dana@gmail.com",
    message: "Leak over the porch",
    sourcePage: "/",
  });
  // TEST enquiries on the REAL business — must never steer anything.
  await spine.enquiries.create({
    businessId: real.id,
    publicationId: publication.id,
    name: "Go-Live Verification",
    contact: "golive-test@example.com",
    message: "production loop test",
    sourcePage: "/",
  });
  await spine.enquiries.create({
    businessId: real.id,
    publicationId: publication.id,
    name: "Audit F2 Verification",
    contact: "07700900123",
    message: "success-state check",
    sourcePage: "/",
  });
  // An enquiry on the INTERNAL business — bell must ignore it too.
  await spine.enquiries.create({
    businessId: internal.id,
    publicationId: internalPub.id,
    name: "Lab Visitor",
    contact: "lab@realmail.co.uk",
    message: "internal business enquiry",
    sourcePage: "/",
  });
  return { real, internal };
}

describe("test artifacts never steer (ADR-056)", () => {
  it("briefing, top actions, counts and health see ONLY the real enquiry", async () => {
    const spine = await resolveBusinessSpine();
    const { real } = await seedMixedWorld(spine);

    const snapshot = await loadMemorySnapshot(spine);
    const mine = snapshot.enquiries.filter((enquiry) => enquiry.businessId === real.id);
    expect(mine).toHaveLength(1);
    expect(mine[0].name).toBe("Dana Homeowner");

    const graph = buildKnowledgeGraph(snapshot);
    const briefing = buildBriefing(projectMissionControlData(graph), { now: NOW });
    const forReal = briefing.enquiriesNeedingAttention.filter(
      (attention) => attention.businessId === real.id,
    );
    expect(forReal).toHaveLength(1);
    expect(forReal[0].name).toBe("Dana Homeowner");
    const actionText = briefing.topActions
      .map((action) => `${action.what} ${action.recommendedAction}`)
      .join(" ");
    expect(actionText).not.toContain("Verification");

    // Health inputs: the enquiries factor counts only the real row.
    const health = computeDepartmentHealth({ graph, observations: [], now: NOW });
    const enquiries = health.find((department) => department.department === "enquiries");
    const evidence = JSON.stringify(enquiries ?? {});
    expect(evidence).not.toContain("Verification");
  });

  it("the notification bell counts neither test rows nor internal businesses", async () => {
    const spine = await resolveBusinessSpine();
    const before = (await getNotificationFeed()).newCount;
    await seedMixedWorld(spine);
    const after = await getNotificationFeed();
    // Exactly ONE new ring: Dana. Two test rows + one internal-business
    // enquiry all silent.
    expect(after.newCount).toBe(before + 1);
    const names = after.recent.map((entry) => entry.name).join(" ");
    expect(names).not.toContain("Verification");
    expect(names).not.toContain("Lab Visitor");
  });
});
