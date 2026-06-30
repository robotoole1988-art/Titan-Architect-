import type { ReactNode } from "react";

/**
 * Layout for public authentication pages. Deliberately has no app shell —
 * it just centres its content on the screen.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      {children}
    </div>
  );
}
