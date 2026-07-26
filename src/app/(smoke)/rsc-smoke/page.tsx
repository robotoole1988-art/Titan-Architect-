import { CommandCentrePage } from "@/features/command-centre";

/**
 * The RSC smoke (ADR-057 addendum — the M2 process fix, permanent DoD item).
 *
 * This page is STATIC on purpose: `next build` prerenders it, which executes
 * CommandCentrePage through the real React Server Components pipeline — the
 * one place client-function-called-from-server violations actually throw.
 * CI runs the build (ADR-009), so this class of bug now fails before any
 * founder session exists. At build time the spine resolves against whatever
 * environment is present (in-memory when none), and the room's crafted
 * empty states render — the smoke needs the render to SUCCEED, not to show
 * live data. Runtime requests are founder-gated by middleware deny-by-default.
 */
export default function RscSmokePage() {
  return <CommandCentrePage founderName="Smoke" />;
}
