import Link from "next/link";
import {
  CAPABILITIES,
  STANDARDS,
  STATUS_BODY,
  STATUS_HEADING,
  TRADE_COUNT,
} from "../model/facts";
import { Prose, Section, SiteFooter, SiteHeader } from "./chrome";
import { ContactForm } from "./contact-form";
import { OsSphere } from "./os-sphere";

/**
 * TITAN's home page (ADR-064) — the founder's approved design, 2026-08-06:
 * "THE AI GROWTH OPERATING SYSTEM", the networked sphere on its dais with
 * the capability callouts, the pipeline band, the honest proof band, the
 * trade cards, and the live demo as the climax.
 *
 * Two audiences read this page and both are served by the same thing —
 * specificity backed by proof. The strongest proof TITAN owns is that the
 * real generator will build a complete site in front of a prospect, so the
 * page's spine is "watch it build", wired to the live demo route.
 *
 * Every claim is sourced in `model/facts.ts` or derived where it stands.
 * There is no social proof because there is none to show yet — the status
 * section still says so plainly, because that sentence is what makes the
 * rest of the page believable (and the honesty-law tests pin it).
 */

const DEMO_HREF = "/experience/demo/roofing/leeds";

/**
 * The eight capability callouts around the sphere. Build truth only:
 * anything not running in production today is marked "in build" — the
 * tense is the claim, same law as CAPABILITIES.
 */
const CALLOUTS = [
  { name: "Marketing", line: "Campaigns planned. Budgets guarded.", forming: false, pos: "left-[34%] top-[2%] w-40" },
  { name: "Website", line: "Generated in seconds. Built to convert.", forming: false, pos: "right-[0%] top-[6%] w-40 text-right" },
  { name: "SEO", line: "Built to rank from the first page.", forming: false, pos: "left-[0%] top-[23%] w-36" },
  { name: "Reception", line: "Every enquiry captured and logged.", forming: true, formingLine: "calls — in build", pos: "right-[0%] top-[31%] w-44 text-right" },
  { name: "Google Ads", line: "Planned. Measured. Honest.", forming: false, pos: "left-[0%] top-[53%] w-40" },
  { name: "CRM & Sales", line: "Follow-ups, pipeline, jobs won.", forming: false, pos: "right-[0%] top-[56%] w-40 text-right" },
  { name: "Automation", line: "Tasks handled while you work.", forming: true, formingLine: "in build", pos: "left-[13%] top-[70%] w-40" },
  { name: "The Brain", line: "Watches everything. Recommends. Asks first.", forming: true, formingLine: "in build", pos: "right-[4%] top-[71%] w-40 text-right" },
] as const;

/**
 * The trade cards the founder named (2026-08-06): roofing, landscaping,
 * driveways, solar, motor trade. Every door opens the real generator demo
 * for a real taxonomy trade — pinned by test, so a renamed trade id breaks
 * the build, not the visitor.
 */
export const TRADE_CARDS = [
  { name: "Roofing", line: "Storm-season ready. Emergency call-outs answered.", tradeId: "roofing", town: "leeds", glow: "rgba(90,140,255,0.4)" },
  { name: "Landscaping", line: "Season-aware. Portfolio-led. Enquiries in spring.", tradeId: "landscaping", town: "harrogate", glow: "rgba(65,214,150,0.34)" },
  { name: "Driveways", line: "Block paving to resin — kerb appeal that wins the street.", tradeId: "driveways-paving", town: "wakefield", glow: "rgba(255,177,90,0.32)" },
  { name: "Solar", line: "Panels, batteries, EV chargers — enquiries with intent.", tradeId: "solar-pv", town: "sheffield", glow: "rgba(255,210,104,0.3)" },
  { name: "Motor trade", line: "MOTs, servicing, repairs — bays kept full.", tradeId: "mot-servicing", town: "bradford", glow: "rgba(110,231,255,0.32)" },
] as const;

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

/* ---------------------------------------------------------- tiny icons */

