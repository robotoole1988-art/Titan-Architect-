/**
 * The department orbs (approved 2026-08-06) — the nine departments standing
 * on the Brain's flanks as glowing spheres. Server-rendered, zero JS: the
 * spheres are CSS radial gradients, the reveal is the room's `cc-reveal`
 * choreography.
 *
 * Honesty rules: an orb links ONLY when a real room exists behind it
 * (model/departments.ts pins this); forming departments render dim with a
 * dashed ring and no door. The little dot is the health engine speaking —
 * a band from the facts snapshot when that department is measured, else
 * the build status (grey while forming).
 */

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  COMMAND_DEPARTMENTS,
  type CommandDepartment,
} from "../model/departments";

type Band = "green" | "amber" | "red" | null;

const DOT = {
  green: "#5ee0a8",
  amber: "#f0b45a",
  red: "#ff7a76",
  forming: "#4a5674",
} as const;

function dotStyle(dept: CommandDepartment, band: Band | undefined): CSSProperties {
  const colour =
    band === "green"
      ? DOT.green
      : band === "amber"
        ? DOT.amber
        : band === "red"
          ? DOT.red
          : dept.status === "forming"
            ? DOT.forming
            : dept.status === "partly"
              ? DOT.amber
              : DOT.green;
  return {
    background: colour,
    boxShadow: colour === DOT.forming ? "none" : `0 0 8px 1px ${colour}cc`,
  };
}

function Orb({
  dept,
  band,
  delayMs,
}: {
  dept: CommandDepartment;
  band: Band | undefined;
  delayMs: number;
}) {
  const mirrored = dept.side === "right";
  const dim = dept.status === "forming";

  const sphere = (
    <span
      aria-hidden="true"
      className={`relative block h-11 w-11 shrink-0 rounded-full ${dim ? "opacity-40" : ""}`}
      style={{
        background: `radial-gradient(circle at 32% 30%, rgba(255,255,255,0.95), transparent 28%), radial-gradient(circle at 50% 50%, ${dept.hue} 0%, transparent 72%)`,
        boxShadow: `0 0 24px 2px ${dept.glow}, inset 0 0 18px rgba(255,255,255,0.25)`,
        filter: dim ? "saturate(0.5)" : "saturate(1.15)",
      }}
    >
      <span
        className="absolute -inset-[7px] rounded-full border"
        style={{
          borderColor: dept.glow,
          borderStyle: dim ? "dashed" : "solid",
          opacity: dim ? 0.5 : 0.35,
        }}
      />
    </span>
  );

  const caption = (
    <span className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#dfe7f3]">
        {dept.name}
      </span>
      <span
        className={`mt-[3px] flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-[#5d7396] ${
          mirrored ? "justify-end" : ""
        }`}
      >
        <span className="h-[5px] w-[5px] shrink-0 rounded-full" style={dotStyle(dept, band)} />
        {dept.stateLabel}
      </span>
    </span>
  );

  const rowClassName = `cc-reveal flex items-center gap-3.5 ${
    mirrored ? "flex-row-reverse text-right" : ""
  }`;
  const style = { animationDelay: `${delayMs}ms` };

  if (dept.room !== null) {
    return (
      <Link
        href={dept.room}
        data-department={dept.id}
        className={`${rowClassName} opacity-95 transition-opacity duration-200 hover:opacity-100`}
        style={style}
      >
        {sphere}
        {caption}
      </Link>
    );
  }
  return (
    <div data-department={dept.id} className={rowClassName} style={style}>
      {sphere}
      {caption}
    </div>
  );
}

function Flank({ side, children }: { side: "left" | "right"; children: ReactNode }) {
  return (
    <div
      data-department-orbs={side}
      className={`fixed bottom-[26%] top-[16%] z-10 flex flex-col justify-between ${
        side === "left" ? "left-[5%] items-start" : "right-[5%] items-end"
      }`}
    >
      {children}
    </div>
  );
}

export function DepartmentOrbs({ bands }: { bands: Record<string, Band> }) {
  const flank = (side: "left" | "right", baseDelayMs: number) =>
    COMMAND_DEPARTMENTS.filter((dept) => dept.side === side).map((dept, index) => (
      <Orb
        key={dept.id}
        dept={dept}
        band={dept.healthKey === null ? null : bands[dept.healthKey]}
        delayMs={baseDelayMs + index * 110}
      />
    ));

  return (
    <>
      <Flank side="left">{flank("left", 750)}</Flank>
      <Flank side="right">{flank("right", 810)}</Flank>
    </>
  );
}
