/**
 * Publishing workflow rules (ADR-027): snapshots pinned to blueprint
 * versions, gated upstream by founder approval; enquiries land on the
 * account with honeypot protection.
 */

import { describe, expect, it } from "vitest";
import {
  createMemoryBusinessSpine,
  processEnquiry,
  publishWebsite,
  uniqueSlugFor,
  unpublishWebsite,
} from "@/core/business";

const DRAFT = {
  name: "Summit Roofing Rescue",
  trade: "Roofing",
  tradeId: "roofing",
  location: "Leeds",
};

describe("publishWebsite", () => {
  it("refuses to publish without a blueprint", async () => {
    const repos = createMemoryBusinessSpine();
    const business = await repos.businesses.create(DRAFT);
    await expect(publishWebsite(repos, business.id)).rejects.toThrow(/blueprint/i);
  });

  it("pins the LATEST blueprint version and logs activity", async () => {
    const repos = createMemoryBusinessSpine();
    const business = await repos.businesses.create(DRAFT);
    await repos.artifacts.save({ businessId: business.id, kind: "blueprint", payload: {} });
    await repos.artifacts.save({ businessId: business.id, kind: "blueprint", payload: {} });

    const publication = await publishWebsite(repos, business.id);
    expect(publication.blueprintVersion).toBe(2);
    expect(publication.slug).toBe("summit-roofing-rescue");
    expect(publication.version).toBe(1);

    const entries = await repos.activity.list(business.id);
    expect(entries[0].kind).toBe("publication");
    expect(entries[0].message).toMatch(/blueprint v2/);
  });

  it("republishing pins the new blueprint but keeps the slug", async () => {
    const repos = createMemoryBusinessSpine();
    const business = await repos.businesses.create(DRAFT);
    await repos.artifacts.save({ businessId: business.id, kind: "blueprint", payload: {} });
    const first = await publishWebsite(repos, business.id);

    // Regenerate: the live site must NOT change until an explicit republish.
    await repos.artifacts.save({ businessId: business.id, kind: "blueprint", payload: {} });
    expect((await repos.publications.current(business.id))?.blueprintVersion).toBe(1);

    const second = await publishWebsite(repos, business.id);
    expect(second.version).toBe(2);
    expect(second.blueprintVersion).toBe(2);
    expect(second.slug).toBe(first.slug);
  });

  it("unpublishWebsite takes the site offline and logs", async () => {
    const repos = createMemoryBusinessSpine();
    const business = await repos.businesses.create(DRAFT);
    await repos.artifacts.save({ businessId: business.id, kind: "blueprint", payload: {} });
    await publishWebsite(repos, business.id);

    await unpublishWebsite(repos, business.id);
    expect(await repos.publications.current(business.id)).toBeNull();
    const entries = await repos.activity.list(business.id);
    expect(entries[0].message).toMatch(/unpublish/i);
  });
});

describe("uniqueSlugFor", () => {
  it("slugifies the business name", async () => {
    const repos = createMemoryBusinessSpine();
    expect(await uniqueSlugFor(repos, "Kerbside Kings & Co.")).toBe(
      "kerbside-kings-co",
    );
  });

  it("suffixes when the slug is owned by another business", async () => {
    const repos = createMemoryBusinessSpine();
    const other = await repos.businesses.create(DRAFT);
    await repos.publications.publish(other.id, 1, "summit-roofing-rescue");
    expect(
      await uniqueSlugFor(repos, "Summit Roofing Rescue"),
    ).toBe("summit-roofing-rescue-2");
  });
});

describe("processEnquiry", () => {
  async function publishedRepos() {
    const repos = createMemoryBusinessSpine();
    const business = await repos.businesses.create(DRAFT);
    await repos.artifacts.save({ businessId: business.id, kind: "blueprint", payload: {} });
    const publication = await publishWebsite(repos, business.id);
    return { repos, business, publication };
  }

  it("creates the enquiry on the right account with source attribution", async () => {
    const { repos, business, publication } = await publishedRepos();
    const result = await processEnquiry(repos, {
      slug: publication.slug,
      name: "Dave Homeowner",
      contact: "07700 900456",
      message: "Leak over the bay window",
      sourcePage: "/",
      honeypot: "",
    });
    expect(result.accepted).toBe(true);
    expect(result.dropped).toBe(false);

    const enquiries = await repos.enquiries.listForBusiness(business.id);
    expect(enquiries).toHaveLength(1);
    expect(enquiries[0].publicationId).toBe(publication.id);
    const entries = await repos.activity.list(business.id);
    expect(entries[0].kind).toBe("enquiry");
    expect(entries[0].message).toContain("Dave Homeowner");
  });

  it("silently drops honeypot submissions (bots think they succeeded)", async () => {
    const { repos, business, publication } = await publishedRepos();
    const result = await processEnquiry(repos, {
      slug: publication.slug,
      name: "Bot",
      contact: "spam@bot",
      message: "buy now",
      sourcePage: "/",
      honeypot: "http://spam.example",
    });
    expect(result.accepted).toBe(true);
    expect(result.dropped).toBe(true);
    expect(await repos.enquiries.listForBusiness(business.id)).toEqual([]);
  });

  it("rejects unknown slugs and empty essentials", async () => {
    const { repos } = await publishedRepos();
    await expect(
      processEnquiry(repos, {
        slug: "not-published",
        name: "X",
        contact: "x",
        message: "x",
        sourcePage: "/",
        honeypot: "",
      }),
    ).rejects.toThrow(/publication/i);
    await expect(
      processEnquiry(repos, {
        slug: "summit-roofing-rescue",
        name: "",
        contact: "",
        message: "hello",
        sourcePage: "/",
        honeypot: "",
      }),
    ).rejects.toThrow(/name|contact/i);
  });
});
