import { getCampaignPlanCsv, isCampaignCsvFile } from "@/features/crm";

/** Thin route (ADR-031): Google Ads Editor CSV downloads. */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const businessId = url.searchParams.get("businessId") ?? "";
  const file = url.searchParams.get("file") ?? "";
  if (!businessId || !isCampaignCsvFile(file)) {
    return new Response("Bad request", { status: 400 });
  }
  const result = await getCampaignPlanCsv(businessId, file);
  if (!result) return new Response("Not found", { status: 404 });
  return new Response(result.csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${result.filename}"`,
    },
  });
}
