import { describe, expect, it } from "vitest";
// A plain ESM helper, shared with the CI gate (which cannot import
// TypeScript). It lives under scripts/ and is imported here so the bug
// described below has a test.
import {
  NOT_THE_PRODUCT,
  blockedPatternsProblem,
  blockedUrlPatternFlags,
} from "../../scripts/lighthouse-flags.mjs";

/**
 * The gate's block list has to actually block (ADR-071).
 *
 * For weeks it did not. The flag was built by joining the patterns with
 * commas, which Lighthouse parses as ONE literal pattern containing commas —
 * matching no URL that exists. Verified by running Lighthouse 12 and reading
 * `configSettings.blockedUrlPatterns` back out of the report:
 *
 *     ["*vercel.live*,*vercel-scripts.com*,*vercel.com/api*"]
 *
 * Nothing warned. The run succeeded, the report looked plausible, and every
 * preview audit scored Vercel's toolbar as TITAN's product: performance 72
 * and 1,425ms of blocking time against a page that measures 99 and 80ms in
 * production.
 *
 * The lesson generalises past this one flag, which is why the second half of
 * this suite tests the runtime proof rather than the string formatting.
 */

const patterns: readonly string[] = NOT_THE_PRODUCT;

describe("blockedUrlPatternFlags", () => {
  it("emits one flag per pattern, never a comma-joined list", () => {
    const flags: string[] = blockedUrlPatternFlags(patterns);
    expect(flags).toHaveLength(patterns.length);
    for (const flag of flags) {
      expect(flag, `${flag} joins patterns with a comma`).not.toContain(",");
      expect(flag).toMatch(/^--blocked-url-patterns=\S+$/);
    }
  });

  it("passes each pattern through untouched", () => {
    expect(blockedUrlPatternFlags(patterns)).toEqual(
      patterns.map((pattern) => `--blocked-url-patterns=${pattern}`),
    );
  });

  it("still refuses the toolbar the law was written against", () => {
    expect(patterns).toContain("*vercel.live*");
  });
});

describe("blockedPatternsProblem — the gate vouches for its own measurement", () => {
  it("is satisfied when Lighthouse applied every pattern", () => {
    expect(blockedPatternsProblem([...patterns], patterns)).toBeNull();
  });

  it("tolerates Lighthouse applying extra patterns of its own", () => {
    expect(blockedPatternsProblem([...patterns, "*something-else*"], patterns)).toBeNull();
  });

  it("catches the comma-joined bug from the report, whatever the flag syntax", () => {
    // Exactly what Lighthouse 12 reported back for the old flag.
    const problem = blockedPatternsProblem([patterns.join(",")], patterns);
    expect(problem).toBeTruthy();
    expect(problem).toContain("did not apply every pattern");
    expect(problem).toContain("*vercel.live*");
  });

  it("refuses a run that reports no block list at all", () => {
    for (const applied of [undefined, null, "*vercel.live*", {}]) {
      expect(blockedPatternsProblem(applied, patterns), String(applied)).toContain(
        "no blocked-url-patterns",
      );
    }
  });

  it("names what is missing, so the failure is actionable", () => {
    const problem = blockedPatternsProblem(["*vercel.live*"], patterns);
    expect(problem).toContain("*vercel-scripts.com*");
    expect(problem).toContain("*vercel.com/api*");
    expect(problem).not.toContain('missing:   ["*vercel.live*"');
  });
});
