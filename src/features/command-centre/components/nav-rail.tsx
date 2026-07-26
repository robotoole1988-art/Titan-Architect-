"use client";

/**
 * The summonable rail (M2 addendum §3) + number-key shortcuts (§5).
 *
 * The room stays clear until the founder reaches for the left edge (hover)
 * or the always-visible chevron (click / keyboard focus). The rail lists
 * EVERY destination from the one navigation registry — the constellation is
 * an enhancement; this rail and the ⌘K palette are the guarantee.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { NavItem } from "@/config/navigation";

export interface RailEntry {
  title: string;
  href: string;
  description: string;
}

export function NavRail({
  items,
  shortcuts,
}: {
  items: ReadonlyArray<Pick<NavItem, "title" | "href" | "description">>;
  shortcuts: ReadonlyArray<{ key: string; href: string; title: string }>;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const closeTimer = useRef<number | null>(null);

  function scheduleClose(): void {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 250);
  }
  function cancelClose(): void {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }

  // Additive number-key shortcuts — never fire while typing or with modifiers.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      const shortcut = shortcuts.find((entry) => entry.key === event.key);
      if (shortcut) router.push(shortcut.href);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, shortcuts]);

  return (
    <>
      {/* Edge summon zone + the always-visible affordance */}
      <div
        data-rail-summon
        className="fixed inset-y-0 left-0 z-40 flex w-8 items-center"
        onMouseEnter={() => {
          cancelClose();
          setOpen(true);
        }}
        onMouseLeave={scheduleClose}
      >
        <button
          type="button"
          aria-label="Open navigation rail"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          onFocus={() => setOpen(true)}
          className="ml-1 rounded-full p-1 text-[#39435a] transition-colors hover:text-[#9fb0ca] focus-visible:text-[#9fb0ca] focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <nav
        aria-label="Departments"
        aria-hidden={!open}
        data-rail
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col justify-center gap-0.5 border-r border-[rgba(100,125,180,0.16)] bg-[rgba(6,9,16,0.82)] px-3 backdrop-blur-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } motion-reduce:transition-none`}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            tabIndex={open ? 0 : -1}
            title={item.description}
            className="rounded-lg px-3 py-1.5 text-[13px] text-[#9fb0ca] transition-colors hover:bg-[rgba(140,175,255,0.08)] hover:text-white focus-visible:bg-[rgba(140,175,255,0.08)] focus-visible:text-white focus-visible:outline-none"
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </>
  );
}
