import "server-only";

/**
 * Server-side founder session (ADR-054), implementing the ADR-004 seam for
 * real. The browser NEVER runs supabase-js: sign-in is a server action, the
 * session lives in httpOnly cookies (@supabase/ssr), and the anon key never
 * ships in a client bundle — so the RLS lockdown has no client to reach it.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { isFounderEmail, type FounderSession } from "@/core/auth";

export function supabaseAuthConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL &&
      process.env.SUPABASE_ANON_KEY &&
      process.env.TITAN_FOUNDER_EMAIL,
  );
}

/** A request-scoped Supabase client bound to Next's cookie store. */
export async function createAuthClient() {
  const store = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (cookiesToSet) => {
          try {
            for (const { name, value, options } of cookiesToSet) {
              store.set(name, value, options);
            }
          } catch {
            // Server Components may not set cookies; middleware refreshes.
          }
        },
      },
    },
  );
}

/**
 * The current founder session, or null. A VALID Supabase session whose
 * email is not the founder's counts as null (and is actively signed out by
 * the auth callback — see route handler).
 */
export async function getFounderSession(): Promise<FounderSession | null> {
  if (!supabaseAuthConfigured()) return null;
  const supabase = await createAuthClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user || !isFounderEmail(user.email, process.env.TITAN_FOUNDER_EMAIL)) {
    return null;
  }
  return {
    userId: user.id,
    email: user.email!,
    name:
      (user.user_metadata?.full_name as string | undefined) ??
      "Robert O'Toole",
  };
}

/** Layout guard (ADR-004's promised enforcement point): founder or /login. */
export async function requireFounder(): Promise<FounderSession> {
  const session = await getFounderSession();
  if (!session) redirect("/login");
  return session;
}

/**
 * Magic-link completion (the /auth/callback route's whole job): establish
 * the session from EITHER landing shape — `?code=` (the verify-redirect
 * flow) or `?token_hash=` (the SSR-recommended direct flow) — then enforce
 * the founder allowlist AGAIN: a valid session for any other email is
 * signed out on the spot.
 */
export async function completeMagicLinkSignIn(params: {
  code: string | null;
  tokenHash: string | null;
}): Promise<{ destination: string }> {
  const supabase = await createAuthClient();
  let email: string | null | undefined;
  if (params.tokenHash) {
    const { data, error } = await supabase.auth.verifyOtp({
      type: "email",
      token_hash: params.tokenHash,
    });
    if (error) return { destination: "/login?notice=link-expired" };
    email = data.user?.email;
  } else if (params.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) return { destination: "/login?notice=link-expired" };
    email = data.user?.email;
  } else {
    return { destination: "/login?notice=missing-code" };
  }
  if (!isFounderEmail(email, process.env.TITAN_FOUNDER_EMAIL)) {
    await supabase.auth.signOut();
    return { destination: "/login?notice=not-authorised" };
  }
  return { destination: "/dashboard" };
}
