import { NextResponse } from "next/server";
import { keepAliveProbe } from "@/features/mission-control";

/**
 * Supabase keep-alive (ADR-054): hit daily by the Vercel cron
 * (vercel.json) so the free tier never idle-pauses. Thin route — the
 * probe lives with Mission Control. Public but harmless: boolean +
 * timestamp only, never data.
 */
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const result = await keepAliveProbe();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
