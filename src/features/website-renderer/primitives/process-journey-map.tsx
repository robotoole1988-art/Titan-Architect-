/**
 * process.journey-map — the engagement made predictable.
 *
 * The customer journey (real step names, ADR-034) becomes numbered stages
 * along a rail that draws itself as you scroll — a pure CSS scroll-driven
 * animation (wr-rail-draw, render-page ROOT_CSS). Browsers without
 * scroll-driven animation support see the rail fully drawn. Variants:
 * "numbered-steps" / "timeline".
 */

import { CinematicImage } from "./cinematic-image";
import type { PrimitiveSectionProps } from "../model/types";
import { Reveal, Stagger, StaggerItem } from "../motion/motion";
import { splitList } from "../model/slots";
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

interface Stage {
  title: string;
  detail?: string;
}

/**
 * Steps are real customer copy joined with "·" (ADR-034). Legacy blueprints
 * carried the internal narrative arc ("… — Dream (…) → Doubt (…)") — that is
 * framework metadata, never copy, so it parses to NOTHING and the primitive
 * renders no framework language anywhere.
 */
function stagesOf(direction: string | undefined): Stage[] {
  if (!direction || direction.includes("→")) return [];
  return splitList(direction).map((step) => ({ title: step }));
}

function guaranteesOf(direction: string | undefined): string[] {
  if (!direction) return [];
  const afterColon = direction.split(":").slice(1).join(":");
  return splitList(afterColon);
}

export function ProcessJourneyMap({ section, slots, mediaAssets }: PrimitiveSectionProps) {
  const supportAsset =
    mediaAssets?.[`${section.media?.[0]?.generationRef ?? `media/${section.id}`}.support`];

  const stages = stagesOf(slots.steps);
  const guarantees = guaranteesOf(slots.guarantees);

  return (
    <SectionShell section={section}>
      <Container>
        <Reveal>
          <Eyebrow>{primitiveName(section)}</Eyebrow>
          <SectionTitle id={`${section.id}-title`}>
            {slots["steps-headline"] ?? "How it works"}
          </SectionTitle>
        </Reveal>

        <ol className="relative mt-14 flex flex-col gap-12 pl-10 sm:pl-14">
          {/* the rail, drawing itself with scroll (CSS timeline; static fallback) */}
          <div aria-hidden className="absolute bottom-2 left-[13px] top-2 w-px sm:left-[17px]" style={{ background: "var(--wr-line)" }} />
          <div
            aria-hidden
            className="wr-rail-draw absolute bottom-2 left-[13px] top-2 w-px origin-top sm:left-[17px]"
            style={{
              background: "linear-gradient(180deg, var(--wr-accent), var(--wr-accent-strong))",
            }}
          />
          {stages.map((stage, index) => (
            <li key={stage.title} className="relative">
              <span
                aria-hidden
                className="absolute -left-10 top-1 flex size-7 items-center justify-center rounded-full border text-[11px] sm:-left-14 sm:size-9 sm:text-xs"
                style={{
                  ...monoFont,
                  borderColor: "var(--wr-line-strong)",
                  background: "var(--wr-bg)",
                  color: "var(--wr-accent)",
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <Reveal y={18}>
                <h3
                  className="font-semibold"
                  style={{ ...displayFont, fontSize: "var(--wr-text-xl)", letterSpacing: "-0.015em" }}
                >
                  {stage.title}
                </h3>
                {stage.detail && (
                  <p className="mt-2 max-w-[var(--wr-measure)] leading-relaxed" style={{ color: "var(--wr-ink-muted)" }}>
                    {stage.detail}
                  </p>
                )}
              </Reveal>
            </li>
          ))}
        </ol>

        {guarantees.length > 0 && (
          <Stagger className="mt-14 flex flex-wrap gap-2" gap={0.05}>
            {guarantees.map((guarantee) => (
              <StaggerItem key={guarantee}>
                <CopyChip>{guarantee}</CopyChip>
              </StaggerItem>
            ))}
          </Stagger>
        )}
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
