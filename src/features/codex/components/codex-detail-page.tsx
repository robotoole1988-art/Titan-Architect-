"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCodex } from "../hooks/use-codex";
import { formatUpdatedAt } from "../model/format";
import { CodexStatusBadge } from "./codex-status-badge";

export function CodexDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { getById, hydrated, remove } = useCodex();
  const entry = getById(id);

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium">Entry not found</p>
        <p className="text-sm text-muted-foreground">
          It may have been deleted.
        </p>
        <Button variant="outline" render={<Link href="/codex" />}>
          <ArrowLeft className="size-4" />
          Back to Codex
        </Button>
      </div>
    );
  }

  function handleDelete() {
    if (!entry) return;
    const confirmed = window.confirm(
      `Delete "${entry.title}"? This cannot be undone.`,
    );
    if (!confirmed) return;
    remove(entry.id);
    router.push("/codex");
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
          render={<Link href="/codex" />}
        >
          <ArrowLeft className="size-4" />
          Codex
        </Button>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{entry.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{entry.category}</Badge>
            <CodexStatusBadge status={entry.status} />
            <span>v{entry.version}</span>
            <span aria-hidden>·</span>
            <span>Updated {formatUpdatedAt(entry.updatedAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            render={<Link href={`/codex/${entry.id}/edit`} />}
          >
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </header>

      <Separator />

      <Card>
        <CardContent className="py-6">
          <div className="max-w-none whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {entry.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