function IconEnvelope() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" />
      <path d="m2 4 6 5 6-5" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <path d="M3 2h3l1.5 3.5-2 1.5a10 10 0 0 0 3.5 3.5l1.5-2L14 10v3a1 1 0 0 1-1 1A11 11 0 0 1 2 3a1 1 0 0 1 1-1Z" />
    </svg>
  );
}
function IconCog() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <circle cx="8" cy="8" r="2.4" />
      <path d="M8 1.6v2.1M8 12.3v2.1M1.6 8h2.1M12.3 8h2.1M3.5 3.5l1.5 1.5M11 11l1.5 1.5M12.5 3.5 11 5M5 11l-1.5 1.5" />
    </svg>
  );
}
function IconSterling() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M10.5 4.2A2.6 2.6 0 0 0 6 6v5.6M4.5 8.4h5M4.5 12h7" />
    </svg>
  );
}
function IconPlay() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M5 3.2v9.6L13 8 5 3.2Z" />
    </svg>
  );
}

function PipelineIcon({ children, brain = false }: { children?: React.ReactNode; brain?: boolean }) {
  return (
    <div
      className={`mx-auto flex items-center justify-center rounded-full border text-[#b9d0f5] shadow-[0_0_24px_rgba(80,140,255,0.25)] ${
        brain
          ? "h-20 w-20 border-[#a0c3ff]/80 shadow-[0_0_40px_rgba(90,150,255,0.5)]"
          : "h-16 w-16 border-[#78a5ff]/40"
      } bg-[radial-gradient(circle_at_50%_35%,rgba(90,150,255,0.25),rgba(9,13,22,0.7))]`}
    >
      {brain ? (
        <span
          aria-hidden="true"
          className="block h-6 w-6 rounded-full shadow-[0_0_22px_4px_rgba(140,185,255,0.8)]"
          style={{
            background:
              "radial-gradient(circle at 40% 35%, #fff, #9cc4ff 45%, rgba(60,110,235,0.2) 75%, transparent)",
          }}
        />
      ) : (
        children
      )}
    </div>
  );
}

/* -------------------------------------------------------------- page */

