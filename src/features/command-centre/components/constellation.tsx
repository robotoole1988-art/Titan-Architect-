"use client";

/**
 * The constellation (ADR-057; M2 addendum §4 — an ENHANCEMENT, never the
 * only route). The operating departments as glowing points arced across the
 * lower room, v5 proportions: hover to preview, click to enter. Rendered as
 * real DOM buttons so they are focusable and testable; the glow colour is
 * the health engine's honest band, dim when not yet scoreable.
 */

import { useState } from "react";
import Link from "next/link";
import type { ConstellationPoint } from "../model/navigation";

const BAND_GLOW: Record<string, string> = {
  green: "0 0 18px 4px rgba(110,220,180,0.35)",
  amber: "0 0 18px 4px rgba(240,180,100,0.4)",
  red: "0 0 20px 5px rgba(240,120,90,0.5)",
};

export function Constellation({
  points,
  bands,
}: {
  points: ReadonlyArray<ConstellationPoint>;
  bands: Readonly<Record<string, "green" | "amber" | "red" | null>>;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div aria-hidden={false} data-constellation className="pointer-events-none fixed inset-0">
      {points.map((point) => {
        const band = point.healthDepartment ? bands[point.healthDepartment] ?? null : null;
        const isHovered = hovered === point.href;
        return (
          <Link
            key={point.href}
            href={point.href}
            onMouseEnter={() => setHovered(point.href)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(point.href)}
            onBlur={() => setHovered(null)}
            className="group pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-2 outline-none"
            style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
          >
            <span
              className={`block size-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                isHovered ? "scale-150 bg-[#cfe6ff]" : "bg-[#5f7ba6]"
              }`}
              style={band ? { boxShadow: BAND_GLOW[band] } : undefined}
            />
            <span
              className={`absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[10.5px] tracking-wide transition-colors ${
                isHovered ? "text-[#eef5ff]" : "text-[#8aa3c8]"
              }`}
            >
              {point.title}
            </span>
            {isHovered && (
              <span
                role="tooltip"
                className="absolute bottom-full left-1/2 mb-2 w-max max-w-[15rem] -translate-x-1/2 rounded-lg border border-[rgba(120,150,220,0.25)] bg-[rgba(8,12,20,0.85)] px-3 py-1.5 text-[11px] text-[#c6d2e6] backdrop-blur-md"
              >
                {point.preview}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
