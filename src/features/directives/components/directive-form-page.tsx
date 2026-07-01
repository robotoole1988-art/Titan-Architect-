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
import { useDirectives } from "../hooks/use-directives";
import {
  DIRECTIVE_PRIORITIES,
  DIRECTIVE_PRODUCTS,
  DIRECTIVE_STATUSES,
  type DirectiveDraft,
  type DirectivePriority,
  type DirectiveProduct,
  type DirectiveStatus,
} from "../model/types";

const STATUS_ITEMS = DIRECTIVE_STATUSES.map((value) => ({ value, label: value }));
const PRIORITY_ITEMS = DIRECTIVE_PRIORITIES.map((value) => ({ value, label: value }));
const PRODUCT_ITEMS = DIRECTIVE_PRODUCTS.map((value) => ({ value, label: value }));

const EMPTY_DRAFT: DirectiveDraft = {
  title: "",
  number: "",
  status: "Draft",
  priority: "Medium",
  product: "TITAN Architect",
  objective: "",
  requirements: "",
  acceptanceCriteria: "",
};

interface DirectiveFormPageProps {
  mode: "create" | "edit";
  id?: string;
}

/**
 * Routing/loading wrapper. Resolves the initial draft (empty for create, the
 * existing directive for edit) and renders the form. Form state is seeded from
 * props via a lazy initializer — no effect — and remounts on a changing `key`.
 */
export function DirectiveFormPage({ mode, id }: DirectiveFormPageProps) {
  const router = useRouter();
  const { getById, hydrated, create, update } = useDirectives();

  if (mode === "edit") {
    if (!hydrated) {
      return (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[32rem] w-full rounded-xl" />
        </div>
      );
    }

    const existing = id ? getById(id) : undefined;
    if (!existing) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm font-medium">Directive not found</p>
          <Button variant="outline" render={<Link href="/directives" />}>
            <ArrowLeft className="size-4" />
            Back to Directives
          </Button>
        </div>
      );
    }

    return (
      <FormShell
        title="Edit directive"
        description="Update this directive."
        cancelHref={`/directives/${existing.id}`}
        cancelLabel="Cancel"
      >
        <DirectiveForm
          key={existing.id}
          initialDraft={{
            title: existing.title,
            number: existing.number,
            status: existing.status,
            priority: existing.priority,
            product: existing.product,
            objective: existing.objective,
            requirements: existing.requirements,
            acceptanceCriteria: existing.acceptanceCriteria,
          }}
          submitLabel="Save changes"
          cancelHref={`/directives/${existing.id}`}
          onSubmit={(draft) => {
            const saved = update(existing.id, draft);
            router.push(saved ? `/directives/${saved.id}` : "/directives");
          }}
        />
      </FormShell>
    );
  }

  return (
    <FormShell
      title="New directive"
      description="Add a new strategic directive."
      cancelHref="/directives"
      cancelLabel="Directives"
    >
      <DirectiveForm
        initialDraft={EMPTY_DRAFT}
        submitLabel="Create directive"
        cancelHref="/directives"
        onSubmit={(draft) => {
          const saved = create(draft);
          router.push(`/directives/${saved.id}`);
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

function DirectiveForm({
  initialDraft,
  submitLabel,
  cancelHref,
  onSubmit,
}: {
  initialDraft: DirectiveDraft;
  submitLabel: string;
  cancelHref: string;
  onSubmit: (draft: DirectiveDraft) => void;
}) {
  const [draft, setDraft] = useState<DirectiveDraft>(initialDraft);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof DirectiveDraft>(
    key: K,
    value: DirectiveDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!draft.number.trim()) {
      setError("Directive number is required.");
      return;
    }
    setError(null);
    onSubmit({
      ...draft,
      title: draft.title.trim(),
      number: draft.number.trim(),
    });
  }

  return (
    <Card>
      <CardContent className="py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="directive-title">Title</Label>
              <Input
                id="directive-title"
                value={draft.title}
                onChange={(event) => setField("title", event.target.value)}
                placeholder="e.g. Enterprise Foundation"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="directive-number">Directive number</Label>
              <Input
                id="directive-number"
                value={draft.number}
                onChange={(event) => setField("number", event.target.value)}
                placeholder="e.g. DIRECTIVE-001"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Select
                value={draft.status}
                items={STATUS_ITEMS}
                onValueChange={(value) =>
                  setField("status", value as DirectiveStatus)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTIVE_STATUSES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Priority</Label>
              <Select
                value={draft.priority}
                items={PRIORITY_ITEMS}
                onValueChange={(value) =>
                  setField("priority", value as DirectivePriority)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTIVE_PRIORITIES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Product</Label>
              <Select
                value={draft.product}
                items={PRODUCT_ITEMS}
                onValueChange={(value) =>
                  setField("product", value as DirectiveProduct)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTIVE_PRODUCTS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="directive-objective">Objective</Label>
            <Textarea
              id="directive-objective"
              value={draft.objective}
              onChange={(event) => setField("objective", event.target.value)}
              rows={3}
              placeholder="What this directive sets out to achieve…"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="directive-requirements">Requirements</Label>
            <Textarea
              id="directive-requirements"
              value={draft.requirements}
              onChange={(event) => setField("requirements", event.target.value)}
              rows={5}
              placeholder="What must be built…"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="directive-acceptance">Acceptance criteria</Label>
            <Textarea
              id="directive-acceptance"
              value={draft.acceptanceCriteria}
              onChange={(event) =>
                setField("acceptanceCriteria", event.target.value)
              }
              rows={5}
              placeholder="How we know it is done…"
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
