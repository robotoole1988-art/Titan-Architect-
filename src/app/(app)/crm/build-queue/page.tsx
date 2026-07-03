import { CrmBuildQueuePage } from "@/features/crm";

export const metadata = { title: "CRM · Build Queue" };

/** Thin route: Level 2 — the build production line. */
export default function Page() {
  return <CrmBuildQueuePage />;
}
