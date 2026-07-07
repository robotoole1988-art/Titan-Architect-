/**
 * trust.team-introduction — the real people and the real credentials (ADR-043).
 *
 * The care archetype's credibility section. HONESTY IS THE POINT: it never
 * fabricates team members or headshots. Portrait frames populate ONLY from real
 * approved team media; in public with none, the section collapses to the real
 * accreditations/registrations (from the taxonomy) rather than show empty faces.
 * In preview the portrait slots carry the photography brief. Variants:
 * "portrait-grid" / "spotlight-profiles".
 */

import { ShieldCheck } from "lucide-react";
import type { PrimitiveSectionProps } from "../model/types";
import { splitList } from "../model/slots";
import { Reveal, Stagger, StaggerItem } from "../motion/motion";
import {
  Container,
  Eyebrow,
  MediaSlotFrame,
  SectionShell,
  SectionTitle,
  monoFont,
  primitiveName,
} from "./atoms";
import { CinematicImage } from "./cinematic-image";

export function TrustTeamIntroduction({
  section,
  variant,
  slots,
  mediaAssets,
  mode,
}: PrimitiveSectionProps) {
  const headline = slots.headline ?? primitiveName(section);
  const intro = slots.intro ?? "";
  const credentials = splitList(slots.credentials);

  const media = section.media?.[0];
  const baseRef = media?.generationRef ?? `media/${section.id}`;
  const spotlight = variant === "spotlight-profiles";
  const portraitRefs = [baseRef, `${baseRef}.2`, `${baseRef}.3`];
  const portraits = portraitRefs.map((ref) => ({ ref, asset: mediaAssets?.[ref] }));
  const realPortraits = portraits.filter((p) => p.asset);
  // Public shows portraits ONLY when real approved media exists; preview shows
  // the annotated slots so the founder knows where the team photos go.
  const showPortraits = mode === "preview" || realPortraits.length > 0;
  const visible = mode === "preview" ? portraits : realPortraits;

  return (
    <SectionShell section={section}>
      <Container>
        <div className="max-w-[46rem]">
          <Eyebrow id={`${section.id}-title`}>{primitiveName(section)}</Eyebrow>
          <Reveal>
            <SectionTitle id={`${section.id}-heading`} size="var(--wr-text-2xl)">
              {headline}
            </SectionTitle>
          </Reveal>
          {intro && (
            <Reveal delay={0.05}>
              <p
                className="mt-4 text-pretty"
                style={{ fontSize: "var(--wr-text-lg)", lineHeight: 1.6, color: "var(--wr-ink-muted)" }}
              >
                {intro}
              </p>
            </Reveal>
          )}
        </div>

        {showPortraits && visible.length > 0 && (
          <Stagger
            gap={0.08}
            className={
              spotlight
                ? "mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]"
                : "mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {visible.map((portrait, index) => (
              <StaggerItem
                key={portrait.ref}
                className={spotlight && index === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-1" : ""}
              >
                {portrait.asset ? (
                  <CinematicImage
                    asset={portrait.asset}
                    alt={`${headline} — team member`}
                    className="w-full overflow-hidden rounded-[var(--wr-radius-lg)] border"
                    sizes="(max-width: 640px) 100vw, 30vw"
                  />
                ) : (
                  <MediaSlotFrame
                    media={media}
                    label={`Team portrait ${index + 1}`}
                    minHeight={spotlight && index === 0 ? "22rem" : "17rem"}
                    mode={mode}
                  />
                )}
              </StaggerItem>
            ))}
          </Stagger>
        )}

        {credentials.length > 0 && (
          <Reveal delay={0.1}>
            <div
              className="mt-10 rounded-[var(--wr-radius-lg)] border p-6 sm:p-7"
              style={{ borderColor: "var(--wr-line)", background: "var(--wr-surface)" }}
            >
              <p
                className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em]"
                style={{ ...monoFont, color: "var(--wr-ink-faint)" }}
              >
                <ShieldCheck className="size-3.5" style={{ color: "var(--wr-accent)" }} aria-hidden />
                Qualified &amp; registered
              </p>
              <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {credentials.map((credential) => (
                  <li key={credential} className="flex items-start gap-2.5 text-base" style={{ color: "var(--wr-ink)" }}>
                    <ShieldCheck
                      className="mt-0.5 size-4 shrink-0"
                      style={{ color: "var(--wr-accent)" }}
                      aria-hidden
                    />
                    {credential}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}
      </Container>
    </SectionShell>
  );
}
