import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Test runner configuration. Tests live in `tests/` (mirroring `src/`) and use
 * the same `@/*` path alias as the application code (tsconfig.json).
 */
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
