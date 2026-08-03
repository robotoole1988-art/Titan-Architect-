import Link from "next/link";
import { CONTACT_EMAIL } from "../model/facts";
import { Prose, Section, SiteFooter, SiteHeader } from "./chrome";

/**
 * The advertising page (ADR-064).
 *
 * This page has an unusual second job. Google's Ads API review reads a
 * company's website to decide whether the applicant is a real business with
 * a real use case, and the application TITAN filed
 * (docs/growth/TITAN-API-Applications-Pack.md) describes campaign creation,
 * budget management and performance reporting for client accounts held under
 * TITAN's manager account. The first application was returned incomplete on
 * 23 July 2026 for exactly one reason: the site described none of it.
 *
 * So the page states the operating model plainly — whose account, whose
 * money, what is automated, what is not, and what changes when API access is
 * granted. Every sentence must stay true of what TITAN actually does; this is
 * the page a reviewer will hold the application form against, and the two
 * disagreeing is worse than either being thin.
 *
 * It is not a compliance artefact bolted on. Showing the working is the
 * argument to the customer too: a trade owner who has been billed for
 * "digital marketing" for two years has never been shown any of this.
 */

const PIPELINE = [
  {
    title: "What a lead is worth where you are",
    body:
      "Before a keyword is written, TITAN works from cost-per-lead and " +
      "cost-per-click intelligence for your trade — what roofing costs to " +
      "advertise against what a driveway costs, and how both move with the " +
      "season and the weather. Budgets start from your job values and your " +
      "appetite for work, not from a round number.",
  },
  {
    title: "The campaign is assembled, not improvised",
    body:
      "Your services from the trade taxonomy, crossed with the areas you " +
      "cover, crossed with how customers in your trade actually search — " +
      "urgent, or researching a price, or comparing installers. That produces " +
      "the ad groups, the keywords and their match types, and the negatives " +
      "you should never pay for. The same inputs always produce the same plan; " +
      "nothing is left to a language model's mood.",
  },
  {
    title: "Ad copy comes from your site, not from a template",
    body:
      "Headlines and descriptions are drawn from the strategy your website was " +
      "built on, so the promise in the ad is the promise on the page someone " +
      "lands on. Anything over Google's character limits is dropped rather " +
      "than truncated — a half-sentence headline is worse than one fewer.",
  },
  {
    title: "It is checked before it can spend",
    body:
      "Every plan is validated before launch: character limits, keyword " +
      "hygiene, and that each landing URL actually exists on your live site. " +
      "The check reports every problem at once rather than the first. " +
      "Campaigns are created paused, and a person starts them.",
  },
  {
    title: "Enquiries are counted at your end, not Google's",
    body:
      "TITAN measures enquiries first-party, on your own site — the form " +
      "submissions and calls that actually arrived, with the page and search " +
      "that produced them. That is the number the budget is steered by, " +
      "because clicks are the platform's scoreboard and jobs are yours.",
  },
] as const;

export function CompanyAdvertisingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="relative overflow-hidden border-b border-white/[0.07]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_75%_at_50%_-25%,rgba(251,191,36,0.13),transparent_60%)]"
          />
          <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 sm:pb-24 sm:pt-28">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-amber-200/70">
              Advertising
            </p>
            <h1 className="mt-7 max-w-3xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
              Google Ads, with the working shown.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/65">
              TITAN plans, builds and manages Google Search campaigns for the
              trade businesses it works with. This page describes exactly how
              that operates — whose account holds the campaigns, whose money is
              spent, what the software decides and what a person decides.
            </p>
          </div>
        </section>

        <Section
          id="pipeline"
          eyebrow="How a campaign is built"
          title="Five steps between your trade and a live campaign."
        >
          <ol className="space-y-12">
            {PIPELINE.map((stage, index) => (
              <li
                key={stage.title}
                className="grid gap-5 border-t border-white/[0.08] pt-8 sm:grid-cols-[4rem_1fr] sm:gap-8"
              >
                <span className="text-sm font-medium tracking-[0.2em] text-amber-200/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {stage.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-white/55">
                    {stage.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* ── The operating model. The section the reviewer reads. ─── */}
        <Section
          id="accounts"
          eyebrow="The operating model"
          title="Your account, your money, your data."
          tone="raised"
        >
          <div className="grid gap-10 sm:grid-cols-2">
            {[
              {
                title: "The advertising account is yours",
                body:
                  "Each business advertises from its own Google Ads account. " +
                  "TITAN holds those accounts as children of its manager " +
                  "account so it can build and manage the campaigns inside " +
                  "them, with the business owner's authorisation. Nobody " +
                  "advertises out of a pooled account, and if you leave, the " +
                  "account and its history are yours to take.",
              },
              {
                title: "Spend goes straight to Google",
                body:
                  "The advertising budget is billed by Google against your " +
                  "account. TITAN charges for its own work separately, so " +
                  "there is never a question of what was media and what was " +
                  "margin — the two never travel in the same invoice.",
              },
              {
                title: "One platform, one integration",
                body:
                  "TITAN uses its Google Ads API access solely to manage the " +
                  "accounts of the businesses it serves — creating and editing " +
                  "campaigns, managing budgets, and reading performance back " +
                  "into each customer's reporting. TITAN does not resell, " +
                  "sublicense or expose API access to anyone else, and the " +
                  "platform is not offered as an API product.",
              },
              {
                title: "A person still presses go",
                body:
                  "Campaigns are generated paused and reviewed before they " +
                  "run. Material changes — a budget increase, a new campaign — " +
                  "are prepared and shown with the projected effect, then " +
                  "approved. The software's job is to have done the thinking " +
                  "before the conversation, not to spend money while nobody " +
                  "is looking.",
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

        <Section
          id="integration"
          eyebrow="Where the integration stands"
          title="What the Google Ads API changes, and what it does not."
        >
          <Prose>
            <p>
              Today TITAN produces each campaign as a complete build sheet and
              exports it in Google Ads Editor format — the campaigns, ad
              groups, keywords and responsive search ads, ready to import into
              the customer&rsquo;s account. Everything described above already
              happens; the final step is a human import.
            </p>
            <p>
              Google Ads API access replaces that manual step. The same
              validated plan is written directly into the customer&rsquo;s
              account under TITAN&rsquo;s manager account, budgets are adjusted
              through the API rather than by hand, and performance is read back
              on a schedule so each customer&rsquo;s reporting reflects what
              actually happened rather than what was exported a fortnight ago.
            </p>
            <p>
              What it does not change: whose account the campaigns live in, who
              the money belongs to, or the rule that a person approves anything
              material before it spends. API access removes retyping. It does
              not remove judgement.
            </p>
          </Prose>
        </Section>

        <Section id="contact" tone="raised">
          <div className="rounded-2xl border border-white/[0.08] bg-[#06070c] p-10 sm:p-14">
            <h2
              id="contact-heading"
              className="max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight text-white"
            >
              Want to see what this would look like for your trade, in your
              area?
            </h2>
            <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-white/60">
              Tell us the trade and the towns you cover and we will walk you
              through the numbers behind it.
            </p>
            <Link
              href="/#contact"
              className="mt-9 inline-block rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#0b0803] transition-colors hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300/70"
            >
              Tell us your trade and towns
            </Link>
            <p className="mt-5 text-sm text-white/55">
              Prefer email?{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-amber-200/80 underline underline-offset-4 hover:text-amber-100"
              >
                Write to us directly
              </a>
              .
            </p>
          </div>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
