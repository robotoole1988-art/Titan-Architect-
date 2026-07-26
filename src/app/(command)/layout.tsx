import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { siteConfig } from "@/config/site";
import { CommandPalette } from "@/components/layout/command-palette";
import { requireFounder } from "@/features/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `Command Centre · ${siteConfig.name}`,
  description: "The state of the business, addressed to the founder.",
};

/**
 * ROOT layout for the Command Centre (ADR-057; multiple-root-layouts per
 * ADR-022). Layer 1 deliberately loads NO OS chrome — no sidebar, no
 * command bar. The room is dark by construction. Navigation guarantee
 * surfaces mounted here: the ⌘K palette (the rail lives in the page,
 * beside the constellation it complements).
 *
 * AUTH (ADR-054): middleware gates "/", and this layout enforces the
 * founder session again server-side — same defence in depth as (app).
 */
export default async function CommandLayout({ children }: { children: ReactNode }) {
  await requireFounder();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-svh bg-[#020307] text-foreground antialiased">
        {children}
        <CommandPalette />
      </body>
    </html>
  );
}
