"use client";

/**
 * The ONE client island of the motion system (ADR-022 v2).
 *
 * A single IntersectionObserver serves every `data-wr-reveal` /
 * `data-wr-stagger` target on the page. Renders nothing; hydrates ~nothing.
 *
 * Choreography contract (audit fault F3 — content can never be stuck
 * invisible):
 * 1. Elements are server-rendered VISIBLE. The CSS hiding rule applies only
 *    under `[data-wr-js]`, which this effect sets — no JavaScript, no hiding.
 * 2. Before hiding anything, targets already in the viewport are marked
 *    revealed synchronously, so above-the-fold content (the LCP) never
 *    blinks and never waits for an animation.
 * 3. Everything else hides, then transitions in as it approaches the
 *    viewport (the observer looks ahead ~18% of a screen).
 */

import { useEffect } from "react";

const LOOKAHEAD = "0px 0px 18% 0px";

function reveal(target: Element, instant: boolean): void {
  if (target.hasAttribute("data-wr-stagger")) {
    const gap = Number(target.getAttribute("data-wr-stagger")) || 0.09;
    const items = target.querySelectorAll("[data-wr-reveal]");
    items.forEach((item, index) => {
      if (!instant) {
        (item as HTMLElement).style.transitionDelay = `${index * gap}s`;
      }
      item.setAttribute("data-wr-on", "");
    });
    return;
  }
  target.setAttribute("data-wr-on", "");
}

export function RevealObserver() {
  useEffect(() => {
    const root = document.querySelector(".wr-root");
    if (!root || !("IntersectionObserver" in window)) return;

    const targets = Array.from(
      root.querySelectorAll("[data-wr-stagger], [data-wr-reveal]"),
    ).filter(
      (target) =>
        target.hasAttribute("data-wr-stagger") ||
        !target.closest("[data-wr-stagger]"),
    );

    // Above-the-fold: revealed BEFORE the hiding rule activates — no blink.
    const pending: Element[] = [];
    for (const target of targets) {
      const rect = target.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        reveal(target, true);
      } else {
        pending.push(target);
      }
    }

    root.setAttribute("data-wr-js", "");
    if (pending.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target, false);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: LOOKAHEAD },
    );
    for (const target of pending) observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return null;
}
