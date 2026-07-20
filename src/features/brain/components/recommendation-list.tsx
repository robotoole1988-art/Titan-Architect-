"use client";

/**
 * The recommendation list (ADR-050): each card leads with the action, shows
 * urgency + confidence honestly, expands into the full WHY (what happened,
 * why it matters, evidence with provenance, impact, risk), and carries the
 * two founder controls — Accept and Dismiss (optional reason). Read-only:
 * nothing here executes anything.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  ListPlus,
  Share2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  acceptRecommendation,
  dismissRecommendation,
} from "../api/decision-actions";
import { requestCommandAction } from "../api/command-actions";
import type { NarratedRecommendation } from "../api/decisions";

/** The business a recommendation concerns, when its link is a CRM record. */
function businessIdOf(recommendation: NarratedRecommendation): string | null {
  const match = recommendation.link.match(/^\/crm\/([^/]+)$/);
  return match && match[1] !== "build-queue" ? match[1] : null;
}

const URGENCY_STYLES: Record<string, string> = {
  now: "border-rose-400/40 bg-rose-400/10 text-rose-300",
  today: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  this_week: "border-sky-400/40 bg-sky-400/10 text-sky-300",
};

function RecommendationCard({
  recommendation,
  rank,
  onGone,
}: {
  recommendation: NarratedRecommendation;
  rank: number;
  onGone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  function accept() {
    startTransition(async () => {
      await acceptRecommendation(recommendation.id, recommendation.recommendedAction);
      onGone();
    });
  }

  function dismiss() {
    startTransition(async () => {
      await dismissRecommendation(
        recommendation.id,
        recommendation.recommendedAction,
        reason || undefined,
      );
      onGone();
    });
  }

  // Command Mode (ADR-052): both buttons QUEUE a pending approval card — the
  // exact preview is approved (or declined) in the Command Mode queue below.
  const businessId = businessIdOf(recommendation);

  function queueNextAction() {
    startTransition(async () => {
      if (!businessId) return;
      await requestCommandAction(
        "create_next_action",
        { businessId, text: recommendation.recommendedAction },
        "recommendation",
      );
    });
  }

  function delegate() {
    startTransition(async () => {
      await requestCommandAction(
        "delegate_recommendation",
        {
          recommendationId: recommendation.id,
          summary: recommendation.recommendedAction,
        },
        "recommendation",
      );
    });
  }

  return (
    <li className="rounded-xl border border-border/60 bg-background/40 px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted/60 text-[11px] font-semibold tabular-nums">
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug">
            {recommendation.recommendedAction}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {recommendation.narrated ?? recommendation.whyItMatters}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className={`text-[10px] uppercase tracking-wide ${URGENCY_STYLES[recommendation.urgency]}`}
            >
              {recommendation.urgency.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {recommendation.confidence} confidence
            </Badge>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wide text-muted-foreground">
              risk if ignored: {recommendation.riskLevel}
            </Badge>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              aria-expanded={open}
            >
              why
              <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
          </div>

          {open && (
            <div className="mt-3 flex flex-col gap-2 rounded-lg border border-border/50 bg-muted/20 p-3 text-xs">
              <p>
                <span className="font-medium text-foreground">What happened: </span>
                <span className="text-muted-foreground">{recommendation.whatHappened}</span>
              </p>
              <p>
                <span className="font-medium text-foreground">Why it matters: </span>
                <span className="text-muted-foreground">{recommendation.whyItMatters}</span>
              </p>
              <p>
                <span className="font-medium text-foreground">Expected impact: </span>
                <span className="text-muted-foreground">{recommendation.expectedImpact}</span>
              </p>
              <ul className="flex flex-col gap-1 border-t border-border/50 pt-2">
                {recommendation.evidence.map((record) => (
                  <li key={`${record.ref.kind}:${record.ref.id}:${record.label}`}>
                    <Link
                      href={record.href}
                      className="group flex items-start gap-1.5 rounded px-1 py-0.5 hover:bg-muted/40"
                    >
                      <ExternalLink className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                      <span className="min-w-0">
                        <span className="block leading-tight">{record.label}</span>
                        {record.detail && (
                          <span className="block text-muted-foreground">{record.detail}</span>
                        )}
                        <span className="block text-[10px] uppercase tracking-wide text-muted-foreground/70">
                          {record.provenance}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
                rule {recommendation.rule} · owner {recommendation.suggestedOwner} · read-only — nothing executes without you
              </p>
            </div>
          )}

          {dismissing && (
            <div className="mt-2 flex items-center gap-2">
              <Input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Reason (optional) — helps the Brain learn"
                className="h-8 border-border/60 bg-background/40 text-xs"
                aria-label="Dismissal reason"
              />
              <Button size="sm" variant="secondary" onClick={dismiss} disabled={pending}>
                Dismiss
              </Button>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={accept}
            disabled={pending}
            title="Mark actioned"
          >
            <Check className="size-3.5" />
            Accept
          </Button>
          {businessId && (
            <Button
              size="sm"
              variant="ghost"
              onClick={queueNextAction}
              disabled={pending}
              title="Queue this as a next action on the business (lands as a pending approval)"
            >
              <ListPlus className="size-3.5" />
              Queue task
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={delegate}
            disabled={pending}
            title="Mark as delegated (lands as a pending approval)"
          >
            <Share2 className="size-3.5" />
            Delegate
          </Button>
          {!dismissing && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissing(true)}
              disabled={pending}
              title="Dismiss"
            >
              <X className="size-3.5" />
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

export function RecommendationList({
  recommendations,
  backend,
}: {
  recommendations: NarratedRecommendation[];
  backend: "anthropic" | "deterministic";
}) {
  const [gone, setGone] = useState<ReadonlySet<string>>(new Set());
  const visible = recommendations.filter((recommendation) => !gone.has(recommendation.id));

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-gradient-to-br from-card/70 to-card/30 p-5">
      <h2 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <BrainCircuit className="size-3.5 text-sky-300" />
        Today&apos;s top actions
        <span className="ml-auto font-normal normal-case tracking-normal">
          Decision Engine · {backend} narration · approval-gated (ADR-052)
        </span>
      </h2>
      {visible.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/5 px-4 py-4 text-sm text-emerald-200">
          <CheckCircle2 className="size-5 shrink-0" />
          Nothing needs you right now — no SLA breaches, no stalled deals or
          builds, nothing waiting in a gate. Honestly quiet.
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {visible.map((recommendation, index) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              rank={index + 1}
              onGone={() =>
                setGone((current) => new Set([...current, recommendation.id]))
              }
            />
          ))}
        </ol>
      )}
    </section>
  );
}
