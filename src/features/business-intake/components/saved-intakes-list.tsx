"use client";

import Link from "next/link";
import { ClipboardList, Trash2, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useBusinessIntake } from "../hooks/use-business-intake";
import { formatDate } from "../model/format";
import type { UrgencyLevel } from "../model/types";

const URGENCY_STYLES: Record<UrgencyLevel, string> = {
  Low: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  Medium: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  High: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  Critical: "border-red-500/30 bg-red-500/10 text-red-400",
};

export function SavedIntakesList() {
  const { intakes, hydrated, remove } = useBusinessIntake();

  function handleRemove(id: string, name: string) {
    if (window.confirm(`Remove the intake for "${name}"?`)) {
      remove(id);
    }
  }

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (intakes.length === 0) {
    return (
      <Card className="flex min-h-[220px] flex-col items-center justify-center gap-3 border-dashed bg-card/40 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl border bg-muted/40">
          <ClipboardList className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No saved intakes yet</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Complete the form to save your first business intake.
        </p>
      </Card>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {intakes.map((intake) => (
        <li key={intake.id}>
          <Card className="flex flex-col gap-3 border-border/60 bg-card/40 p-5 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate font-medium">
                  {intake.businessName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {intake.trade} · {intake.location} · Saved{" "}
                  {formatDate(intake.createdAt)}
                </span>
              </div>
              <Badge
                variant="outline"
                className={cn("shrink-0 font-medium", URGENCY_STYLES[intake.urgencyLevel])}
              >
                {intake.urgencyLevel}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <span>
                <span className="text-foreground/70">Goal:</span> {intake.mainGoal}
              </span>
              <span>
                <span className="text-foreground/70">Budget:</span>{" "}
                {intake.monthlyMarketingBudget}
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between gap-2">
              <Button
                size="sm"
                className="gap-1.5"
                render={
                  <Link
                    href={`/experience-studio?${new URLSearchParams({
                      businessName: intake.businessName,
                      trade: intake.trade,
                      location: intake.location,
                    }).toString()}`}
                  />
                }
              >
                <Wand2 className="size-3.5" />
                Generate Strategy
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemove(intake.id, intake.businessName)}
              >
                <Trash2 className="size-3.5" />
                Remove
              </Button>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
