"use server";

/**
 * Founder sign-in actions (ADR-054). Magic-link only: no password exists
 * anywhere in the platform. The allowlist is enforced BEFORE any email is
 * sent — a non-founder address gets an honest no, not an OTP.
 */

import { redirect } from "next/navigation";
import { isFounderEmail } from "@/core/auth";
import { createAuthClient, supabaseAuthConfigured } from "./server-session";

export interface MagicLinkState {
  ok: boolean;
  message: string;
}

export async function requestMagicLink(
  _previous: MagicLinkState | null,
  formData: FormData,
): Promise<MagicLinkState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!supabaseAuthConfigured()) {
    return {
      ok: false,
      message:
        "Auth is not configured on this server (SUPABASE_ANON_KEY / TITAN_FOUNDER_EMAIL missing).",
    };
  }
  if (!isFounderEmail(email, process.env.TITAN_FOUNDER_EMAIL)) {
    // Founder-only v1: honest refusal, no OTP email to anyone else.
    return {
      ok: false,
      message: "This TITAN instance is founder-only. That address has no access.",
    };
  }
  const supabase = await createAuthClient();
  const origin = process.env.TITAN_APP_ORIGIN ?? "http://localhost:4100";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) {
    return { ok: false, message: `Sign-in link failed: ${error.message}` };
  }
  return {
    ok: true,
    message: `Sign-in link sent to ${email} — it expires in about an hour.`,
  };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/login");
}
