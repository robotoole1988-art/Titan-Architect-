import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PUBLIC_COMPANY_SITE_PATHS } from "@/core/auth";
import { PERFORMANCE_LAW } from "@/core/performance-law";
import { TRADE_TAXONOMY } from "@/core/trade-taxonomy";
import {
  CompanyAboutPage,
  CompanyAdvertisingPage,
  CompanyHomePage,
  CompanyPrivacyPage,
  CONTACT_EMAIL,
  PERFORMANCE_FLOOR,
  TRADE_COUNT,
} from "@/features/company-site";

/**
 * TITAN'S OWN SITE OBEYS TITAN'S OWN LAWS (ADR-064).
 *
 * ADR-059 and ADR-060 forbid the generator from ever producing a verifiable
 * fact a customer cannot back — an accreditation, a review, a price, a
 * photograph of work. TITAN's company site is hand-written, so none of those
 * choke points protect it: it is the one page in the repository where a
 * person could type "NFRC approved · 500 happy customers" and nothing would
 * stop them.
 *
 * This file is that stop. It renders the real markup of every public page
 * and asserts the forbidden shapes never appear. The company that sells
 * "everything on your website is true" cannot be the one caught decorating
 * its own.
 */

const PAGES: ReadonlyArray<[string, () => React.JSX.Element]> = [
  ["home", CompanyHomePage],
  ["advertising", CompanyAdvertisingPage],
  ["about", CompanyAboutPage],
  ["privacy", CompanyPrivacyPage],
];

/** Rendered text, tags stripped, entities folded — what a reader sees. */
function textOf(Page: () => React.JSX.Element): string {
  return renderToStaticMarkup(<Page />)
    .replace(/<[^>]+>/g, " ")
    .replace(/&rsquo;|&#x27;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}

const RENDERED = PAGES.map(([name, Page]) => [name, textOf(Page)] as const);

const FEATURE_DIR = join(process.cwd(), "src/features/company-site");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : [path];
  });
}

