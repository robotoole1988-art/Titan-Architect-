"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider, type AuthUser } from "./auth-provider";

/**
 * Composes every app-wide provider in one place so the root layout stays
 * clean. Order matters: theming is outermost, then auth, then UI concerns.
 * The REAL founder session arrives from the server layout (ADR-054).
 */
export function AppProviders({
  children,
  user = null,
  onSignOut,
}: {
  children: ReactNode;
  /** The founder session (ADR-054); null on the public door. */
  user?: AuthUser | null;
  onSignOut?: () => Promise<void>;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider initialUser={user} onSignOut={onSignOut}>
        <TooltipProvider delay={200}>{children}</TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
