/**
 * ADR-057 §6 — the room's containing-block law.
 *
 * Every fixed-position element of the Command Centre lives inside the
 * `.cc-room` wrapper. If the wrapper carries a transform — even a keyframe
 * that fills to `none` — it becomes the containing block for all of them
 * and the room collapses into the top of the page. Chromium keeps the
 * containing block after a forwards-filled transform animation completes,
 * so the collapse is permanent, not a flicker (measured live on the first
 * production deploy, 2026-07-26).
 *
 * Vitest cannot run a compositor, so the law is enforced statically: the
 * wrapper's own declarations and every keyframe it animates with may not
 * touch transform or any other containing-block-forming property.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

const CONTAINING_BLOCK_PROPS =
  /\b(transform|translate|rotate|scale|filter|backdrop-filter|perspective|will-change|contain)\s*:/;

/** Bodies of every innermost rule whose selector list names .cc-room. */
function roomRuleBodies(): string[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter((match) =>
      match[1]
        .split(",")
        .some((selector) => selector.trim().split(/\s+/).pop() === ".cc-room"),
    )
    .map((match) => match[2]);
}

function keyframesBody(name: string): string {
  const at = css.search(new RegExp(`@keyframes\\s+${name}\\s*\\{`));
  expect(at, `@keyframes ${name} exists`).toBeGreaterThanOrEqual(0);
  const open = css.indexOf("{", at);
  let depth = 0;
  let index = open;
  while (index < css.length) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") depth -= 1;
    index += 1;
    if (depth === 0) break;
  }
  return css.slice(open, index);
}

describe("the room wrapper never becomes a containing block (ADR-057 §6)", () => {
  const bodies = roomRuleBodies();

  it("finds the .cc-room rules", () => {
    expect(bodies.length).toBeGreaterThan(0);
  });

  it("declares no containing-block-forming property on .cc-room", () => {
    for (const body of bodies) {
      // The reduced-motion reset `transform: none` is the one legal form.
      const stripped = body.replace(/transform\s*:\s*none\s*;?/g, "");
      expect(stripped).not.toMatch(CONTAINING_BLOCK_PROPS);
    }
  });

  it("animates the room with opacity-only keyframes", () => {
    const names = bodies
      .flatMap((body) => [...body.matchAll(/animation:\s*([a-z-]+)/gi)])
      .map((match) => match[1])
      .filter((name) => name !== "none");
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(keyframesBody(name)).not.toMatch(CONTAINING_BLOCK_PROPS);
    }
  });
});
