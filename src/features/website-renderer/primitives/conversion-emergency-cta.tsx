/**
 * conversion.emergency-cta — the always-reachable call moment.
 *
 * Variant "sticky-call-bar": an in-flow conversion band PLUS a fixed bottom
 * bar — on mobile the call action is never more than a thumb-reach away.
 * The bar's slide-in is a pure CSS scroll-driven animation (wr-sticky-bar,
 * render-page ROOT_CSS): it rises as the hero's own CTA scrolls away.
 * Browsers without scroll-driven animation support keep the bar always
 * visible — the conversion law's preferred fallback. Zero JavaScript.
 * "full-width-banner" renders the band only.
 */

import { Phone } from "lucide-react";
import type { PrimitiveSectionProps } from "../model/types";
import { Reveal } from "../motion/motion";
import {
  Container,
  SectionShell,
  SectionTitle,
  SignalCTA,
  displayFont,
} from "./atoms";
import { primaryCtaHref } from "../model/cta";

/** Pull the quoted objection out of the reassurance direction, if present. */
function extractQuote(text: string | undefined): string | undefined {
  const match = text?.match(/[“"]([^”"]+)[”"]/);
  return match?.[1];
}

function StickyCallBar({
  businessName,
  label,
  ctaHref,
}: {
  businessName?: string;
  label: string;
  ctaHref: string;
}) {
  return (
    <div className="wr-sticky-bar fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]">
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
        <SignalCTA href={ctaHref} size="sm">
          <Phone className="size-4" aria-hidden />
          {label}
        </SignalCTA>
      </div>
    </div>
  );
}

export function ConversionEmergencyCta({
  section,
  variant,
  slots,
  blueprint,
  contact,
}: PrimitiveSectionProps) {
  const label = slots["cta-label"] ?? "";
  const ctaHref = primaryCtaHref(blueprint, contact);
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
                  <SignalCTA href={ctaHref} size="md">
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
        <StickyCallBar businessName={blueprint.identity.businessName} label={label} ctaHref={ctaHref} />
      )}
    </SectionShell>
  );
}
