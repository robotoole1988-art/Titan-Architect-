import { describe, expect, it } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit within the window, then blocks", () => {
    let now = 1_000_000;
    const limiter = createRateLimiter({ windowMs: 60_000, max: 3, now: () => now });
    expect(limiter.allow("1.2.3.4")).toBe(true);
    expect(limiter.allow("1.2.3.4")).toBe(true);
    expect(limiter.allow("1.2.3.4")).toBe(true);
    expect(limiter.allow("1.2.3.4")).toBe(false);
    // A different key is unaffected.
    expect(limiter.allow("5.6.7.8")).toBe(true);
    // The window slides.
    now += 60_001;
    expect(limiter.allow("1.2.3.4")).toBe(true);
  });
});
