/**
 * The in-app notification feed (ADR-030) — called by /api/notifications.
 * The enquiry store IS the inbox — no parallel notifications table.
 */

import { isTestEnquiry, resolveBusinessSpine } from "@/core/business";

export interface NotificationFeed {
  newCount: number;
  recent: Array<{
    id: string;
    name: string;
    business: string;
    sourcePage: string;
    status: string;
    createdAt: string;
  }>;
}

export async function getNotificationFeed(): Promise<NotificationFeed> {
  const spine = await resolveBusinessSpine();
  const all = await spine.businesses.list();
  const businesses = new Map(all.map((business) => [business.id, business.name]));
  const internal = new Set(
    all.filter((business) => business.internal).map((business) => business.id),
  );
  // The bell reads repositories directly, so it applies the exclusion
  // rules itself (ADR-056, Law §7): no test artifact and no internal
  // business ever rings or counts. Fetch WIDE then filter then cap —
  // filtering after a tight cap would let a burst of excluded rows push
  // real enquiries out of the window (review-workflow finding).
  const recent = (await spine.enquiries.listRecent(60))
    .filter(
      (enquiry) => !isTestEnquiry(enquiry) && !internal.has(enquiry.businessId),
    )
    .slice(0, 20);
  return {
    newCount: recent.filter((enquiry) => enquiry.status === "new").length,
    recent: recent.slice(0, 8).map((enquiry) => ({
      id: enquiry.id,
      name: enquiry.name,
      business: businesses.get(enquiry.businessId) ?? "",
      sourcePage: enquiry.sourcePage,
      status: enquiry.status,
      createdAt: enquiry.createdAt,
    })),
  };
}
