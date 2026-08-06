import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../globals.css";

export const metadata: Metadata = {
  title: "Example site — TITAN",
  robots: { index: false },
};

/**
 * ROOT layout for the generator demo (PRD-007 §3.5, multiple-root-layouts
 * pattern as (preview)/(sites)). Deliberately lean: no app shell, no OS
 * fonts, no providers — this document is the flagship's iframe content and
 * a standalone proof, and nothing may sit between the generated site and
 * its first paint. Never indexed, at layout level as well as per page.
 */
export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-svh bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
