/**
 * Site chrome: the rendered site's own header and footer, composed from the
 * blueprint's HeaderBlueprint / FooterBlueprint. (Not section primitives —
 * every page carries them.)
 */

import { Phone } from "lucide-react";
import type { WebsiteBlueprint } from "@/core/website-blueprint";
import type { SiteNavLink } from "../model/types";
import { AnnotationTag, Container, SignalCTA, displayFont, monoFont } from "./atoms";

/** Page-collection links (ADR-028) — blueprint navigation drives these. */
function NavLinks({ nav, footer = false }: { nav: SiteNavLink[]; footer?: boolean }) {
  if (nav.length === 0) return null;
  return (
    <nav aria-label={footer ? "Areas we cover" : "Site"}>
      <ul className={`flex flex-wrap items-center ${footer ? "gap-x-5 gap-y-2" : "gap-x-4"}`}>
        {nav.map((link) => (
          <li key={link.pageId}>
            <a
              href={link.href}
              aria-current={link.active ? "page" : undefined}
              className={`text-sm transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 ${link.active ? "" : "opacity-70"}`}
              style={{
                color: link.active ? "var(--wr-accent)" : "var(--wr-ink-muted)",
                outlineColor: "var(--wr-accent)",
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteHeader({
  blueprint,
  nav = [],
}: {
  blueprint: WebsiteBlueprint;
  nav?: SiteNavLink[];
}) {
  const { identity, header } = blueprint;
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <Container wide className="flex items-center justify-between gap-4 py-5">
        <a
          href="#top"
          className="flex flex-col leading-tight focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{ outlineColor: "var(--wr-accent)" }}
        >
          <span
            className="text-lg font-bold tracking-tight"
            style={{ ...displayFont, color: "var(--wr-ink)" }}
          >
            {identity.businessName}
          </span>
          {identity.location && (
            <span
              className="text-[10px] uppercase tracking-[0.22em]"
              style={{ ...monoFont, color: "var(--wr-ink-faint)" }}
            >
              {identity.trade} · {identity.location}
            </span>
          )}
        </a>
        <div className="hidden md:block">
          <NavLinks nav={nav} />
        </div>
        {header.cta?.label && (
          // Long labels wrap into a clumsy pill at phone widths; the hero's
          // own CTA carries conversion there. Short labels ("Call now") stay.
          <span
            className={
              header.cta.label.length > 14 ? "hidden sm:inline-flex" : "inline-flex"
            }
          >
            <SignalCTA href="#callback" size="sm">
              <Phone className="size-3.5" aria-hidden />
              {header.cta.label}
            </SignalCTA>
          </span>
        )}
      </Container>
    </header>
  );
}

export function SiteFooter({
  blueprint,
  nav = [],
}: {
  blueprint: WebsiteBlueprint;
  nav?: SiteNavLink[];
}) {
  const { identity, footer } = blueprint;
  return (
    <footer className="border-t" style={{ borderColor: "var(--wr-line)", background: "var(--wr-bg-raised)" }}>
      <Container wide className="flex flex-col gap-8 py-14">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <span
            className="text-xl font-bold tracking-tight"
            style={{ ...displayFont, color: "var(--wr-ink)" }}
          >
            {identity.businessName}
          </span>
          <div className="flex max-w-md flex-col gap-2.5">
            {(footer.contents ?? []).map((content) => (
              <AnnotationTag key={content}>{content}</AnnotationTag>
            ))}
          </div>
        </div>
        {nav.length > 0 && (
          <div className="flex flex-col gap-3 border-t pt-6" style={{ borderColor: "var(--wr-line)" }}>
            <span
              className="text-[10px] uppercase tracking-[0.22em]"
              style={{ ...monoFont, color: "var(--wr-ink-faint)" }}
            >
              Areas we cover
            </span>
            <NavLinks nav={nav} footer />
          </div>
        )}
        {(footer.legal?.length ?? 0) > 0 && (
          <div
            className="flex flex-wrap gap-x-6 gap-y-2 border-t pt-6 text-[11px] uppercase tracking-[0.16em]"
            style={{ ...monoFont, borderColor: "var(--wr-line)", color: "var(--wr-ink-faint)" }}
          >
            {footer.legal!.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        )}
      </Container>
    </footer>
  );
}
