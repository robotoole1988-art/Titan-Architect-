/**
 * Domain types for the Business Intake feature.
 *
 * A Business Intake is the record TITAN needs before generating strategy and
 * blueprint outputs. It is the first step of the Business → Blueprint journey.
 */

export const MARKETING_BUDGETS = [
  "Under £500 / month",
  "£500 – £1,000 / month",
  "£1,000 – £2,500 / month",
  "£2,500 – £5,000 / month",
  "£5,000+ / month",
] as const;

export type MarketingBudget = (typeof MARKETING_BUDGETS)[number];

export const BUSINESS_GOALS = [
  "More leads",
  "More phone calls",
  "More bookings",
  "Dominate local search",
  "Premium rebrand",
  "Increase revenue",
] as const;

export type BusinessGoal = (typeof BUSINESS_GOALS)[number];

export const URGENCY_LEVELS = ["Low", "Medium", "High", "Critical"] as const;

export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];

/** A saved Business Intake record — the output later modules will consume. */
export interface BusinessIntake {
  id: string;
  businessName: string;
  trade: string;
  location: string;
  services: string;
  targetCustomer: string;
  monthlyMarketingBudget: MarketingBudget;
  /** Optional — the business's current website, if any. */
  currentWebsiteUrl: string;
  mainGoal: BusinessGoal;
  urgencyLevel: UrgencyLevel;
  /** ISO-8601 timestamps. System-managed. */
  createdAt: string;
  updatedAt: string;
}

/** The editable fields — everything except system-managed id/createdAt/updatedAt. */
export type BusinessIntakeDraft = Omit<
  BusinessIntake,
  "id" | "createdAt" | "updatedAt"
>;
