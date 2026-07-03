/**
 * Workflow rules (ADR-024): framework-free orchestration over the spine.
 * Exercised against the in-memory adapter — same behaviour on any adapter
 * that passes the repository contract.
 */

import { describe, expect, it } from "vitest";
import {
  createMemoryBusinessSpine,
  recordArtifactGenerated,
  transitionBusinessStage,
} from "@/core/business";

const DRAFT = {
  name: "Kerbside Kings",
  trade: "Driveways & Patios",
  location: "York",
};

describe("transitionBusinessStage", () => {
  it("moves the stage and logs the change", async () => {
    const repos = createMemoryBusinessSpine();
    const business = await repos.businesses.create(DRAFT);
    const updated = await transitionBusinessStage(repos, business.id, "qualified");
    expect(updated.stage).toBe("qualified");
    const entries = await repos.activity.list(business.id);
    expect(entries[0].kind).toBe("stage_change");
    expect(entries[0].message).toContain("qualified");
  });

  it("records the reason for lost stages", async () => {
    const repos = createMemoryBusinessSpine();
    const business = await repos.businesses.create(DRAFT);
    await transitionBusinessStage(
      repos,
      business.id,
      "not_going_ahead",
      "Chose a cheaper quote",
    );
    const stored = await repos.businesses.get(business.id);
    expect(stored?.stage).toBe("not_going_ahead");
    expect(stored?.stageHistory.at(-1)?.reason).toBe("Chose a cheaper quote");
    const entries = await repos.activity.list(business.id);
    expect(entries[0].message).toContain("Chose a cheaper quote");
  });

  it("creates the build exactly once when a business is won", async () => {
    const repos = createMemoryBusinessSpine();
    const business = await repos.businesses.create(DRAFT);

    await transitionBusinessStage(repos, business.id, "won");
    const build = await repos.builds.getForBusiness(business.id);
    expect(build).not.toBeNull();

    // Bounce out and back to won: no second build, no duplicate seed.
    await transitionBusinessStage(repos, business.id, "proposed");
    await transitionBusinessStage(repos, business.id, "won");
    const again = await repos.builds.getForBusiness(business.id);
    expect(again?.id).toBe(build?.id);

    const buildCreatedEntries = (await repos.activity.list(business.id)).filter(
      (entry) => entry.kind === "build_created",
    );
    expect(buildCreatedEntries).toHaveLength(1);
  });

  it("puts the website item straight into review when a blueprint already exists", async () => {
    const repos = createMemoryBusinessSpine();
    const business = await repos.businesses.create(DRAFT);
    await repos.artifacts.save({
      businessId: business.id,
      kind: "blueprint",
      payload: { sections: 9 },
    });

    await transitionBusinessStage(repos, business.id, "won");
    const build = await repos.builds.getForBusiness(business.id);
    expect(build?.items.find((item) => item.kind === "website")?.status).toBe(
      "review",
    );
  });
});

describe("recordArtifactGenerated", () => {
  it("logs the generation on the business activity", async () => {
    const repos = createMemoryBusinessSpine();
    const business = await repos.businesses.create(DRAFT);
    await recordArtifactGenerated(repos, business.id, "strategy", 1);
    const entries = await repos.activity.list(business.id);
    expect(entries[0].kind).toBe("artifact_generated");
    expect(entries[0].message).toContain("strategy");
    expect(entries[0].meta?.version).toBe(1);
  });

  it("advances a queued website item to review when a blueprint lands", async () => {
    const repos = createMemoryBusinessSpine();
    const business = await repos.businesses.create(DRAFT);
    await transitionBusinessStage(repos, business.id, "won");
    expect(
      (await repos.builds.getForBusiness(business.id))?.items.find(
        (item) => item.kind === "website",
      )?.status,
    ).toBe("queued");

    await recordArtifactGenerated(repos, business.id, "blueprint", 1);
    expect(
      (await repos.builds.getForBusiness(business.id))?.items.find(
        (item) => item.kind === "website",
      )?.status,
    ).toBe("review");
  });

  it("never touches website items already past review", async () => {
    const repos = createMemoryBusinessSpine();
    const business = await repos.businesses.create(DRAFT);
    await transitionBusinessStage(repos, business.id, "won");
    const build = (await repos.builds.getForBusiness(business.id))!;
    await repos.builds.setItemStatus(build.id, "website", "review");
    await repos.builds.setItemStatus(build.id, "website", "approved");

    await recordArtifactGenerated(repos, business.id, "blueprint", 2);
    expect(
      (await repos.builds.getForBusiness(business.id))?.items.find(
        (item) => item.kind === "website",
      )?.status,
    ).toBe("approved");
  });
});
