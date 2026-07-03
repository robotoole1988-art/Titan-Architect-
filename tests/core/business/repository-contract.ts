/**
 * The repository CONTRACT (ADR-023): one suite, every adapter. An adapter
 * that passes this suite is a valid Business Spine store. In-memory runs
 * everywhere; Supabase runs when a test instance is configured.
 */

import { describe, expect, it } from "vitest";
import {
  BUILD_ITEM_KINDS,
  BuildTransitionError,
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

    it("round-trips coverage areas (ADR-028)", async () => {
      await withRepos(async ({ businesses }) => {
        const areas = ["Sale", "Stockport", "Altrincham"];
        const created = await businesses.create({
          ...DRAFT,
          coverageAreas: areas,
        });
        expect(created.coverageAreas).toEqual(areas);
        expect((await businesses.get(created.id))?.coverageAreas).toEqual(areas);
        // Absent on records created without them (legacy-safe).
        const bare = await businesses.create({ ...DRAFT, name: "Bare Ltd" });
        expect(bare.coverageAreas ?? []).toEqual([]);
      });
    });

    it("round-trips the taxonomy trade id (ADR-026)", async () => {
      await withRepos(async ({ businesses }) => {
        const classified = await businesses.create({ ...DRAFT, tradeId: "roofing" });
        expect(classified.tradeId).toBe("roofing");
        expect((await businesses.get(classified.id))?.tradeId).toBe("roofing");
        const unclassified = await businesses.create({ ...DRAFT, name: "Free Text Ltd" });
        expect(unclassified.tradeId).toBeUndefined();
      });
    });

    it("versions deal artifacts like any other kind (ADR-026)", async () => {
      await withRepos(async ({ businesses, artifacts }) => {
        const business = await businesses.create(DRAFT);
        const d1 = await artifacts.save({
          businessId: business.id,
          kind: "deal",
          payload: { setupFee: 1995 },
        });
        const d2 = await artifacts.save({
          businessId: business.id,
          kind: "deal",
          payload: { setupFee: 1495 },
        });
        expect(d1.version).toBe(1);
        expect(d2.version).toBe(2);
        const latest = await artifacts.latest<{ setupFee: number }>(
          business.id,
          "deal",
        );
        expect(latest?.payload.setupFee).toBe(1495);
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

    it("records a lost stage with its reason, and reopens", async () => {
      await withRepos(async ({ businesses }) => {
        const created = await businesses.create(DRAFT);
        const lost = await businesses.updateStage(
          created.id,
          "not_interested",
          "Budget spent for the year",
        );
        expect(lost.stage).toBe("not_interested");
        expect(lost.stageHistory.at(-1)?.reason).toBe("Budget spent for the year");

        const reopened = await businesses.updateStage(created.id, "lead");
        expect(reopened.stage).toBe("lead");
        expect(reopened.stageHistory).toHaveLength(3);
      });
    });

    it("logs activity newest-first and cascades on remove", async () => {
      await withRepos(async ({ businesses, activity }) => {
        const business = await businesses.create(DRAFT);
        await activity.log({
          businessId: business.id,
          kind: "note",
          message: "Spoke to Dave — call back Tuesday",
        });
        await activity.log({
          businessId: business.id,
          kind: "stage_change",
          message: "Moved to qualified",
          meta: { stage: "qualified" },
        });

        const entries = await activity.list(business.id);
        expect(entries).toHaveLength(2);
        expect(entries[0].kind).toBe("stage_change");
        expect(entries[0].meta?.stage).toBe("qualified");
        expect(entries[1].message).toContain("Dave");

        await expect(
          activity.log({ businessId: "nope", kind: "note", message: "x" }),
        ).rejects.toBeInstanceOf(BusinessNotFoundError);

        await businesses.remove(business.id);
        expect(await activity.list(business.id)).toEqual([]);
      });
    });

    it("creates a build exactly once per business, seeded with every item", async () => {
      await withRepos(async ({ businesses, builds }) => {
        const business = await businesses.create(DRAFT);
        const first = await builds.createForBusiness(business.id);
        expect(first.created).toBe(true);
        expect(first.build.items.map((item) => item.kind)).toEqual([
          ...BUILD_ITEM_KINDS,
        ]);
        expect(first.build.items.every((item) => item.status === "queued")).toBe(true);
        const website = first.build.items.find((item) => item.kind === "website");
        expect(website?.manual).toBe(false);
        expect(
          first.build.items
            .filter((item) => item.kind !== "website")
            .every((item) => item.manual),
        ).toBe(true);

        const second = await builds.createForBusiness(business.id);
        expect(second.created).toBe(false);
        expect(second.build.id).toBe(first.build.id);

        await expect(builds.createForBusiness("nope")).rejects.toBeInstanceOf(
          BusinessNotFoundError,
        );
      });
    });

    it("enforces the approval gate on build item transitions", async () => {
      await withRepos(async ({ businesses, builds }) => {
        const business = await businesses.create(DRAFT);
        const { build } = await builds.createForBusiness(business.id);

        // Nothing goes live without approval, and approval only from review.
        await expect(
          builds.setItemStatus(build.id, "website", "live"),
        ).rejects.toBeInstanceOf(BuildTransitionError);
        await expect(
          builds.setItemStatus(build.id, "website", "approved"),
        ).rejects.toBeInstanceOf(BuildTransitionError);

        // The lawful path: queued → review → approved → live.
        await builds.setItemStatus(build.id, "website", "review");
        const approved = await builds.setItemStatus(build.id, "website", "approved");
        expect(
          approved.items.find((item) => item.kind === "website")?.status,
        ).toBe("approved");
        const live = await builds.setItemStatus(build.id, "website", "live");
        expect(live.items.find((item) => item.kind === "website")?.status).toBe("live");
      });
    });

    it("sends an item back from review with a note", async () => {
      await withRepos(async ({ businesses, builds }) => {
        const business = await businesses.create(DRAFT);
        const { build } = await builds.createForBusiness(business.id);
        await builds.setItemStatus(build.id, "seo", "review");
        const sentBack = await builds.setItemStatus(
          build.id,
          "seo",
          "building",
          "Meta descriptions read as filler — tighten them",
        );
        const seo = sentBack.items.find((item) => item.kind === "seo");
        expect(seo?.status).toBe("building");
        expect(seo?.note).toContain("tighten");
      });
    });

    it("removing a business cascades to its build and activity", async () => {
      await withRepos(async ({ businesses, builds }) => {
        const business = await businesses.create(DRAFT);
        await builds.createForBusiness(business.id);
        await businesses.remove(business.id);
        expect(await builds.getForBusiness(business.id)).toBeNull();
      });
    });

    it("publishes immutable, versioned snapshots with a stable slug (ADR-027)", async () => {
      await withRepos(async ({ businesses, publications }) => {
        const business = await businesses.create(DRAFT);
        const v1 = await publications.publish(business.id, 2, "summit-roofing-rescue");
        expect(v1.version).toBe(1);
        expect(v1.blueprintVersion).toBe(2);
        expect(v1.status).toBe("live");
        expect(v1.slug).toBe("summit-roofing-rescue");

        const v2 = await publications.publish(business.id, 3, "summit-roofing-rescue");
        expect(v2.version).toBe(2);
        // The new publication takes over; the old one is superseded, never mutated.
        const current = await publications.current(business.id);
        expect(current?.version).toBe(2);
        expect(current?.blueprintVersion).toBe(3);
        const history = await publications.history(business.id);
        expect(history.map((p) => p.version)).toEqual([2, 1]);
        expect(history[1].status).toBe("superseded");
        expect(history[1].blueprintVersion).toBe(2); // pinned, untouched
      });
    });

    it("resolves live publications by slug and by hostname", async () => {
      await withRepos(async ({ businesses, publications }) => {
        const business = await businesses.create(DRAFT);
        await publications.publish(business.id, 1, "summit-roofing-rescue");
        expect(
          (await publications.currentBySlug("summit-roofing-rescue"))?.businessId,
        ).toBe(business.id);
        expect(await publications.currentBySlug("nope")).toBeNull();

        await publications.addDomain("summitroofing.co.uk", business.id);
        expect(
          (await publications.currentByHostname("summitroofing.co.uk"))?.businessId,
        ).toBe(business.id);
        expect(await publications.currentByHostname("unknown.example")).toBeNull();
      });
    });

    it("unpublishes (site offline) and republish starts a new version", async () => {
      await withRepos(async ({ businesses, publications }) => {
        const business = await businesses.create(DRAFT);
        await publications.publish(business.id, 1, "summit-roofing-rescue");
        await publications.unpublish(business.id);
        expect(await publications.current(business.id)).toBeNull();
        expect(await publications.currentBySlug("summit-roofing-rescue")).toBeNull();

        const again = await publications.publish(business.id, 1, "summit-roofing-rescue");
        expect(again.version).toBe(2);
        expect((await publications.current(business.id))?.version).toBe(2);
      });
    });

    it("reports slug ownership for uniqueness checks", async () => {
      await withRepos(async ({ businesses, publications }) => {
        const business = await businesses.create(DRAFT);
        await publications.publish(business.id, 1, "summit-roofing-rescue");
        expect(await publications.slugOwner("summit-roofing-rescue")).toBe(business.id);
        expect(await publications.slugOwner("free-slug")).toBeNull();
      });
    });

    it("enquiries carry the speed-to-lead lifecycle (ADR-030)", async () => {
      await withRepos(async ({ businesses, publications, enquiries }) => {
        const business = await businesses.create(DRAFT);
        const publication = await publications.publish(business.id, 1, "lead-flow-co");
        const enquiry = await enquiries.create({
          businessId: business.id,
          publicationId: publication.id,
          name: "Sandra",
          contact: "07700 1",
          message: "quote please",
          sourcePage: "/sale",
        });
        // Born new, no lifecycle timestamps yet.
        expect(enquiry.status).toBe("new");
        expect(enquiry.seenAt).toBeUndefined();
        // seen → timestamps land on the right fields.
        const seen = await enquiries.setStatus(enquiry.id, "seen", "2026-07-09T10:00:00.000Z");
        expect(seen.status).toBe("seen");
        expect(seen.seenAt).toBe("2026-07-09T10:00:00.000Z");
        const contacted = await enquiries.setStatus(enquiry.id, "contacted", "2026-07-09T10:05:00.000Z");
        expect(contacted.contactedAt).toBe("2026-07-09T10:05:00.000Z");
        expect(contacted.seenAt).toBe("2026-07-09T10:00:00.000Z");
        const won = await enquiries.setStatus(enquiry.id, "qualified", "2026-07-09T11:00:00.000Z");
        expect(won.status).toBe("qualified");
        expect(won.outcomeAt).toBe("2026-07-09T11:00:00.000Z");
        // get + recent listing across businesses (the in-app inbox).
        expect((await enquiries.get(enquiry.id))?.status).toBe("qualified");
        const recent = await enquiries.listRecent(10);
        expect(recent.some((entry) => entry.id === enquiry.id)).toBe(true);
      });
    });

    it("aggregates site metrics daily per business × path × event (ADR-030)", async () => {
      await withRepos(async ({ businesses, metrics }) => {
        const business = await businesses.create(DRAFT);
        await metrics.record(business.id, "/", "view", "2026-07-09");
        await metrics.record(business.id, "/", "view", "2026-07-09");
        await metrics.record(business.id, "/", "form_start", "2026-07-09");
        await metrics.record(business.id, "/sale", "view", "2026-07-09");
        await metrics.record(business.id, "/sale", "form_submit", "2026-07-09");
        await metrics.record(business.id, "/", "view", "2026-07-10");
        const rows = await metrics.listForBusiness(business.id);
        const homeDay1 = rows.find((row) => row.path === "/" && row.date === "2026-07-09");
        expect(homeDay1).toMatchObject({ views: 2, formStarts: 1, formSubmits: 0 });
        const saleDay1 = rows.find((row) => row.path === "/sale" && row.date === "2026-07-09");
        expect(saleDay1).toMatchObject({ views: 1, formSubmits: 1 });
        expect(rows.find((row) => row.date === "2026-07-10")?.views).toBe(1);
        // Unknown business: fail loudly like every other repository.
        await expect(
          metrics.record("missing", "/", "view", "2026-07-09"),
        ).rejects.toThrow(BusinessNotFoundError);
      });
    });

    it("round-trips ownerEmail and ga4MeasurementId (ADR-030)", async () => {
      await withRepos(async ({ businesses }) => {
        const created = await businesses.create({
          ...DRAFT,
          ownerEmail: "owner@kerbside.example",
          ga4MeasurementId: "G-TEST123",
        });
        expect(created.ownerEmail).toBe("owner@kerbside.example");
        expect((await businesses.get(created.id))?.ga4MeasurementId).toBe("G-TEST123");
        // updateDetails patches and clears.
        const patched = await businesses.updateDetails(created.id, {
          ownerEmail: "new@kerbside.example",
        });
        expect(patched.ownerEmail).toBe("new@kerbside.example");
        expect(patched.ga4MeasurementId).toBe("G-TEST123");
        const cleared = await businesses.updateDetails(created.id, {
          ownerEmail: undefined,
        });
        expect(cleared.ownerEmail).toBeUndefined();
      });
    });

    it("captures enquiries against the account, newest first, cascading", async () => {
      await withRepos(async ({ businesses, publications, enquiries }) => {
        const business = await businesses.create(DRAFT);
        const publication = await publications.publish(business.id, 1, "summit-roofing-rescue");
        await enquiries.create({
          businessId: business.id,
          publicationId: publication.id,
          name: "Dave Homeowner",
          contact: "07700 900456",
          message: "Leak over the bay window after the storm",
          sourcePage: "/",
        });
        await enquiries.create({
          businessId: business.id,
          publicationId: publication.id,
          name: "Sue Homeowner",
          contact: "sue@example.com",
          message: "Quote for a full re-roof",
          sourcePage: "/",
        });

        const listed = await enquiries.listForBusiness(business.id);
        expect(listed).toHaveLength(2);
        expect(listed[0].name).toBe("Sue Homeowner");
        expect(listed[1].message).toContain("bay window");
        expect(listed[1].publicationId).toBe(publication.id);

        await expect(
          enquiries.create({
            businessId: "nope",
            publicationId: publication.id,
            name: "X",
            contact: "x",
            message: "x",
            sourcePage: "/",
          }),
        ).rejects.toBeInstanceOf(BusinessNotFoundError);

        await businesses.remove(business.id);
        expect(await enquiries.listForBusiness(business.id)).toEqual([]);
      });
    });
  });
}
