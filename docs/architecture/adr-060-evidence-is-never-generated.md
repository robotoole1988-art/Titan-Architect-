# ADR-060 — Evidence is never generated; illustration always may be

- **Status:** Accepted
- **Date:** 2026-08-01
- **Prompted by:** `docs/research/2026-07-30-titan-end-to-end-audit.md` §5, item 5
- **Builds on:** ADR-034 (honesty means absence), ADR-053 (customer
  photographs and verified reviews), ADR-059 (never generate a verifiable fact)

## Context

ADR-059 listed four things TITAN may never invent: a registration, a review,
a price, and **a photograph of work the business did**. This closes the fourth.

`deriveMediaPlan` commissioned three families of image that assert provenance:

- `.before` / `.after` — the `story.transformation-arc` comparison, built by
  `buildPairPrompts` as a seed-matched pair: *"the SAME PROPERTY from the SAME
  CAMERA ANGLE"*, one state *"worn, tired, weathered and cracked"*, the other
  *"newly finished, pristine, completed to a premium standard"*.
- `.pair-before` / `.pair-after` — a second comparison for the portfolio's
  `before-after-reveal` variant.
- `.frame-N` — portfolio and gallery frames, briefed as *"Finished project
  photograph 1 of 3 — a different completed job each frame."*

Those rendered under the heading **"The work speaks first"**, with alt text
*"Completed project 1"*, an eyebrow reading **"Portfolio Showcase"**, and — in
the arc's case — behind a drag handle inviting the visitor to move between the
two states themselves. It was the most persuasive thing on the page, and none
of it happened.

**The law.** DMCC Act 2024 s.226 makes a misleading *presentation* actionable
in its own right — the deception need not be a sentence. The ASA is explicitly
technology-neutral about how the presentation was produced: *"Ads created
using AI are subject to the same rules on misleadingness… as any other
marketing content."*

### The first version of this ADR was wrong

It read the finding as "stop generating imagery for these sections", and made
them **collapse** when no customer photograph existed. Measured: a driveways
homepage went from nine sections to six, solar nine to seven. It was rejected,
correctly, on the grounds that high-end generated imagery works well and the
product should have both.

The error was treating *AI vs real photograph* as the axis. It isn't. The axis
is **claim vs illustration**, and the technology is irrelevant to it:

| Same image, different frame | Verdict |
| --- | --- |
| "The finish you're buying" · alt *"the driveway finish — detail 1"* | Illustration of the trade. True of any competent installer. |
| "Our recent work" · alt *"a completed job — photograph 1"* | A claim about **this** business. Needs a real photograph. |

A kitchen showroom's CGI room set is lawful; the same render captioned "a
kitchen we fitted in Headingley" is not. Nothing about the pixels decides it.

## Decision

**Evidence is never generated. Illustration always may be.** The sections keep
their place, their imagery and their visual weight; what changes with the
customer's photographs is what the page *says*.

### Two voices

`src/features/website-renderer/model/showcase-copy.ts` holds the entire legal
difference — heading, eyebrow, alt text — for the portfolio, the gallery and
the arc:

- **Illustrative** (default, day one): generated `.showcase-N` frames under a
  per-archetype heading — *"The finish you're buying"*, *"The standard we
  install to"*, *"Inside the practice"* — with alt text naming the material.
  The arc renders a single generated `.atmosphere` image with the business's
  real journey steps over it.
- **Evidence** (earned): the moment approved customer photographs exist in
  `.frame-N`, the section becomes *"Our recent work"*, shows **exactly** those
  photographs, and its alt text names a job. It is never padded out with
  illustrative frames, because that would put generated imagery back under a
  provenance heading — the original defect, in miniature.

The before/after comparison has **no illustrative substitute**. A slider is
structurally a claim about one property, so it requires both of the customer's
own photographs and half a pair is not a pair.

The illustrative voice carries **no "illustrative" disclaimer**. It makes no
claim to disclaim, and a premium site that captions its own imagery "not real"
teaches the visitor to distrust everything else on the page.

### Three choke points

The rule is expressed on the **slot reference** (`src/core/media/sourcing.ts`),
so it holds in three independent places:

1. **The plan** declares evidentiary slots with `sourcing: "customer-photo"`
   and **no prompt**. `prompt` became optional on `MediaPlanItem` precisely so
   that any code wanting to commission one must narrow the type first, and
   discovers there is nothing to send.
2. **The generator** refuses those items and counts them as
   `awaitingCustomerPhotos` — never requested, never paid for. It *does*
   commission the illustrative counterparts, which is what makes a brand-new
   site look finished.
3. **The published-site resolution seam** refuses to *serve* a non-customer
   asset in an evidentiary slot. Assets commissioned before this ADR are still
   sitting approved in the database; they stop here rather than needing a
   migration.

Any one is bypassable alone. Together they are not.

### Incidental

- `buildPairPrompts` was **deleted**, not left unused. An exported helper with
  a passing test is an invitation, and ADR-059 documents a defect that survived
  months behind exactly that.
- `projectFrameCount()` is now read by both the plan and the primitives. It was
  not: the plan declared 3 portfolio frames while the grid drew 4 and the
  carousel 5, and 4 gallery frames against 6 laid out — so 2–3 frames per site
  could never be filled by anybody, invisibly, because generation filled what
  it was asked for and the renderer gradient-filled the rest.
- These three sections stop printing their **registry name** as a public
  eyebrow. "Portfolio Showcase" and "Transformation Arc" were reaching live
  pages, and "Portfolio" is itself a provenance word sitting directly above
  imagery that claims none. Preview keeps the primitive name as founder
  scaffolding. The other call sites — "Lead Capture" appears on 100% of pages
  — are a separate fix.

**Enforcement** is `tests/core/evidence-law.test.ts`: slot classification
including near-misses, prompt absence and prompt presence across five trades,
illustrative-counterpart coverage, frame parity, a spy provider that is asked
for illustration and never for evidence, the resolution seam refusing a legacy
generated asset while serving a customer one, and rendered public markup across
every page of five archetypes asserting both that the sections are **present**
and that they contain none of seven provenance claims.

## Consequences

### Positive
- The second of ADR-059's four is closed with no loss of visual quality — a
  new site launches with every section full, and the imagery budget is
  unchanged.
- The upgrade path is a **sales conversation** rather than a backlog: the CRM
  media page asks for N photographs and says what happens when they arrive
  ("upload real photos and they upgrade to *our recent work*, which is the
  version that actually sells"). That is also the moment the customer supplies
  their accreditation numbers.
- Two classes of unfillable frame disappeared, and two internal labels stopped
  reaching customers.

### Negative / Trade-offs
- Media cost per site rises: the illustrative counterparts are additional
  generated slots (3–6 per portfolio/gallery, 1 per arc).
- The copy in `showcase-copy.ts` is now load-bearing *legally*, not just
  editorially. Someone rewording "The finish you're buying" to "Work we're
  proud of" reintroduces the claim. The test suite bans the known phrasings,
  but it cannot enumerate every way English can imply provenance — this is the
  same limit ADR-059 accepted with its blunt string ban.
- Kerbside Kings, live today, loses any generated asset sitting in a `.frame-N`
  slot on next revalidation and picks up illustrative imagery instead once its
  media run repeats.

### Neutral
- No migration and no data deletion. Old generated assets stay in the database
  and the review gate, visibly provenanced, simply unservable in those slots.
