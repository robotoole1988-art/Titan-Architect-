import { MarketExplorerPage } from "@/features/market";

export const metadata = { title: "Market Intelligence" };

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Thin route: trade + location arrive as GET params (shareable estimates). */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <MarketExplorerPage
      trade={firstParam(params.trade)}
      location={firstParam(params.location)}
    />
  );
}
