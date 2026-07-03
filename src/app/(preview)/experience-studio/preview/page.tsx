import { WebsitePreviewPage } from "@/features/website-renderer";

export const metadata = { title: "Website Preview" };

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Reads the business context from the URL (ADR-019 pattern) and hands it to
 * the Website Renderer's preview. Thin: no generation here, no core imports.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <WebsitePreviewPage
      businessName={firstParam(params.businessName)}
      trade={firstParam(params.trade)}
      location={firstParam(params.location)}
    />
  );
}
