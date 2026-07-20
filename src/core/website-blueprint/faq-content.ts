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
    matches: /roof/i,
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
    matches: /drivew|paving/i,
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
    matches: /dent/i,
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
        question: "Are your dentists qualified?",
        answer:
          "All clinicians are GDC-registered — you can check any dentist's registration yourself at gdc-uk.org — and it's fair to ask about postgraduate training for specialist work like implants.",
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
    matches: /electric|solar|ev charg/i,
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
        question: "Are you certified?",
        answer:
          "All work is carried out by or under a Part P-compliant contractor registered with NICEIC or NAPIT, to BS 7671 (18th Edition). Notifiable work always comes with certification.",
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
          "Survey, design, then an MCS and Part P-compliant installation. Most EV charge points typically land £200–£2,000 depending on the cable run and supply; solar systems are quoted per design.",
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
