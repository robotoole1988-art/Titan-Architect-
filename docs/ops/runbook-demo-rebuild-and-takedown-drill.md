# Runbook — rebuild one demo end to end, with the takedown drill

Queue item 4. Goal: one finished, imagery-complete site at the standard, live
in public — and takedown proven as a *watched* capability, not a believed
one, before anything is sold. Total founder time ≈ 30–45 minutes; imagery
cost ≈ 60p per site (images only — film stays off: `NEXT_PUBLIC_AMBIENT_FILM`
is not set, and commissioning film today is money for bytes nobody sees).

Roles: **[T]** = founder's Terminal, **[C]** = Claude drives (CRM/browser),
**[F]** = founder judgment call.

## 0. Preflight (5 min) — nothing is commissioned until this is green

1. **[T]** `node scripts/media-preflight.mjs` — verifies REPLICATE_API_TOKEN,
   FAL_KEY, Supabase env, and the public `media` bucket. All four were in
   place as of 2 Aug (keys in `.env.local`, bucket exists) — the preflight
   proves it TODAY rather than remembers it.
2. **[F]** Pick the demo business. Recommendation: **Summit Roofing Rescue**
   (emergency archetype — the flagship PRD's Act 4 story uses it, so this
   build feeds the flagship directly). Its blueprint predates ADR-059/063 —
   step 1 regenerates it clean.

## 1. Regenerate the blueprint (5 min)

1. **[C]** Open the business in the CRM → Experience Studio → regenerate
   strategy + blueprint (post-ADR-063: business-specific colour and form;
   post-ADR-059: no unbacked facts possible).
2. **[F]** Review the preview — the architect's drawing, annotations on.
   This is the taste gate: colour, register, section order. Iterate here,
   cheaply, before any image money moves.

## 2. Commission imagery (~60p, 10 min + generation time)

1. **[C]** From `/crm/{id}/media`: `generateBusinessMedia` fills the
   blueprint's slot plan (deterministic slots from ADR-033; UK-authenticity
   prompt law at the choke point; evidentiary slots are EXCLUDED by ADR-060
   — generation cannot fill a portfolio frame, only mood/materials/finish).
2. Wait for the review queue to fill (Replicate latency, minutes).
3. **[F]** The founder gate, one asset at a time: approve / reject
   (`setMediaStatus`), or `approveAllMediaInReview` only if every asset
   clears the bar. Rejects can be regenerated; ~60p buys a full slot plan,
   so taste beats thrift — reject freely.

## 3. Publish (2 min)

1. **[C]** Build Queue → website item → **live** (this IS publishing:
   ADR-027 pins the latest blueprint version; stage transitions to `live`;
   the server action evicts the edge cache so the page serves fresh).
2. **[C]** Verify serving: `/sites/summit-roofing-rescue` renders with
   approved imagery (media resolves live without republish — ADR-055 §5).

## 4. Prove the standard (5 min)

1. **[C]** Section-by-section screenshots (never full-page) — the design
   pass against the founder's bar.
2. **[T]** `node scripts/lighthouse-gate.mjs https://titan-architect.vercel.app --paths /sites/summit-roofing-rescue`
   — the Performance Law, on the real page, mobile emulation, median of 3.
   A miss is a stop: fix before the demo is shown to anyone.

## 5. THE TAKEDOWN DRILL (5 min) — the part that makes it sellable

The first live site since the takedown path shipped (PR #29/30). Drill it
while nothing commercial depends on it:

1. **[T]** `node scripts/unpublish-site.mjs summit-roofing-rescue`
   — expect: `offline: /sites/summit-roofing-rescue — row flipped, edge cache evicted`.
2. **[C]** Curl/browse the URL: **404 within seconds**, not within an hour.
   This is the 200-path proof of `/api/revalidate` that was deliberately
   left untested on 2 Aug (fail-closed 401/503 already verified in prod).
3. **[C]** CRM detail page → Live site panel → **Republish** via Build
   Queue → verify serving again. Takedown AND resurrection, both watched.
4. Log the drill in the business activity (one note) — the paper trail
   starts with our own demo.

## 6. Aftermath

- The finished site becomes: the thing shown to prospects, Act 4's living
  exhibit, and the page that un-reds the Performance Law CI check (its
  audit paths stop 404ing).
- If the imagery pass surfaced prompt-law weaknesses, file them against the
  media pipeline before generating for site #2 — one demo's lessons are
  cheap, a fleet's are not.

## Abort lines

- Preflight red → fix config; commission nothing.
- Generated imagery below the bar after two rejection rounds → publish
  WITHOUT imagery (designed empty states, ADR-034) and treat the prompt law
  as the day's real work — a bare honest site beats a dressed mediocre one.
- Lighthouse floor missed → the site does not get shown, per the law's own
  words: a site that misses a floor does not go live.
