import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import sharp from "sharp";
import {
  createMemoryBusinessSpine,
  type Business,
  type BusinessSpineRepositories,
} from "@/core/business";
import {
  CUSTOMER_UPLOAD_PROVIDER,
  MAX_UPLOAD_BYTES,
  ingestCustomerImage,
  normaliseImageFormat,
} from "@/core/media";
import type { MediaStorage } from "@/core/media/generate";

/**
 * ADR-053 §customer imagery: validation, pipeline-standard variants
 * (dimensions + LQIP), honest provenance, and the founder gate — customer
 * photos are born in "review" like everything else.
 */

let png: Uint8Array;

beforeAll(async () => {
  png = new Uint8Array(
    await sharp({
      create: { width: 64, height: 48, channels: 3, background: "#2d6cdf" },
    })
      .png()
      .toBuffer(),
  );
});

function memoryStorage(): MediaStorage & { saved: string[] } {
  const saved: string[] = [];
  return {
    saved,
    async save(businessId, slotRef, _bytes, format) {
      saved.push(`${businessId}/${slotRef}.${format}`);
      return { url: `/generated-media/${businessId}/${slotRef}.${format}` };
    },
  };
}

describe("normaliseImageFormat", () => {
  it("accepts webp/jpeg/png, maps jpg → jpeg, strips MIME prefixes", () => {
    expect(normaliseImageFormat("jpg")).toBe("jpeg");
    expect(normaliseImageFormat("image/jpeg")).toBe("jpeg");
    expect(normaliseImageFormat("PNG")).toBe("png");
    expect(normaliseImageFormat("webp")).toBe("webp");
    expect(normaliseImageFormat("gif")).toBe("");
    expect(normaliseImageFormat("mp4")).toBe("");
  });
});

describe("ingestCustomerImage", () => {
  let spine: BusinessSpineRepositories;
  let business: Business;

  beforeEach(async () => {
    spine = createMemoryBusinessSpine();
    business = await spine.businesses.create({
      name: "Summit Roofing Rescue",
      trade: "Emergency Roofing & Drainage",
      location: "Leeds",
    });
  });

  it("stores a valid photo with dimensions, LQIP, zero cost — born in the review gate", async () => {
    const storage = memoryStorage();
    const result = await ingestCustomerImage(spine, storage, business, {
      slotRef: "hero.backdrop",
      bytes: png,
      format: "png",
      note: "Our van outside the Headingley job",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.record.status).toBe("review"); // the gate is law
    expect(result.record.width).toBe(64);
    expect(result.record.height).toBe(48);
    expect(result.record.lqip).toMatch(/^data:image\/webp;base64,/);
    expect(result.record.provenance.provider).toBe(CUSTOMER_UPLOAD_PROVIDER);
    expect(result.record.provenance.model).toBe("original-photograph");
    expect(result.record.provenance.costUsd).toBe(0);
    expect(result.record.brief).toContain("Headingley");
    // Only approved media ever serves — the upload is NOT approved yet.
    expect(await spine.media.listApprovedForBusiness(business.id)).toEqual([]);
  });

  it("uploads never overwrite earlier takes — distinct storage path per upload", async () => {
    const storage = memoryStorage();
    await ingestCustomerImage(spine, storage, business, {
      slotRef: "hero.backdrop",
      bytes: png,
      format: "png",
    });
    await ingestCustomerImage(spine, storage, business, {
      slotRef: "hero.backdrop",
      bytes: png,
      format: "png",
    });
    expect(storage.saved).toEqual([
      `${business.id}/hero.backdrop.customer-1.png`,
      `${business.id}/hero.backdrop.customer-2.png`,
    ]);
  });

  it("rejects unsupported formats, oversized files, and empty files with honest reasons", async () => {
    const storage = memoryStorage();
    const badFormat = await ingestCustomerImage(spine, storage, business, {
      slotRef: "hero.backdrop",
      bytes: png,
      format: "gif",
    });
    expect(badFormat.ok).toBe(false);
    if (!badFormat.ok) expect(badFormat.problems[0]).toContain("Unsupported format");

    const tooBig = await ingestCustomerImage(spine, storage, business, {
      slotRef: "hero.backdrop",
      bytes: new Uint8Array(MAX_UPLOAD_BYTES + 1),
      format: "png",
    });
    expect(tooBig.ok).toBe(false);
    if (!tooBig.ok) expect(tooBig.problems[0]).toContain("limit is 8MB");

    const empty = await ingestCustomerImage(spine, storage, business, {
      slotRef: "hero.backdrop",
      bytes: new Uint8Array(0),
      format: "png",
    });
    expect(empty.ok).toBe(false);

    expect(storage.saved).toEqual([]); // nothing stored on any rejection
  });

  it("rejects bytes that are not actually an image, whatever the extension", async () => {
    const storage = memoryStorage();
    const result = await ingestCustomerImage(spine, storage, business, {
      slotRef: "hero.backdrop",
      bytes: new TextEncoder().encode("<script>alert(1)</script>"),
      format: "png",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.problems[0]).toContain("could not be read as an image");
    }
    expect(storage.saved).toEqual([]);
  });
});
