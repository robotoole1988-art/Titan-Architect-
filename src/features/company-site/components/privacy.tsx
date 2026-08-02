import { CONTACT_EMAIL } from "../model/facts";
import { Prose, Section, SiteFooter, SiteHeader } from "./chrome";

/**
 * The privacy notice (ADR-064) — for THIS WEBSITE ONLY.
 *
 * Deliberately narrow. It describes what titan-architect.vercel.app does
 * with a visitor's data, which is very close to nothing, and it says so in
 * terms that are checkable against the code: no analytics package is
 * installed, no cookie is set on a public path (the auth middleware returns
 * early before it can touch one), and there is no form to submit.
 *
 * It is NOT the customer data-processing terms. Those govern personal data
 * TITAN processes on behalf of a client business — enquiry records, call
 * data, review attestations — and are being drafted with a solicitor. Every
 * sentence here scopes itself to the marketing site so the two can never be
 * confused, and so this page never has to be quietly walked back.
 */

export function CompanyPrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="border-b border-white/[0.07]">
          <div className="mx-auto max-w-6xl px-6 pb-16 pt-24 sm:pt-28">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-amber-200/70">
              Privacy
            </p>
            <h1 className="mt-7 max-w-3xl text-balance text-4xl font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl">
              What this website does with your data.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/65">
              Almost nothing, and this page exists to be specific about it
              rather than reassuring about it.
            </p>
          </div>
        </section>

        <Section id="site" eyebrow="This website" title="No tracking, no cookies, no form.">
          <Prose>
            <p>
              These pages carry no analytics, no advertising tags and no
              third-party tracking scripts. No cookie is set when you browse
              them.
            </p>
            <p>
              There is no contact form. The only way to contact TITAN from this
              site is by email, which means the decision to send your details,
              and which details to send, stays entirely with you.
            </p>
            <p>
              If you do email us, we hold that correspondence in order to reply
              to you and, if we go on to work together, to keep a record of what
              was agreed. We do not add you to a mailing list and we do not pass
              your details to anyone else. Ask us to delete the correspondence
              and we will, unless we are required to keep it.
            </p>
            <p>
              This site is hosted on infrastructure that keeps standard server
              logs, including IP addresses, for security and operational
              purposes. That is a function of the hosting, not something TITAN
              reads or analyses.
            </p>
          </Prose>
        </Section>

        <Section
          id="scope"
          eyebrow="What this page is not"
          title="Customer data is governed separately."
          tone="raised"
        >
          <Prose>
            <p>
              This notice covers this website only. Personal data that TITAN
              processes on behalf of a client business — enquiries submitted
              through that business&rsquo;s own website, and the records
              attached to them — is governed by the agreement between TITAN and
              that business, not by this page.
            </p>
            <p>
              Those terms are being prepared with legal advisers. If you are a
              prospective customer and want to see them before committing, ask
              and we will send you what exists at the time you ask, including
              where it is still in draft.
            </p>
          </Prose>
        </Section>

        <Section id="rights" eyebrow="Your rights" title="Getting in touch about your data.">
          <Prose>
            <p>
              Under UK data protection law you have the right to ask what
              personal data we hold about you, to have it corrected, to have it
              erased in certain circumstances, and to complain to the
              Information Commissioner&rsquo;s Office if you are unhappy with
              how we have handled it.
            </p>
            <p>
              For anything on this page, or to make such a request, email{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-amber-200/80 underline underline-offset-4 hover:text-amber-100"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Prose>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
