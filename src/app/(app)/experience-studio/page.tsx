import { ExperienceStudioPage } from "@/features/experience-studio";

export const metadata = { title: "Experience Studio" };

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Reads the business context from the URL (passed forward by Business Intake)
 * and hands it to the studio. Thin: no generation here, no core imports.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <ExperienceStudioPage
      businessId={firstParam(params.businessId)}
      businessName={firstParam(params.businessName)}
      trade={firstParam(params.trade)}
      location={firstParam(params.location)}
    />
  );
}
