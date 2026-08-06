import {
  resolveIndustryDna,
  type DnaList,
  type MonetaryAmount,
} from "@/core/industry-dna";
import type { JobValue } from "./pitch";

/**
 * Pitch material derived from the trade knowledge base (ADR-067).
 *
 * Four purpose-written packs cover seven taxonomy ids; the other
 * twenty-eight used to fall to the general pack — the founder selling a
 * scaffolder with the same three lines he'd give a dentist. The knowledge
 * base now holds sourced, per-trade material for every taxonomy id, so the
 * fallback ladder gains a rung: curated pack → DERIVED FROM KNOWLEDGE →
 * general.
 *
 * Derivation is selection and phrasing, never invention: every line below
 * is a knowledge-base entry (label · value · description) whose provenance
 * gate already forced a research citation. Objection HANDLERS are not
 * derived — a scripted response the research never wrote is exactly the
 * kind of plausible fabrication ADR-059 exists to prevent, so the caller
 * keeps the general handlers instead.
 */

export interface DnaPitchMaterial {
  /** The canonical taxonomy id the knowledge base matched. */
  tradeId: string;
  talkingPoints: string[];
  /** Absent when the record holds too little to say anything honest. */
  painPoints?: string[];
  averageJobValues?: JobValue[];
}

/** One entry, phrased for reading aloud: label (value) — description. */
function sentence(entry: { label: string; value?: string | number; description?: string }): string {
  const value = entry.value !== undefined ? ` (${entry.value})` : "";
  const description = entry.description ? ` — ${entry.description}` : "";
  return `${entry.label}${value}${description}`;
}

function take(lists: ReadonlyArray<DnaList | undefined>, cap: number): string[] {
  const out: string[] = [];
  for (const list of lists) {
    for (const entry of list ?? []) {
      if (out.length >= cap) return out;
      out.push(sentence(entry));
    }
  }
  return out;
}

function rangeOf(amount: MonetaryAmount | undefined): string | null {
  if (!amount) return null;
  const fmt = (value: number) => `£${value.toLocaleString("en-GB")}`;
  if (amount.min !== undefined && amount.max !== undefined) {
    return `${fmt(amount.min)} – ${fmt(amount.max)}`;
  }
  if (amount.amount !== undefined) return fmt(amount.amount);
  return null;
}

/**
 * Derive pitch material for a trade, or null when the knowledge base has
 * no match (unknown free text) — the caller decides what honesty demands
 * next. `resolveIndustryDna` matches by exact id or the taxonomy's blessed
 * matcher only (ADR-066): damp-proofing can never come back as roofing.
 */
export function deriveDnaPitch(trade: string): DnaPitchMaterial | null {
  const { dna, matched } = resolveIndustryDna(trade);
  if (!matched) return null;

  const talkingPoints = take(
    [
      dna.operations.certifications,
      dna.customerPsychology.trustFactors,
      dna.operations.serviceGuarantees,
      dna.website.trustSignals,
      dna.customerPsychology.buyingTriggers,
    ],
    5,
  );
  if (talkingPoints.length < 2) return null;

  const painPoints = take(
    [dna.customerPsychology.fears, dna.customerPsychology.painPoints],
    4,
  );

  const jobValues: JobValue[] = (dna.marketIntelligence.pricingPosition ?? [])
    .filter((entry) => entry.value !== undefined)
    .map((entry) => ({ job: entry.label, typicalRange: String(entry.value) }));
  const identityRange = rangeOf(dna.businessIdentity.averageJobValue);
  if (identityRange) {
    jobValues.push({ job: "Typical project value", typicalRange: identityRange });
  }

  return {
    tradeId: matched,
    talkingPoints,
    ...(painPoints.length >= 2 ? { painPoints } : {}),
    ...(jobValues.length > 0 ? { averageJobValues: jobValues } : {}),
  };
}

/**
 * Budget guidance for the founder's "what would this cost me?" moment.
 *
 * Every line is a knowledge-base entry from the merged record's
 * `paidAdvertising.budgetGuidance` — the platform layer's trade-tiered
 * floors (Vol 3: refuse sub-£500/month; CPL ≤ 10–15% of job value) unless
 * the trade's own research wrote something more specific, in which case the
 * field-level merge already put the trade's truth first.
 *
 * This function formats entries; it never computes a number. Arithmetic on
 * figures parsed out of prose is how a "suggested budget" becomes an
 * invented one — the founder reads the sourced lines against the job
 * values beside them, which is exactly the sanity check the guardrail
 * entry describes (ADR-067; the no-substring law, ADR-062/066, applied to
 * numbers).
 */
export interface BudgetGuidance {
  /** The canonical taxonomy id the knowledge base matched. */
  tradeId: string;
  /** Sourced budget lines, phrased for reading aloud. */
  lines: string[];
}

export function deriveBudgetGuidance(trade: string): BudgetGuidance | null {
  const { dna, matched } = resolveIndustryDna(trade);
  if (!matched) return null;
  const lines = take([dna.paidAdvertising.budgetGuidance], 4);
  if (lines.length === 0) return null;
  return { tradeId: matched, lines };
}
