import Link from "next/link";
import { CONTACT_EMAIL, TRADE_COUNT } from "../model/facts";
import { Prose, Section, SiteFooter, SiteHeader } from "./chrome";

/**
 * The about page (ADR-064).
 *
 * Two jobs: tell a trade owner who they would be dealing with, and give the
 * platform verification processes (Google advertiser verification, Meta
 * business verification) a factual page about the entity to read. Both are
 * served by saying true things precisely — including how early this is.
 */

export function CompanyAboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="border-b border-white/[0.07]">
          <div className="mx-auto max-w-6xl px-6 pb-20 pt-24 sm:pt-28">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-amber-200/70">
              About
            </p>
            <h1 className="mt-7 max-w-3xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
              Built for the trades, by someone who got tired of watching them
              be sold rubbish.
            </h1>
          </div>
        </section>

        <Section id="what" eyebrow="What TITAN is" title="One system, not three suppliers.">
          <Prose>
            <p>
              TITAN is a growth platform for United Kingdom trade businesses.
              It builds a business&rsquo;s website, captures and measures the
              enquiries that come through it, and plans and manages the Google
              Ads campaigns that feed it — as one connected system rather than
              three suppliers who never speak to each other.
            </p>
            <p>
              It works across {TRADE_COUNT} trades, from emergency roofing and
              plumbing through driveways, landscaping, solar and electrical, to
              motor trades and professional services. Each trade is modelled
              separately, because an emergency call-out and a £30,000
              renovation are not the same purchase and pretending otherwise is
              why so much of this industry&rsquo;s output looks identical.
            </p>
            <p>
              The company is based in the United Kingdom and works with UK
              businesses only.
            </p>
          </Prose>
        </Section>

        <Section
          id="stage"
          eyebrow="Where we are"
          title="Early, and saying so."
          tone="raised"
        >
          <Prose>
            <p>
              TITAN is a new company, currently taking on its first customers.
              The website engine, the enquiry pipeline and the Google Ads
              campaign builder run in production. The intelligence layer — the
              part that watches the numbers and tells you what to do next — is
              being built.
            </p>
            <p>
              You will not find customer logos, case studies or testimonials on
              this site, because there are none that are real. TITAN&rsquo;s
              central promise to a customer is that it never puts a claim on
              their website they cannot back. A company that decorated its own
              site with invented proof while selling that promise would not
              deserve to be believed about anything else.
            </p>
            <p>
              When there are results worth showing, they will be named, real,
              and published with the customer&rsquo;s permission.
            </p>
          </Prose>
        </Section>

        <Section id="standards" eyebrow="How we work" title="Rules we do not bend.">
          <Prose>
            <p>
              <strong className="font-semibold text-white/90">
                Nothing is claimed that cannot be backed.
              </strong>{" "}
              Accreditations, reviews, guarantees, prices and years trading
              appear on a customer&rsquo;s site only when the customer holds
              them. This is enforced in the software, not left to somebody
              remembering.
            </p>
            <p>
              <strong className="font-semibold text-white/90">
                Absence is handled honestly.
              </strong>{" "}
              When a business has no photographs yet, or no reviews yet, the
              site says so gracefully instead of being padded with something
              borrowed. A new business is not a problem to be disguised.
            </p>
            <p>
              <strong className="font-semibold text-white/90">
                The customer owns their assets.
              </strong>{" "}
              The domain, the Google Ads account, the Google Business Profile
              and the enquiry history belong to the business. If the
              relationship ends, they leave with them.
            </p>
            <p>
              <strong className="font-semibold text-white/90">
                A person is accountable.
              </strong>{" "}
              No site publishes itself and no campaign starts itself. Software
              does the work; a person is answerable for it.
            </p>
          </Prose>
        </Section>

        <Section id="contact" eyebrow="Contact" title="Get in touch." tone="raised">
          <Prose>
            <p>
              The fastest way to reach TITAN is the contact form on the home
              page — it runs on TITAN&rsquo;s own enquiry capture, and the{" "}
              <Link
                href="/privacy"
                className="text-amber-200/80 underline underline-offset-4 hover:text-amber-100"
              >
                privacy page
              </Link>{" "}
              says exactly what it stores. Email works too, if you would
              rather keep the exchange in your own hands:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-amber-200/80 underline underline-offset-4 hover:text-amber-100"
              >
                write to us directly
              </a>
              .
            </p>
          </Prose>
          <Link
            href="/#contact"
            className="mt-9 inline-block rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#0b0803] transition-colors hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300/70"
          >
            Start the conversation
          </Link>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
