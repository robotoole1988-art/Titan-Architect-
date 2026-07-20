import "server-only";

/**
 * Supabase keep-alive probe (ADR-054): one trivial read so the daily
 * Vercel cron counts as activity against the free tier's ~7-day idle
 * pause. Returns only a boolean — never data. Lives in Mission Control
 * because uptime is an operations concern, and thin app routes may only
 * import features (charter §3).
 */

import { resolveBusinessSpine } from "@/core/business";

export interface KeepAliveResult {
  ok: boolean;
  at: string;
  error?: string;
}

export async function keepAliveProbe(): Promise<KeepAliveResult> {
  const at = new Date().toISOString();
  try {
    const spine = await resolveBusinessSpine();
    await spine.businesses.list();
    return { ok: true, at };
  } catch (error) {
    return {
      ok: false,
      at,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
