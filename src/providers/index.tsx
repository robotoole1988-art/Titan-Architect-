"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";

/**
 * Composes every app-wide provider in one place so the root layout stays
 * clean. Order matters: theming is outermost, then auth, then UI concerns.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <TooltipProvider delay={200}>{children}</TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
