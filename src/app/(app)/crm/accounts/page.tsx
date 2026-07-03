import { CrmAccountsPage } from "@/features/crm";

export const metadata = { title: "CRM · Accounts" };

/** Thin route: Level 3 — live customer accounts. */
export default function Page() {
  return <CrmAccountsPage />;
}
