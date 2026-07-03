import { NextResponse, type NextRequest } from "next/server";

/**
 * Host-header serving (ADR-027): requests for hosts that are not the TITAN
 * app are rewritten to the internal host resolver, which serves the live
 * publication (custom-domain table first, then the `<slug>.host` convention
 * used for local demos, e.g. http://kerbside-kings.localhost:4100).
 *
 * The TITAN app itself answers on localhost/127.0.0.1 and TITAN_APP_HOST in
 * production (e.g. app.titan.example on Vercel).
 */

const APP_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function middleware(request: NextRequest) {
  const host = (request.headers.get("host") ?? "")
    .split(":")[0]
    .toLowerCase();
  if (!host || APP_HOSTS.has(host) || host === process.env.TITAN_APP_HOST) {
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  if (url.pathname.startsWith("/sites/")) return NextResponse.next();
  // `-host` cannot collide with a slug: slugify never emits leading hyphens.
  // (A `_host` folder would be a Next.js private folder — excluded from routing.)
  url.pathname = `/sites/-host/${host}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Never intercept assets or the API (enquiry POSTs work on customer hosts).
  matcher: ["/((?!_next/|api/|favicon\\.ico).*)"],
};
