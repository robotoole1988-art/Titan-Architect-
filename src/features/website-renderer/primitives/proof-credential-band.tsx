/**
 * proof.credential-band — scannable, de-risking proof in one slim band.
 * Variants: "badge-row" (chips) / "inline-strip" (divided inline run).
 */

import { ShieldCheck } from "lucide-react";
import type { PrimitiveSectionProps } from "../model/types";
import { Stagger, StaggerItem } from "../motion/motion";
import { splitList } from "../model/slots";
import { Container, SectionShell, monoFont } from "./atoms";

export function ProofCredentialBand({ section, variant, slots }: PrimitiveSectionProps) {
  const credentials = splitList(slots.credentials);
  const inline = variant === "inline-strip";

  return (
    <SectionShell section={section} flush>
      <span id={`${section.id}-title`} className="sr-only">
        {credentials.join(", ")}
      </span>
      <div
        className="border-y py-6"
        style={{ borderColor: "var(--wr-line)", background: "var(--wr-surface)" }}
      >
        <Container wide>
          <Stagger
            gap={0.05}
            className={
              inline
                ? "flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
                : "flex flex-wrap items-center justify-center gap-3"
            }
          >
            {credentials.map((credential) => (
              <StaggerItem key={credential}>
                {inline ? (
                  <span
                    className="flex items-center gap-2 text-xs uppercase tracking-[0.18em]"
                    style={{ ...monoFont, color: "var(--wr-ink-muted)" }}
                  >
                    <ShieldCheck className="size-3.5" style={{ color: "var(--wr-accent)" }} aria-hidden />
                    {credential}
                  </span>
                ) : (
                  <span
                    className="flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em]"
                    style={{
                      ...monoFont,
                      borderColor: "var(--wr-line-strong)",
                      color: "var(--wr-ink-muted)",
                    }}
                  >
                    <ShieldCheck className="size-3.5" style={{ color: "var(--wr-accent)" }} aria-hidden />
                    {credential}
                  </span>
                )}
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </div>
    </SectionShell>
  );
}
