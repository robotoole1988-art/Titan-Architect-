/**
 * services.interactive-explorer — the offer, explorable.
 *
 * Cards built from the blueprint's key-message explainers with the content
 * pillars as supporting anchors; every card is a live route to help (#callback)
 * with decisive hover/focus motion. Variants: "card-grid" / "guided-accordion"
 * render the crafted card grid; "tabbed" is the SURFACE SELECTOR (ADR-029) —
 * visitors explore surfaces/materials with texture-suggestive panels and a
 * pricing-guide CTA per surface.
 */

import { ArrowUpRight } from "lucide-react";
import type { PrimitiveSectionProps } from "../model/types";
import { Reveal, Stagger, StaggerItem } from "../motion/motion";
import { afterFirstDash, splitList } from "../model/slots";
import { SurfaceSelector } from "./services-surface-selector";
import {
  Container,
  CopyChip,
  Eyebrow,
  SectionShell,
  SectionTitle,
  displayFont,
  monoFont,
  primitiveName,
} from "./atoms";

/** "The core X services in Y, organised around…" → the lead sentence. */
function leadSentence(direction: string | undefined): string {
  if (!direction) return "";
  return direction.split(", organised")[0].replace(/\.$/, "");
}

/** "…content pillars: a · b · c." → [a, b, c] */
function pillars(direction: string | undefined): string[] {
  if (!direction) return [];
  const afterColon = direction.split(":").slice(1).join(":");
  return splitList(afterColon);
}

/** "Explain each service through the key messages — a · b · c." → [a, b, c] */
function explainers(direction: string | undefined): string[] {
  if (!direction) return [];
  return splitList(afterFirstDash(direction));
}

export function ServicesInteractiveExplorer({ section, variant, slots }: PrimitiveSectionProps) {
  const heading = leadSentence(slots.services);
  const cards = explainers(slots["service-explainers"]);
  const anchors = pillars(slots.services);

  // The surface selector needs surfaces to explore; with fewer than two it
  // degrades gracefully to the crafted card grid.
  if (variant === "tabbed" && anchors.length >= 2) {
    return (
      <SectionShell section={section}>
        <SurfaceSelector
          sectionId={section.id}
          heading={heading}
          surfaces={anchors}
          explainers={cards}
        />
      </SectionShell>
    );
  }

  return (
    <SectionShell section={section}>
      <Container wide>
        <Reveal>
          <Eyebrow>{primitiveName(section)}</Eyebrow>
          <SectionTitle id={`${section.id}-title`}>{heading}</SectionTitle>
        </Reveal>

        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, index) => (
            <StaggerItem key={card}>
              <a
                href="#callback"
                className="group flex h-full flex-col justify-between gap-10 rounded-[var(--wr-radius)] border p-6 transition-all duration-300 hover:-translate-y-1.5 focus-visible:-translate-y-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                style={{
                  borderColor: "var(--wr-line)",
                  background: "var(--wr-surface)",
                  outlineColor: "var(--wr-accent)",
                }}
              >
                <span
                  aria-hidden
                  className="text-sm"
                  style={{ ...monoFont, color: "var(--wr-ink-faint)" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex flex-col gap-3">
                  <span
                    className="text-pretty font-semibold transition-colors group-hover:text-[var(--wr-accent)]"
                    style={{ ...displayFont, fontSize: "var(--wr-text-lg)", lineHeight: 1.25 }}
                  >
                    {card}
                  </span>
                  <span
                    aria-hidden
                    className="inline-flex items-center text-xs opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:opacity-100"
                    style={{ ...monoFont, color: "var(--wr-accent)" }}
                  >
                    <ArrowUpRight className="size-4" />
                  </span>
                </span>
              </a>
            </StaggerItem>
          ))}
        </Stagger>

        {anchors.length > 0 && (
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-wrap gap-2">
              {anchors.map((anchor) => (
                <CopyChip key={anchor}>{anchor}</CopyChip>
              ))}
            </div>
          </Reveal>
        )}
      </Container>
    </SectionShell>
  );
}
