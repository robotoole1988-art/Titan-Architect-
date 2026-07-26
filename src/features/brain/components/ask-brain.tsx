"use client";

/**
 * Ask the Brain (ADR-048) — the working input that replaced the placeholder.
 *
 * Question in → answer, the evidence behind it (real records, linked), how it
 * was derived, and an honest confidence badge. Read-only v1: links only, no
 * actions. Following an evidence link is recorded to the learning feed.
 */

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { BrainCircuit, CornerDownLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProvenanceInfo } from "@/components/ui/provenance-info";
import { confidenceBadged } from "../model/badges";
import {
  askBrainAction,
  recordBrainFollowUp,
  type AskBrainResponse,
} from "../api/actions";

const CONFIDENCE_STYLES: Record<AskBrainResponse["confidence"], string> = {
  high: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  medium: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  low: "border-border bg-muted/40 text-muted-foreground",
};

export function AskBrain({ placeholder }: { placeholder?: string }) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<AskBrainResponse | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌘K now belongs to the app-wide section switcher (ADR-057, amending
  // ADR-056's doorbell): the palette is the jump surface; the Brain keeps
  // ⌘J / Ctrl+J as its focus key so the front door still has a doorbell.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "j") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const asked = question.trim();
    if (!asked || pending) return;
    startTransition(async () => {
      setResponse(await askBrainAction(asked));
    });
  }

  return (
    <div className="flex flex-col gap-3" data-ask-brain>
      <form onSubmit={submit} className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <BrainCircuit className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-sky-300/80" />
          <Input
            ref={inputRef}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={placeholder ?? "Ask the Brain anything about the business…"}
            className="h-11 rounded-xl border-sky-400/25 bg-background/50 pl-10 pr-12 text-[15px] shadow-[0_0_30px_-12px] shadow-sky-400/25 focus-visible:border-sky-400/50"
            aria-label="Ask the Brain"
            disabled={pending}
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border/60 bg-muted/30 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ⌘J
          </kbd>
        </div>
        <Button type="submit" size="sm" variant="secondary" disabled={pending || !question.trim()}>
          {pending ? "Thinking…" : "Ask"}
          {!pending && <CornerDownLeft className="ml-1.5 size-3.5" />}
        </Button>
      </form>

      {response && (
        <div
          className="rounded-xl border border-border/60 bg-background/40 p-4"
          role="region"
          aria-label="Brain answer"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="min-w-0 flex-1 text-sm leading-relaxed">{response.answer}</p>
            {/* Confidence badges only when NOT high (ADR-056): uncertainty
                is the signal; confidence is the default state. */}
            {confidenceBadged(response.confidence) && (
              <Badge
                variant="outline"
                className={`shrink-0 text-[10px] uppercase tracking-wide ${CONFIDENCE_STYLES[response.confidence]}`}
              >
                {response.confidence} confidence
              </Badge>
            )}
          </div>

          {response.records.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1.5 border-t border-border/60 pt-3">
              {response.records.map((record) => (
                <li key={`${record.ref.kind}:${record.ref.id}:${record.label}`}>
                  <Link
                    href={record.href}
                    onClick={() => void recordBrainFollowUp(response.question, record.href)}
                    className="group flex items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/40"
                  >
                    <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <span className="min-w-0">
                      <span className="block font-medium leading-tight">{record.label}</span>
                      {record.detail && (
                        <span className="block text-xs text-muted-foreground">{record.detail}</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* How it was derived — staged behind ⓘ (Law §3), verbatim,
              including each evidence record's store lineage. */}
          <div className="mt-3 flex justify-end border-t border-border/60 pt-2">
            <ProvenanceInfo
              label="How this was answered"
              lines={[
                response.derivation,
                `answered by the ${response.backend} reasoner · read-only`,
                ...response.records.map(
                  (record) => `${record.label} — ${record.provenance}`,
                ),
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
