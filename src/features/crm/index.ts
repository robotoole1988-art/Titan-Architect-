/**
 * CRM — public API (ADR-024).
 *
 * The founder's three-level command centre: Pipeline (Level 1, sales),
 * Build Queue (Level 2, production with the founder-approval gate), and
 * Accounts (Level 3, live customers) — three VIEWS of the one Business
 * record, never three systems.
 *
 * This is the ONLY surface other layers may import from.
 */

export { CrmPipelinePage } from "./components/pipeline-page";
export { CrmLeadDetailPage } from "./components/lead-detail-page";
export { CrmBuildQueuePage } from "./components/build-queue-page";
export { CrmAccountsPage } from "./components/accounts-page";

export { getNotificationFeed } from "./api/notification-feed";
export type { NotificationFeed } from "./api/notification-feed";
export { CampaignPlanPage } from "./components/campaign-plan-page";
export { getCampaignPlanCsv, isCampaignCsvFile } from "./api/campaign-plan-export";
export { MediaPage } from "./components/media-page";
