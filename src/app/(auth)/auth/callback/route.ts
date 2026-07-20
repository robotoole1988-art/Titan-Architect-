import { NextResponse, type NextRequest } from "next/server";
import { completeMagicLinkSignIn } from "@/features/auth";

/**
 * Magic-link landing (ADR-054). Thin route: the session establishment, the
 * founder allowlist re-check, and the sign-out of anyone else all live
 * with the auth feature. Handles both landing shapes (?code / ?token_hash).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { destination } = await completeMagicLinkSignIn({
    code: request.nextUrl.searchParams.get("code"),
    tokenHash: request.nextUrl.searchParams.get("token_hash"),
  });
  return NextResponse.redirect(`${request.nextUrl.origin}${destination}`);
}
