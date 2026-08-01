/**
 * The facts TITAN's own website is allowed to state (ADR-064).
 *
 * TITAN's central promise to a customer is that its sites never claim
 * anything the business cannot back — no invented accreditations, no
 * generated reviews, no photographs of work that was never done (ADR-059,
 * ADR-060). A company site that broke that rule while selling it would be
 * the most expensive sentence on the internet.
 *
 * So this module is the same discipline pointed inward. Every number the
 * public site prints is DERIVED from the system it describes, and every
 * qualitative claim is written here once, beside a note on what makes it
 * true. If a claim cannot be sourced, it does not go on the page — and
 * `tests/features/company-site/honesty-law.test.tsx` walks the rendered
 * markup asserting the forbidden shapes never appear.
 *
 * The absent list matters as much as the present one. TITAN is new. It has
 * no customer count, no case studies, no testimonials and no results to
 * publish, and inventing any of them is the one thing this company cannot
 * survive doing. Stating that plainly is not a weakness on the page; it is
 * the argument.
 */

import { TRADE_TAXONOMY } from "@/core/trade-taxonomy";
import { PERFORMANCE_LAW } from "@/core/performance-law";

/**
 * Trades TITAN knows how to build for, counted from the taxonomy itself
 * rather than typed. A trade added to the kernel updates the sentence on
 * the home page; a number typed by hand would have started drifting the
 * day after it was written.
 */
export const TRADE_COUNT: number = TRADE_TAXONOMY.length;

/**
 * The mobile Lighthouse performance floor, read from `law.json` — the same
 * file the CI gate, the publish gate and the nightly fleet sampler read.
 * The site cannot advertise a standard looser than the one enforced.
 */
export const PERFORMANCE_FLOOR: number =
  PERFORMANCE_LAW.categories.performance.floor;

export const ACCESSIBILITY_FLOOR: number =
  PERFORMANCE_LAW.categories.accessibility.floor;

/** Contact. The only route in — there is deliberately no form (see privacy). */
export const CONTACT_EMAIL = "robotoole1988@gmail.com";

/**
 * What TITAN does today, in the customer's words.
 *
 * `status` is load-bearing. "live" means it runs in production now; "build"
 * means it is being built and is named here because a buyer deciding today
 * deserves to know what they are and are not buying. Nothing is described
 * in the present tense that does not exist — the tense IS the claim.
 */
export interface Capability {
  readonly title: string;
  readonly body: string;
  readonly status: "live" | "build";
}

export const CAPABILITIES: ReadonlyArray<Capability> = [
  {
    title: "The website",
    body:
      "A site designed around how your customers actually decide — an emergency " +
      "roof call and a £30,000 driveway are not the same purchase and should not " +
      "be the same page. Built to load fast on a phone on site, on the worst " +
      "signal your customer has.",
    status: "live",
  },
  {
    title: "The enquiries",
    body:
      "Every enquiry lands in one place, timestamped, with the page and the " +
      "search that produced it. You stop guessing which of your marketing is " +
      "working, because the answer stops being a matter of opinion.",
    status: "live",
  },
  {
    title: "The advertising",
    body:
      "Google Ads campaigns built from what your trade actually costs per lead " +
      "in your area — keywords, ad copy, negatives, budgets, with the working " +
      "shown. Launched against your own account, never a shared one.",
    status: "live",
  },
  {
    title: "The intelligence",
    body:
      "The layer that watches the numbers and tells you what changed and what " +
      "to do about it, rather than handing you a dashboard and wishing you luck.",
    status: "build",
  },
];

/**
 * The standards. Each is enforced somewhere in the codebase, and the note
 * says where — because a promise with a filename behind it is a different
 * kind of promise.
 */
export interface Standard {
  readonly title: string;
  readonly body: string;
}

export const STANDARDS: ReadonlyArray<Standard> = [
  {
    title: "We never write a fact you cannot back",
    body:
      "TITAN will not put an accreditation, a review, a price, a guarantee or a " +
      "years-trading figure on your website unless you hold it. Not as a policy " +
      "somebody might forget — the generator has no route to produce one. If you " +
      "are registered with a trade body, your site says so and names it; if you " +
      "are not, nothing appears, and no badge is quietly invented to fill the gap.",
  },
  {
    title: "Photographs of your work are your work",
    body:
      "Galleries, before-and-afters and case studies show jobs you actually did, " +
      "from photographs you supplied. TITAN does use generated imagery — for " +
      "mood, materials and finish, where it earns its place — but it is never " +
      "presented as a job you completed. A stock photo passed off as your work is " +
      "a fake review with better lighting.",
  },
  {
    title: "Reviews are attested or they do not exist",
    body:
      "A review appears on a TITAN site only when the customer who gave it has " +
      "been through the attestation flow. There is no seed data, no filler, and " +
      "no wall of glowing quotes on launch day from people who never said them.",
  },
  {
    title: "Speed is a rule, not an aspiration",
    body:
      `Every published site is measured against a mobile Lighthouse floor of ` +
      `${PERFORMANCE_FLOOR} for performance and ${ACCESSIBILITY_FLOOR} for ` +
      `accessibility, with page-weight budgets on top. The numbers live in one ` +
      `file that the build reads, so the standard cannot quietly slip between ` +
      `the promise and the product.`,
  },
  {
    title: "A person looks at it before it goes live",
    body:
      "Nothing publishes itself. Every site is reviewed and released " +
      "deliberately — which is also why TITAN will tell you when it has nothing " +
      "honest to put in a section, instead of filling it with something that " +
      "sounds right.",
  },
];

/**
 * The honest status section. This exists because TITAN is early, a buyer
 * can tell, and pretending otherwise insults them. It is also the section
 * that makes the rest of the page credible.
 */
export const STATUS_HEADING = "Where TITAN is today";

export const STATUS_BODY: ReadonlyArray<string> = [
  "TITAN is a new company. The website engine, the enquiry pipeline and the " +
    "Google Ads campaign builder run in production today. The intelligence " +
    "layer is being built.",
  "There are no case studies on this site, no customer logos and no " +
    "testimonials, because TITAN has not earned them yet. When there are " +
    "results worth showing, they will be real ones, named, with the customer's " +
    "permission. That is the same standard TITAN holds your website to, and it " +
    "would be a strange company that applied it to everyone except itself.",
];
