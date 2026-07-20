"use client";

/**
 * Command Mode surfaces (ADR-052): the pending-approval queue and the
 * executed history. Every pending card shows EXACTLY what will happen —
 * the preview lines written at request time — with the guardrail tier on
 * the badge. Approve executes (once) with a full trace; Decline records the
 * founder's no. History shows outcomes honestly: executed, failed, or
 * partial, with the trace inspectable.
 */

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CircleSlash,
  Play,
  ShieldCheck,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  CommandHistoryEntry,
  GuardrailTier,
  PendingCommand,
  RejectedCommand,
} from "@/core/command-mode";
import {
  approveCommandAction,
  rejectCommandAction,
} from "../api/command-actions";

const TIER_LABELS: Record<GuardrailTier, string> = {
  auto: "auto",
  recommend_first: "recommend-first",
  approval_required: "approval-required",
};

const TIER_STYLES: Record<GuardrailTier, string> = {
  auto: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  recommend_first: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  approval_required: "border-rose-400/40 bg-rose-400/10 text-rose-300",
};

const STATUS_STYLES: Record<CommandHistoryEntry["status"], string> = {
  executed: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  failed: "border-rose-400/40 bg-rose-400/10 text-rose-300",
  partial: "border-amber-400/40 bg-amber-400/10 text-amber-300",
};

function PendingCard({
  command,
  onSettled,
}: {
  command: PendingCommand;
  onSettled: (message: string, ok: boolean) => void;
}) {
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  function approve() {
    startTransition(async () => {
      const result = await approveCommandAction(command.requestId);
      onSettled(result.message, result.ok);
    });
  }

  function decline() {
    startTransition(async () => {
      await rejectCommandAction(command.requestId, reason || undefined);
      onSettled("Declined — recorded in the learning feed.", true);
    });
  }

  return (
    <li className="rounded-xl border border-border/60 bg-background/40 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-medium">{command.title}</span>
            <Badge
              variant="outline"
              className={`text-[10px] uppercase tracking-wide ${TIER_STYLES[command.tier]}`}
            >
              {TIER_LABELS[command.tier]}
            </Badge>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wide text-muted-foreground">
              via {command.via}
            </Badge>
          </div>
          {/* Exactly what will happen — written at request time. */}
          <ul className="mt-1.5 flex flex-col gap-1">
            {command.previewLines.map((line) => (
              <li key={line} className="text-xs text-muted-foreground">
                {line}
              </li>
            ))}
          </ul>
          {declining && (
            <div className="mt-2 flex items-center gap-2">
              <Input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Reason (optional) — helps the Brain learn"
                className="h-8 border-border/60 bg-background/40 text-xs"
                aria-label="Decline reason"
              />
              <Button size="sm" variant="secondary" onClick={decline} disabled={pending}>
                Decline
              </Button>
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          <Button size="sm" onClick={approve} disabled={pending} title="Approve and execute">
            <Play className="size-3.5" />
            Approve
          </Button>
          {!declining && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeclining(true)}
              disabled={pending}
              title="Decline"
            >
              <X className="size-3.5" />
              Decline
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

function HistoryCard({ entry }: { entry: CommandHistoryEntry }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-lg border border-border/50 bg-background/30 px-3 py-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge
          variant="outline"
          className={`text-[10px] uppercase tracking-wide ${STATUS_STYLES[entry.status]}`}
        >
          {entry.status}
        </Badge>
        <span className="text-xs font-medium">{entry.title}</span>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          aria-expanded={open}
        >
          trace
          <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {entry.status === "executed"
          ? entry.trace.changes.join(" ")
          : entry.error}
      </p>
      {open && (
        <div className="mt-2 flex flex-col gap-1 rounded border border-border/50 bg-muted/20 p-2 text-[11px] text-muted-foreground">
          <p>
            Approved by {entry.trace.approvedBy} ·{" "}
            {entry.trace.approvedAt.slice(0, 16).replace("T", " ")} · finished{" "}
            {entry.trace.finishedAt.slice(11, 19)}
          </p>
          {entry.trace.steps.map((step) => (
            <p key={`${step.at}:${step.label}`}>
              {step.at.slice(11, 19)} — {step.label}
              {step.detail ? `: ${step.detail}` : ""}
            </p>
          ))}
          {entry.trace.changes.length > 0 && (
            <p className="text-foreground/80">
              Changed: {entry.trace.changes.join(" ")}
            </p>
          )}
          {entry.trace.revert && <p>Revert: {entry.trace.revert}</p>}
        </div>
      )}
    </li>
  );
}

export function CommandQueue({
  pending,
  history,
  rejected,
}: {
  pending: PendingCommand[];
  history: CommandHistoryEntry[];
  rejected: RejectedCommand[];
}) {
  const [settled, setSettled] = useState<ReadonlySet<string>>(new Set());
  const [notice, setNotice] = useState<{ message: string; ok: boolean } | null>(null);
  const visible = pending.filter((command) => !settled.has(command.requestId));

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-gradient-to-br from-card/70 to-card/30 p-5">
      <h2 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <ShieldCheck className="size-3.5 text-emerald-300" />
        Command Mode — pending approvals
        <span className="ml-auto font-normal normal-case tracking-normal">
          ADR-052 · nothing runs without you
        </span>
      </h2>

      {notice && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
            notice.ok
              ? "border-emerald-400/30 bg-emerald-400/5 text-emerald-200"
              : "border-rose-400/30 bg-rose-400/5 text-rose-200"
          }`}
        >
          {notice.ok ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertTriangle className="size-4 shrink-0" />
          )}
          {notice.message}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/10 px-4 py-3 text-xs text-muted-foreground">
          <CircleSlash className="size-4 shrink-0" />
          Nothing awaits approval. Ask the Brain for one — &quot;create a task
          to chase …&quot; — or queue an action from a recommendation.
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {visible.map((command) => (
            <PendingCard
              key={command.requestId}
              command={command}
              onSettled={(message, ok) => {
                setSettled((current) => new Set([...current, command.requestId]));
                setNotice({ message, ok });
              }}
            />
          ))}
        </ol>
      )}

      {(history.length > 0 || rejected.length > 0) && (
        <div className="flex flex-col gap-2 border-t border-border/50 pt-3">
          <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Execution history — every run traced
          </h3>
          <ul className="flex flex-col gap-1.5">
            {history.map((entry) => (
              <HistoryCard key={`${entry.requestId}:${entry.occurredAt}`} entry={entry} />
            ))}
            {rejected.map((entry) => (
              <li
                key={`${entry.requestId}:${entry.occurredAt}`}
                className="rounded-lg border border-border/50 bg-background/30 px-3 py-2"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    declined
                  </Badge>
                  <span className="text-xs font-medium">{entry.title}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.previewLines[0]}
                  {entry.reason ? ` — "${entry.reason}"` : ""}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
