"use client";

/**
 * conversion.lead-capture — the committed next step. Anchor target of every
 * CTA on the page (#callback).
 *
 * Renders a real, keyboard-operable callback form. Submission is not wired to
 * a backend yet — submitting reveals an explicit annotation instead of faking
 * success (honesty over theatre, ADR-022). Variants: "callback-request" /
 * "short-form" / "multi-step" / "consultation-booking" (v1: one crafted
 * callback form; the variant is recorded in the markup for the future flows).
 */

import { useState, type FormEvent } from "react";
import { Phone } from "lucide-react";
import type { PrimitiveSectionProps } from "../model/types";
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

export function ConversionLeadCapture({ section, slots, blueprint }: PrimitiveSectionProps) {
  const [submitted, setSubmitted] = useState(false);
  const objection = extractQuote(slots.objective);
  const ctaLabel = slots["cta-label"] ?? "";

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
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
              {objection && ctaLabel && (
                <p
                  className="mt-5 text-pretty"
                  style={{ fontSize: "var(--wr-text-lg)", color: "var(--wr-ink-muted)" }}
                >
                  {blueprint.identity.businessName}
                </p>
              )}
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
              onSubmit={onSubmit}
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
              <button
                type="submit"
                className="mt-2 w-full rounded-xl px-6 py-4 text-base font-semibold transition-transform focus-visible:outline-2 focus-visible:outline-offset-4 active:scale-[0.99]"
                style={{
                  background:
                    "linear-gradient(180deg, var(--wr-accent), var(--wr-accent-strong))",
                  color: "var(--wr-accent-ink)",
                  outlineColor: "var(--wr-accent)",
                }}
              >
                {ctaLabel}
              </button>
              {submitted ? (
                <AnnotationTag>
                  lead-capture slot · flow wiring lands with the Growth Engine
                </AnnotationTag>
              ) : (
                slots.fields && (
                  <p className="text-[11px] leading-relaxed" style={{ ...monoFont, color: "var(--wr-ink-faint)" }}>
                    {slots.fields}
                  </p>
                )
              )}
            </form>
          </Reveal>
        </div>
      </Container>
    </SectionShell>
  );
}
