import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

/**
 * Architecture boundary enforcement.
 *
 * These rules turn the import rules of the Architecture Charter
 * (docs/architecture/architecture-charter.md) into automated guardrails.
 * A violating import fails lint and the build — not just code review.
 *
 * Layer ranking (imports flow DOWNWARD only):
 *   app → feature → (shared | providers) → core → foundation
 *
 * See ADR-008 for the rationale and worked examples.
 */
const architectureBoundaries = {
  plugins: { boundaries },
  settings: {
    // Only our own source is subject to boundary checks.
    "boundaries/include": ["src/**/*"],
    // Map each folder to an architectural "element" (layer).
    // Folder mode: every file under the matched folder belongs to that element.
    "boundaries/elements": [
      { type: "app", pattern: "src/app", mode: "folder" },
      {
        type: "feature",
        pattern: "src/features/*",
        mode: "folder",
        capture: ["feature"],
      },
      { type: "shared", pattern: "src/components", mode: "folder" },
      { type: "providers", pattern: "src/providers", mode: "folder" },
      { type: "core", pattern: "src/core", mode: "folder" },
      {
        type: "foundation",
        pattern: ["src/lib", "src/config", "src/hooks", "src/types"],
        mode: "folder",
      },
    ],
  },
  rules: {
    "boundaries/dependencies": [
      "error",
      {
        default: "disallow",
        message:
          "Architecture Charter violation: '{{from.type}}' may not import '{{to.type}}'. See docs/architecture/architecture-charter.md (§3 Import rules, §4 Feature isolation).",
        rules: [
          // ── app (routing/composition) ──────────────────────────────────
          // Composes shared UI, providers, and foundation. It may NOT import
          // the kernel (core), so business logic cannot live in app/ — it must
          // reach the kernel through a feature. (Features handled below.)
          {
            from: { type: "app" },
            allow: { to: { type: ["app", "shared", "providers", "foundation"] } },
          },

          // ── feature (vertical domain slice) ────────────────────────────
          // May use its OWN internals (any file within the same feature)…
          {
            from: { type: "feature" },
            allow: {
              to: {
                type: "feature",
                captured: { feature: "{{from.captured.feature}}" },
              },
            },
          },
          // …plus shared UI, providers, the kernel, and the foundation.
          {
            from: { type: "feature" },
            allow: { to: { type: ["shared", "providers", "core", "foundation"] } },
          },

          // ── feature isolation (entry point) ────────────────────────────
          // A feature is a black box to the outside world: app and OTHER
          // features may import it ONLY through its public `index.ts`.
          {
            from: { type: ["app", "feature"] },
            allow: { to: { type: "feature", internalPath: "index.{ts,tsx}" } },
          },

          // ── shared UI & app-wide providers ─────────────────────────────
          // Same tier + downward only.
          {
            from: { type: "shared" },
            allow: { to: { type: ["shared", "providers", "core", "foundation"] } },
          },
          {
            from: { type: "providers" },
            allow: { to: { type: ["shared", "providers", "core", "foundation"] } },
          },

          // ── core (platform kernel) ─────────────────────────────────────
          // Kernel + foundation only.
          {
            from: { type: "core" },
            allow: { to: { type: ["core", "foundation"] } },
          },

          // ── foundation ─────────────────────────────────────────────────
          // Itself only — no upward dependencies whatsoever.
          {
            from: { type: "foundation" },
            allow: { to: { type: "foundation" } },
          },
        ],
      },
    ],
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  architectureBoundaries,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
