import Link from "next/link";
import { PERFORMANCE_FLOOR, TRADE_COUNT } from "../model/facts";
import { SiteFooter, SiteHeader } from "./chrome";

/**
 * LAB — the arrival prototype (PRD-007 v2, Increment 1: the judgment gate).
 *
 * The founder rejected particles (ADR-068) and set the bar for any flagship
 * medium: a built prototype judged by his eyes, not prose. This page is that
 * prototype — Act 0 of The Working Mind in the motion language the revised
 * PRD proposes: ink, type, pulse. A single line draws itself out of the
 * dark beneath the claim, branches into the first departments, and one
 * pulse travels it — then the line leaves the frame, because the system
 * continues past what one screen can show.
 *
 * Laws it keeps, deliberately:
 * - Zero JavaScript. Every movement is CSS `@keyframes`; the feature-wide
 *   "ships no client component" test keeps passing.
 * - The H1 is real text, painted at first paint, never animated from
 *   hidden — the film may not delay the content (Performance Law; LCP).
 * - Stillness is the default. Animation exists only inside a
 *   `prefers-reduced-motion: no-preference` guard, so reduced-motion
 *   visitors (and any engine that ignores the block) see the finished
 *   drawing, complete and legible. The still is the design; motion is the
 *   exception applied to it.
 * - The drawing is true. The five branches are the real departments with
 *   their real statuses from `facts.ts` tense — intelligence is dashed
 *   FORMING because it is not built, on the very first screen.
 * - Small screens get their own composition — a vertical rail, drawn for
 *   the shape of a phone — not a shrunken photocopy of the desktop one.
 *   (First cut of this page shipped the photocopy; the screenshots said
 *   what screenshots say.)
 *
 * This page is noindex, linked from nowhere, and lives behind the judgment
 * gate: if it is below the standard it is deleted, and the lesson recorded
 * in PRD-007 §7 risk 1.
 */

interface Department {
  readonly label: string;
  readonly status: "alive" | "forming";
  /** Position of the branch on the desktop canvas (1440-wide viewBox). */
  readonly x: number;
  readonly up: boolean;
  /** Stop on the mobile rail (560-tall viewBox). */
  readonly railY: number;
  /** Animation delay (s) for the branch draw; dot and label follow it. */
  readonly delay: number;
}

/**
 * The five departments of the first drawing. Statuses mirror
 * `CAPABILITIES`/`facts.ts`: the intelligence layer is the one still
 * forming. Act 1 of the full experience derives its map from module paths
 * with a walking test (PRD-007 §4); the prototype states the same truth in
 * miniature.
 */
const DEPARTMENTS: ReadonlyArray<Department> = [
  { label: "Website engine", status: "alive", x: 320, up: true, railY: 96, delay: 2.3 },
  { label: "Enquiry desk", status: "alive", x: 500, up: false, railY: 188, delay: 2.7 },
  { label: "Ads planner", status: "alive", x: 680, up: true, railY: 280, delay: 3.1 },
  { label: "Knowledge base", status: "alive", x: 860, up: false, railY: 372, delay: 3.5 },
  { label: "Intelligence", status: "forming", x: 1040, up: true, railY: 464, delay: 3.9 },
];

/** Desktop drawing geometry (viewBox 1440 × 330 — the act must fit one
 *  viewport at 1440×900; the first cut overflowed the fold). */
const LINE_Y = 170;
const BRANCH_LEN = 96;
/** Where the ink starts: the text column's left edge at a 1440 viewport. */
const ORIGIN_X = 168;

const INK = "rgba(255,255,255,0.34)";
const INK_SOFT = "rgba(255,255,255,0.24)";
const AMBER = "rgb(252 211 77)";
const AMBER_SOFT = "rgb(252 211 77 / 0.75)";

