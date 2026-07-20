"use client";

/**
 * The shared motion system (ADR-022). Every rendered primitive animates
 * through these components — never ad-hoc — so motion stays coherent,
 * purposeful, and accessible. Framer Motion under the hood; the page root
 * wraps everything in <MotionConfig reducedMotion="user"> and custom effects
 * check useReducedMotion, so prefers-reduced-motion is honoured throughout.
 *
 * Motion exists to create emotion and guide attention — never decoration.
 */

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Reveal guard (audit fault F3): a cheap interval that force-reveals an
 * element ONLY once it is actually in the viewport and the intersection
 * observer has not fired — the same rise animation runs, just on a backup
 * trigger. Never pins elements ahead of time (late sections keep their
 * full reveal), disposes itself the moment the element is revealed.
 */
function useRevealGuard(
  ref: RefObject<HTMLDivElement | null>,
  revealed: boolean,
  reveal: () => void,
): void {
  useEffect(() => {
    if (revealed) return;
    const id = window.setInterval(() => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) reveal();
    }, 900);
    return () => window.clearInterval(id);
  }, [ref, revealed, reveal]);
}

/**
 * Rise-and-settle scroll reveal. The workhorse: calm, decisive, once.
 *
 * Audit fault F3 tuning: the viewport margin LOOKS AHEAD (positive bottom
 * margin) so sections start revealing ~a fifth of a screen before they
 * enter, travel is short, and a CSS guard in the page root (`data-reveal`,
 * see render-page ROOT_CSS) forces full visibility if the intersection
 * observer ever lags — content can never be stuck invisible.
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  duration = 0.7,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  /** Premium primitives reveal more slowly than emergency's urgency (ADR-029). */
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  useRevealGuard(ref, revealed, () => setRevealed(true));
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      data-reveal
      initial={{ opacity: 0, y }}
      animate={revealed ? { opacity: 1, y: 0 } : undefined}
      whileInView={{ opacity: 1, y: 0 }}
      onViewportEnter={() => setRevealed(true)}
      viewport={{ once: true, margin: "0px 0px 20% 0px" }}
      transition={{ duration, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/** Orchestrated entrance for a group of children. */
export function Stagger({
  children,
  className,
  gap = 0.09,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  useRevealGuard(ref, revealed, () => setRevealed(true));
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={revealed ? "visible" : undefined}
      whileInView="visible"
      onViewportEnter={() => setRevealed(true)}
      viewport={{ once: true, margin: "0px 0px 15% 0px" }}
      variants={{ visible: { transition: { staggerChildren: gap } }, hidden: {} }}
    >
      {children}
    </motion.div>
  );
}

/** One item inside a <Stagger>. */
export function StaggerItem({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      data-reveal
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Gentle scroll parallax; static under reduced motion. */
export function Parallax({
  children,
  distance = 60,
  className,
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <motion.div ref={ref} className={className} style={reduced ? undefined : { y }}>
      {children}
    </motion.div>
  );
}

/**
 * A CTA that leans toward the pointer — a small act of eagerness reserved for
 * the page's most important action. Static under reduced motion and touch.
 */
export function MagneticCTA({
  children,
  className,
  strength = 0.3,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduced = useReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    setOffset({
      x: (event.clientX - rect.left - rect.width / 2) * strength,
      y: (event.clientY - rect.top - rect.height / 2) * strength,
    });
  }

  return (
    <motion.div
      className={className}
      style={{ display: "inline-block" }}
      animate={reduced ? undefined : { x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 220, damping: 18, mass: 0.5 }}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
      whileHover={reduced ? undefined : { scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}

/** A slow, reassuring pulse ring (the "we're here" beacon). */
export function PulseBeacon({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <span
        aria-hidden
        className={className}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          boxShadow: "0 0 0 6px var(--wr-accent-glow)",
        }}
      />
    );
  }
  return (
    <motion.span
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        border: "2px solid var(--wr-accent)",
      }}
      animate={{ scale: [1, 1.35], opacity: [0.55, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
    />
  );
}
