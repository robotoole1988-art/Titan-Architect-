"use client";

/**
 * faq.reassurance-accordion — objection handling, honestly staged.
 *
 * The blueprint provides the FAQ's *direction*, not finished Q&A. The primary
 * objection (real customer language extracted from the direction) opens the
 * accordion as a genuine question; the remaining items are explicit content
 * slots derived from the strategy's content pillars, each annotated as
 * awaiting real answers. Keyboard-operable disclosure throughout.
 * Variants: "accordion" / "two-column".
 */

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { CinematicImage } from "./cinematic-image";
import type { PrimitiveSectionProps } from "../model/types";
import { Reveal } from "../motion/motion";
import { splitList } from "../model/slots";
import {
  AnnotationTag,
  Container,
  Eyebrow,
  SectionShell,
  SectionTitle,
  displayFont,
} from "./atoms";
import { sectionEyebrow } from "../model/section-eyebrow";

interface FaqSlot {
  question: string;
  /** A real answer (from `qa:` requirements) — customer-visible copy. */
  answer?: string;
  /** Preview-only pencil mark when no real answer exists yet. */
  annotation?: string;
}

/** Build FAQ slots from the direction: quoted objection first, then pillars. */
function faqSlots(direction: string | undefined): FaqSlot[] {
  if (!direction) return [];
  const slots: FaqSlot[] = [];
  const objection = direction.match(/[“"]([^”"]+)[”"]/)?.[1];
  if (objection) {
    slots.push({
      question: objection,
      annotation: "answer slot · the primary objection, answered plainly",
    });
  }
  const afterColon = direction.split(":").slice(1).join(":");
  for (const pillar of splitList(afterColon)) {
    slots.push({
      question: pillar,
      annotation: "question set slot · derived from this content pillar",
    });
  }
  return slots;
}

/** Complete Q&A copy: `qa: question | answer` content requirements (ADR-034). */
function qaSlots(requirements: ReadonlyArray<string> | undefined): FaqSlot[] {
  const slots: FaqSlot[] = [];
  for (const requirement of requirements ?? []) {
    if (!requirement.startsWith("qa:")) continue;
    const [question, answer] = requirement
      .slice("qa:".length)
      .split("|")
      .map((part) => part.trim());
    if (question && answer) slots.push({ question, answer });
  }
  return slots;
}

function AccordionItem({
  slot,
  open,
  onToggle,
}: {
  slot: FaqSlot;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  return (
    <div className="border-b" style={{ borderColor: "var(--wr-line)" }}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-6 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{ outlineColor: "var(--wr-accent)" }}
        >
          <span
            className="text-pretty font-medium capitalize"
            style={{ ...displayFont, fontSize: "var(--wr-text-lg)", lineHeight: 1.3 }}
          >
            {slot.question}
          </span>
          <span
            aria-hidden
            data-open={open}
            className="wr-rotor flex size-8 shrink-0 items-center justify-center rounded-full border"
            style={{ borderColor: "var(--wr-line-strong)", color: "var(--wr-accent)" }}
          >
            <Plus className="size-4" />
          </span>
        </button>
      </h3>
      {/* CSS grid-rows collapse (wr-collapse, render-page ROOT_CSS): the
          panel stays mounted; closed content is visibility-hidden so it
          leaves the accessibility tree. */}
      <div id={panelId} data-open={open} className="wr-collapse">
        <div>
          <div className="pb-6">
            {slot.answer ? (
              <p
                className="max-w-[var(--wr-measure)] leading-relaxed"
                style={{ color: "var(--wr-ink-muted)" }}
              >
                {slot.answer}
              </p>
            ) : (
              slot.annotation && <AnnotationTag>{slot.annotation}</AnnotationTag>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FaqReassuranceAccordion({ section, variant, slots, mediaAssets, mode }: PrimitiveSectionProps) {
  const supportAsset =
    mediaAssets?.[`${section.media?.[0]?.generationRef ?? `media/${section.id}`}.support`];

  // Public mode renders ONLY complete Q&A copy; with none, the section
  // collapses (ADR-034). Preview keeps the annotated direction slots.
  const qa = qaSlots(section.contentRequirements);
  const items = mode === "public" ? qa : qa.length > 0 ? qa : faqSlots(slots["questions-direction"]);
  const [openIndex, setOpenIndex] = useState(0);
  const twoColumn = variant === "two-column";

  if (mode === "public" && items.length === 0) return null;

  return (
    <SectionShell section={section}>
      <Container>
        <div className={twoColumn ? "grid gap-10 lg:grid-cols-[2fr_3fr]" : ""}>
          <Reveal>
            <Eyebrow>{sectionEyebrow(section, mode)}</Eyebrow>
            <SectionTitle id={`${section.id}-title`}>
              {items[0]?.question ?? ""}
            </SectionTitle>
          </Reveal>
          <Reveal delay={0.1}>
            <div className={twoColumn ? "" : "mt-10"}>
              {items.map((slot, index) => (
                <AccordionItem
                  key={slot.question}
                  slot={slot}
                  open={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
                />
              ))}
            </div>
          </Reveal>
        </div>
              {supportAsset && (
          <div className="mt-10 overflow-hidden rounded-[var(--wr-radius-lg)]">
            <CinematicImage
              asset={supportAsset}
              alt="The craft in progress"
              fit="sized"
              className="h-56 w-full sm:h-72"
            />
          </div>
        )}
      </Container>
    </SectionShell>
  );
}
