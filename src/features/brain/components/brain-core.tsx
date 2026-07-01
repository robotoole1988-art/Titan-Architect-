import { BrainCircuit } from "lucide-react";

/**
 * The animated TITAN Brain core — the visual centerpiece of the workspace.
 *
 * Keyframes are defined locally (scoped by name) so the whole feature stays
 * self-contained and the motion renders without depending on global CSS. It is
 * decorative only — it represents an idle Brain, not any live AI activity.
 */
export function BrainCore() {
  return (
    <div className="relative flex aspect-square w-full max-w-[260px] items-center justify-center">
      <style>{`
        @keyframes brain-spin { to { transform: rotate(360deg); } }
        @keyframes brain-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes brain-breathe {
          0%, 100% { opacity: .55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
      `}</style>

      {/* ambient glows (blurred solids) */}
      <div className="absolute size-44 rounded-full bg-sky-500/20 blur-[64px]" />
      <div className="absolute size-32 rounded-full bg-violet-500/20 blur-[52px]" />

      {/* concentric rings */}
      <div className="absolute inset-0 rounded-full border border-sky-400/20" />
      <div className="absolute inset-8 rounded-full border border-violet-400/15" />
      <div className="absolute inset-[22%] rounded-full border border-white/10" />

      {/* orbiting nodes */}
      <div
        className="absolute inset-1"
        style={{ animation: "brain-spin 22s linear infinite" }}
      >
        <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 rounded-full bg-sky-300 shadow-[0_0_14px_2px] shadow-sky-400/60" />
        <span className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-violet-300 shadow-[0_0_12px_2px] shadow-violet-400/60" />
        <span className="absolute right-0 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_12px_2px] shadow-cyan-400/60" />
      </div>

      {/* counter-rotating inner ring */}
      <div
        className="absolute inset-10 rounded-full border border-white/10"
        style={{ animation: "brain-spin-rev 16s linear infinite" }}
      />

      {/* core orb */}
      <div className="relative flex size-24 items-center justify-center rounded-full border border-white/15 bg-[radial-gradient(circle_at_30%_30%,rgba(125,211,252,0.5),rgba(139,92,246,0.2)_45%,transparent_75%)] backdrop-blur-sm">
        <div
          className="absolute size-14 rounded-full bg-sky-300/40 blur-[6px]"
          style={{ animation: "brain-breathe 3.5s ease-in-out infinite" }}
        />
        <BrainCircuit className="relative size-8 text-white/90" />
      </div>
    </div>
  );
}
