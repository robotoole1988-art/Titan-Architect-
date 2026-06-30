"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCodex } from "../hooks/use-codex";
import {
  CODEX_CATEGORIES,
  CODEX_STATUSES,
  type CodexCategory,
  type CodexDraft,
  type CodexStatus,
} from "../model/types";

const CATEGORY_ITEMS = CODEX_CATEGORIES.map((category) => ({
  value: category,
  label: category,
}));

const STATUS_ITEMS = CODEX_STATUSES.map((status) => ({
  value: status,
  label: status,
}));

const EMPTY_DRAFT: CodexDraft = {
  title: "",
  category: "Vision",
  status: "Draft",
  version: "0.1.0",
  content: "",
};

interface CodexFormPageProps {
  mode: "create" | "edit";
  id?: string;
}

/**
 * Routing/loading wrapper. Resolves the initial draft (empty for create, the
 * existing entry for edit) and renders the form. The form's state is seeded
 * from props via a lazy initializer — no effect — and remounts on a changing
 * `key` if the underlying entry changes.
 */
export function CodexFormPage({ mode, id }: CodexFormPageProps) {
  const router = useRouter();
  const { getById, hydrated, create, update } = useCodex();

  if (mode === "edit") {
    if (!hydrated) {
      return (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      );
    }

    const existing = id ? getById(id) : undefined;
    if (!existing) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm font-medium">Entry not found</p>
          <Button variant="outline" render={<Link href="/codex" />}>
            <ArrowLeft className="size-4" />
            Back to Codex
          </Button>
        </div>
      );
    }

    return (
      <FormShell
        title="Edit entry"
        description="Update this Codex entry."
        cancelHref={`/codex/${existing.id}`}
        cancelLabel="Cancel"
      >
        <CodexEntryForm
          key={existing.id}
          initialDraft={{
            title: existing.title,
            category: existing.category,
            status: existing.status,
            version: existing.version,
            content: existing.content,
          }}
          submitLabel="Save changes"
          cancelHref={`/codex/${existing.id}`}
          onSubmit={(draft) => {
            const saved = update(existing.id, draft);
            router.push(saved ? `/codex/${saved.id}` : "/codex");
          }}
        />
      </FormShell>
    );
  }

  return (
    <FormShell
      title="New entry"
      description="Add a new entry to the Codex."
      cancelHref="/codex"
      cancelLabel="Codex"
    >
      <CodexEntryForm
        initialDraft={EMPTY_DRAFT}
        submitLabel="Create entry"
        cancelHref="/codex"
        onSubmit={(draft) => {
          const saved = create(draft);
          router.push(`/codex/${saved.id}`);
        }}
      />
    </FormShell>
  );
}

function FormShell({
  title,
  description,
  cancelHref,
  cancelLabel,
  children,
}: {
  title: string;
  description: string;
  cancelHref: string;
  cancelLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
          render={<Link href={cancelHref} />}
        >
          <ArrowLeft className="size-4" />
          {cancelLabel}
        </Button>
      </div>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </header>
      {children}
    </div>
  );
}

function CodexEntryForm({
  initialDraft,
  submitLabel,
  cancelHref,
  onSubmit,
}: {
  initialDraft: CodexDraft;
  submitLabel: string;
  cancelHref: string;
  onSubmit: (draft: CodexDraft) => void;
}) {
  const [draft, setDraft] = useState<CodexDraft>(initialDraft);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof CodexDraft>(key: K, value: CodexDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!draft.version.trim()) {
      setError("Version is required.");
      return;
    }
    setError(null);
    onSubmit({
      ...draft,
      title: draft.title.trim(),
      version: draft.version.trim(),
    });
  }

  return (
    <Card>
      <CardContent className="py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="codex-title">Title</Label>
            <Input
              id="codex-title"
              value={draft.title}
              onChange={(event) => setField("title", event.target.value)}
              placeholder="e.g. Architecture Charter"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <Select
                value={draft.category}
                items={CATEGORY_ITEMS}
                onValueChange={(value) =>
                  setField("category", value as CodexCategory)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CODEX_CATEGORIES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Select
                value={draft.status}
                items={STATUS_ITEMS}
                onValueChange={(value) =>
                  setField("status", value as CodexStatus)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CODEX_STATUSES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="codex-version">Version</Label>
              <Input
                id="codex-version"
                value={draft.version}
                onChange={(event) => setField("version", event.target.value)}
                placeholder="e.g. 1.0.0"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="codex-updated">Last updated</Label>
              <Input
                id="codex-updated"
                value="Set automatically on save"
                disabled
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="codex-content">Content</Label>
            <Textarea
              id="codex-content"
              value={draft.content}
              onChange={(event) => setField("content", event.target.value)}
              rows={10}
              placeholder="Write the entry content…"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" render={<Link href={cancelHref} />}>
              Cancel
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
