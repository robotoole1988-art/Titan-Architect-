import { describe, expect, it } from "vitest";
import {
  averageResponseTimeMs,
  createMemoryBusinessSpine,
  markEnquiryStatus,
  processEnquiry,
  publishWebsite,
  responseTimeMs,
  transitionBusinessStage,
  type BusinessSpineRepositories,
  type Enquiry,
} from "@/core/business";

/** Speed-to-lead workflows (ADR-030). */

async function seedEnquiry(spine: BusinessSpineRepositories): Promise<Enquiry> {
  const business = await spine.businesses.create({
    name: "Kerbside Kings",
    trade: "Driveways & Paving",
    location: "Manchester",
  });
  await spine.artifacts.save({ businessId: business.id, kind: "blueprint", payload: {} });
  await transitionBusinessStage(spine, business.id, "won");
  await publishWebsite(spine, business.id);
  const outcome = await processEnquiry(spine, {
    slug: "kerbside-kings",
    name: "Sandra",
    contact: "07700 900123",
    message: "resin quote",
    sourcePage: "/sale",
    honeypot: "",
  });
  // ADR-030: the outcome now carries the stored enquiry for notification.
  return outcome.enquiry!;
}

describe("enquiry lifecycle workflows", () => {
  it("marks seen → contacted with activity entries", async () => {
    const spine = createMemoryBusinessSpine();
    const enquiry = await seedEnquiry(spine);
    expect(enquiry.status).toBe("new");

    const seen = await markEnquiryStatus(spine, enquiry.id, "seen");
    expect(seen.status).toBe("seen");
    expect(seen.seenAt).toBeTruthy();

    const contacted = await markEnquiryStatus(spine, enquiry.id, "contacted");
    expect(contacted.contactedAt).toBeTruthy();

    const log = await spine.activity.list(enquiry.businessId);
    const messages = log.map((entry) => entry.message).join("\n");
    expect(messages).toContain("contacted");
  });

  it("refuses backwards transitions (contacted → seen)", async () => {
    const spine = createMemoryBusinessSpine();
    const enquiry = await seedEnquiry(spine);
    await markEnquiryStatus(spine, enquiry.id, "contacted");
    await expect(markEnquiryStatus(spine, enquiry.id, "seen")).rejects.toThrow(
      /transition/i,
    );
  });

  it("computes response time from creation to first contact", async () => {
    const enquiry = {
      createdAt: "2026-07-09T10:00:00.000Z",
      contactedAt: "2026-07-09T10:12:30.000Z",
    } as Enquiry;
    expect(responseTimeMs(enquiry)).toBe(12.5 * 60 * 1000);
    expect(responseTimeMs({ createdAt: "2026-07-09T10:00:00.000Z" } as Enquiry)).toBeNull();
  });

  it("averages response time over contacted enquiries only", () => {
    const enquiries = [
      { createdAt: "2026-07-09T10:00:00.000Z", contactedAt: "2026-07-09T10:10:00.000Z" },
      { createdAt: "2026-07-09T11:00:00.000Z", contactedAt: "2026-07-09T11:20:00.000Z" },
      { createdAt: "2026-07-09T12:00:00.000Z" }, // not yet contacted — excluded
    ] as Enquiry[];
    expect(averageResponseTimeMs(enquiries)).toBe(15 * 60 * 1000);
    expect(averageResponseTimeMs([])).toBeNull();
  });
});
