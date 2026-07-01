/**
 * Business Intake — public API.
 *
 * The ONLY surface the rest of the app may import from (enforced by the
 * architecture boundary rules; see docs/architecture/architecture-charter.md
 * §4 and ADR-008). Everything else in this folder is private to the feature.
 *
 * The `BusinessIntake` record type is exported so later modules can consume the
 * saved intake shape.
 */
export { BusinessIntakePage } from "./components/business-intake-page";

export type {
  BusinessIntake,
  BusinessIntakeDraft,
  MarketingBudget,
  BusinessGoal,
  UrgencyLevel,
} from "./model/types";
