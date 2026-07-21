# Changelog

## 2026-07-21 — Area-page radar centres the page's area

- The `location.service-area` radar on area landing pages centred and
  labelled the business BASE (e.g. the Greater London page showed
  "Oxford"). Area pages now ground the visitor in THEIR area: the builder's
  ADR-028 localisation seam writes a `focus-place` slot + re-anchored
  coverage heading per area, and the primitive centres that slot with the
  base shown as a quiet secondary point ("based in Oxford"). Homepages and
  already-published blueprints (no slot) keep centring the base. Pinned by
  builder + renderer tests across all four Liberty Contractors areas.

## 2026-07-20 — Pre-deploy fix-pack (audit F1–F3)

- **F1 · Broken poster assets**: the ADR-054 auth middleware was gating
  `/renderer/*` (and `/generated-media/*`) static assets behind login —
  the renderer's poster fallbacks 307'd to the sign-in page and drew
  broken-image glyphs on Voltway Renewables and Bright Smile Dental
  (Summit/Kerbside were covered by approved media). Both prefixes are now
  public in `isProtectedAppPath` (tested). Both `/renderer/*` posters
  exist and are committed; no other `/renderer/*` references in the tree.
- **F2 · Enquiry submit label**: the lead-capture submit button echoed the
  page's primary CTA ("Call now") — misleading on a form that sends an
  enquiry. Submit copy is now crafted per archetype (emergency "Request
  urgent callback" · premium/project "Request my quote" · care "Request an
  appointment" · technical/default "Request a callback"), overridable via
  a `form-cta-label` content slot; the post-submit success state is
  per-archetype too, with no invented SLA figures.
- **F3 · Blank viewport on fast scroll**: reveals now look AHEAD
  (positive viewport margins — sections begin animating ~a fifth of a
  screen before entry), travel is shorter (28→18px / 24→16px), and a
  backup trigger (a cheap self-disposing interval) force-runs the SAME
  rise animation if the intersection observer ever lags while an element
  sits in the viewport — content can never be stuck invisible, and late
  sections keep their full reveal motion. Reduced-motion path untouched.
