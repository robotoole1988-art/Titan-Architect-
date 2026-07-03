import { resolveBusinessSpine } from "@/core/business";

/**
 * The in-app notification feed (ADR-030): recent enquiries + how many are
 * unseen. The enquiry store IS the inbox — no parallel notifications table.
 */
export async function GET(): Promise<Response> {
  const spine = await resolveBusinessSpine();
  const recent = await spine.enquiries.listRecent(20);
  const businesses = new Map(
    (await spine.businesses.list()).map((business) => [business.id, business.name]),
  );
  return Response.json({
    newCount: recent.filter((enquiry) => enquiry.status === "new").length,
    recent: recent.slice(0, 8).map((enquiry) => ({
      id: enquiry.id,
      name: enquiry.name,
      business: businesses.get(enquiry.businessId) ?? "",
      sourcePage: enquiry.sourcePage,
      status: enquiry.status,
      createdAt: enquiry.createdAt,
    })),
  });
}
