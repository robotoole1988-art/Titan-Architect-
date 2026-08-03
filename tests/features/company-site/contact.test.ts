import { describe, expect, it } from "vitest";
import { createMemoryBusinessSpine } from "@/core/business";
import { processCompanyContact } from "@/features/company-site/api/contact";

/**
 * The company-site contact form's logic: submissions become classified
 * leads in TITAN's own CRM through the same spine every customer enquiry
 * uses. Honeypot drops are silent (bots think they succeeded), trades
 * resolve by exact taxonomy id (ADR-066 — tampered ids are rejected, never
 * guessed at), and nothing is stored that validation did not pass.
 */

const VALID = {
  name: "Dave Example",
  business: "Example Roofing",
  tradeId: "roofing",
  town: "Leeds",
  email: "dave@example.co.uk",
  phone: "07700 900123",
  message: "Storm damage enquiries are going to voicemail and I am losing them.",
  website: "",
};

describe("processCompanyContact", () => {
  it("stores a valid submission as a classified lead with the message logged", async () => {
    const spine = createMemoryBusinessSpine();
    const result = await processCompanyContact(spine, VALID);
    expect(result).toEqual({ ok: true, dropped: false });

    const businesses = await spine.businesses.list();
    expect(businesses).toHaveLength(1);
    expect(businesses[0].name).toBe("Example Roofing");
    expect(businesses[0].tradeId).toBe("roofing");
    expect(businesses[0].location).toBe("Leeds");
    expect(businesses[0].contact?.email).toBe("dave@example.co.uk");

    const entries = await spine.activity.list(businesses[0].id);
    const note = entries.find((entry) => entry.kind === "note");
    expect(note?.message).toContain("Dave Example");
    expect(note?.message).toContain("losing them");
    expect(note?.meta?.source).toBe("company-site-contact-form");
  });

  it("drops honeypot submissions silently — the bot believes it succeeded", async () => {
    const spine = createMemoryBusinessSpine();
    const result = await processCompanyContact(spine, {
      ...VALID,
      website: "https://spam.example",
    });
    expect(result).toEqual({ ok: true, dropped: true });
    expect(await spine.businesses.list()).toHaveLength(0);
  });

  it("rejects a tampered trade id rather than guessing (ADR-066)", async () => {
    const spine = createMemoryBusinessSpine();
    const result = await processCompanyContact(spine, {
      ...VALID,
      tradeId: "roof-stuff-llc",
    });
    expect(result).toEqual({ ok: false, reason: "invalid" });
    expect(await spine.businesses.list()).toHaveLength(0);
  });

  it("rejects submissions missing the essentials", async () => {
    const spine = createMemoryBusinessSpine();
    for (const broken of [
      { ...VALID, name: "  " },
      { ...VALID, business: "" },
      { ...VALID, town: "" },
      { ...VALID, email: "not-an-address" },
      { ...VALID, message: "short" },
    ]) {
      expect(await processCompanyContact(spine, broken)).toEqual({
        ok: false,
        reason: "invalid",
      });
    }
    expect(await spine.businesses.list()).toHaveLength(0);
  });

  it("caps every stored field — nobody stores a novel", async () => {
    const spine = createMemoryBusinessSpine();
    const result = await processCompanyContact(spine, {
      ...VALID,
      message: "x".repeat(5000),
    });
    expect(result).toEqual({ ok: true, dropped: false });
    const [business] = await spine.businesses.list();
    const entries = await spine.activity.list(business.id);
    const note = entries.find((entry) => entry.kind === "note");
    expect((note?.message ?? "").length).toBeLessThanOrEqual(2100);
  });
});
