import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Test runner configuration. Tests live in `tests/` (mirroring `src/`) and use
 * the same `@/*` path alias as the application code (tsconfig.json).
 */
export default defineConfig({
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    environment: "node",
  },
  resolve: {
    alias: {
      // next/font only works inside the Next.js build; see tests/stubs/.
      "next/font/google": path.resolve(__dirname, "tests/stubs/next-font-google.ts"),
      "@": path.resolve(__dirname, "src"),
    },
  },
});
