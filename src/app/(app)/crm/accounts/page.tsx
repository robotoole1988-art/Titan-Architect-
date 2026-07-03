import { CrmAccountsPage } from "@/features/crm";

export const metadata = { title: "CRM · Accounts" };

/**
 * Thin route: Level 3 — live customer accounts. `?enquiry=` deep-links from
 * a notification straight to the highlighted enquiry (ADR-030).
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const enquiry = params.enquiry;
  return (
    <CrmAccountsPage
      highlightEnquiryId={typeof enquiry === "string" ? enquiry : undefined}
    />
  );
}
