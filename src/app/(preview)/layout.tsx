import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    default: `Website Preview · ${siteConfig.name}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: "Rendered website preview, composed from the Website Blueprint.",
};

/**
 * ROOT layout for full-screen website previews (multiple-root-layouts
 * pattern, ADR-022). Deliberately lean: no app shell, no OS fonts, no
 * providers — nothing sits between the rendered website and its first paint.
 * The theme class is fixed to dark; the rendered site brings its own tokens
 * and typography.
 */
export default function PreviewLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-svh bg-background text-foreground antialiased">
        <div className="flex min-h-svh flex-col">{children}</div>
      </body>
    </html>
  );
}
