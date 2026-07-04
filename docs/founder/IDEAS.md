# Founder Ideas Register

Living register of product ideas — where they came from, what they'd change,
and where they stand. An idea graduates by becoming a milestone spec (and
usually an ADR); nothing here is a commitment until it does.

Creative canon lives separately: the founder's morph & cinema library is
[Signature Moments](../experience/SIGNATURE-MOMENTS.md), the
creative-technology constitution behind it is
[Experience Engineering](../experience/EXPERIENCE-ENGINEERING.md), and the
growth constitution is [The Growth Department](../growth/GROWTH-DEPARTMENT.md).

| Idea | Status |
| --- | --- |
| [Glass Box](#glass-box) | Idea |
| [Revenue Attribution](#revenue-attribution) | Idea |
| [The Living Website](#the-living-website) | Idea |
| [Never-Miss-A-Lead](#never-miss-a-lead) | Idea |
| [Network Intelligence](#network-intelligence) | Idea |
| [Area Pages](#area-pages) | **Shipped** — ADR-028 |
| [Schema Everywhere](#schema-everywhere) | **Shipped** — ADR-028 |

## Glass Box

Customer-facing explainability. Every number, ranking, and decision TITAN
shows a customer should be able to answer "why?" in one click — the same
provenance discipline the platform already enforces internally (ADR-025's
confidence + sources on every figure), surfaced as a customer-visible layer.
Trust becomes the product: competitors sell dashboards, TITAN sells a glass
box you can see into.

## Revenue Attribution

Optimise to pounds, not leads. Today the loop closes at the enquiry; the next
loop closes at the invoice: which enquiry became a £6k driveway, which
keyword, area page, and surface produced it. Once revenue flows back in,
budget allocation, CPL targets, and ROI stop being estimates and become
measurements — and "TITAN never shows a number it didn't measure" gets its
strongest expression.

## The Living Website

Weather- and season-reactive sites. A roofing site that quietly foregrounds
storm response when a storm front is inbound; a driveways site that shifts to
golden summer tones in June and warm maintenance messaging in November. The
blueprint already separates content direction from rendering — a reactive
layer would select variants/emphasis from live context signals, under the
same review-gate discipline (nothing changes live without rules the founder
approved). The creative expression of this idea is "The Living Atmosphere"
in [Signature Moments](../experience/SIGNATURE-MOMENTS.md#the-five-cinematic-systems).

## Never-Miss-A-Lead

Missed-call text-back. A trade on a roof cannot answer the phone; the lead
calls the next company in the results. A missed call to a TITAN-managed
number triggers an instant SMS ("Sorry we missed you — we're on a job. Want a
callback slot?") and logs an enquiry against the account automatically. The
enquiry entity and notification seam from ADR-027 are the natural mounting
points.

## Network Intelligence

Cross-customer benchmarks. Every TITAN customer makes the platform smarter:
anonymised, aggregated performance (CPL by trade/area, conversion by section
sequence, seasonal demand curves) feeds back into strategy generation and the
market-intelligence engine. The moat compounds — a new customer's site starts
from what a hundred previous sites learned. Requires careful anonymisation
and terms; the provider seam (ADR-025) is where it plugs in.

## Area Pages

**Shipped (ADR-028).** One genuinely unique landing page per coverage area —
own conversion-forward sequence, localised strategy, honest area-proof slots,
anti-doorway differentiation enforced by the generator and CI.

## Schema Everywhere

**Shipped (ADR-028).** JSON-LD generated from the blueprint on every
published page — LocalBusiness with areaServed, Service, FAQPage mirroring
rendered content, BreadcrumbList on area pages; review markup deliberately
waits for real review data.
