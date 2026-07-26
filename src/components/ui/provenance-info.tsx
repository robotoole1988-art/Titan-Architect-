"use client";

/**
 * ⓘ — the staged-provenance affordance (ADR-056, Cockpit Law §3).
 *
 * ADR numbers, engine names and seam descriptions never stand on the cabin
 * walls; they live here, one ⓘ per module, revealed on hover/tap. The
 * provenance law is not weakened — the exact lineage text renders
 * verbatim, one line per entry.
 */

import { useState } from "react";
import { Info } from "lucide-react";

export function ProvenanceInfo({
  lines,
  label = "Provenance",
  defaultOpen = false,
}: {
  /** The exact lineage text, verbatim — one entry per line. */
  lines: ReadonlyArray<string>;
  label?: string;
  /** Tests only: render the popover open so verbatim content is assertable. */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (lines.length === 0) return null;
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        data-provenance-trigger
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onBlur={() => setOpen(false)}
        className="rounded-full p-0.5 text-muted-foreground/50 transition-colors hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Info className="size-3.5" />
      </button>
      {open && (
        <span
          role="tooltip"
          data-provenance-content
          className="absolute right-0 top-full z-50 mt-1.5 w-max max-w-[19rem] rounded-lg border border-border/70 bg-popover px-3 py-2 shadow-xl"
        >
          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          {lines.map((line) => (
            <span
              key={line}
              className="block py-0.5 text-[11px] leading-relaxed text-muted-foreground"
            >
              {line}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
