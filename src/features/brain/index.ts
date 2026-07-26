/**
 * Brain — public API.
 *
 * The ONLY surface the rest of the app may import from (enforced by the
 * architecture boundary rules; see docs/architecture/architecture-charter.md
 * §4 and ADR-008). Everything else in this folder is private to the feature.
 */
export { BrainWorkspace } from "./components/brain-workspace";
export { AskBrain } from "./components/ask-brain";
export { Recommendations } from "./components/recommendations";
export { CommandCentre } from "./components/command-centre";
export { loadCommandCentre } from "./api/commands";
export { loadDepartmentHealth } from "./api/health";
export { loadRecommendations } from "./api/decisions";
export { approveCommandAction, rejectCommandAction } from "./api/command-actions";
export { acceptRecommendation, dismissRecommendation } from "./api/decision-actions";
export { HealthPanel, HealthStrip } from "./components/health-panel";
