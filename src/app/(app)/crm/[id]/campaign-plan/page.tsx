import { CampaignPlanPage } from "@/features/crm";

export const metadata = { title: "CRM · Campaign Plan" };

/** Thin route: the Google Ads campaign build sheet viewer (ADR-031). */
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CampaignPlanPage businessId={id} />;
}
