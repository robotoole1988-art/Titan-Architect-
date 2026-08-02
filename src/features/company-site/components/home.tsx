import Link from "next/link";
import {
  CAPABILITIES,
  CONTACT_EMAIL,
  STANDARDS,
  STATUS_BODY,
  STATUS_HEADING,
  TRADE_COUNT,
} from "../model/facts";
import { Prose, Section, SiteFooter, SiteHeader } from "./chrome";

/**
 * TITAN's home page (ADR-064).
 *
 * Two audiences read this page and both are served by the same thing —
 * specificity. A roofer deciding whether to spend money wants to know
 * exactly what arrives; a platform reviewer deciding whether TITAN is a
 * real business wants to know exactly what it does. Vagueness fails both.
 *
 * Every claim here is sourced in `model/facts.ts`. There is no social
 * proof on this page because there is none to show yet, and the section
 * that says so is deliberately not hidden at the bottom.
 */

/** The four beats of the journey, in the customer's experience of them. */
const JOURNEY = [
  {
    step: "01",
    title: "We read what already exists",
    body:
      "Your current site, your Google Business Profile, your listings. You do " +
      "not retype what the world already knows about your business, and " +
      "nothing gets invented to fill a gap we find.",
  },
  {
    step: "02",
    title: "You see it before you commit",
    body:
      "The build is shown to you — what you have now against what TITAN would " +
      "put in its place. Where taste decisions matter, you are shown options " +
      "and asked to point, not asked to choose from descriptions.",
  },
  {
    step: "03",
    title: "One link, about fifteen minutes",
    body:
      "After signing, you get a single checklist built for a phone and one " +
      "free thumb: job photos, customers happy to vouch, the details we read " +
      "back to you for confirmation. That is the whole of your effort.",
  },
  {
    step: "04",
    title: "Live, then continuously worked",
    body:
      "Going live is the beginning. Enquiries land in one place, the " +
      "advertising is tuned against what it actually costs to win a job in " +
      "your area, and you are told what changed and why.",
  },
] as const;

export function CompanyHomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-white/[0.07]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-20%,rgba(251,191,36,0.16),transparent_62%)]"
          />
          <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-24 sm:pb-32 sm:pt-32">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-amber-200/70">
              For UK trade businesses
            </p>
            <h1 className="mt-7 max-w-4xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl">
              The website, the enquiries and the advertising — built and run as
              one system.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/65 sm:text-xl">
              Most trades are sold three separate things by three separate
              people, and none of them can tell you which one won the job.
              TITAN builds your site, captures every enquiry through it, and
              runs the advertising that feeds it — so the question of what is
              working stops being a matter of opinion.
            </p>
            <div className="mt-11 flex flex-wrap items-center gap-4">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#0b0803] transition-colors hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300/70"
              >
                Talk to us
              </a>
              <Link
                href="/advertising"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition-colors hover:border-white/35 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300/70"
              >
                How the advertising works
              </Link>
            </div>
            <p className="mt-10 text-sm text-white/55">
              Built for {TRADE_COUNT} trades — roofing, driveways, electrical,
              solar, landscaping, motor and more.
            </p>
          </div>
        </section>

        {/* ── The problem ──────────────────────────────────────────── */}
        <Section
          id="problem"
          eyebrow="The problem"
          title="You are paying for marketing you cannot evaluate."
        >
          <div className="grid gap-10 sm:grid-cols-3">
            {[
              {
                title: "A website that looks like everyone else's",
                body:
                  "A template with your logo dropped in, indistinguishable " +
                  "from the three competitors who bought the same one.",
              },
              {
                title: "Ad spend with no scoreboard",
                body:
                  "Money leaves every month. Which enquiries it produced, and " +
                  "what each one cost, is nobody's job to tell you.",
              },
              {
                title: "Invoices you cannot check",
                body:
                  "The agency reports on impressions and clicks. You needed " +
                  "to know about jobs, and about which half of it to stop.",
              },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-white/55">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── What TITAN does ──────────────────────────────────────── */}
        <Section
          id="capabilities"
          eyebrow="What TITAN does"
          title="Four things, connected — which is the whole point."
          lead="Each one is more useful because of the others. The site knows what the ads are bidding on. The ads know what the site converts. Nothing is guessed twice."
          tone="raised"
        >
          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2">
            {CAPABILITIES.map((capability) => (
              <div key={capability.title} className="bg-[#06070c] p-8 sm:p-10">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">
                    {capability.title}
                  </h3>
                  {capability.status === "build" ? (
                    <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-wider text-white/55">
                      In build
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-white/55">
                  {capability.body}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── The standard ─────────────────────────────────────────── */}
        <Section
          id="standard"
          eyebrow="The standard"
          title="Everything on your website is true."
          lead="This sounds like table stakes. In this industry it is not, and it is the single thing TITAN is least willing to bend on — including when bending it would make a page look better."
        >
          <ul className="grid gap-12 sm:grid-cols-2">
            {STANDARDS.map((standard) => (
              <li key={standard.title}>
                <h3 className="text-base font-semibold text-white">
                  {standard.title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-white/55">
                  {standard.body}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-14 max-w-2xl text-sm leading-relaxed text-white/55">
            There is a commercial reason as well as a moral one. Under the
            Digital Markets, Competition and Consumers Act 2024, misleading
            claims on a trader&rsquo;s own website are the trader&rsquo;s
            liability. A site that invents an accreditation is not a marketing
            decision — it is an enforcement risk sitting on your domain.
          </p>
        </Section>

        {/* ── How it works ─────────────────────────────────────────── */}
        <Section
          id="how"
          eyebrow="How it works"
          title="Four steps, and about fifteen minutes of your time."
          tone="raised"
        >
          <ol className="grid gap-10 sm:grid-cols-2">
            {JOURNEY.map((beat) => (
              <li
                key={beat.step}
                className="border-l border-amber-300/25 pl-6"
              >
                <p className="text-xs font-medium tracking-[0.2em] text-amber-200/60">
                  {beat.step}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-white">
                  {beat.title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-white/55">
                  {beat.body}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        {/* ── Honest status ────────────────────────────────────────── */}
        <Section id="status" eyebrow="Straight answer" title={STATUS_HEADING}>
          <Prose>
            {STATUS_BODY.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </Prose>
        </Section>

        {/* ── Contact ──────────────────────────────────────────────── */}
        <Section id="contact" tone="raised">
          <div className="rounded-2xl border border-white/[0.08] bg-[#06070c] p-10 sm:p-14">
            <h2
              id="contact-heading"
              className="max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight text-white"
            >
              If you run a trade business and you are tired of guessing, start
              with a conversation.
            </h2>
            <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-white/60">
              No pitch deck. We will look at what you have now, tell you
              honestly whether TITAN would move the needle for you, and say so
              if it would not.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-9 inline-block rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#0b0803] transition-colors hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300/70"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
