import { NextResponse, type NextRequest } from "next/server";
import { submitEnquiry } from "@/features/website-renderer";

/**
 * Public enquiry intake (ADR-027). Thin route: parse, hand to the feature
 * (which rate-limits, honeypots, and stores via the core workflow), map the
 * outcome to a response. Never leaks internals.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const clientKey =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const result = await submitEnquiry({
    slug: String(body.slug ?? ""),
    name: String(body.name ?? ""),
    contact: String(body.contact ?? ""),
    message: String(body.message ?? ""),
    sourcePage: String(body.sourcePage ?? "/"),
    website: String(body.website ?? ""),
    clientKey,
  });
  if (!result.ok) {
    return NextResponse.json(
      { ok: false },
      { status: result.reason === "rate_limited" ? 429 : 400 },
    );
  }
  return NextResponse.json({ ok: true });
}
