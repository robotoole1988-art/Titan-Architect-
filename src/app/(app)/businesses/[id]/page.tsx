import { BusinessJourneyPage } from "@/features/businesses";

export const metadata = { title: "Business Journey" };

/** Thin route: resolves the id param and renders the feature's journey view. */
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BusinessJourneyPage businessId={id} />;
}
