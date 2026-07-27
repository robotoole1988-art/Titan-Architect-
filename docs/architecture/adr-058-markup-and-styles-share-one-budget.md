# ADR-058 — Markup and styles share one budget

- **Status:** Accepted
- **Date:** 2026-07-27
- **Amends:** `docs/experience/PUBLISHED-SITES-PERFORMANCE-LAW.md` §2
- **Builds on:** ADR-055 (the law, enforced by a machine)

## Context

The Performance Law §2 writes two separate lines:

```
HTML ≤35KB gz · CSS ≤35KB gz
```

Those lines quietly assume the CSS arrives as its own file. It does not.
`next.config.ts` sets `experimental.inlineCss` precisely so it does not — that
was an ADR-033 performance decision to remove the render-blocking stylesheet
fetch gating the published sites' LCP.

So when the gate first measured a real TITAN page it reported:

```
FAIL  document bytes    57.937KB  (budget 35KB)
PASS  stylesheet bytes  0KB       (budget 35KB)
```

One artefact judged against one of its two numbers, while the other number
sat unused at zero. Markup and styles together came to **57.9KB against the
70KB the law had always allowed** — comfortably inside it. The site was not
over budget; the budget was written for a serving arrangement we had
deliberately moved away from.

Left alone, the only way to make that line green would be to stop inlining
the critical CSS — trading a byte-budget pass for a worse LCP, which inverts
the entire point of the law.

## Decision

`document` and `stylesheet` are replaced by a single **composite budget**:

```
markup+styles ≤ 70KB transferred   (document + stylesheet)
```

70KB is 35 + 35 — the same total §2 always allowed, counted once, whichever
file the bytes arrive in. This is not a raised ceiling; it is the same
ceiling, measured correctly.

The mechanism is general rather than a special case: `law.json` grows a
`compositeBudgets` block, and both enforcers sum the named parts. A future
budget that spans delivery mechanisms (say, a font that could arrive inline
or linked) is expressed the same way.

The rule of §2 stands unchanged: **budgets may only ever be lowered.** This
amendment does not lower the total, so the sites gain no slack — 57.9KB
against 70KB is the honest current position, and the next ratchet should
start from there.

## Consequences

### Positive
- The gate measures what the visitor actually downloads, not where the build
  happened to put it. Turning `inlineCss` on or off no longer changes the
  verdict.
- The law can no longer be satisfied by making the site slower.
- One less permanently-red line, which is what keeps a gate credible.

### Negative / Trade-offs
- A page could now spend the whole 70KB on markup with no styles at all, and
  pass. In practice the styles are the incompressible part and the composite
  is the binding constraint, but the split did carry information the sum
  does not.
- `compositeBudgets` is a second budget concept to understand alongside the
  flat ones.

### Neutral
- The sites sit at 57.9KB of 70KB — inside the law, with ~12KB of headroom.
  That headroom is not an invitation; §2's ratchet-down rule still applies.
