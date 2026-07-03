/**
 * A minimal sliding-window in-memory rate limiter (ADR-027 anti-spam basics).
 * Per-process only — adequate for v1's single-instance serving; swap for a
 * shared store when the serving tier scales out.
 */

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  /** Injectable clock for tests. */
  now?: () => number;
}

export interface RateLimiter {
  /** True when the key may proceed; false when over the limit. */
  allow(key: string): boolean;
}

export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
  const now = options.now ?? Date.now;
  const hits = new Map<string, number[]>();

  return {
    allow(key: string): boolean {
      const cutoff = now() - options.windowMs;
      const recent = (hits.get(key) ?? []).filter((at) => at > cutoff);
      if (recent.length >= options.max) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now());
      hits.set(key, recent);
      return true;
    },
  };
}