export function CompanyArrivalLabPage() {
  return (
    <>
      {/* All motion for this act. Default styles are the FINISHED drawing;
          animation exists only under the no-preference guard, so stillness
          is what every reduced-motion visitor and unsupporting engine gets. */}
      <style>{`
        .al-pulse, .al-pulse-v { opacity: 0; }
        @media (prefers-reduced-motion: no-preference) {
          .al-rise {
            opacity: 0;
            transform: translateY(14px);
            animation: al-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            animation-delay: var(--d, 0s);
          }
          @keyframes al-rise {
            to { opacity: 1; transform: translateY(0); }
          }
          .al-draw {
            stroke-dasharray: 1;
            stroke-dashoffset: 1;
            animation: al-draw 1.7s cubic-bezier(0.65, 0, 0.35, 1) forwards;
            animation-delay: var(--d, 0s);
          }
          .al-draw-branch { animation-duration: 0.8s; }
          @keyframes al-draw {
            to { stroke-dashoffset: 0; }
          }
          .al-set {
            opacity: 0;
            animation: al-set 0.5s ease-out forwards;
            animation-delay: var(--d, 0s);
          }
          @keyframes al-set {
            to { opacity: 1; }
          }
          .al-pulse {
            animation: al-pulse 1.6s cubic-bezier(0.4, 0, 0.3, 1) forwards;
            animation-delay: 5s;
          }
          @keyframes al-pulse {
            0% { opacity: 0; transform: translateX(0); }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { opacity: 0; transform: translateX(1272px); }
          }
          .al-pulse-v {
            animation: al-pulse-v 1.6s cubic-bezier(0.4, 0, 0.3, 1) forwards;
            animation-delay: 5s;
          }
          @keyframes al-pulse-v {
            0% { opacity: 0; transform: translateY(0); }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { opacity: 0; transform: translateY(536px); }
          }
        }
      `}</style>

      <SiteHeader />
      <main id="main">
        <section
          aria-label="TITAN, drawing itself"
          className="relative overflow-hidden border-b border-white/[0.07]"
        >
          <div className="mx-auto max-w-6xl px-6 pt-16 sm:pt-16">
            <div className="flex items-start justify-between gap-6">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-amber-200/70">
                Lab · Act 0 — the arrival
              </p>
              {/* The skip law: visible from 0ms, first thing after nav,
                  works with no JavaScript because it is an anchor. */}
              <a
                href="#content"
                className="shrink-0 text-xs font-medium text-white/60 underline decoration-white/[0.25] underline-offset-4 transition-colors hover:text-white"
              >
                Skip the film — read it straight
              </a>
            </div>

            {/* The LCP element. Painted immediately, animated never. */}
            <h1 className="mt-7 max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Your business, thinking.
            </h1>

            <p
              className="al-rise mt-6 max-w-2xl text-lg leading-relaxed text-white/65"
              style={{ "--d": "0.45s" } as React.CSSProperties}
            >
              One system that builds your website, captures every enquiry and
              plans your Google Ads — across {TRADE_COUNT} trades, measured
              against a mobile performance floor of {PERFORMANCE_FLOOR}.
            </p>

            <div
              className="al-rise mt-7"
              style={{ "--d": "0.75s" } as React.CSSProperties}
            >
              <Link
                href="/#contact"
                className="inline-block rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-[#0b0803] transition-colors hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300/70"
              >
                Talk to us
              </Link>
            </div>
          </div>

          {/* ── The drawing · desktop: ink runs from under the words and
                 leaves the frame — the system continues past the screen. */}
          <div className="hidden w-full sm:block" aria-hidden="true">
            <svg
              viewBox="0 0 1440 330"
              fill="none"
              className="h-auto w-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* The first line of ink. */}
              <path
                d={`M ${ORIGIN_X} ${LINE_Y} H 1440`}
                pathLength={1}
                className="al-draw"
                style={{ "--d": "1.15s" } as React.CSSProperties}
                stroke={INK}
                strokeWidth="1.5"
              />
              {DEPARTMENTS.map((d) => {
                const yEnd = d.up ? LINE_Y - BRANCH_LEN : LINE_Y + BRANCH_LEN;
                const dotY = d.up ? yEnd - 10 : yEnd + 10;
                const labelY = d.up ? dotY - 22 : dotY + 32;
                return (
                  <g key={d.label}>
                    <path
                      d={`M ${d.x} ${LINE_Y} V ${yEnd}`}
                      pathLength={1}
                      className="al-draw al-draw-branch"
                      style={{ "--d": `${d.delay}s` } as React.CSSProperties}
                      stroke={INK_SOFT}
                      strokeWidth="1.25"
                    />
                    {d.status === "alive" ? (
                      <circle
                        cx={d.x}
                        cy={dotY}
                        r="4.5"
                        className="al-set"
                        style={
                          { "--d": `${d.delay + 0.65}s` } as React.CSSProperties
                        }
                        fill={AMBER_SOFT}
                      />
                    ) : (
                      <circle
                        cx={d.x}
                        cy={dotY}
                        r="6"
                        className="al-set"
                        style={
                          { "--d": `${d.delay + 0.65}s` } as React.CSSProperties
                        }
                        fill="none"
                        stroke={AMBER_SOFT}
                        strokeWidth="1.25"
                        strokeDasharray="3.5 3.5"
                      />
                    )}
                    <text
                      x={d.x}
                      y={labelY}
                      textAnchor="middle"
                      className="al-set"
                      style={
                        {
                          "--d": `${d.delay + 0.8}s`,
                          fontSize: "13px",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          fontWeight: 500,
                        } as React.CSSProperties
                      }
                      fill={
                        d.status === "alive"
                          ? "rgba(255,255,255,0.6)"
                          : "rgb(252 211 77 / 0.7)"
                      }
                    >
                      {d.label}
                      {d.status === "forming" ? " — forming" : ""}
                    </text>
                  </g>
                );
              })}
              {/* One pulse. One pulse means one real thing happening. */}
              <circle
                cx={ORIGIN_X}
                cy={LINE_Y}
                r="5"
                className="al-pulse"
                fill={AMBER}
              />
            </svg>
          </div>

          {/* ── The drawing · phones: its own composition — a rail drawn
                 down the page, stops at each department, pulse descending. */}
          <div className="mt-10 px-6 sm:hidden" aria-hidden="true">
            <svg
              viewBox="0 0 358 560"
              fill="none"
              className="h-auto w-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                d="M 24 0 V 560"
                pathLength={1}
                className="al-draw"
                style={{ "--d": "1.15s" } as React.CSSProperties}
                stroke={INK}
                strokeWidth="1.5"
              />
              {DEPARTMENTS.map((d) => (
                <g key={d.label}>
                  <path
                    d={`M 24 ${d.railY} H 44`}
                    pathLength={1}
                    className="al-draw al-draw-branch"
                    style={{ "--d": `${d.delay}s` } as React.CSSProperties}
                    stroke={INK_SOFT}
                    strokeWidth="1.25"
                  />
                  {d.status === "alive" ? (
                    <circle
                      cx="52"
                      cy={d.railY}
                      r="4.5"
                      className="al-set"
                      style={
                        { "--d": `${d.delay + 0.65}s` } as React.CSSProperties
                      }
                      fill={AMBER_SOFT}
                    />
                  ) : (
                    <circle
                      cx="52"
                      cy={d.railY}
                      r="6"
                      className="al-set"
                      style={
                        { "--d": `${d.delay + 0.65}s` } as React.CSSProperties
                      }
                      fill="none"
                      stroke={AMBER_SOFT}
                      strokeWidth="1.25"
                      strokeDasharray="3.5 3.5"
                    />
                  )}
                  <text
                    x="74"
                    y={d.railY + 5}
                    className="al-set"
                    style={
                      {
                        "--d": `${d.delay + 0.8}s`,
                        fontSize: "14px",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        fontWeight: 500,
                      } as React.CSSProperties
                    }
                    fill={
                      d.status === "alive"
                        ? "rgba(255,255,255,0.6)"
                        : "rgb(252 211 77 / 0.7)"
                    }
                  >
                    {d.label}
                    {d.status === "forming" ? " — forming" : ""}
                  </text>
                </g>
              ))}
              <circle cx="24" cy="12" r="5" className="al-pulse-v" fill={AMBER} />
            </svg>
          </div>

          {/* What the drawing says, for everyone. */}
          <p className="sr-only">
            TITAN&rsquo;s departments today: website engine, enquiry desk,
            ads planner and knowledge base are live; the intelligence layer
            is still forming.
          </p>

          <div className="mx-auto max-w-6xl px-6 pb-8">
            <p
              className="al-set mt-3 text-xs leading-relaxed text-white/55"
              style={{ "--d": "4.85s" } as React.CSSProperties}
            >
              Drawn from what exists today — a dashed circle means still
              forming, and says so.
            </p>
          </div>
        </section>

        <section id="content" className="border-b border-white/[0.07]">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-amber-200/70">
              Read it straight
            </p>
            <div className="mt-8 max-w-2xl space-y-5 text-[1.0625rem] leading-relaxed text-white/65">
              <p>
                This page is a motion prototype for TITAN&rsquo;s future front
                door — the opening seconds of an experience where you watch
                the system think, ending in a live demonstration where a real
                site is generated for your trade and town in front of you.
              </p>
              <p>
                It is built under the same rules as everything TITAN ships:
                the headline paints before the film starts, the whole act is
                skippable from the first moment, visitors who prefer reduced
                motion get the finished drawing instead, and the page carries
                no JavaScript at all. What the drawing shows is true — the
                dashed department is genuinely still being built.
              </p>
              <p>
                The rest of the site is live today:{" "}
                <Link
                  href="/"
                  className="text-amber-200/80 underline underline-offset-4 hover:text-amber-100"
                >
                  the front page and its contact form
                </Link>
                , which runs on TITAN&rsquo;s own enquiry capture.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
