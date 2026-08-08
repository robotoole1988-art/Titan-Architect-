import { readFileSync } from "node:fs";
import { join } from "node:path";
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
 * These tests guard the three ways one small file like this does real damage:
 * telling crawlers to ignore a page that exists to sell TITAN, drifting out of
 * step with the auth model it describes, and — the subtle one — disallowing a
 * page that relies on `noindex`, which silently makes the `noindex`
 * unreachable and can leave the URL indexed for ever.
 */

const APP_DIR = join(process.cwd(), "src", "app");

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
    expect(await response.text()).not.toContain("<");
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

  it("shuts the door, which has no noindex and nothing to index", async () => {
    const disallowed = directives(await robots(), "Disallow");
    expect(disallowed).toContain("/login");
    expect(disallowed).toContain("/auth/");
  });

  it("never disallows a page the company site publishes to sell TITAN", async () => {
    // The one way this file could quietly cost money.
    for (const path of PUBLIC_COMPANY_SITE_PATHS) {
      for (const prefix of DISALLOWED_PREFIXES) {
        expect(path.startsWith(prefix), `${path} is shadowed by Disallow: ${prefix}`).toBe(
          false,
        );
      }
    }
  });
});

describe("Disallow and noindex are never used on the same URL", () => {
  /**
   * The rule this suite exists for. A crawler forbidden to FETCH a page can
   * never read the `noindex` inside it, so one inbound link can index the bare
   * URL with the instruction not to permanently unread. Whichever route
   * declares `robots: { index: false }` must stay crawlable.
   */
  const NOINDEX_ROUTES: ReadonlyArray<[string, string]> = [
    // [url path, source file that declares index:false]
    ["/lab/arrival", "(public)/lab/arrival/page.tsx"],
    ["/thanks", "(public)/thanks/page.tsx"],
    ["/experience/demo/", "(demo)/layout.tsx"],
  ];

  it("every route listed here really does declare noindex", () => {
    // Pins the premise, so this suite cannot pass on a stale assumption.
    for (const [, file] of NOINDEX_ROUTES) {
      const source = readFileSync(join(APP_DIR, file), "utf8");
      expect(source, `${file} no longer declares index: false`).toMatch(
        /robots:\s*{\s*index:\s*false/,
      );
    }
  });

  it("and none of them is disallowed, which would make that noindex unreachable", () => {
    for (const [path] of NOINDEX_ROUTES) {
      for (const prefix of DISALLOWED_PREFIXES) {
        expect(
          path.startsWith(prefix),
          `${path} relies on noindex, so Disallow: ${prefix} would hide it from the crawler that must read it`,
        ).toBe(false);
      }
    }
  });

  it("ADR-070 §4's demo disallow is deferred on purpose, not forgotten", async () => {
    // It becomes correct when the flagship LINKS the demo publicly: at that
    // point 35 trades × any town makes crawl budget the larger concern. Until
    // then, noindex alone is doing the job — and a disallow would break it.
    expect(directives(await robots(), "Disallow")).not.toContain("/experience/demo/");
    expect(await robots()).toContain("noindex, not Disallow");
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
