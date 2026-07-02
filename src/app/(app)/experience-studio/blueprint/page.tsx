import { BlueprintViewerPage } from "@/features/experience-studio";

export const metadata = { title: "Website Blueprint" };

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Reads the business context from the URL (passed forward by the Experience
 * Studio; ADR-019 pattern) and hands it to the Blueprint Viewer. Thin: no
 * generation here, no core imports.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <BlueprintViewerPage
      businessName={firstParam(params.businessName)}
      trade={firstParam(params.trade)}
      location={firstParam(params.location)}
    />
  );
}
