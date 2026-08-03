import type { BusinessSpineRepositories } from "@/core/business";
import { getTradeDefinition } from "@/core/trade-taxonomy";

/**
 * The company-site contact form's logic (ADR-064, amended by the fix wave
 * that removed the raw-Gmail CTA).
 *
 * TITAN sells enquiry capture. For its first months its own site's only
 * route in was a mailto: to a personal Gmail address — the one page on the
 * internet where TITAN visibly did not use TITAN. This module is the
 * correction: a submission becomes a LEAD in TITAN's own CRM through the
 * same spine repositories every customer enquiry uses. The form is the
 * product, demonstrated.
 *
 * Same protections as customer enquiry intake (ADR-027): a honeypot field
 * bots fill and humans never see (drops are silent — bots think they
 * succeeded), rate limiting at the action layer, and hard field caps so
 * nobody stores a novel.
 */

export interface CompanyContactInput {
  /** The person's name. */
  name: string;
  /** The trade business's name. */
  business: string;
  /** Canonical taxonomy id from the form's select. */
  tradeId: string;
  town: string;
  email: string;
  phone: string;
  message: string;
  /** Honeypot — humans leave it empty (field is visually hidden). */
  website: string;
}

export type CompanyContactResult =
  | { ok: true; dropped: boolean }
  | { ok: false; reason: "invalid" };

const MAX = {
  name: 120,
  business: 160,
  town: 90,
  email: 200,
  phone: 40,
  message: 2000,
} as const;

/**
 * Validate and store a contact submission as a CRM lead.
 *
 * The trade select submits a taxonomy id, so the lead lands classified —
 * the knowledge panel and pitch panel light up the moment it is opened.
 * An unknown id (form tampering) is rejected rather than guessed at
 * (ADR-066: a trade is looked up, never guessed).
 */
export async function processCompanyContact(
  spine: BusinessSpineRepositories,
  input: CompanyContactInput,
): Promise<CompanyContactResult> {
  // Honeypot: accept, store nothing. The bot moves on satisfied.
  if (input.website.trim() !== "") return { ok: true, dropped: true };

  const name = input.name.trim().slice(0, MAX.name);
  const business = input.business.trim().slice(0, MAX.business);
  const town = input.town.trim().slice(0, MAX.town);
  const email = input.email.trim().slice(0, MAX.email);
  const phone = input.phone.trim().slice(0, MAX.phone);
  const message = input.message.trim().slice(0, MAX.message);
  const trade = getTradeDefinition(input.tradeId.trim());

  if (!name || !business || !town || !trade) return { ok: false, reason: "invalid" };
  // Email is the required channel (the form marks it required); a bare
  // "@"-less string is not an address.
  if (!email.includes("@") || email.length < 6) return { ok: false, reason: "invalid" };
  if (message.length < 10) return { ok: false, reason: "invalid" };

  const created = await spine.businesses.create({
    name: business,
    trade: trade.label,
    tradeId: trade.id,
    location: town,
    contact: { email, ...(phone ? { phone } : {}) },
  });

  await spine.activity.log({
    businessId: created.id,
    kind: "note",
    message:
      `Enquiry via the TITAN site contact form — from ${name}` +
      `${phone ? ` (${phone})` : ""}: ${message}`,
    meta: { source: "company-site-contact-form" },
  });

  return { ok: true, dropped: false };
}
