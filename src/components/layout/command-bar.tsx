"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarContent } from "./sidebar";
import { BrainMark } from "./brain-mark";
import { CommandPalette, CommandPaletteTrigger } from "./command-palette";
import { NotificationsBell } from "./notifications-bell";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

/**
 * Top command bar: the Brain mark (the way back to the Command Centre,
 * ADR-057), mobile navigation trigger, the ⌘K palette trigger, theme toggle
 * and account menu. Sticky so it stays available while scrolling.
 */
export function CommandBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <BrainMark />
      {/* Mobile navigation */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation"
            />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* The ⌘K switcher (M2 addendum §2) — one palette, mounted here and on
          the Command Centre layout */}
      <CommandPaletteTrigger />
      <CommandPalette />

      {/* Right-side actions */}
      <div className="ml-auto flex items-center gap-1.5">
        <NotificationsBell />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
