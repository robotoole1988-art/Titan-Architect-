"use client";

/**
 * The ⌘K command palette (ADR-057, M2 addendum §2).
 *
 * ONE switcher for the whole cockpit: every destination from the navigation
 * registry, type-ahead, Enter to jump. Mounted on every root layout — the
 * Command Centre included — so no screen is ever more than one action from
 * any other. This absorbs the CommandBar's placeholder search; there is no
 * second palette (the addendum's "don't build two").
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  primaryNavigation,
  secondaryNavigation,
  type NavItem,
} from "@/config/navigation";

function allDestinations(): NavItem[] {
  return [
    ...primaryNavigation.flatMap((section) => section.items),
    ...secondaryNavigation,
  ];
}

function filter(query: string, items: NavItem[]): NavItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  const byTitle = items.filter((item) => item.title.toLowerCase().includes(q));
  const byDescription = items.filter(
    (item) => !byTitle.includes(item) && item.description.toLowerCase().includes(q),
  );
  return [...byTitle, ...byDescription];
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const items = useMemo(() => allDestinations(), []);
  const matches = useMemo(() => filter(query, items), [query, items]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === "Escape" && open) {
        close();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function go(item: NavItem): void {
    close();
    router.push(item.href);
  }

  if (!open) return null;

  return (
    <div
      data-command-palette
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 pt-[18vh] backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Go to section"
    >
      <div
        className="w-[min(560px,92vw)] overflow-hidden rounded-2xl border border-border/70 bg-popover shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-border/60 px-4">
          <Search className="size-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((value) => Math.min(value + 1, matches.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((value) => Math.max(value - 1, 0));
              } else if (event.key === "Enter" && matches[active]) {
                event.preventDefault();
                go(matches[active]);
              }
            }}
            placeholder="Go to…"
            aria-label="Go to section"
            className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            esc
          </kbd>
        </div>
        <ul className="max-h-[46vh] overflow-y-auto p-1.5" role="listbox">
          {matches.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              No section matches “{query}”.
            </li>
          ) : (
            matches.map((item, index) => (
              <li key={item.href} role="option" aria-selected={index === active}>
                <button
                  type="button"
                  onClick={() => go(item)}
                  onMouseEnter={() => setActive(index)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${
                    index === active ? "bg-accent text-accent-foreground" : ""
                  }`}
                >
                  <item.icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm">{item.title}</span>
                  <span className="ml-auto truncate pl-4 text-[11px] text-muted-foreground">
                    {item.description}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

/** The CommandBar trigger that replaced the placeholder search input. */
export function CommandPaletteTrigger() {
  return (
    <button
      type="button"
      data-palette-trigger
      onClick={() =>
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", metaKey: true }),
        )
      }
      className="relative flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground transition-colors hover:bg-accent/50"
    >
      <Search className="size-4" />
      <span>Go to…</span>
      <kbd className="ml-auto rounded border border-border/60 px-1.5 py-0.5 text-[10px]">
        ⌘K
      </kbd>
    </button>
  );
}
