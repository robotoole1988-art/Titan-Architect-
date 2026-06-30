"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookText, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCodex } from "../hooks/use-codex";
import { CODEX_CATEGORIES } from "../model/types";
import { formatUpdatedAt } from "../model/format";
import { CodexStatusBadge } from "./codex-status-badge";

const ALL = "All";

const CATEGORY_FILTER_ITEMS = [
  { value: ALL, label: "All categories" },
  ...CODEX_CATEGORIES.map((category) => ({ value: category, label: category })),
];

export function CodexListPage() {
  const { entries, hydrated } = useCodex();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesQuery =
        !q ||
        entry.title.toLowerCase().includes(q) ||
        entry.content.toLowerCase().includes(q);
      const matchesCategory = category === ALL || entry.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [entries, query, category]);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Codex</h1>
          <p className="text-muted-foreground">
            Company knowledge and intellectual property.
          </p>
        </div>
        <Button render={<Link href="/codex/new" />}>
          <Plus className="size-4" />
          New entry
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search entries…"
            className="pl-9"
            aria-label="Search Codex entries"
          />
        </div>
        <Select
          value={category}
          items={CATEGORY_FILTER_ITEMS}
          onValueChange={(value) => setCategory((value as string) ?? ALL)}
        >
          <SelectTrigger className="w-52" aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {CODEX_CATEGORIES.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!hydrated ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[68px] w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex min-h-[280px] flex-col items-center justify-center gap-3 border-dashed text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl border bg-muted/40">
            <BookText className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">
            {entries.length === 0
              ? "No Codex entries yet"
              : "No entries match your filters"}
          </p>
          {entries.length === 0 && (
            <Button variant="outline" render={<Link href="/codex/new" />}>
              <Plus className="size-4" />
              Create the first entry
            </Button>
          )}
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((entry) => (
            <li key={entry.id}>
              <Link href={`/codex/${entry.id}`} className="block">
                <Card className="flex flex-row items-center justify-between gap-4 p-4 transition-colors hover:border-ring/40 hover:bg-card/60">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate font-medium">{entry.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {entry.category} · v{entry.version} · Updated{" "}
                      {formatUpdatedAt(entry.updatedAt)}
                    </span>
                  </div>
                  <CodexStatusBadge status={entry.status} />
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
