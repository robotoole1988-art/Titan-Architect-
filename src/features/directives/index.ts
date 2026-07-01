/**
 * Directives — public API.
 *
 * The ONLY surface the rest of the app may import from (enforced by the
 * architecture boundary rules; see docs/architecture/architecture-charter.md
 * §4 and ADR-008). Everything else in this folder is private to the feature.
 */
export { DirectivesListPage } from "./components/directives-list-page";
export { DirectiveDetailPage } from "./components/directive-detail-page";
export { DirectiveFormPage } from "./components/directive-form-page";

export type {
  Directive,
  DirectiveStatus,
  DirectivePriority,
  DirectiveProduct,
} from "./model/types";
