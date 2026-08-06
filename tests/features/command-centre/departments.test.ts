/**
 * The room's cast list is honest (approved 2026-08-06): nine departments,
 * every live orb backed by a real route, every forming orb doorless
 * (no fake doors, ADR-034).
 */

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { COMMAND_DEPARTMENTS } from "@/features/command-centre/model/departments";

/** Every routable path in src/app, with route groups stripped. */
function appRoutes(): Set<string> {
  const routes = new Set<string>();
  const walk = (dir: string, segments: string[]): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const isGroup = entry.name.startsWith("(") && entry.name.endsWith(")");
        walk(join(dir, entry.name), isGroup ? segments : [...segments, entry.name]);
      } else if (entry.name === "page.tsx") {
        routes.add(`/${segments.join("/")}`);
      }
    }
  };
  walk(join(process.cwd(), "src/app"), []);
  return routes;
}

describe("the nine departments (Command Centre cast list)", () => {
  it("names the founder's nine, once each, in room order", () => {
    expect(COMMAND_DEPARTMENTS.map((dept) => dept.name)).toEqual([
      "Marketing",
      "SEO",
      "Automation",
      "Customer Relations",
      "Sales",
      "Website AI",
      "Reception",
      "Finance",
      "Operations",
    ]);
    expect(new Set(COMMAND_DEPARTMENTS.map((dept) => dept.id)).size).toBe(9);
  });

  it("gives every orb its own colour", () => {
    expect(new Set(COMMAND_DEPARTMENTS.map((dept) => dept.hue)).size).toBe(9);
  });

  it("backs every door with a real route, and forming departments have none", () => {
    const routes = appRoutes();
    for (const dept of COMMAND_DEPARTMENTS) {
      if (dept.status === "forming") {
        expect(dept.room, `${dept.id} is forming — no fake doors`).toBeNull();
      }
      if (dept.room !== null) {
        expect(routes.has(dept.room), `${dept.id} → ${dept.room} must exist`).toBe(
          true,
        );
      }
    }
  });

  it("reports health only through real health-engine departments, one orb per gauge", () => {
    const engine = new Set([
      "enquiries",
      "pipeline",
      "delivery",
      "experience",
      "measurement",
    ]);
    const claimed = COMMAND_DEPARTMENTS.map((dept) => dept.healthKey).filter(
      (key): key is NonNullable<typeof key> => key !== null,
    );
    for (const key of claimed) {
      expect(engine.has(key), `${key} is not a health-engine department`).toBe(true);
    }
    expect(new Set(claimed).size).toBe(claimed.length);
  });

  it("stands four on the left flank, five on the right", () => {
    expect(COMMAND_DEPARTMENTS.filter((dept) => dept.side === "left")).toHaveLength(4);
    expect(COMMAND_DEPARTMENTS.filter((dept) => dept.side === "right")).toHaveLength(5);
  });
});
