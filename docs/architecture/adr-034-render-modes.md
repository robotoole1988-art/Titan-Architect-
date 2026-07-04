# ADR-034: Render Modes — the drawing and the building are different things

- **Status:** Accepted
- **Date:** 2026-07-04
- **Deciders:** Robert O'Toole
- **Tags:** renderer, publishing, builder, seo
- **Supersedes:** — (amends the honesty mechanics of ADR-022/028/033)
- **Superseded by:** —

## Context

A strategy-partner review of a served demo homepage scored it 6/10 against
the £10k bar — not for architectural reasons, but because internal blueprint
scaffolding was rendering on the PUBLIC site: media-brief annotations
("backdrop direction…"), slot labels ("verified review slot", "answer
slot…"), dashed placeholder chips (footer "contact details for…"), empty
five-star outlines that read as a zero-star company, and framework language
("Dream → Doubt → Guide → Transformation") leaking into customer-visible
headlines. Worst of all, the FAQ JSON-LD published the literal string
"answer slot · the primary objection, answered plainly" as an Answer to
search engines.

ADR-022's honesty rule ("never fake content — annotate what's missing") was
right for the architect's PREVIEW, and wrong for the customer's PUBLIC page.
Annotations are pencil marks on a drawing. A homeowner is standing in the
building.

## Decision

### Two explicit render modes

`renderPage` gains `mode: "preview" | "public"` (default `"preview"`), passed
to every primitive via `PrimitiveSectionProps.mode` and to the site chrome.

- **preview** — the architect's drawing. TITAN chrome, annotations, media
  briefs, dashed slot frames: everything the founder needs to see what the
  system intends. Unchanged from ADR-022.
- **public** — the customer's building. ZERO internal scaffolding, ever:
  no annotation chips, no slot labels, no dashed placeholder frames, no
  string originating from blueprint intent/metadata fields (media
  `direction`, footer placeholder `contents`, arc stage names).

Published sites (`/sites/[slug]` and hostname serving, ADR-027) always
render `mode: "public"`. Previews and the blueprint viewer keep `"preview"`.

### Empty-state policy: in public mode, honesty means absence, not annotation

No section may render skeletal to a customer:

- **Review wall with no verified reviews** — the section collapses entirely.
  Never empty quote cards; never zero-star outlines.
- **FAQ without real answers** — renders only items with complete Q&A copy
  from the blueprint; with none, the section collapses. The FAQPage JSON-LD
  follows the same rule: it is emitted ONLY when real Q&A copy exists —
  placeholder answers are never sent to search engines (fixes the ADR-028
  schema leak).
- **Footer placeholders** — replaced by real business data where it exists
  (business name, coverage areas via navigation, phone/email from the
  Business record passed as `RenderPageOptions.contact`) and OMITTED where
  it doesn't. Placeholder legal chips ("copyright notice") become a real
  copyright line; unlinked policies are omitted.
- **Media slots without an approved asset** — the art-directed atmosphere
  renders clean (composition only); the brief annotation and dashed inset
  are preview-only.
- **Unmapped primitive placeholder** (ADR-025 fallback) — preview keeps the
  labelled placeholder; public renders nothing.

### Arc metadata is never copy

"Dream → Doubt → Guide → Transformation" is an internal storytelling
framework, not customer language. The strategy's trade profiles gain a
`customerJourney` — real, customer-facing step names per archetype ("Design
consultation at your home", "Precision groundworks…"). The builder maps it
into content slots (`journey-steps` on story.transformation-arc; the `steps`
slot of process.journey-map now carries the customer steps, plus
`steps-headline` / `arc-headline` for section titles). The renderer never
parses `narrative-arc` into visible text; the word "Doubt" must never appear
on a customer page. The homeowner-fear quote in lead capture renders
UNATTRIBUTED — it is the customer's inner voice, not a company statement.

### Structural enforcement

A public-render test renders demo-shaped blueprints (project + emergency
archetypes) to static markup in public mode and fails CI on any hit against
a denylist of scaffolding markers (slot labels, direction strings, dashed
chip classes, arc stage names, placeholder footer strings). The drawing is
also tested: preview mode must KEEP its annotations.

## Consequences

- Existing publications pin blueprints that predate the customer-journey
  slots; the renderer degrades safely (framework strings are simply not
  rendered), and demos are republished on the new builder output.
- `SPINE_SHAPE_VERSION` is unchanged — no contract change; `mode` and
  `contact` are renderer options, resolved at serve time like media
  (ADR-033), so republication is only needed to pick up new builder copy.
- ADR-022's annotation language now explicitly describes PREVIEW mode; its
  "never fake content" law is unchanged in both modes — public mode simply
  expresses honesty as absence.
