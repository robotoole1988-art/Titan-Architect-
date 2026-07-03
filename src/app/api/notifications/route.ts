import { getNotificationFeed } from "@/features/crm";

/** Thin route (ADR-030): the in-app notification feed. */
export async function GET(): Promise<Response> {
  return Response.json(await getNotificationFeed());
}
