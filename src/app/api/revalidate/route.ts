import { NextResponse, type NextRequest } from "next/server";
import { processTakedownRequest } from "@/features/website-renderer";

/**
 * Remote cache eviction (the serving law, ADR-055 §5). Thin route: read the
 * secret header and optional slug, hand to the feature. Exists so takedowns
 * that start OUTSIDE the app — scripts/unpublish-site.mjs — can evict the
 * edge cache the moment the publication row flips, instead of waiting for
 * the hourly backstop or a redeploy. Fail-closed: no configured
 * TITAN_REVALIDATE_SECRET means 503, never an open endpoint.
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let slug: unknown;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    slug = body.slug;
  } catch {
    slug = undefined; // Empty body is fine: it means "every site".
  }
  const outcome = processTakedownRequest(
    request.headers.get("x-titan-revalidate-secret"),
    slug,
  );
  return NextResponse.json(outcome.body, { status: outcome.status });
}
