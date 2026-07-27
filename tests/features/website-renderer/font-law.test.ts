import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The media law §4: fonts ≤100KB, "max 2 woff2, preloaded".
 *
 * next/font decides preloading at BUILD time, per import — it cannot be made
 * conditional on the theme a page happens to render. And this module is
 * imported by every published site. So every non-preload:false family here is
 * fetched on every page of every trade, whether that trade's theme can render
 * it or not.
 *
 * That is not theoretical. Measured on the live emergency-roofing site:
 * 4 font files, 118KB against a 100KB budget, 3 of them preloaded — including
 * Fraunces, the care-archetype serif, which a roofing theme can never display.
 *
 * A runtime test cannot see this (next/font is stubbed outside the Next
 * build), so the law is enforced where the decision is actually made: the
 * source. Adding a fifth face is fine; adding a third PRELOADED one is a
 * budget change and needs an ADR.
 */

const FONTS = readFileSync(
  join(process.cwd(), "src/features/website-renderer/theme/fonts.ts"),
  "utf8",
);

/** Each `Family({ … })` call in the module, with its options block. */
function fontCalls(): Array<{ family: string; options: string }> {
  const calls: Array<{ family: string; options: string }> = [];
  const re = /=\s*([A-Z][A-Za-z_]*)\(\{([\s\S]*?)\n\}\);/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(FONTS)) !== null) {
    calls.push({ family: match[1], options: match[2] });
  }
  return calls;
}

describe("the font law — at most two faces on the critical path", () => {
  it("finds every font declaration (the scan itself works)", () => {
    const families = fontCalls().map((call) => call.family);
    expect(families.length).toBeGreaterThanOrEqual(4);
    expect(families).toContain("Bricolage_Grotesque");
    expect(families).toContain("Fraunces");
  });

  it("preloads NO MORE THAN TWO families", () => {
    const preloaded = fontCalls().filter(
      (call) => !/preload:\s*false/.test(call.options),
    );
    expect(
      preloaded.map((call) => call.family),
      "media law §4 allows two preloaded woff2; raising that needs an ADR",
    ).toHaveLength(2);
  });

  it("keeps the care-archetype serif off every other trade's critical path", () => {
    const serif = fontCalls().find((call) => call.family === "Fraunces");
    expect(serif, "Fraunces must still be declared — care sites need it").toBeDefined();
    expect(
      /preload:\s*false/.test(serif!.options),
      "Fraunces is imported by every published site; preloading it costs ~36KB on trades that cannot render it",
    ).toBe(true);
  });

  it("never lets a face swap mid-view — display:optional, so no CLS", () => {
    for (const call of fontCalls()) {
      expect(
        /display:\s*"optional"/.test(call.options),
        `${call.family} must use display:"optional" — a late swap re-wraps the display headline`,
      ).toBe(true);
    }
  });
});
