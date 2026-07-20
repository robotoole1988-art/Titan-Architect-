# ADR-048 — Ask the Brain v1: deterministic-first universal search

- **Status:** Accepted
- **Date:** 2026-07-20
- **Builds on:** ADR-046 (Memory Spine — the graph + learning feed this reads),
  ADR-042 (Mission Control), ADR-024 (CRM)

## Context

The Brain has memory (ADR-046) but no mouth: the command bar has been a
labelled placeholder since the workspace was scaffolded. The founder should be
able to ask "which customers haven't been contacted in a week?" and get real
records back — with evidence, not vibes.

This is the platform's first LLM-reasoning surface, so it sets the doctrine:
**deterministic first, LLM second, honesty always.**

## Decision

### One new core module: `core/ask-brain`

**Layer 1 — the deterministic intent catalog.** Six named intents, each a pure
function over the memory-spine graph + learning-feed observations:

| Intent | Answers |
| --- | --- |
| `leads_not_contacted` | Which customers haven't been contacted in N days? |
| `builds_attention` | Which builds are stalled or waiting on review? |
| `enquiries_for` | Show enquiries for business X |
| `pipeline_by_stage` | What does the pipeline look like by stage? |
| `top_sites` | Which sites got the most visits/enquiries this period? |
| `recorded_for` | What did we record/promise for customer X? |

Every result carries the real records behind it (labels, app links —
`/crm/[id]`, `/sites/[slug]` — and per-record provenance from the spine), a
deterministic summary template, and an honest `isEmpty`. A deterministic
pattern parser maps the canonical phrasings (and close variants) to intents
with **zero LLM involvement**; business names resolve by conservative match,
and ambiguity is returned as a question, never a guess.

**Layer 2 — the LLM, behind a seam.** `BrainReasoner` has exactly two jobs:
map free-form phrasing onto the catalog (`parseIntent`) and narrate results
(`composeAnswer`). The Anthropic adapter (founder-approved provider;
`ANTHROPIC_API_KEY` in `.env.local`) uses Haiku for intent parsing and Sonnet
for composition. Hard rules: the LLM **never sees the database, only the
intent catalog and the already-resolved results**; parse output is validated
against the catalog (anything malformed falls back to deterministic); empty
results are answered by the honest template — the LLM is not invited to
narrate absence into presence. No key → the deterministic reasoner runs the
whole surface (patterns + templates), clearly labelled.

**Confidence, honestly derived:** `high` = deterministic parse;
`medium` = LLM-parsed intent (validated); `low` = unmappable question, which
says so and lists what the Brain *can* answer today.

### The surface

The placeholder command bar is deleted. A real Ask-the-Brain input renders in
the Brain workspace, Mission Control, and the CRM: question in → answer,
evidence records with links, a "how this was derived" line, and the
confidence badge. **Read-only v1**: answers and links only — no actions, no
mutations (Command Mode is a later milestone).

### The learning feed closes the loop

Every question is appended as an observation (question, resolved intent,
result count, confidence, source `ask-brain`); following an evidence link
appends an `acted` observation. This is the substrate future ranking and
learning draws from — ADR-046 earning its keep.

## Out of scope

Actions/execution (Command Mode); predictions; embeddings/semantic retrieval
over free text (spine v2); any provider beyond the founder-approved one.

## Verification

Deterministic intents + parser + engine fully tested over the memory-spine
fixture (stub reasoner, no live API in CI); LLM adapter validated live in the
browser with natural phrasings; empty-result honesty and confidence labels
asserted; questions visible in the learning feed; gates + CI green.
