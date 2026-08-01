import Link from "next/link";
import type { ReactNode } from "react";
import { CONTACT_EMAIL } from "../model/facts";

/**
 * The company site's chrome (ADR-064).
 *
 * Server components throughout, no client boundary anywhere on this site:
 * a marketing page that ships a hydration bundle to say four things is the
 * exact sin TITAN charges customers to fix. Navigation is links.
 *
 * The palette is deliberately NOT the renderer's `--wr-*` token set. Those
 * tokens belong to the archetype registers and are scoped to a rendered
 * customer site; TITAN's own face is its own, and the boundary rules keep
 * the two from leaking into each other.
 */

const NAV = [
  { href: "/advertising", label: "Advertising" },
  { href: "/about", label: "About" },
] as const;

export function Wordmark({ muted = false }: { muted?: boolean }) {
  return (
    <span
      className={`text-[0.95rem] font-semibold tracking-[0.28em] ${
        muted ? "text-white/55" : "text-white"
      }`}
    >
      TITAN
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#05060a]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300/70">
          <Wordmark />
          <span className="sr-only">TITAN — home</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-7 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300/70"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="rounded-full border border-amber-300/30 bg-amber-300/[0.07] px-4 py-1.5 text-amber-100 transition-colors hover:border-amber-300/60 hover:bg-amber-300/[0.14] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300/70"
          >
            Get in touch
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#04050a]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-4 text-sm leading-relaxed text-white/45">
              The growth platform for UK trade businesses — the website, the
              enquiries and the advertising, run as one system.
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-col gap-3 text-sm">
            <Link href="/advertising" className="text-white/55 hover:text-white">
              Advertising
            </Link>
            <Link href="/about" className="text-white/55 hover:text-white">
              About
            </Link>
            <Link href="/privacy" className="text-white/55 hover:text-white">
              Privacy
            </Link>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-white/55 hover:text-white"
            >
              {CONTACT_EMAIL}
            </a>
            <Link href="/login" className="text-white/30 hover:text-white/60">
              Sign in
            </Link>
          </nav>
        </div>
        {/*
          Meta's business verification and Google's advertiser verification
          both read the legal entity off this line, so it stays factual and
          gets updated the day incorporation completes — not before.
        */}
        <p className="mt-12 border-t border-white/[0.06] pt-8 text-xs text-white/30">
          TITAN is a United Kingdom business. Registered company details will
          appear here once incorporation completes.
        </p>
      </div>
    </footer>
  );
}

/** A page section with a consistent rhythm and a labelled landmark. */
export function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
  tone = "base",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  lead?: string;
  children?: ReactNode;
  tone?: "base" | "raised";
}) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={tone === "raised" ? "bg-white/[0.02]" : undefined}
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        {eyebrow ? (
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.24em] text-amber-200/70">
            {eyebrow}
          </p>
        ) : null}
        {title ? (
          <h2
            id={headingId}
            className="max-w-3xl text-balance text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:text-4xl"
          >
            {title}
          </h2>
        ) : null}
        {lead ? (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
            {lead}
          </p>
        ) : null}
        {children ? <div className="mt-14">{children}</div> : null}
      </div>
    </section>
  );
}

/** Body copy at a readable measure, for the prose-heavy pages. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-2xl space-y-6 text-[1.0625rem] leading-relaxed text-white/65">
      {children}
    </div>
  );
}
