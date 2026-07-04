"use client";

/**
 * conversion.lead-capture — the committed next step. Anchor target of every
 * CTA on the page (#callback).
 *
 * Renders a real, keyboard-operable callback form. On a PUBLISHED site
 * (serving context present, ADR-027) it submits to the public enquiry
 * endpoint — honeypot-guarded — and the enquiry lands in the customer's
 * account. In previews it stays an honest annotation (no faked success).
 * Variants: "callback-request" / "short-form" / "multi-step" /
 * "consultation-booking" (v1: one crafted callback form).
 */

import { useState, type FormEvent } from "react";
import { Phone } from "lucide-react";
import type { PrimitiveSectionProps } from "../model/types";
import { sendSiteMetric, siteRelativePath } from "../components/site-metrics-beacon";
import { Reveal } from "../motion/motion";
import {
  AnnotationTag,
  Container,
  Eyebrow,
  SectionShell,
  SectionTitle,
  SignalCTA,
  monoFont,
  primitiveName,
} from "./atoms";

/** Pull the quoted objection from the objective direction, if present. */
function extractQuote(text: string | undefined): string | undefined {
  return text?.match(/[“"]([^”"]+)[”"]/)?.[1];
}

const FIELD_CLASS =
  "w-full rounded-xl border bg-transparent px-4 py-3.5 text-base outline-none transition-colors focus-visible:border-[var(--wr-accent)]";

export function ConversionLeadCapture({
  section,
  slots,
  serving,
  mode,
}: PrimitiveSectionProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">(
    "idle",
  );
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);
  const objection = extractQuote(slots.objective);
  const ctaLabel = slots["cta-label"] ?? "";

  // Measurement (ADR-030): form_start once on first interaction, published only.
  function onFormInteract() {
    if (!serving || started) return;
    setStarted(true);
    sendSiteMetric(serving.slug, siteRelativePath(serving.slug, window.location.pathname), "form_start");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!serving) {
      // Preview: no backend theatre — the annotation says exactly that.
      setSubmitted(true);
      return;
    }
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: serving.slug,
          name: String(form.get("name") ?? ""),
          contact: String(form.get("phone") ?? ""),
          message: String(form.get("message") ?? ""),
          sourcePage: window.location.pathname,
          website: String(form.get("website") ?? ""), // honeypot
        }),
      });
      setStatus(response.ok ? "sent" : "failed");
      if (response.ok) {
        sendSiteMetric(serving.slug, siteRelativePath(serving.slug, window.location.pathname), "form_submit");
      }
    } catch {
      setStatus("failed");
    }
  }

  return (
    <SectionShell section={section} className="scroll-mt-8" >
      {/* the anchor every CTA points at */}
      <span id="callback" className="absolute -top-24" aria-hidden />
      <Container wide>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Reveal>
              <Eyebrow>{primitiveName(section)}</Eyebrow>
              <SectionTitle id={`${section.id}-title`}>
                {objection ? `“${objection}”` : ctaLabel}
              </SectionTitle>
              {/* The quote is the CUSTOMER'S inner voice — it renders
                  unattributed, never as a company statement (ADR-034). */}
            </Reveal>
            <Reveal delay={0.12}>
              <div className="mt-8">
                <SignalCTA href="#callback" size="md">
                  <Phone className="size-4" aria-hidden />
                  {ctaLabel}
                </SignalCTA>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.08}>
            <form
              onSubmit={onSubmit} onFocusCapture={onFormInteract}
              className="flex flex-col gap-4 rounded-[var(--wr-radius-lg)] border p-7 sm:p-9"
              style={{
                borderColor: "var(--wr-line-strong)",
                background: "var(--wr-bg-raised)",
                boxShadow: "0 30px 80px -30px rgba(0,0,0,0.6)",
              }}
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={`${section.id}-name`}
                  className="text-xs uppercase tracking-[0.16em]"
                  style={{ ...monoFont, color: "var(--wr-ink-faint)" }}
                >
                  Name
                </label>
                <input
                  id={`${section.id}-name`}
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={FIELD_CLASS}
                  style={{ borderColor: "var(--wr-line)", color: "var(--wr-ink)" }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={`${section.id}-phone`}
                  className="text-xs uppercase tracking-[0.16em]"
                  style={{ ...monoFont, color: "var(--wr-ink-faint)" }}
                >
                  Phone
                </label>
                <input
                  id={`${section.id}-phone`}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  className={FIELD_CLASS}
                  style={{ borderColor: "var(--wr-line)", color: "var(--wr-ink)" }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={`${section.id}-message`}
                  className="text-xs uppercase tracking-[0.16em]"
                  style={{ ...monoFont, color: "var(--wr-ink-faint)" }}
                >
                  What needs doing? (optional)
                </label>
                <textarea
                  id={`${section.id}-message`}
                  name="message"
                  rows={3}
                  className={FIELD_CLASS}
                  style={{ borderColor: "var(--wr-line)", color: "var(--wr-ink)" }}
                />
              </div>
              {/* Honeypot — hidden from humans, irresistible to bots */}
              <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
                <label htmlFor={`${section.id}-website`}>Website</label>
                <input
                  id={`${section.id}-website`}
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              {serving && status === "sent" ? (
                <p
                  className="rounded-xl border px-4 py-4 text-center text-base font-medium"
                  style={{
                    borderColor: "var(--wr-ok)",
                    color: "var(--wr-ok)",
                  }}
                  data-enquiry-sent
                >
                  Request received — expect a call back shortly.
                </p>
              ) : (
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-2 w-full rounded-xl px-6 py-4 text-base font-semibold transition-transform focus-visible:outline-2 focus-visible:outline-offset-4 active:scale-[0.99] disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(180deg, var(--wr-accent), var(--wr-accent-strong))",
                    color: "var(--wr-accent-ink)",
                    outlineColor: "var(--wr-accent)",
                  }}
                >
                  {status === "sending" ? "Sending…" : ctaLabel}
                </button>
              )}
              {serving && status === "failed" && (
                <p className="text-sm" style={{ color: "var(--wr-ink-muted)" }}>
                  That didn&apos;t send — please try again, or call instead.
                </p>
              )}
              {!serving &&
                mode === "preview" &&
                (submitted ? (
                  <AnnotationTag>
                    lead-capture slot · live submission activates when the site
                    is published
                  </AnnotationTag>
                ) : (
                  slots.fields && (
                    <p className="text-[11px] leading-relaxed" style={{ ...monoFont, color: "var(--wr-ink-faint)" }}>
                      {slots.fields}
                    </p>
                  )
                ))}
            </form>
          </Reveal>
        </div>
      </Container>
    </SectionShell>
  );
}
