/**
 * The client/server boundary guard (ADR-057 addendum, from the M2
 * verification failure: "Attempted to call typingDurationMs() from the
 * server but typingDurationMs is on the client").
 *
 * Vitest cannot execute the real RSC boundary (directives are inert in
 * node), so this test enforces it STATICALLY: a server-side module of the
 * feature may import ONLY components (PascalCase bindings) from any
 * "use client" module — never functions or values, which throw at runtime
 * when called during server render. The build-time smoke route
 * (src/app/(smoke)/rsc-smoke) is the dynamic half of this guard.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isProtectedAppPath } from "@/core/auth";

const FEATURE_ROOT = join(process.cwd(), "src/features/command-centre");

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? listFiles(join(dir, entry.name))
      : entry.name.match(/\.(ts|tsx)$/)
        ? [join(dir, entry.name)]
        : [],
  );
}

function isClientModule(source: string): boolean {
  return /^\s*["']use client["']/.test(source);
}

/** import { A, b, type C } from "./x" → bindings [A, b] (types dropped). */
function importedBindings(source: string): Array<{ from: string; names: string[] }> {
  const imports: Array<{ from: string; names: string[] }> = [];
  const pattern = /import\s+(?:type\s+)?{([^}]+)}\s+from\s+["']([^"']+)["']/g;
  for (const match of source.matchAll(pattern)) {
    const names = match[1]
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0 && !name.startsWith("type "))
      .map((name) => name.split(/\s+as\s+/)[0].trim());
    imports.push({ from: match[2], names });
  }
  return imports;
}

describe("server modules import only components from client modules (ADR-057)", () => {
  const files = listFiles(FEATURE_ROOT);
  const sources = new Map(files.map((file) => [file, readFileSync(file, "utf8")]));

  function resolve(fromFile: string, spec: string): string | null {
    if (!spec.startsWith(".")) return null;
    const base = join(fromFile, "..", spec);
    for (const candidate of [`${base}.ts`, `${base}.tsx`]) {
      if (sources.has(candidate)) return candidate;
    }
    return null;
  }

  it("model/ and api/ carry no 'use client' directive (server-safe by charter)", () => {
    for (const [file, source] of sources) {
      if (/\/(model|api)\//.test(file)) {
        expect(isClientModule(source), `${file} must stay server-safe`).toBe(false);
      }
    }
  });

  it("no server-side module imports a non-component binding from a client module", () => {
    const violations: string[] = [];
    for (const [file, source] of sources) {
      if (isClientModule(source)) continue; // client→client is fine
      for (const imported of importedBindings(source)) {
        const target = resolve(file, imported.from);
        if (!target || !isClientModule(sources.get(target)!)) continue;
        for (const name of imported.names) {
          if (!/^[A-Z]/.test(name)) {
            violations.push(
              `${file.replace(FEATURE_ROOT, "")} imports "${name}" from client module ${imported.from} — move it to model/ or compute client-side`,
            );
          }
        }
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("the rsc-smoke route stays founder-gated at runtime (middleware deny-by-default)", () => {
    // The (smoke) layout deliberately has no requireFounder so the page can
    // prerender; this pins the claim that the middleware still gates it.
    expect(isProtectedAppPath("/rsc-smoke")).toBe(true);
  });

  it("typingDurationMs lives in the server-safe typing model", () => {
    const typing = sources.get(join(FEATURE_ROOT, "model/typing.ts"));
    expect(typing).toBeDefined();
    expect(typing!).toContain("export function typingDurationMs");
    expect(isClientModule(typing!)).toBe(false);
  });
});
