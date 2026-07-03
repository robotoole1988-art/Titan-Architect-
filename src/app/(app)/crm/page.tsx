import { CrmPipelinePage } from "@/features/crm";

export const metadata = { title: "CRM · Pipeline" };

/** Thin route: Level 1 — the sales pipeline. */
export default function Page() {
  return <CrmPipelinePage />;
}
