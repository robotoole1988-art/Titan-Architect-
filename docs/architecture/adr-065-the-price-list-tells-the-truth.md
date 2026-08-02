# ADR-065 — The price list tells the truth

- **Status:** Accepted
- **Date:** 2026-08-02
- **Prompted by:** a capability audit run 2026-08-02, before the first customer signs
- **Builds on:** ADR-026 (pricing catalogue), ADR-059 (never generate a verifiable fact)

## Context

The catalogue sold seven services. Two of them exist as code.

| Sold | Setup | Monthly | Behind it |
| --- | --- | --- | --- |
| Website Build | £2,995 | £49 | The blueprint engine and 17 primitives |
| Lead Generation | £495 | £395 | The site, plus a validated Google Ads plan |
| SEO Management | £495 | £295 | On-page output only; no SEO module |
| GBP Management | £295 | £145 | **A label and a price** |
| LSA Management | £295 | £125 | **A label and a price** |
| Meta Ads Management | £495 | £295 | **A label and a price** |
| AI Search Optimisation | £395 | £195 | **A label and a price** |

The four marked in bold have no implementation anywhere in `src/`. Each is
exactly three things: a row in `BUILD_ITEM_KINDS`, a label, and a price. The
£945/month TITAN bundle includes all four.

The descriptions were the problem, not the prices. *"Google Business Profile:
posts, reviews, Q&A, photos"* sat in the same list, in the same voice, as
*"Full cinematic website from the TITAN blueprint pipeline."* A customer
reading the catalogue could not tell which of the two they were buying, and
the honest answer — a person will do this by hand — appeared nowhere.

TITAN's whole product argument is that it will not put a claim on a
customer's website that the customer cannot back. Selling four automated
channels that do not exist is the same misrepresentation one level up: in a
contract rather than on a page, where it is worse, because the customer has
paid for it. `build-model.ts` already knew — it stamps six of seven build
items "manual" and comments *"v1 honesty: only the website pipeline is
automated."* Two files described the same seven things and disagreed.

## Decision

**How a service is delivered is a field, not a turn of phrase.**

1. `ServiceDelivery = "platform" | "hand"` on every `PricedService`.
   `"platform"` means TITAN's code produces the artefact. `"hand"` means a
   person does the work and no pipeline runs.
2. The four channels stay sellable and stay priced — they are **real work
   Robert can genuinely do by hand** for early customers, and a solo founder
   setting up a Google Business Profile personally is worth £145 a month. What
   changes is that the catalogue says so: *"managed personally… done by hand,
   not automated."*
3. `seo_management` is re-described honestly as ongoing hand-worked SEO, while
   naming what the platform genuinely does build with the site — structure,
   metadata, schema, sitemap, area pages.
4. `lead_generation` keeps `"platform"` and carries the split in its
   description: TITAN generates the campaign, a person launches and manages it
   in the customer's own account. That stays true when the Ads API lands; only
   the sentence gets shorter.
5. `tests/core/pricing-honesty.test.ts` pins each service to its truth,
   requires every hand-delivered service to say so **in words a customer will
   read**, forbids automation vocabulary in those descriptions, and asserts
   the catalogue and `BUILD_ITEM_KINDS` cannot drift apart again.

The field is the point. A description is one careless edit from drifting back;
a typed field with a test behind it means the day GBP genuinely becomes
automated, flipping it is a deliberate change that breaks a test on purpose.

### Deliberately not in this change

Removing the four services, or repricing anything. The work is real and
saleable by hand at these prices; only the description was wrong. Nothing here
touches the soft-floor discount governance or the deal maths.

## Consequences

### Positive
- Nothing in the catalogue can be questioned. The first customer contract can
  be signed without a sentence in it that the platform cannot honour.
- The distinction is machine-readable, so the Deal Builder and the build queue
  can surface "we do this by hand" to the founder and to the customer.
- It creates the honest ladder the roadmap needs: every service that moves
  from `"hand"` to `"platform"` is a visible, testable graduation.

### Negative / Trade-offs
- The catalogue now reads less like a product and more like an agency for five
  of its seven lines. That is what it is today.
- Delivering GBP, LSA, Meta and AI-search work by hand does not scale past a
  handful of customers, and the price list no longer disguises that. The
  pressure to build them is now explicit rather than deferred.

### Neutral
- No migration. `delivery` is derived from what already existed; stored deals
  reference service ids, not descriptions.
