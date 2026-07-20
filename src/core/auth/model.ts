/**
 * Founder auth v1 (ADR-054) — the pure rules.
 *
 * One founder, allowlisted by email. Everything here is deterministic and
 * Next-free so the middleware gate and the server session helpers share one
 * tested source of truth. The Supabase plumbing lives in features/auth and
 * src/middleware.ts; THIS module decides who counts and what is protected.
 */

/** The authenticated founder, as the app sees them. */
export interface FounderSession {
  userId: string;
  email: string;
  name: string;
}

/**
 * The allowlist check. v1 is founder-only: exactly one email, compared
 * case-insensitively and trimmed. No allowlist configured → NOBODY passes
 * (deny-by-default, never open-by-accident).
 */
export function isFounderEmail(
  email: string | null | undefined,
  founderEmail: string | undefined,
): boolean {
  if (!email || !founderEmail) return false;
  return email.trim().toLowerCase() === founderEmail.trim().toLowerCase();
}

/**
 * Route classification for the auth gate (ADR-054).
 *
 * PUBLIC (cookieless — the middleware must never touch auth or Set-Cookie
 * here, keeping the sites' no-tracking-cookies claim true):
 * - `/sites/*` — published customer sites (slug + hostname serving)
 * - `/login`, `/auth/*` — the door itself
 * - `/api/*` — enquiry submit, metrics beacon, media streaming, keepalive
 *   (the middleware matcher already excludes /api, listed here for tests)
 *
 * Everything else on an APP host is the internal OS and requires the
 * founder session.
 */
export function isProtectedAppPath(pathname: string): boolean {
  if (pathname === "/login" || pathname.startsWith("/login/")) return false;
  if (pathname.startsWith("/auth/")) return false;
  if (pathname.startsWith("/sites/")) return false;
  if (pathname.startsWith("/api/")) return false;
  if (pathname.startsWith("/_next/") || pathname === "/favicon.ico") return false;
  return true;
}
