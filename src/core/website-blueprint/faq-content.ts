/**
 * The trade FAQ content bank (ADR-047).
 *
 * Crafted, researched Q&A per trade — typical UK industry ranges (researched
 * July 2026) with the provenance in the copy itself: figures are ALWAYS
 * framed as typical ranges, never as the business's own prices. The builder
 * rides these through the existing `qa: question | answer` channel, which the
 * FAQ primitive (ADR-022), public redaction (ADR-034), and FAQPage JSON-LD
 * (ADR-028) already consume.
 *
 * Matching is CONSERVATIVE by design: a trade without a bank gets null and
 * its FAQ keeps the honest ADR-034 collapse. Wrong answers are worse than no
 * answers — a bank is only added when its content has actually been
 * researched. The pipe character is the slot separator and must never appear
 * in copy (enforced by tests).
 *
 * ANSWERS DESCRIBE THE INDUSTRY, NEVER THE BUSINESS (ADR-059). The same rule
 * that keeps prices as "typical UK ranges, not a quote" applies to
 * credentials, insurance and guarantees: TITAN does not know whether THIS
 * electrician holds NICEIC registration, so it must not say so. Two answers
 * used to ("All work is carried out by… a contractor registered with NICEIC
 * or NAPIT"; "All clinicians are GDC-registered") and were rewritten to state
 * the rule and tell the reader how to check — which is better content anyway,
 * and is enforced by tests/core/accreditation-law.test.ts.
 */

export interface TradeFaq {
  question: string;
  answer: string;
}

export interface FaqBank {
  id: string;
  /** When the figures were last researched — review periodically. */
  researchedAt: string;
  /** Conservative trade matcher: explicit patterns, no fuzzy guessing. */
  matches: RegExp;
  qas: ReadonlyArray<TradeFaq>;
}

