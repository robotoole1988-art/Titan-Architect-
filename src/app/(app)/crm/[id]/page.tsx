import { CrmLeadDetailPage } from "@/features/crm";

export const metadata = { title: "CRM · Lead" };

/** Thin route: the business detail in the CRM lens. */
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CrmLeadDetailPage businessId={id} />;
}
