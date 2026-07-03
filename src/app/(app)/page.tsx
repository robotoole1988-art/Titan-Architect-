import { redirect } from "next/navigation";

/**
 * The root route has no page of its own — the platform opens on the
 * Dashboard. Centralising this here keeps the entry point in one place.
 */
export default function RootPage() {
  redirect("/dashboard");
}
