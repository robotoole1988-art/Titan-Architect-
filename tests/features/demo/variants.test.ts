import { describe, expect, it } from "vitest";
import { resolveBusinessSpine } from "@/core/business";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import { buildWebsiteBlueprint } from "@/core/website-blueprint";
import { loadDemoData, saveVariantAction } from "@/features/demo";

/**
 * ADR-055's central law: RENDERING variants writes NOTHING. The demo view
 * model may be loaded any number of times, in any variant, and the artifact
 * store is untouched. Saving is explicit and writes NEW versions only.
 * (Memory spine: no env in tests → resolveBusinessSpine is in-memory.)
 */

async function seedLiberty() {
  const spine = await resolveBusinessSpine();
  const business = await spine.businesses.create({
    name: `Liberty Variants ${crypto.randomUUID().slice(0, 6)}`,
    trade: "Roofing",
    location: "Oxford",
    coverageAreas: ["Surrey"],
    currentWebsiteUrl: "https://libertycontractors.co.uk",
  });
  const strategy = generateExperienceStrategy({
    businessName: business.name,
    trade: business.trade,
    location: business.location,
  });
  await spine.artifacts.save({ businessId: business.id, kind: "strategy", payload: strategy });
  await spine.artifacts.save({
    businessId: business.id,
    kind: "blueprint",
    payload: buildWebsiteBlueprint({ strategy, coverageAreas: business.coverageAreas }),
  });
  return { spine, business };
}

describe("variant rendering is preview-only", () => {
  it("loading the demo in every variant writes ZERO artifacts", async () => {
    const { spine, business } = await seedLiberty();
    const versionsBefore = {
      strategy: (await spine.artifacts.listVersions(business.id, "strategy")).length,
      blueprint: (await spine.artifacts.listVersions(business.id, "blueprint")).length,
    };

    const primary = await loadDemoData(business.id, undefined);
    expect(primary?.showingPrimary).toBe(true);
    expect(primary?.blueprint?.designSystem?.themeRef).toBe("titan-project");
    // Roofing (project) alternates: premium + technical.
    for (const variant of primary!.alternates) {
      const data = await loadDemoData(business.id, variant);
      expect(data?.showingPrimary).toBe(false);
      expect(data?.blueprint?.designSystem?.themeRef).toBe(`titan-${variant}`);
    }
    // An unknown variant safely falls back to the primary.
    expect((await loadDemoData(business.id, "yolo"))?.showingPrimary).toBe(true);

    expect({
      strategy: (await spine.artifacts.listVersions(business.id, "strategy")).length,
      blueprint: (await spine.artifacts.listVersions(business.id, "blueprint")).length,
    }).toEqual(versionsBefore);
  });

  it("saving a direction writes NEW versions — never overwrites", async () => {
    const { spine, business } = await seedLiberty();
    const before = await spine.artifacts.listVersions(business.id, "blueprint");
    const result = await saveVariantAction(business.id, "premium");
    expect(result.ok).toBe(true);

    const strategies = await spine.artifacts.listVersions(business.id, "strategy");
    const blueprints = await spine.artifacts.listVersions(business.id, "blueprint");
    expect(blueprints.length).toBe(before.length + 1);
    expect(blueprints[0].version).toBe(before[0].version + 1); // newest first
    expect(strategies[0].meta?.demoVariant).toBe("premium");
    // The saved variant IS the premium direction.
    const latest = await spine.artifacts.latest(business.id, "blueprint");
    expect(
      (latest?.payload as { designSystem?: { themeRef?: string } }).designSystem?.themeRef,
    ).toBe("titan-premium");
  });

  it("refuses a direction that is not offered for the trade", async () => {
    const { business } = await seedLiberty();
    const result = await saveVariantAction(business.id, "event");
    expect(result.ok).toBe(false);
    expect(result.message).toContain("not an offered direction");
  });
});
