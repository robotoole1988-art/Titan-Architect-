import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isFounderEmail, isProtectedAppPath } from "@/core/auth";

/**
 * Two jobs, strictly separated (ADR-027 + ADR-054):
 *
 * 1. Host-header serving (ADR-027): requests for hosts that are not the
 *    TITAN app are rewritten to the internal host resolver, which serves
 *    the live publication. CUSTOMER HOSTS NEVER TOUCH AUTH — no session
 *    read, no Set-Cookie, ever. The published sites' no-tracking-cookies
 *    claim depends on this.
 *
 * 2. The founder gate (ADR-054): on APP hosts, every internal route
 *    requires the founder session. Public app paths (/sites/*, /login,
 *    /auth/*) pass through cookieless; /api/* is excluded by the matcher.
 */

const APP_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isAppHost(host: string): boolean {
  return (
    !host ||
    APP_HOSTS.has(host) ||
    host === process.env.TITAN_APP_HOST ||
    // Vercel deployment URLs are the app (production + previews).
    host.endsWith(".vercel.app")
  );
}

export async function middleware(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();

  // --- Customer-domain serving (ADR-027). Cookieless by construction.
  if (!isAppHost(host)) {
    const url = request.nextUrl.clone();
    if (url.pathname.startsWith("/sites/")) return NextResponse.next();
    // `-host` cannot collide with a slug: slugify never emits leading hyphens.
    url.pathname = `/sites/-host/${host}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // --- Public app paths stay cookieless (the door, the sites, assets).
  if (!isProtectedAppPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // --- The founder gate. Missing config = locked (deny-by-default).
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const founderEmail = process.env.TITAN_FOUNDER_EMAIL;
  if (!supabaseUrl || !anonKey || !founderEmail) {
    return NextResponse.redirect(new URL("/login?notice=auth-unconfigured", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        // Session refresh: mirror onto the request (for downstream RSC
        // reads) and the response (for the browser).
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isFounderEmail(user.email, founderEmail)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return response;
}

export const config = {
  // Never intercept assets or the API (enquiry POSTs work on customer hosts).
  matcher: ["/((?!_next/|api/|favicon\\.ico).*)"],
};
