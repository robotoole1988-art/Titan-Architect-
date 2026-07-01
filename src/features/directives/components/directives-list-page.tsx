"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Target } from "lucide-react";
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
import { useDirectives } from "../hooks/use-directives";
import { DIRECTIVE_PRODUCTS, DIRECTIVE_STATUSES } from "../model/types";
import { formatDate } from "../model/format";
import {
  DirectivePriorityBadge,
  DirectiveStatusBadge,
} from "./directive-badges";

const ALL = "All";

const STATUS_FILTER_ITEMS = [
  { value: ALL, label: "All statuses" },
  ...DIRECTIVE_STATUSES.map((status) => ({ value: status, label: status })),
];

const PRODUCT_FILTER_ITEMS = [
  { value: ALL, label: "All products" },
  ...DIRECTIVE_PRODUCTS.map((product) => ({ value: product, label: product })),
];

export function DirectivesListPage() {
  const { directives, hydrated } = useDirectives();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>(ALL);
  const [product, setProduct] = useState<string>(ALL);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return directives.filter((directive) => {
      const matchesQuery =
        !q ||
        directive.title.toLowerCase().includes(q) ||
        directive.number.toLowerCase().includes(q) ||
        directive.objective.toLowerCase().includes(q);
      const matchesStatus = status === ALL || directive.status === status;
      const matchesProduct = product === ALL || directive.product === product;
      return matchesQuery && matchesStatus && matchesProduct;
    });
  }, [directives, query, status, product]);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Directives</h1>
          <p className="text-muted-foreground">
            Strategic build directives that guide development.
          </p>
        </div>
        <Button render={<Link href="/directives/new" />}>
          <Plus className="size-4" />
          New directive
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search directives…"
            className="pl-9"
            aria-label="Search directives"
          />
        </div>
        <Select
          value={status}
          items={STATUS_FILTER_ITEMS}
          onValueChange={(value) => setStatus((value as string) ?? ALL)}
        >
          <SelectTrigger className="w-44" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {DIRECTIVE_STATUSES.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={product}
          items={PRODUCT_FILTER_ITEMS}
          onValueChange={(value) => setProduct((value as string) ?? ALL)}
        >
          <SelectTrigger className="w-56" aria-label="Filter by product">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All products</SelectItem>
            {DIRECTIVE_PRODUCTS.map((option) => (
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
            <Skeleton key={index} className="h-[76px] w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex min-h-[280px] flex-col items-center justify-center gap-3 border-dashed text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl border bg-muted/40">
            <Target className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">
            {directives.length === 0
              ? "No directives yet"
              : "No directives match your filters"}
          </p>
          {directives.length === 0 && (
            <Button variant="outline" render={<Link href="/directives/new" />}>
              <Plus className="size-4" />
              Create the first directive
            </Button>
          )}
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((directive) => (
            <li key={directive.id}>
              <Link href={`/directives/${directive.id}`} className="block">
                <Card className="flex flex-row items-center justify-between gap-4 p-4 transition-colors hover:border-ring/40 hover:bg-card/60">
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {directive.number}
                      </span>
                      <span className="truncate font-medium">
                        {directive.title}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {directive.product} · Updated{" "}
                      {formatDate(directive.updatedAt)}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <DirectivePriorityBadge priority={directive.priority} />
                    <DirectiveStatusBadge status={directive.status} />
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
