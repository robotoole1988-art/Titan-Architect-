/**
 * Founder auth v1 (ADR-054) — public API. Pure rules only; the Supabase
 * session plumbing lives in features/auth (server) and src/middleware.ts.
 */

export {
  isFounderEmail,
  isProtectedAppPath,
  PUBLIC_COMPANY_SITE_PATHS,
  type FounderSession,
} from "./model";
