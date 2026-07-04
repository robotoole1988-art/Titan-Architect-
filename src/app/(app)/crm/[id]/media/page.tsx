import { MediaPage } from "@/features/crm";

export const metadata = { title: "CRM · Media" };

/** Thin route: the media department's review gate (ADR-033). */
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MediaPage businessId={id} />;
}