export function CompanyHomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* ── Hero: the OS sphere ──────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-white/[0.07]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_85%_at_68%_30%,rgba(46,86,196,0.2),transparent_58%)]"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-6 pb-16 pt-14 lg:grid-cols-[1fr_1.02fr] lg:gap-2 lg:pb-8 lg:pt-10">
            <div className="max-w-xl">
              <h1 className="text-balance text-[2rem] font-bold uppercase leading-[1.09] tracking-tight text-white sm:text-[2.6rem]">
                The AI growth operating system{" "}
                <span className="block text-[#a8c4ff] [text-shadow:0_0_30px_rgba(90,150,255,0.35)]">
                  built to grow your trade business.
                </span>
              </h1>
              <p className="mt-6 max-w-[44ch] text-[1.04rem] leading-relaxed text-white/65">
                TITAN becomes your growth team.{" "}
                <b className="font-semibold text-white/90">
                  Website. Enquiries. Google&nbsp;Ads. CRM.
                </b>{" "}
                Departments of AI, run from one intelligent system — while you
                stay on the tools.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href={DEMO_HREF}
                  className="rounded-xl bg-gradient-to-b from-[#3f79ff] to-[#2c5fe8] px-6 py-3 text-sm font-semibold tracking-wide text-white shadow-[0_6px_24px_rgba(63,121,255,0.35)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7fa8ff]/70"
                >
                  Watch TITAN build a site →
                </Link>
                <a
                  href="#contact"
                  className="rounded-xl border border-[#7fa8ff]/40 px-6 py-3 text-sm font-medium text-[#dfe9fb] transition-colors hover:border-[#7fa8ff]/70 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7fa8ff]/70"
                >
                  Book a demo
                </a>
              </div>
              <p className="mt-8 max-w-md text-sm leading-relaxed text-white/55">
                <b className="font-semibold text-white/80">
                  Founder-built in the UK.
                </b>{" "}
                {TRADE_COUNT} trades researched in depth. No templates — every
                site generated for your business, live, in front of you.
              </p>
            </div>

            {/* the sphere + desktop callouts */}
            <div className="relative mx-auto w-full max-w-[430px] lg:max-w-none">
              <OsSphere />
              <div className="absolute inset-0 hidden lg:block" aria-hidden="true">
                {CALLOUTS.map((callout) => (
                  <div key={callout.name} className={`absolute ${callout.pos}`}>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#dfe9fb] [text-shadow:0_0_14px_rgba(90,150,255,0.5)]">
                      {callout.name}
                    </p>
                    <p className="mt-1 text-[11px] leading-snug text-[#8296b3]">
                      {callout.line}
                    </p>
                    {callout.forming ? (
                      <p className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-[#7c8fa8]">
                        — {callout.formingLine}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* the same eight, as a list, where the overlay has no room */}
            <ul className="grid grid-cols-2 gap-x-6 gap-y-4 lg:hidden">
              {CALLOUTS.map((callout) => (
                <li key={callout.name}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#dfe9fb]">
                    {callout.name}
                  </p>
                  <p className="mt-0.5 text-xs leading-snug text-white/55">
                    {callout.line}
                    {callout.forming ? (
                      <span className="text-white/50"> ({callout.formingLine})</span>
                    ) : null}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── One system ───────────────────────────────────────────── */}
        <Section
          id="system"
          eyebrow="One system"
          title="Everything connected."
          lead="What happens when a customer finds your business."
          tone="raised"
        >
          <ol className="flex flex-wrap items-start justify-center gap-x-2 gap-y-10">
            {[
              { icon: <IconEnvelope />, name: "New enquiry", sub: "Comes in" },
              { icon: <IconPhone />, name: "Reception", sub: "Captured & logged" },
              { icon: null, name: "TITAN Brain", sub: "Analyses & decides", brain: true },
              { icon: <IconCog />, name: "AI departments", sub: "Take action" },
              { icon: <IconSterling />, name: "More jobs", sub: "Won & measured" },
            ].map((step, index) => (
              <li key={step.name} className="flex items-start">
                {index > 0 ? (
                  <span
                    aria-hidden="true"
                    className="mt-7 px-1 text-base tracking-[-0.15em] text-[#44598a] sm:px-2"
                  >
                    ›››
                  </span>
                ) : null}
                <div className="w-32 text-center sm:w-40">
                  <PipelineIcon brain={step.brain}>{step.icon}</PipelineIcon>
                  <p className="mt-4 text-[11.5px] font-bold uppercase tracking-[0.18em] text-white">
                    {step.name}
                  </p>
                  <p className="mt-1 text-[11px] text-white/55">{step.sub}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* ── Honest proof ─────────────────────────────────────────── */}
        <Section
          id="real"
          eyebrow="Real from day one"
          title="No invented averages. No fake stars."
          lead="Numbers we can prove — most of them in front of you, on this site, today."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                big: String(TRADE_COUNT),
                label: "UK trades researched in depth before a word is written",
                src: "counted from the knowledge base",
              },
              {
                big: "0",
                label: "templates. Every site is generated from your trade's research",
                src: "the generator, live today",
              },
              {
                big: "24/7",
                label: "every enquiry captured, timestamped, in one place",
                src: "enquiry capture, live today",
              },
              {
                big: "£0",
                label: "to watch TITAN build your site before you spend anything",
                src: "the live demo, below",
              },
            ].map((card) => (
              <div
                key={card.src}
                className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0d1320d9] to-[#070a12d9] p-7 text-center"
              >
                <p className="text-[2.1rem] font-bold tracking-tight text-white [text-shadow:0_0_26px_rgba(90,150,255,0.4)]">
                  {card.big}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {card.label}
                </p>
                <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-white/50">
                  {card.src}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Built for the trades ─────────────────────────────────── */}
        <Section
          id="trades"
          eyebrow="Built for the trades"
          title="TITAN builds. Grows. Scales."
          lead="Each trade researched, priced and written like we've worked it — because the research has."
          tone="raised"
        >
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
            {TRADE_CARDS.map((trade) => (
              <Link
                key={trade.tradeId}
                href={`/experience/demo/${trade.tradeId}/${trade.town}`}
                className="group flex h-56 flex-col justify-end overflow-hidden rounded-2xl border border-white/[0.08] p-4 transition-colors hover:border-[#7fa8ff]/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7fa8ff]/70"
                style={{
                  background: `radial-gradient(130% 95% at 50% 0%, ${trade.glow} 0%, transparent 60%), linear-gradient(180deg, rgba(16,23,38,0.92), rgba(7,10,18,0.95))`,
                }}
              >
                <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-white">
                  {trade.name}
                </p>
                <p className="mt-1.5 text-[11px] leading-snug text-white/55">
                  {trade.line}
                </p>
                <p className="mt-2 text-[10.5px] text-[#9db9e8] group-hover:text-[#c3d9ff]">
                  See it built →
                </p>
              </Link>
            ))}
            <a
              href="#demo"
              className="flex h-56 flex-col justify-end overflow-hidden rounded-2xl border border-white/[0.08] p-4 transition-colors hover:border-[#7fa8ff]/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7fa8ff]/70"
              style={{
                background:
                  "radial-gradient(130% 95% at 50% 0%, rgba(180,139,255,0.36) 0%, transparent 60%), linear-gradient(180deg, rgba(16,23,38,0.92), rgba(7,10,18,0.95))",
              }}
            >
              <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-white">
                + {TRADE_COUNT - TRADE_CARDS.length} more
              </p>
              <p className="mt-1.5 text-[11px] leading-snug text-white/55">
                {TRADE_COUNT} trades researched. TITAN adapts to yours.
              </p>
              <p className="mt-2 text-[10.5px] text-[#9db9e8]">Every trade →</p>
            </a>
          </div>
        </Section>

        {/* ── The climax: watch it build ───────────────────────────── */}
        <Section id="demo">
          <div className="flex flex-col items-center gap-10 rounded-3xl border border-white/[0.08] bg-[radial-gradient(90%_120%_at_85%_20%,rgba(50,92,205,0.22),transparent_60%),linear-gradient(180deg,rgba(11,16,28,0.92),rgba(6,9,16,0.95))] p-9 sm:p-12 lg:flex-row lg:gap-8">
            <div className="flex-1">
              <h2 className="text-balance text-[1.7rem] font-bold uppercase leading-tight tracking-tight text-white sm:text-3xl">
                Don&rsquo;t take our word.{" "}
                <span className="text-[#a8c4ff]">Watch it build.</span>
              </h2>
              <p className="mt-5 max-w-[52ch] text-[0.98rem] leading-relaxed text-white/60">
                Pick a trade. Name a town.{" "}
                <b className="font-semibold text-white/90">
                  TITAN generates a complete, working website in front of you
                </b>{" "}
                — the same engine that builds every customer site, run live.
                Not a mock-up. Not a showreel.
              </p>
              <p className="mt-4 text-[10.5px] uppercase tracking-[0.12em] text-white/50">
                Marked as an example · your business replaces it in minutes
              </p>
              <div className="mt-7 flex flex-wrap gap-4">
                <Link
                  href={DEMO_HREF}
                  className="rounded-xl bg-gradient-to-b from-[#3f79ff] to-[#2c5fe8] px-6 py-3 text-sm font-semibold tracking-wide text-white shadow-[0_6px_24px_rgba(63,121,255,0.35)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7fa8ff]/70"
                >
                  Watch TITAN build a site →
                </Link>
                <a
                  href="#contact"
                  className="rounded-xl border border-[#7fa8ff]/40 px-6 py-3 text-sm font-medium text-[#dfe9fb] transition-colors hover:border-[#7fa8ff]/70 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7fa8ff]/70"
                >
                  Book a demo
                </a>
              </div>
            </div>
            <Link
              href={DEMO_HREF}
              aria-label="Open the live demo — a roofing site for Leeds, generated by TITAN"
              className="group flex h-52 w-full max-w-[340px] flex-col items-center justify-center gap-3 rounded-2xl border border-[#78a5ff]/30 bg-[radial-gradient(80%_80%_at_50%_40%,rgba(60,105,225,0.3),transparent_70%),#060a13] transition-colors hover:border-[#78a5ff]/60"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#bed7ff]/80 bg-[#141f3c99] text-[#eaf1ff] shadow-[0_0_30px_rgba(90,150,255,0.4)] transition-transform group-hover:scale-105">
                <IconPlay />
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#9fb4d4]">
                Roofing · Leeds — generated live
              </span>
            </Link>
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
              <li key={beat.step} className="border-l border-[#7fa8ff]/25 pl-6">
                <p className="text-xs font-medium tracking-[0.2em] text-[#8fb0e8]">
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
            {/* TITAN's own enquiry capture, on TITAN's own site. For months
                this card ended in a mailto: to a personal Gmail address —
                the one page on the internet where TITAN visibly did not use
                TITAN. Never again. */}
            <ContactForm />
          </div>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
