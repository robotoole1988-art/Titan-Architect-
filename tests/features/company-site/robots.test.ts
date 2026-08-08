import { describe, expect, it } from "vitest";
import { PUBLIC_COMPANY_SITE_PATHS, isProtectedAppPath } from "@/core/auth";
import { DISALLOWED_PREFIXES, GET } from "@/app/(public)/robots.txt/route";

/**
 * The app host's robots.txt (ADR-071).
 *
 * It exists because it was MISSING: `/robots.txt` fell through to the founder
 * gate, answered a login redirect to any crawler, and Lighthouse scored SEO
 * 91 against a floor of 100 — the reason the nightly production run could not
 * go green even with the fleet up.
 *
 * These tests guard the two ways this one small file could do real damage:
 * telling crawlers to ignore a page that exists to sell TITAN, and drifting
 * out of step with the auth model it describes.
 */

async function robots(): Promise<string> {
  return await GET().text();
}

function directives(body: string, name: "Allow" | "Disallow"): string[] {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith(`${name}:`))
    .map((line) => line.slice(name.length + 1).trim());
}

describe("the app host serves a valid robots.txt", () => {
  it("answers 200 as plain text — not HTML, which is what failed the audit", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/plain");
    const body = await response.text();
    expect(body).not.toContain("<");
  });

  it("names a user-agent before any rule — a rule with no agent is ignored", async () => {
    const lines = (await robots())
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"));
    expect(lines[0]).toBe("User-agent: *");
  });

  it("uses only conventional directives — this file must satisfy a validator too", async () => {
    for (const line of (await robots()).split("\n")) {
      const trimmed = line.trim();
      if (trimmed.length === 0 || trimmed.startsWith("#")) continue;
      expect(trimmed, trimmed).toMatch(/^(User-agent|Allow|Disallow|Sitemap): \S/);
    }
  });

  it("does not point a crawler at a sitemap that does not exist", async () => {
    // Exactly the class of mistake this route was written to fix.
    expect(await robots()).not.toContain("Sitemap:");
  });
});

describe("what it allows and forbids", () => {
  it("lets the public company site be crawled", async () => {
    expect(directives(await robots(), "Allow")).toContain("/");
  });

  it("keeps the generator demo out of the index (ADR-070 §4)", async () => {
    // The demo pages already carry noindex per page and per layout; this is
    // the crawler-side half of the same promise.
    expect(DISALLOWED_PREFIXES).toContain("/experience/demo/");
    expect(directives(await robots(), "Disallow")).toContain("/experience/demo/");
  });

  it("keeps founder-judgment prototypes out of the index", async () => {
    // /lab/arrival is publicly REACHABLE so it can be judged on a real
    // deployment. Reachable is not crawlable.
    expect(DISALLOWED_PREFIXES).toContain("/lab/");
    expect(isProtectedAppPath("/lab/arrival")).toBe(false);
  });

  it("never disallows a page the company site publishes to sell TITAN", async () => {
    // The one way this file could quietly cost money. /lab/ and the door are
    // deliberate exceptions: reachable, but nothing a searcher should land on.
    const deliberatelyUncrawled = new Set(["/lab/arrival", "/thanks", "/robots.txt"]);
    for (const path of PUBLIC_COMPANY_SITE_PATHS) {
      if (deliberatelyUncrawled.has(path)) continue;
      for (const prefix of DISALLOWED_PREFIXES) {
        expect(path.startsWith(prefix), `${path} is shadowed by Disallow: ${prefix}`).toBe(false);
      }
    }
  });
});

describe("the crawler can actually reach it", () => {
  it("is public — behind the gate it answered a login redirect", () => {
    expect(isProtectedAppPath("/robots.txt")).toBe(false);
    expect(PUBLIC_COMPANY_SITE_PATHS.has("/robots.txt")).toBe(true);
  });

  it("is an EXACT path, so no look-alike rides in behind it", () => {
    // The company site is a Set membership test on purpose (ADR-064).
    expect(isProtectedAppPath("/robots.txtX")).toBe(true);
    expect(isProtectedAppPath("/robots")).toBe(true);
    expect(isProtectedAppPath("/robots.txt/")).toBe(true);
  });
});
