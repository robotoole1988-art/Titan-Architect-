import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";

/**
 * Layout for the protected application. Every page in this route group is
 * wrapped in the shell (sidebar + command bar).
 *
 * AUTH SEAM: this is where server-side authentication will be enforced.
 * When real auth is wired in, read the session here and redirect, e.g.:
 *
 *   const session = await getSession();
 *   if (!session) redirect("/login");
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
