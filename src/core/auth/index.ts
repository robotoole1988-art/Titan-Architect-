/**
 * Founder auth v1 (ADR-054) — public API. Pure rules only; the Supabase
 * session plumbing lives in features/auth (server) and src/middleware.ts.
 */

export {
  isFounderEmail,
  isProtectedAppPath,
  type FounderSession,
} from "./model";
