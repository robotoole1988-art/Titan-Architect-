/**
 * Codex — public API.
 *
 * This is the ONLY surface the rest of the app may import from (enforced by the
 * architecture boundary rules; see docs/architecture/architecture-charter.md
 * §4 and ADR-008). Everything else in this folder is private to the feature.
 */
export { CodexListPage } from "./components/codex-list-page";
export { CodexDetailPage } from "./components/codex-detail-page";
export { CodexFormPage } from "./components/codex-form-page";

export type {
  CodexEntry,
  CodexCategory,
  CodexStatus,
} from "./model/types";
