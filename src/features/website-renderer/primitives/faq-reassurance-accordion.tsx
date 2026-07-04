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
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  primitiveName,
} from "./atoms";

interface FaqSlot {
  question: string;
  annotation: string;
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

function AccordionItem({
  slot,
  open,
  onToggle,
}: {
  slot: FaqSlot;
  open: boolean;
  onToggle: () => void;
}) {
  const reduced = useReducedMotion();
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
          <motion.span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full border"
            style={{ borderColor: "var(--wr-line-strong)", color: "var(--wr-accent)" }}
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
          >
            <Plus className="size-4" />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6">
              <AnnotationTag>{slot.annotation}</AnnotationTag>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqReassuranceAccordion({ section, variant, slots, mediaAssets }: PrimitiveSectionProps) {
  const supportAsset =
    mediaAssets?.[`${section.media?.[0]?.generationRef ?? `media/${section.id}`}.support`];

  const items = faqSlots(slots["questions-direction"]);
  const [openIndex, setOpenIndex] = useState(0);
  const twoColumn = variant === "two-column";

  return (
    <SectionShell section={section}>
      <Container>
        <div className={twoColumn ? "grid gap-10 lg:grid-cols-[2fr_3fr]" : ""}>
          <Reveal>
            <Eyebrow>{primitiveName(section)}</Eyebrow>
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
              className="h-56 w-full sm:h-72"
            />
          </div>
        )}
      </Container>
    </SectionShell>
  );
}
