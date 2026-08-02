/**
 * The TITAN company site — public API (ADR-064).
 *
 * TITAN's own public face, served from the app's root. Everything here is a
 * server component with no client boundary: the site that sells a mobile
 * performance floor is not permitted to ship a hydration bundle to say four
 * things.
 *
 * The claims these pages make are centralised in `model/facts.ts` and pinned
 * by `tests/features/company-site/honesty-law.test.tsx`, which renders the
 * real markup and asserts the shapes TITAN forbids on a customer's site —
 * invented reviews, unearned accreditations, fabricated counts — never
 * appear on TITAN's own.
 */

export { CompanyHomePage } from "./components/home";
export { CompanyAdvertisingPage } from "./components/advertising";
export { CompanyAboutPage } from "./components/about";
export { CompanyPrivacyPage } from "./components/privacy";
export {
  CAPABILITIES,
  CONTACT_EMAIL,
  PERFORMANCE_FLOOR,
  STANDARDS,
  TRADE_COUNT,
} from "./model/facts";
