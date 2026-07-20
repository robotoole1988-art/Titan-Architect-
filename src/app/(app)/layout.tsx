import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { AppProviders } from "@/providers";
import { siteConfig } from "@/config/site";
import { AppShell } from "@/components/layout/app-shell";
import { requireFounder, signOutAction } from "@/features/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

/**
 * ROOT layout for the protected application (multiple-root-layouts pattern:
 * each top-level route group owns its own <html>; the website-preview group
 * deliberately loads none of the OS chrome — see ADR-022). Every page in
 * this group is wrapped in the shell (sidebar + command bar).
 *
 * AUTH (ADR-054, delivering ADR-004's seam): the middleware gates every
 * internal route; this layout enforces the founder session AGAIN server-side
 * (defense in depth) and hands the real user to the providers.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await requireFounder();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-svh bg-background text-foreground antialiased">
        <AppProviders
          user={{ id: session.userId, name: session.name, email: session.email }}
          onSignOut={signOutAction}
        >
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
