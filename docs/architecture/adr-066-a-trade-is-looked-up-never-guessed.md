# ADR-066 — A trade is looked up, never guessed

- **Status:** Accepted
- **Date:** 2026-08-02
- **Prompted by:** a capability audit run 2026-08-02
- **Closes:** the defect class opened by ADR-059, continued by ADR-061 and ADR-062

## Context

`/crm/{id}` opens with a pitch panel the founder reads **while on the phone to
a prospect**: talking points, their pain points, scripted objection handlers,
indicative job values. It resolved which pack to show like this:

```ts
["roofing", ["roof", "guttering", "fascia", "soffit", "chimney"], ROOFING],
…
keywords.some((keyword) => tradeLower.includes(keyword))
```

`"damp-proofing".includes("roof")` is **true**. The word is damp-p-**roof**-ing.

So a damp-proofing lead opened showing roofing material: *"Storm damage is a
search spike you can own"*, *"accreditation (NFRC, CompetentRoofer) up front
closes the trust gap"*, and re-roof job values. `"chimney-fireplaces"` matched
too — a stove fitter works to HETAS and Part J and has nothing to do with
re-roofs.

This is worse than showing nothing. The founder reads it aloud believing it
describes the business he is selling to, and the customer hears him name two
accreditations that belong to a different trade.

**This is the fourth appearance of one defect: inferring a fact from a
substring.** ADR-059 grew accreditations out of a trade name. ADR-061 put
roofing FAQs on a damp-proofing site — the same `/roof/` against the same
word. ADR-062 read a CTA's behaviour off its label. Both `faq-content.ts` and
`trade-intelligence.ts` carry comments warning about this exact string.
`pitch.ts` sat between them and never got the fix, because each previous ADR
fixed *its* call site rather than the class.

The deeper cause was coverage, not regex. `PACK_BY_TAXONOMY_ID` listed 5 of 35
trades, so **30 taxonomy trades fell through to keyword matching** — a
fall-through built for hand-typed free text was doing most of the work for
ids that were never free text at all.

## Decision

**Every trade in the taxonomy is decided by lookup. Matching is only ever a
fallback for text a human typed.**

1. `PACK_BY_TAXONOMY_ID` lists **all 35 taxonomy ids**, including — especially
   — the ones that get the general pack. An id absent from that map is an id
   that falls through to a guess, so absence is the bug and the map has no
   holes.
2. The free-text matchers become **anchored regexes** (`/\broof|\bguttering/i`),
   the same fix ADR-061 applied to the FAQ bank.
3. A trade gets a purpose-written pack **only where the pack genuinely
   describes that business**. Chimney and fireplace work is general, not
   roofing, because handing a founder the wrong specific knowledge mid-call is
   worse than handing him general knowledge he knows is general — and the CRM
   labels it *"General trade knowledge"* on screen.
4. `tests/core/pitch-matching.test.ts` walks **every** taxonomy trade, asserts
   the exact pack each resolves to, proves no id reaches the matcher, and
   asserts directly that no accreditation ever appears for a trade that does
   not hold it.

**The coverage number is now asserted, not hidden.** 7 of 35 trades reach a
purpose-written pack; 28 are honestly general. The test pins 7 so the number
cannot drift upward by accident — if it rises, it must be because somebody
wrote knowledge, not because a guess crept back in. That gap is the case for
the trade knowledge base.

## Consequences

### Positive
- The founder is never shown another trade's accreditations while selling.
- The pattern is now uniform across all four sites the defect appeared at:
  declared lookup first, anchored matching only for genuinely free text.
- The coverage gap is a number in a test rather than a thing nobody counted.

### Negative / Trade-offs
- 28 of 35 trades get a general pitch pack, and that is now explicit. The
  panel was never better than this — it only looked better because two of the
  trades were being confidently wrong.
- Adding a taxonomy trade means adding a row to the map. The test fails if you
  forget, which is the intent.

### Neutral
- No migration, no data change. Deals and businesses store trade ids; only the
  resolution of ids to sales material changed.
