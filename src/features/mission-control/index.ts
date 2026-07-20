/**
 * Mission Control — feature public API (ADR-042).
 *
 * The Brain's first surface: a live daily briefing rendered from existing CRM
 * and first-party measurement data. `resolveBriefing` is the swappable data
 * seam (the memory spine re-points it later); `MissionControlPage` is the
 * read-only surface. This is the ONLY entry point the app layer imports.
 */

export { MissionControlPage } from "./components/mission-control-page";
export { resolveBriefing } from "./data/resolve-briefing";
export { keepAliveProbe, type KeepAliveResult } from "./data/keep-alive";