const BANKS: ReadonlyArray<FaqBank> = [
  {
    id: "roofing-emergency",
    researchedAt: "2026-07",
    // \b, not a bare substring: "Damp Proofing" contains "roof" inside
    // "p-ROOF-ing" and was being served six emergency-roofing FAQs —
    // "How fast can you get here?", "Will my insurance cover storm damage?"
    // — on a damp-proofing site. The same trap ADR-059 found in the
    // accreditation map, 400 lines from a comment warning about it.
    matches: /\broof/i,
    // Storm-voice: urgent, plain, reassuring — damage stopped first.
    qas: [
      {
        question: "How much does an emergency roofer cost?",
        answer:
          "Typical UK ranges (2026): a callout is usually £150–£300 before any work, temporary weatherproofing £150–£400, and repairs £250–£1,500+ depending on damage and access. Those are industry ranges, not a quote — always get the full cost, including the callout, in writing before anyone climbs a ladder.",
      },
      {
        question: "How fast can you get here?",
        answer:
          "Same-day, including out-of-hours. The first job is always to stop the damage getting worse: temporary cover — tarpaulin, secured tiles — goes on immediately, then the full repair is planned properly.",
      },
      {
        question: "How long will the repair take?",
        answer:
          "Small patch jobs are often finished the same or next day. Extensive repairs typically run 2–5 days and are weather-dependent. Temporary cover is fitted to hold for days up to a couple of weeks, so nothing gets worse while you wait.",
      },
      {
        question: "Are you insured?",
        answer:
          "Yes — and you should ask that of any roofer before they start. If uninsured workmanship causes damage, your home insurance may not pay out.",
      },
      {
        question: "What happens if you find more problems mid-job?",
        answer:
          "You get photos, a written explanation, and a revised quote before any extra work happens. No surprise bills.",
      },
      {
        question: "Will my insurance cover storm damage?",
        answer:
          "Often yes, where the damage is sudden storm damage rather than wear. Everything gets documented — photos and a written report — so your claim has the evidence it needs.",
      },
    ],
  },
  {
    id: "driveways-paving",
    researchedAt: "2026-07",
    matches: /\bdrivew|\bpaving/i,
    // Golden-hour voice: considered, craft-first, honest about trade-offs.
    qas: [
      {
        question: "How much does a new driveway cost?",
        answer:
          "Typical UK ranges (2026): resin-bound around £110–£150 per square metre, block paving £75–£110. A typical 50 square-metre drive lands around £3,600–£9,000 depending on material and groundwork. Industry ranges, not a quote — every drive is priced on its own preparation, in writing.",
      },
      {
        question: "Do I need planning permission?",
        answer:
          "Not for permeable surfaces like resin-bound or permeable block paving. A non-permeable surface over five square metres that drains to the highway does need permission — worth settling before the design is finalised.",
      },
      {
        question: "How long does installation take?",
        answer:
          "Resin-bound is typically 2–3 days; block paving 3–6 days including groundwork. The preparation is most of the job — and most of the lifespan.",
      },
      {
        question: "How long will it last?",
        answer:
          "Properly installed and maintained: resin-bound typically 20–25 years, permeable block paving 25–30 years.",
      },
      {
        question: "Resin or block paving — which is better?",
        answer:
          "A genuine trade-off. Resin gives a seamless, contemporary finish with low maintenance — an annual wash. Block gives the classic look and is repairable block by block, with joints re-sanded every 5–7 years.",
      },
      {
        question: "What maintenance will it need?",
        answer:
          "Resin: an annual clean. Block: occasional re-sanding or re-gritting of the joints. Both stay at their best with prompt weed and moss treatment.",
      },
    ],
  },
  {
    id: "dentistry",
    researchedAt: "2026-07",
    // \b again: "dent" hides inside "accident", "independent", "resident".
    matches: /\bdent/i,
    // Quiet-confidence voice: gentle, transparent, patient-first.
    qas: [
      {
        question: "How much is a check-up?",
        answer:
          "Private check-ups typically cost £50–£120 in the UK (2026), and new-patient consultations often include X-rays and a full assessment. Those are typical ranges rather than a quote — you'll always know the exact cost before you book.",
      },
      {
        question: "What do dental implants cost?",
        answer:
          "Typically £1,400–£3,500 per tooth in the UK (2026). Always compare like-for-like: a quote should state whether the crown, the abutment and imaging are included.",
      },
      {
        question: "I'm nervous about the dentist — can you help?",
        answer:
          "Yes, and you're far from alone. Gentle pacing, everything explained before it happens, and sedation options for anxious patients and longer treatments.",
      },
      {
        question: "How do I check a dentist is qualified?",
        answer:
          "Every dentist practising in the UK must be registered with the General Dental Council, and you can check any dentist's registration yourself at gdc-uk.org. It is also fair to ask about postgraduate training for specialist work like implants.",
      },
      {
        question: "Can I spread the cost?",
        answer:
          "Most practices offer payment plans or 0% finance on larger treatments. Ask for a written, itemised treatment plan first, so the amount you're spreading is exact.",
      },
      {
        question: "Will I get a treatment plan before work starts?",
        answer:
          "Always. A written plan with itemised costs before any treatment begins — no exceptions.",
      },
    ],
  },
  {
    id: "electrical-solar",
    researchedAt: "2026-07",
    matches: /\belectric|\bsolar|\bev charg/i,
    // Live-wire voice: precise, certification-forward, no hand-waving.
    qas: [
      {
        question: "How much does an electrician cost?",
        answer:
          "Typically £40–£70 per hour across the UK (2026); small jobs are usually quoted as a fixed price. Industry ranges, not a quote — exact figures come in writing before work starts.",
      },
      {
        question: "What is an EICR and what does it cost?",
        answer:
          "An Electrical Installation Condition Report — a formal safety inspection of your wiring. Typically £100–£250 for an average home, taking 2–4 hours on site. Landlords are legally required to hold a current one at regular intervals.",
      },
      {
        question: "What certification should an electrician have?",
        answer:
          "Notifiable electrical work in England and Wales must either be done by an electrician registered with a government-approved competent-person scheme, or notified to building control. Ask any electrician which scheme they belong to and for their registration number before work starts, check it on that scheme's own register, and expect a certificate when the work is finished. The work itself should meet BS 7671 (18th Edition).",
      },
      {
        question: "How much does a rewire cost?",
        answer:
          "Typically £1,500–£6,500 in the UK (2026), depending on property size and access.",
      },
      {
        question: "Do I get a certificate after the work?",
        answer:
          "Yes — an Electrical Installation Certificate, or a Minor Works Certificate for smaller jobs, for all notifiable work. Keep it safe: buyers, landlords and insurers ask for it.",
      },
      {
        question: "What does a solar or EV charger installation involve?",
        answer:
          "Survey, design, then installation and certification. Most EV charge points typically land £200–£2,000 depending on the cable run and supply; solar systems are quoted per design. Ask any installer which certification schemes they hold before you sign — for solar it affects both your export tariff and your consumer protections.",
      },
    ],
  },
];

/**
 * The bank for a trade, or null. Matching is explicit and conservative —
 * tradeId (canonical taxonomy id) and the display trade are both consulted;
 * no bank means no `qa:` slots and the FAQ keeps its honest collapse.
 */
export function resolveFaqBank(meta: {
  trade: string;
  tradeId?: string;
}): FaqBank | null {
  const haystack = `${meta.trade} ${meta.tradeId ?? ""}`;
  return BANKS.find((bank) => bank.matches.test(haystack)) ?? null;
}
