"use client";

/**
 * conversion.emergency-cta — the always-reachable call moment.
 *
 * Variant "sticky-call-bar": an in-flow conversion band PLUS a fixed bottom
 * bar that appears once the hero's own CTA has scrolled away — on mobile the
 * call action is never more than a thumb-reach away. "full-width-banner"
 * renders the band only.
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Phone } from "lucide-react";
import { useEffect, useState } from "react";
import type { PrimitiveSectionProps } from "../model/types";
import { Reveal } from "../motion/motion";
import {
  Container,
  SectionShell,
  SectionTitle,
  SignalCTA,
  displayFont,
} from "./atoms";

/** Pull the quoted objection out of the reassurance direction, if present. */
function extractQuote(text: string | undefined): string | undefined {
  const match = text?.match(/[“"]([^”"]+)[”"]/);
  return match?.[1];
}

function StickyCallBar({
  businessName,
  label,
}: {
  businessName?: string;
  label: string;
}) {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]"
          initial={reduced ? { opacity: 0 } : { y: 72, opacity: 0 }}
          animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { y: 72, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="mx-auto mb-3 flex w-[min(94%,26rem)] items-center justify-between gap-3 rounded-full border py-2 pl-5 pr-2 backdrop-blur-xl"
            style={{
              borderColor: "var(--wr-line-strong)",
              background: "color-mix(in oklab, var(--wr-bg-raised) 82%, transparent)",
              boxShadow: "0 18px 50px -12px rgba(0,0,0,0.6)",
            }}
          >
            <span
              className="truncate text-sm font-semibold"
              style={{ ...displayFont, color: "var(--wr-ink)" }}
            >
              {businessName}
            </span>
            <SignalCTA href="#callback" size="sm">
              <Phone className="size-4" aria-hidden />
              {label}
            </SignalCTA>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ConversionEmergencyCta({
  section,
  variant,
  slots,
  blueprint,
}: PrimitiveSectionProps) {
  const label = slots["cta-label"] ?? "";
  const objection = extractQuote(slots.reassurance);

  return (
    // defer=false: the fixed sticky bar must escape paint containment.
    <SectionShell section={section} flush defer={false} className="relative">
      <Container>
        <Reveal>
          <div
            className="relative overflow-hidden rounded-[var(--wr-radius-lg)] border px-7 py-10 sm:px-12 sm:py-12"
            style={{
              borderColor: "color-mix(in oklab, var(--wr-accent) 30%, transparent)",
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--wr-accent) 12%, var(--wr-bg-raised)), var(--wr-bg-raised) 60%)",
            }}
          >
            <div
              aria-hidden
              className="absolute -right-20 -top-24 size-64 rounded-full"
              style={{ background: "var(--wr-accent-glow)", filter: "blur(80px)" }}
            />
            <div className="relative flex flex-col items-start justify-between gap-7 sm:flex-row sm:items-center">
              <div className="max-w-xl">
                <SectionTitle id={`${section.id}-title`} size="var(--wr-text-2xl)">
                  {objection ? `“${objection}”` : label}
                </SectionTitle>
              </div>
              {label && (
                <div className="shrink-0">
                  <SignalCTA href="#callback" size="md">
                    <Phone className="size-4" aria-hidden />
                    {label}
                  </SignalCTA>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </Container>

      {variant === "sticky-call-bar" && label && (
        <StickyCallBar businessName={blueprint.identity.businessName} label={label} />
      )}
    </SectionShell>
  );
}
