# ADR-062 — "Call now" dials

- **Status:** Accepted
- **Date:** 2026-08-01
- **Prompted by:** `docs/research/2026-07-30-titan-end-to-end-audit.md` §5, item 7
- **Builds on:** ADR-030 (lead flow), ADR-061 (nothing internal reaches the customer)

## Context

The emergency archetype's primary call to action is the string **"Call now"**.
It renders with a phone icon beside it, in a sticky bar pinned to the bottom
of the viewport, and again in the hero and the header. Every one of them
pointed at `href="#callback"` — an anchor to the on-page lead form.

So a homeowner with water coming through the ceiling, on a phone, tapped a
button that said *Call now* and got scrolled to a contact form. The only
working `tel:` link on the entire site was the number in the footer.

Measured across the archetypes: 10 CTAs pointed at the form, 1 `tel:` link
existed. Of the 8 trade archetypes, exactly one — emergency — has a CTA that
should dial; the other seven say "Get a free quote", "Book a consultation",
"Enquire", and belong on a form. This was never a case of ten broken buttons.
It was one button, on the one archetype where the phone is the entire product,
and it is the highest-intent moment TITAN handles.

**Why it hid.** `buildCta()` already computed an intent:

```ts
function ctaIntent(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes("call")) return "call";
  …
}
```

It correctly returned `"call"` — and **nothing consumed it**. The renderer
hardcoded the anchor. A correct answer, computed and discarded, next to a
hardcoded wrong one.

## Decision

**A CTA declares what it does. No layer infers behaviour from its label.**

1. `TradeProfile` and `ConversionStrategy` gain
   `primaryCtaAction: "call" | "form"`. Emergency declares `"call"`; the other
   seven archetypes declare `"form"`.
2. `buildCta()` carries the declared action into the blueprint as the CTA's
   `intent`. `ctaIntent()` — the label sniffer — is **deleted**, not fixed.
3. `primaryCtaHref(blueprint, contact)` resolves the destination once, in one
   place, and every CTA in the renderer uses it. `telHref()` strips everything
   a handset cannot dial while preserving a leading `+`, and the footer's
   ad-hoc `replace(/\s+/g, "")` now uses it too.
4. **Graceful fallback**: a `"call"` CTA with no phone number on the business
   record routes to the form. TITAN publishes sites before the founder has
   finished collecting details, and a button that dials nothing is worse than
   one that scrolls.

Inferring meaning from a string is now the third defect of this exact shape:
ADR-059 (roofing accreditations from the trade *name*), ADR-061 (roofing FAQs
on "damp-p**roof**ing"), and this. The test suite includes both mirror cases —
a call CTA relabelled to never say "call" still dials, and a form CTA
relabelled "Call us today" does not — so a future label-sniffer fails loudly.

### Deliberately not in this change

The `call_click` metric. `site_metrics` stores counters as **columns**
(`views`, `form_starts`, `form_submits`), so counting taps needs a schema
migration — and the database currently has **no backups** (Supabase free
tier). More importantly, the product direction makes it largely redundant: the
plan is a tracked local number per customer forwarding to their own line, and
a telephony provider counts *actual connected calls*, with duration and
recording, across every channel — not just taps on a website, where a tap is
not a call. Tap-counting is deferred until there is a reason it beats what the
phone system already knows.

## Consequences

### Positive
- The highest-intent action on the highest-urgency archetype works.
- The seam is right for the call-tracking plan: the site publishes whatever
  number sits on the business record, so introducing tracked numbers changes
  stored data, not renderer code.
- One resolver means the header, hero, sticky bar and inline CTA cannot drift
  apart — which is the likely regression, and is tested for directly.

### Negative / Trade-offs
- Sites for urgent trades now depend on the phone number being captured
  during onboarding. Without it they silently degrade to the old behaviour,
  which is safe but invisible — worth surfacing in the CRM as a readiness
  warning rather than leaving the founder to notice.
- `primaryCtaAction` is a per-archetype constant. A specific business that
  wants the opposite of its archetype's default has no override yet.

### Neutral
- No data migration; `ConversionStrategy` gains a field with a value derived
  from existing profile data, so regenerating a strategy is enough.
