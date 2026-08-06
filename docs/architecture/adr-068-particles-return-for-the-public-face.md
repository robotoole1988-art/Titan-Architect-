# ADR-068 — Particles return, for the public face only

- **Status:** Rejected (founder, 2026-08-03: "the quality was very poor —
  idea is great, the delivery was so far below the TITAN standard." ADR-041
  stands. The flagship vision survives; particles do not carry it.)
- **Date:** 2026-08-03
- **Prompted by:** the flagship experience PRD (`docs/prd/prd-007-flagship-experience-the-working-mind.md`) and the founder's vision brief of 2026-08-02
- **Reverses, narrowly:** ADR-041 (retirement of the particle morph)

## Context

ADR-041 retired real-time particle rendering after it endangered the
Performance Law on customer sites. The founder's flagship vision — the site
that lets a visitor watch TITAN think, ending in the live generator building
a real site in front of them — needs exactly that medium back: particles as
data, connections as communication, pulses as decisions.

Reviving a retired capability is the kind of decision that rots silently if
it happens inside a feature branch. It gets an ADR, and the founder signs it
in daylight, because the person who retired the technique is the person
being asked to un-retire it.

## Decision (proposed)

Real-time particle rendering returns under strict containment:

1. **Public face only.** The experience lives in `company-site`; customer
   sites never load it. An eslint boundary rule keeps the renderer and the
   experience from importing each other.
2. **Ledger B only.** Zero particle bytes in the audited load: the film's
   engines load after LCP and after a user gesture, within the two-ledger
   accounting the PRD defines. `/` joins `law.json`'s audited paths in the
   same increment — the page carrying the film is gated by the same law as
   every customer page.
3. **canvas2d is canonical; WebGL is an upgrade.** The 2D experience must
   stand alone as the finished work; the r3f layer is desktop-only,
   gesture-gated, and demotes itself on dropped frames. Reduced motion
   always wins (device-tier law, unchanged).
4. **Kill-switch.** One env flag stills the film fleet-wide without a
   deploy of content changes — the same posture as `NEXT_PUBLIC_AMBIENT_FILM`
   for customer media.
5. **The film is made of true things.** Departments render ALIVE only with
   a real module path behind them (machine-checked); everything else is
   visibly FORMING. The honesty map in the PRD is the enforced source.

## Consequences

- The vision becomes buildable without weakening a single floor; the
  Performance Law's authority is extended to TITAN's own face, not spent.
- ADR-041 remains true for customer sites — nothing about this decision
  touches them.
- If the founder declines, the PRD's still/CSS tiers already describe the
  film without particles; the acts survive, quieter.

## Outcome (2026-08-03)

The founder declined — not on cost or risk, but on quality: the particle
work ADR-041 retired was itself far below the standard, and un-retiring a
medium whose best showing was poor would be nostalgia, not judgment. His
words: the idea is great; the delivery was not.

What this means in practice:

- ADR-041 stands in full. No real-time particle rendering anywhere.
- PRD-007's acts survive on the still/CSS choreography tiers it already
  defines (§ device tiers) — the working mind is shown through motion
  design, live data and the real generator, not through a particle field.
- The bar for any future medium proposal on the public face: a built
  prototype at the TITAN standard, judged by the founder with his eyes,
  before an ADR asks for sanction. Prose does not reopen this.
