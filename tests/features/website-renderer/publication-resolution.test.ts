import { describe, expect, it } from "vitest";
import { resolveBusinessSpine } from "@/core/business";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import { buildWebsiteBlueprint } from "@/core/website-blueprint";
import { resolvePublishedSite } from "@/features/website-renderer";

/**
 * Serve-time resolution (ADR-053): verified reviews resolve alongside
 * approved media, and a business's own APPROVED photo beats the generated
 * asset for the same slot. Runs against the memory spine (no env → memory).
 */

const PROVENANCE_AI = {
  provider: "replicate",
  model: "flux",
  prompt: "hero",
  costUsd: 0.04,
  generatedAt: "2026-07-01T09:00:00.000Z",
};

async function seed() {
  const spine = await resolveBusinessSpine();
  const business = await spine.businesses.create({
    name: `Resolution Test ${crypto.randomUUID().slice(0, 8)}`,
    trade: "Emergency Roofing & Drainage",
    location: "Leeds",
  });
  const blueprint = buildWebsiteBlueprint({
    strategy: generateExperienceStrategy({
      businessName: business.name,
      trade: business.trade,
      location: business.location,
    }),
  });
  await spine.artifacts.save({ businessId: business.id, kind: "blueprint", payload: blueprint });
  const slug = `resolution-${crypto.randomUUID().slice(0, 8)}`;
  await spine.publications.publish(business.id, 1, slug);
  return { spine, business, blueprint, slug };
}

describe("resolvePublishedSite (ADR-053 additions)", () => {
  it("resolves ONLY verified reviews for the page", async () => {
    const { spine, business, slug } = await seed();
    await spine.reviews.create({
      businessId: business.id,
      customerName: "Priya Patel",
      rating: 5,
      text: "Same-day fix.",
      reviewedAt: "2026-07-01",
      source: "direct",
      verification: {
        verifiedBy: "founder",
        method: "email on file",
        verifiedAt: "2026-07-02T09:00:00.000Z",
      },
    });
    await spine.reviews.create({
      businessId: business.id,
      customerName: "Unverified Person",
      rating: 1,
      text: "Should never serve.",
      reviewedAt: "2026-07-03",
      source: "other",
    });

    const resolved = await resolvePublishedSite({ slug });
    expect(resolved).not.toBeNull();
    expect(resolved!.reviews).toHaveLength(1);
    expect(resolved!.reviews[0].customerName).toBe("Priya Patel");
  });

  it("an approved customer photo beats the approved generated asset for the same slot", async () => {
    const { spine, business, slug } = await seed();
    const generated = await spine.media.create({
      businessId: business.id,
      slotRef: "hero.backdrop",
      brief: "AI hero",
      modality: "image",
      url: "/generated-media/x/hero.webp",
      provenance: PROVENANCE_AI,
    });
    const customer = await spine.media.create({
      businessId: business.id,
      slotRef: "hero.backdrop",
      brief: "Customer-supplied photograph",
      modality: "image",
      url: "/generated-media/x/hero.customer-1.jpeg",
      provenance: { ...PROVENANCE_AI, provider: "customer-upload", model: "original-photograph", costUsd: 0 },
    });
    await spine.media.setStatus(generated.id, "approved");
    await spine.media.setStatus(customer.id, "approved");

    const resolved = await resolvePublishedSite({ slug });
    expect(resolved!.media["hero.backdrop"].url).toBe("/generated-media/x/hero.customer-1.jpeg");
  });

  it("without a customer photo, the generated asset serves as before", async () => {
    const { spine, business, slug } = await seed();
    const generated = await spine.media.create({
      businessId: business.id,
      slotRef: "hero.backdrop",
      brief: "AI hero",
      modality: "image",
      url: "/generated-media/x/hero.webp",
      provenance: PROVENANCE_AI,
    });
    await spine.media.setStatus(generated.id, "approved");

    const resolved = await resolvePublishedSite({ slug });
    expect(resolved!.media["hero.backdrop"].url).toBe("/generated-media/x/hero.webp");
  });

  it("a customer photo in the gate (not approved) never serves", async () => {
    const { spine, business, slug } = await seed();
    await spine.media.create({
      businessId: business.id,
      slotRef: "hero.backdrop",
      brief: "Customer-supplied photograph",
      modality: "image",
      url: "/generated-media/x/hero.customer-1.jpeg",
      provenance: { ...PROVENANCE_AI, provider: "customer-upload", costUsd: 0 },
    });
    const resolved = await resolvePublishedSite({ slug });
    expect(resolved!.media["hero.backdrop"]).toBeUndefined();
  });
});
