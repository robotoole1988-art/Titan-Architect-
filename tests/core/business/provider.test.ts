import { describe, expect, it } from "vitest";
import { resolvePersistenceBackend } from "@/core/business";

describe("persistence backend resolution", () => {
  it("defaults to the in-memory adapter with no configuration", () => {
    expect(resolvePersistenceBackend({})).toBe("memory");
  });

  it("selects supabase only when BOTH server env vars are present", () => {
    expect(
      resolvePersistenceBackend({
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      }),
    ).toBe("supabase");
    expect(
      resolvePersistenceBackend({ SUPABASE_URL: "https://example.supabase.co" }),
    ).toBe("memory");
    expect(
      resolvePersistenceBackend({ SUPABASE_SERVICE_ROLE_KEY: "key" }),
    ).toBe("memory");
  });
});
