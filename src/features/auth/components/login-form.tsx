"use client";

/**
 * The real login form (ADR-054): founder-only magic link. No password
 * field exists because no password exists. Server action does the work;
 * the browser never touches Supabase directly.
 */

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestMagicLink, type MagicLinkState } from "../api/actions";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState<MagicLinkState | null, FormData>(
    requestMagicLink,
    null,
  );

  return (
    <form action={action} className="space-y-3">
      {notice && (
        <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
          {notice}
        </p>
      )}
      <Input
        type="email"
        name="email"
        required
        placeholder="founder email"
        aria-label="Email"
        autoComplete="email"
      />
      <Button className="w-full" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Email me a sign-in link"}
      </Button>
      {state && (
        <p
          className={`rounded-lg border px-3 py-2 text-xs ${
            state.ok
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
              : "border-rose-400/30 bg-rose-400/10 text-rose-300"
          }`}
          role="status"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
