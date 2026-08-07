import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

/**
 * ROOT layout for TITAN's public company site (ADR-064; multiple root
 * layouts per ADR-022).
 *
 * This is the one route group an anonymous visitor can reach on an app host,
 * so it loads nothing that assumes a session: no `requireFounder()`, no
 * command palette, no OS chrome. It also loads no client component at all —
 * the whole site is static markup, which is how a page that sells a mobile
 * performance floor ought to behave.
 *
 * Only the display face is loaded. `Geist_Mono` is deliberately absent: the
 * marketing pages have no code on them, and an unused family is bytes a
 * visitor pays for to render nothing.
 */

const DESCRIPTION =
  "TITAN builds and runs the digital presence of UK trade businesses — the " +
  "website, the enquiries and the Google Ads that feed it, as one system.";

export const metadata: Metadata = {
  metadataBase: new URL("https://titan-architect.vercel.app"),
  title: {
    default: "TITAN — the growth platform for UK trade businesses",
    template: "%s · TITAN",
  },
  description: DESCRIPTION,
  applicationName: "TITAN",
  openGraph: {
    type: "website",
    siteName: "TITAN",
    title: "TITAN — the growth platform for UK trade businesses",
    description: DESCRIPTION,
    locale: "en_GB",
  },
  twitter: { card: "summary", title: "TITAN", description: DESCRIPTION },
  robots: { index: true, follow: true },
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-svh bg-[#05060a] font-sans text-white antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-50 focus:rounded-full focus:bg-[#7fa8ff] focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#071022]"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
