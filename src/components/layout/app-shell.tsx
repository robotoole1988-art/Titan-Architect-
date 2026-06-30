import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { CommandBar } from "./command-bar";

/**
 * The application shell: fixed left sidebar + top command bar wrapping the
 * routed page content. Defined once and shared by every page in the (app)
 * route group.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <CommandBar />
        <main className="flex flex-1 flex-col p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
