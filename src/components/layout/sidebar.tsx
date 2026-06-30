"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import {
  primaryNavigation,
  secondaryNavigation,
  type NavItem,
} from "@/config/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span>{item.title}</span>
    </Link>
  );
}

/**
 * The inner sidebar content (brand + navigation). Rendered both in the fixed
 * desktop sidebar and inside the mobile slide-over sheet, so it lives once.
 */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary font-bold text-sidebar-primary-foreground">
          T
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight">
            {siteConfig.name}
          </span>
          <span className="mt-1 text-[11px] text-sidebar-foreground/50">
            v{siteConfig.version}
          </span>
        </div>
      </div>

      {/* Primary navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-6">
          {primaryNavigation.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
                {section.title}
              </p>
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Secondary navigation */}
      <div className="border-t border-sidebar-border px-3 py-4">
        {secondaryNavigation.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActive(item.href)}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

/** Fixed left sidebar — visible on medium screens and up. */
export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border md:block">
      <div className="sticky top-0 h-svh">
        <SidebarContent />
      </div>
    </aside>
  );
}
