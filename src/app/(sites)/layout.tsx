import type { ReactNode } from "react";
import "../globals.css";

/**
 * ROOT layout for PUBLISHED customer sites (ADR-027, multiple-root-layouts
 * pattern). Entirely the customer's page: no TITAN chrome, no OS fonts, no
 * providers — the rendered site brings its own tokens and typography.
 */
export default function SitesLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-svh bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
