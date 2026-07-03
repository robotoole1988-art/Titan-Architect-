"use client";

/**
 * New-enquiry indicator (ADR-030). Polls the in-app feed so no enquiry can
 * sit unseen: badge with the unseen count, dropdown with the latest, one tap
 * to the enquiry in Accounts.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FeedItem {
  id: string;
  name: string;
  business: string;
  sourcePage: string;
  status: string;
  createdAt: string;
}

export function NotificationsBell() {
  const [newCount, setNewCount] = useState(0);
  const [recent, setRecent] = useState<FeedItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/notifications", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as {
          newCount: number;
          recent: FeedItem[];
        };
        if (!cancelled) {
          setNewCount(data.newCount);
          setRecent(data.recent);
        }
      } catch {
        // The bell degrades silently; the email channel is the guarantee.
      }
    }
    void load();
    const interval = setInterval(load, 15_000);
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={
              newCount > 0 ? `${newCount} new enquiries` : "Notifications"
            }
          />
        }
      >
        <Bell className="size-5" />
        {newCount > 0 && (
          <span
            data-new-enquiries={newCount}
            className="absolute -right-0.5 -top-0.5 flex size-4.5 min-w-4.5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-emerald-950"
          >
            {newCount > 9 ? "9+" : newCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          {newCount > 0 ? `${newCount} new enquir${newCount === 1 ? "y" : "ies"}` : "Enquiries"}
        </DropdownMenuLabel>
        {recent.length === 0 ? (
          <div className="px-2 py-3 text-sm text-muted-foreground">
            Enquiries from live sites land here.
          </div>
        ) : (
          recent.map((item) => (
            <DropdownMenuItem
              key={item.id}
              render={<Link href={`/crm/accounts?enquiry=${item.id}`} />}
              className="flex flex-col items-start gap-0.5"
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="font-medium">{item.name}</span>
                {item.status === "new" && (
                  <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                    new
                  </span>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {item.business} · {item.sourcePage}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
