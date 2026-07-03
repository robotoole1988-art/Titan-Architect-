/**
 * The repository CONTRACT (ADR-023): one suite, every adapter. An adapter
 * that passes this suite is a valid Business Spine store. In-memory runs
 * everywhere; Supabase runs when a test instance is configured.
 */

import { describe, expect, it } from "vitest";
import {
  BusinessNotFoundError,
  type BusinessDraft,
  type BusinessSpineRepositories,
} from "@/core/business";

export interface ContractHarness {
  repos: BusinessSpineRepositories;
  cleanup?: () => Promise<void>;
}

const DRAFT: BusinessDraft = {
  name: "Summit Roofing Rescue",
  trade: "Emergency Roofing & Drainage",
  location: "Leeds",
  contact: { email: "office@summit.example", phone: "0113 000 0000" },
  services: "Storm damage, leak response, gutter clearance",
  targetCustomer: "Homeowners in Leeds",
  goal: "More phone calls",
  budget: "£1,000 – £2,500 / month",
  urgency: "High",
  currentWebsiteUrl: "",
};

export function runRepositoryContract(
  adapterName: string,
  makeHarness: () => Promise<ContractHarness>,
): void {
  describe(`repository contract · ${adapterName}`, () => {
    async function withRepos<T>(
      run: (repos: BusinessSpineRepositories) => Promise<T>,
    ): Promise<T> {
      const { repos, cleanup } = await makeHarness();
      try {
        return await run(repos);
      } finally {
        await cleanup?.();
      }
    }

    it("creates a business as a lead with opening stage history", async () => {
      await withRepos(async ({ businesses }) => {
        const business = await businesses.create(DRAFT);
        expect(business.id).toBeTruthy();
        expect(business.stage).toBe("lead");
        expect(business.stageHistory).toHaveLength(1);
        expect(business.stageHistory[0].stage).toBe("lead");
        expect(business.stageHistory[0].enteredAt).toBe(business.createdAt);
        expect(business.name).toBe(DRAFT.name);
        expect(business.contact?.email).toBe(DRAFT.contact?.email);
        expect(business.budget).toBe(DRAFT.budget);
      });
    });

    it("gets a saved business back, and null for unknown ids", async () => {
      await withRepos(async ({ businesses }) => {
        const created = await businesses.create(DRAFT);
        const fetched = await businesses.get(created.id);
        expect(fetched).toEqual(created);
        expect(await businesses.get("does-not-exist")).toBeNull();
      });
    });

    it("lists businesses newest-first", async () => {
      await withRepos(async ({ businesses }) => {
        const first = await businesses.create({ ...DRAFT, name: "First Ltd" });
        const second = await businesses.create({ ...DRAFT, name: "Second Ltd" });
        const listed = await businesses.list();
        const ids = listed.map((business) => business.id);
        expect(ids.indexOf(second.id)).toBeLessThan(ids.indexOf(first.id));
      });
    });

    it("advances the lifecycle stage and records the transition", async () => {
      await withRepos(async ({ businesses }) => {
        const created = await businesses.create(DRAFT);
        const qualified = await businesses.updateStage(created.id, "qualified");
        expect(qualified.stage).toBe("qualified");
        expect(qualified.stageHistory).toHaveLength(2);
        expect(qualified.stageHistory[1].stage).toBe("qualified");
        expect(
          Date.parse(qualified.stageHistory[1].enteredAt),
        ).toBeGreaterThanOrEqual(Date.parse(created.createdAt));
        expect(
          Date.parse(qualified.updatedAt),
        ).toBeGreaterThanOrEqual(Date.parse(created.updatedAt));
      });
    });

    it("does not duplicate history when the stage is unchanged", async () => {
      await withRepos(async ({ businesses }) => {
        const created = await businesses.create(DRAFT);
        const same = await businesses.updateStage(created.id, "lead");
        expect(same.stageHistory).toHaveLength(1);
      });
    });

    it("throws BusinessNotFoundError when staging an unknown business", async () => {
      await withRepos(async ({ businesses }) => {
        await expect(
          businesses.updateStage("does-not-exist", "qualified"),
        ).rejects.toBeInstanceOf(BusinessNotFoundError);
      });
    });

    it("saves artifacts with auto-incrementing versions per kind", async () => {
      await withRepos(async ({ businesses, artifacts }) => {
        const business = await businesses.create(DRAFT);
        const s1 = await artifacts.save({
          businessId: business.id,
          kind: "strategy",
          payload: { thesis: "one" },
        });
        const s2 = await artifacts.save({
          businessId: business.id,
          kind: "strategy",
          payload: { thesis: "two" },
        });
        const b1 = await artifacts.save({
          businessId: business.id,
          kind: "blueprint",
          payload: { sections: 9 },
          meta: { strategyVersion: 2 },
        });
        expect(s1.version).toBe(1);
        expect(s2.version).toBe(2);
        expect(b1.version).toBe(1); // kinds count independently
        expect(b1.meta?.strategyVersion).toBe(2);
      });
    });

    it("returns the latest artifact and specific versions", async () => {
      await withRepos(async ({ businesses, artifacts }) => {
        const business = await businesses.create(DRAFT);
        await artifacts.save({ businessId: business.id, kind: "strategy", payload: { v: "a" } });
        await artifacts.save({ businessId: business.id, kind: "strategy", payload: { v: "b" } });

        const latest = await artifacts.latest<{ v: string }>(business.id, "strategy");
        expect(latest?.version).toBe(2);
        expect(latest?.payload.v).toBe("b");

        const v1 = await artifacts.getVersion<{ v: string }>(business.id, "strategy", 1);
        expect(v1?.payload.v).toBe("a");

        expect(await artifacts.latest(business.id, "blueprint")).toBeNull();
        expect(await artifacts.getVersion(business.id, "strategy", 99)).toBeNull();
      });
    });

    it("lists artifact versions newest-first", async () => {
      await withRepos(async ({ businesses, artifacts }) => {
        const business = await businesses.create(DRAFT);
        await artifacts.save({ businessId: business.id, kind: "strategy", payload: {} });
        await artifacts.save({ businessId: business.id, kind: "strategy", payload: {} });
        const versions = await artifacts.listVersions(business.id, "strategy");
        expect(versions.map((artifact) => artifact.version)).toEqual([2, 1]);
      });
    });

    it("rejects artifacts for unknown businesses", async () => {
      await withRepos(async ({ artifacts }) => {
        await expect(
          artifacts.save({ businessId: "does-not-exist", kind: "strategy", payload: {} }),
        ).rejects.toBeInstanceOf(BusinessNotFoundError);
      });
    });

    it("removing a business cascades to its artifacts", async () => {
      await withRepos(async ({ businesses, artifacts }) => {
        const business = await businesses.create(DRAFT);
        await artifacts.save({ businessId: business.id, kind: "strategy", payload: {} });
        await businesses.remove(business.id);
        expect(await businesses.get(business.id)).toBeNull();
        expect(await artifacts.latest(business.id, "strategy")).toBeNull();
      });
    });
  });
}
