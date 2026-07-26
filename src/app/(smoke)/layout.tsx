import type { ReactNode } from "react";
import "../globals.css";

/**
 * ROOT layout for the RSC smoke group (ADR-057 addendum — the M2 process
 * fix). DELIBERATELY carries no requireFounder: this group's one page must
 * PRERENDER at build time so `next build` executes the Command Centre
 * through the real server-component pipeline (a cookie-reading auth guard
 * would force it dynamic and defeat the smoke). Runtime access is still
 * founder-gated by the middleware's deny-by-default (isProtectedAppPath
 * covers every non-public path, /rsc-smoke included) — verified by test.
 * Never add a public path exemption for this group.
 */
export default function SmokeLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <body>{children}</body>
    </html>
  );
}
