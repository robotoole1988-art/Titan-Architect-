"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useDirectives } from "../hooks/use-directives";
import { formatDate } from "../model/format";
import {
  DirectivePriorityBadge,
  DirectiveStatusBadge,
} from "./directive-badges";

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
        {body || "—"}
      </p>
    </section>
  );
}

export function DirectiveDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { getById, hydrated, remove } = useDirectives();
  const directive = getById(id);

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (!directive) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium">Directive not found</p>
        <p className="text-sm text-muted-foreground">It may have been deleted.</p>
        <Button variant="outline" render={<Link href="/directives" />}>
          <ArrowLeft className="size-4" />
          Back to Directives
        </Button>
      </div>
    );
  }

  function handleDelete() {
    if (!directive) return;
    const confirmed = window.confirm(
      `Delete "${directive.number} — ${directive.title}"? This cannot be undone.`,
    );
    if (!confirmed) return;
    remove(directive.id);
    router.push("/directives");
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
          render={<Link href="/directives" />}
        >
          <ArrowLeft className="size-4" />
          Directives
        </Button>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            {directive.number}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">
            {directive.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <DirectiveStatusBadge status={directive.status} />
            <DirectivePriorityBadge priority={directive.priority} />
            <Badge variant="secondary">{directive.product}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            render={<Link href={`/directives/${directive.id}/edit`} />}
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
        <CardContent className="flex flex-col gap-6 py-6">
          <Section title="Objective" body={directive.objective} />
          <Section title="Requirements" body={directive.requirements} />
          <Section
            title="Acceptance Criteria"
            body={directive.acceptanceCriteria}
          />
          <Separator />
          <div className="flex flex-wrap gap-x-8 gap-y-1 text-xs text-muted-foreground">
            <span>Created {formatDate(directive.createdAt)}</span>
            <span>Updated {formatDate(directive.updatedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
