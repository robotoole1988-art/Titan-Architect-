import type { BusinessIntake } from "./types";

/**
 * Seed data for Business Intake (v0.1). Mock/local only — a single example so
 * the saved-intakes list is populated on first load. The store seeds itself
 * from this and then persists changes to localStorage.
 */
export const MOCK_BUSINESS_INTAKES: BusinessIntake[] = [
  {
    id: "intake-sample",
    businessName: "Rapid Response Plumbing",
    trade: "Plumbing",
    location: "Manchester",
    services:
      "Emergency plumbing, boiler repair & installation, bathroom fitting, leak detection.",
    targetCustomer:
      "Homeowners in and around Manchester who need fast, trustworthy plumbing.",
    monthlyMarketingBudget: "£1,000 – £2,500 / month",
    currentWebsiteUrl: "https://example-plumbing.co.uk",
    mainGoal: "More leads",
    urgencyLevel: "High",
    createdAt: "2026-07-01T09:00:00.000Z",
    updatedAt: "2026-07-01T09:00:00.000Z",
  },
];
