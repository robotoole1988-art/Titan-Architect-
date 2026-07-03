/**
 * The in-app notification feed (ADR-030) — called by /api/notifications.
 * The enquiry store IS the inbox — no parallel notifications table.
 */

import { resolveBusinessSpine } from "@/core/business";

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
  const recent = await spine.enquiries.listRecent(20);
  const businesses = new Map(
    (await spine.businesses.list()).map((business) => [business.id, business.name]),
  );
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
