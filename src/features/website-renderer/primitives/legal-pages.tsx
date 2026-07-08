/**
 * legal.privacy-policy + legal.legal-notice (ADR-045).
 *
 * Crafted, registry-keyed UK legal pages. The component holds the standard
 * scaffolding — section headings, the rights enumeration, the "baseline, not
 * legal advice" disclaimer; the business specifics ride in from content slots
 * (populated by the builder from real business data). The controller CONTACT is
 * the real Business contact, plumbed in as a prop — or an honest placeholder
 * when absent. No fabricated registration or business details, ever.
 */

import type { PrimitiveSectionProps } from "../model/types";
import { splitList } from "../model/slots";
import { Container, Eyebrow, SectionShell, SectionTitle, displayFont } from "./atoms";

const DISCLAIMER =
  "This is a standard baseline written to a common UK template — it is not legal advice. For wording specific to your business and how it operates, take advice from a solicitor.";

/** One titled legal section: a heading and a paragraph of real copy. */
function LegalSection({ heading, body }: { heading: string; body?: string }) {
  if (!body) return null;
  return (
    <section className="flex flex-col gap-2.5">
      <h2
        className="text-lg font-semibold"
        style={{ ...displayFont, color: "var(--wr-ink)", letterSpacing: "-0.01em" }}
      >
        {heading}
      </h2>
      <p className="text-pretty" style={{ lineHeight: 1.7, color: "var(--wr-ink-muted)" }}>
        {body}
      </p>
    </section>
  );
}

/** The page frame: eyebrow, title, lead line, sections, and the disclaimer. */
function LegalPageShell({
  section,
  title,
  lead,
  children,
}: {
  section: PrimitiveSectionProps["section"];
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <SectionShell section={section} defer={false}>
      <Container>
        <div className="mx-auto flex max-w-[46rem] flex-col gap-10">
          <header className="flex flex-col gap-3">
            <Eyebrow>Legal</Eyebrow>
            <SectionTitle id={`${section.id}-title`} as="h1" size="var(--wr-text-2xl)">
              {title}
            </SectionTitle>
            <p style={{ fontSize: "var(--wr-text-lg)", lineHeight: 1.6, color: "var(--wr-ink-muted)" }}>
              {lead}
            </p>
          </header>
          <div className="flex flex-col gap-8">{children}</div>
          <p
            className="rounded-[var(--wr-radius)] border p-4 text-sm"
            style={{
              borderColor: "var(--wr-line)",
              background: "var(--wr-bg-raised)",
              color: "var(--wr-ink-faint)",
              lineHeight: 1.6,
            }}
          >
            {DISCLAIMER}
          </p>
        </div>
      </Container>
    </SectionShell>
  );
}

/** The real controller contact, or an honest placeholder. */
function contactLine(
  slotContact: string | undefined,
  contact: PrimitiveSectionProps["contact"],
): string {
  const parts: string[] = [];
  if (contact?.email) parts.push(`email ${contact.email}`);
  if (contact?.phone) parts.push(`phone ${contact.phone}`);
  const detail = parts.length > 0 ? parts.join(", ") : "[contact details to be confirmed]";
  return `${slotContact ?? "For any of the above, get in touch"} — ${detail}.`;
}

export function LegalPrivacyPolicy({ section, slots, contact }: PrimitiveSectionProps) {
  return (
    <LegalPageShell
      section={section}
      title="Privacy Policy"
      lead={slots.controller ?? "How your information is handled on this site."}
    >
      <LegalSection heading="What we collect" body={slots.collected} />
      <LegalSection heading="Why we use it" body={slots.purpose} />
      <LegalSection heading="Our lawful basis" body={slots["lawful-basis"]} />
      <LegalSection heading="How long we keep it" body={slots.retention} />
      {slots.rights && (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-lg font-semibold" style={{ ...displayFont, color: "var(--wr-ink)", letterSpacing: "-0.01em" }}>
            Your rights
          </h2>
          <p style={{ color: "var(--wr-ink-muted)", lineHeight: 1.6 }}>
            Under UK GDPR you have the right to:
          </p>
          <ul className="grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
            {splitList(slots.rights).map((right) => (
              <li key={right} className="flex items-start gap-2" style={{ color: "var(--wr-ink)" }}>
                <span aria-hidden style={{ color: "var(--wr-accent)" }}>
                  •
                </span>
                {right}
              </li>
            ))}
          </ul>
        </section>
      )}
      <LegalSection heading="Cookies & tracking" body={slots.cookies} />
      <LegalSection heading="Who runs this site" body={slots.processor} />
      <LegalSection heading="Contact" body={contactLine(slots.contact, contact)} />
    </LegalPageShell>
  );
}

export function LegalNotice({ section, slots, contact }: PrimitiveSectionProps) {
  return (
    <LegalPageShell
      section={section}
      title="Terms & Legal Notice"
      lead={slots.identity ?? "The terms of using this website."}
    >
      <LegalSection heading="Using this site" body={slots["service-terms"]} />
      <LegalSection heading="Liability" body={slots.liability} />
      <LegalSection heading="Governing law" body={slots["governing-law"]} />
      <LegalSection heading="Contact" body={contactLine(slots.contact, contact)} />
    </LegalPageShell>
  );
}