describe("no proof TITAN has not earned", () => {
  it("claims no accreditation or trade-body membership", () => {
    // Real organisations with real marks. TITAN holds none of them, and the
    // demo builds that once carried two of these are exactly why this test
    // exists rather than a note in a document.
    const BODIES =
      /\b(NFRC|CompetentRoofer|Gas Safe|NICEIC|TrustMark|Checkatrade|Which\?? Trusted|FMB|RECC|MCS certified|ISO ?9001)\b/i;
    for (const [name, text] of RENDERED) {
      expect(BODIES.test(text), `${name} names an accreditation`).toBe(false);
    }
  });

  it("publishes no review, quotation or star rating", () => {
    // Deliberately the SHAPE of a testimonial, not the word: the page says
    // "no testimonials" on purpose, and a test that banned the word would
    // have banned the sentence that makes the page honest. What a testimonial
    // actually looks like is a long quotation, a star, or an attribution.
    const SOCIAL_PROOF =
      /(★|\bfive[- ]star\b|\b5[- ]star\b|\bverified customer\b|\brated\s+\d|[“"][^”"]{25,}[”"])/i;
    for (const [name, text] of RENDERED) {
      expect(SOCIAL_PROOF.test(text), `${name} carries social proof`).toBe(false);
    }
  });

  it("counts no customers, jobs, years or results", () => {
    // The shapes a marketing page reaches for when it has nothing real:
    // "trusted by 200+", "over 1,000 jobs", "15 years", "3x more leads".
    const FABRICATED_COUNT =
      /\b(trusted by|join(ed)? (over )?\d|over \d[\d,]*\s+(customers|businesses|jobs|leads|clients)|\d[\d,]*\+\s*(customers|businesses|jobs|leads|clients)|\d+\s*years? (of )?(experience|trading)|\d+x\s+more)\b/i;
    for (const [name, text] of RENDERED) {
      expect(FABRICATED_COUNT.test(text), `${name} invents a count`).toBe(false);
    }
  });

  it("says plainly that there are no case studies yet", () => {
    // The disarming sentence is load-bearing: it is what makes the rest of
    // the page believable, and it is the first thing a rewrite would cut.
    const [, home] = RENDERED.find(([name]) => name === "home")!;
    expect(home).toMatch(/no case studies|no customer logos|no testimonials/i);
  });
});

describe("the numbers are derived, never typed", () => {
  it("the trade count is the taxonomy's own length", () => {
    expect(TRADE_COUNT).toBe(TRADE_TAXONOMY.length);
    const [, home] = RENDERED.find(([name]) => name === "home")!;
    expect(home).toContain(String(TRADE_COUNT));
  });

  it("the performance floor is the one the build actually enforces", () => {
    // A marketing page advertising a looser standard than law.json enforces
    // would be a true sentence about nothing. They move together or not at all.
    expect(PERFORMANCE_FLOOR).toBe(PERFORMANCE_LAW.categories.performance.floor);
  });
});

describe("the advertising page matches the application TITAN filed", () => {
  // Google's Ads API review reads this page against the submitted use case
  // (docs/growth/TITAN-API-Applications-Pack.md). A rewrite that drops one of
  // these would desync the site from the application silently — and the first
  // symptom would be a second rejection weeks later.
  const [, advertising] = RENDERED.find(([name]) => name === "advertising")!;

  it("states that client accounts sit under TITAN's manager account", () => {
    expect(advertising).toMatch(/manager account/i);
    expect(advertising).toMatch(/own Google Ads account/i);
  });

  it("states that TITAN does not resell API access", () => {
    expect(advertising).toMatch(/does not resell/i);
  });

  it("describes what API access is for", () => {
    expect(advertising).toMatch(/Google Ads API/i);
    for (const capability of [/campaign/i, /budget/i, /performance/i]) {
      expect(capability.test(advertising)).toBe(true);
    }
  });

  it("is honest that execution is a manual import today", () => {
    expect(advertising).toMatch(/Google Ads Editor/i);
  });
});

describe("the site is as fast as the standard it sells", () => {
  it("ships no client component", () => {
    // A marketing page that hydrates to say four things is the exact waste
    // TITAN charges customers to remove. Every page here is server-rendered
    // markup; the day one needs interactivity, this test is the conversation.
    for (const file of sourceFiles(FEATURE_DIR)) {
      const source = readFileSync(file, "utf8");
      expect(source.includes('"use client"'), `${file} is a client component`).toBe(
        false,
      );
    }
  });

  it("loads no image — the pages are type and colour", () => {
    for (const [name, text] of RENDERED) {
      const markup = renderToStaticMarkup(
        PAGES.find(([pageName]) => pageName === name)![1](),
      );
      expect(/<img\b/i.test(markup), `${name} loads an image`).toBe(false);
      expect(text.length).toBeGreaterThan(400);
    }
  });
});

describe("the site is as legible as the standard it sells", () => {
  it("uses no muted text that fails WCAG AA against the page", () => {
    // Measured against the page ground (#05060a): white/30 is 2.55:1 and
    // white/40 is 3.74:1 — both below the 4.5:1 AA needs for body text —
    // and white/45 lands at 4.47:1, under the line by a rounding error.
    // white/50 is 5.28:1 and white/55 is 6.26:1.
    //
    // TITAN advertises an accessibility floor of 95 on the sites it builds.
    // Its own site is not covered by that gate (law.json audits the archetype
    // paths, not this one), which is exactly why the rule is written down
    // here instead of assumed. Found by screenshotting the built page.
    const FAILING = /text-white\/(?:30|35|40|45)\b/;
    for (const file of sourceFiles(FEATURE_DIR)) {
      const source = readFileSync(file, "utf8");
      const hit = source.match(FAILING);
      expect(hit?.[0], `${file} uses ${hit?.[0]} — below 4.5:1 on #05060a`).toBe(
        undefined,
      );
    }
  });
});

describe("every page is reachable and complete", () => {
  it("renders one h1 per page, and a route exists for every public path", () => {
    for (const [name, Page] of PAGES) {
      const markup = renderToStaticMarkup(<Page />);
      expect((markup.match(/<h1\b/g) ?? []).length, `${name} h1 count`).toBe(1);
      expect(markup, `${name} skips the main landmark`).toContain('id="main"');
    }
    // /, /advertising, /about, /privacy — one page component each.
    expect(PUBLIC_COMPANY_SITE_PATHS.size).toBe(PAGES.length);
  });

  it("offers a way to make contact on every page", () => {
    for (const [name, Page] of PAGES) {
      expect(renderToStaticMarkup(<Page />), name).toContain(
        `mailto:${CONTACT_EMAIL}`,
      );
    }
  });
});
