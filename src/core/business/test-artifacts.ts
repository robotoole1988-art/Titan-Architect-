/**
 * Test-artifact detection (ADR-056, Cockpit Law §7) — the enquiry-level
 * sibling of ADR-049's `isInternalBusinessName`.
 *
 * The Brain's credibility is the product: it must never recommend chasing
 * a test row. An enquiry is a test artifact when it carries the platform's
 * own explicit markers, verification-run naming, or — the principled
 * backbone — identifiers RESERVED FOR FICTION that cannot belong to a real
 * customer: RFC-2606/6761 reserved domains and the UK Ofcom drama-reserved
 * number range (07700 900000–900999).
 *
 * Conservative on purpose: whole-word name matches only, so real names
 * ("Testa", "Sam Sorted") never trip it. Exclusion means "never steers an
 * operating surface" — CRM detail views keep test rows findable, exactly
 * as internal businesses remain findable under ADR-049.
 */

import type { Enquiry } from "./repository";

/** Explicit convention markers + verification-run naming (whole words). */
const NAME_MARKERS = /\((test|internal)\)|\b(test|verification)\b/i;

/** RFC-2606/6761 reserved domains — documentation/testing only, forever. */
const RESERVED_DOMAIN =
  /@(?:[a-z0-9.-]*\.)?(?:example\.(?:com|org|net)|example|test|invalid|localhost)\s*$/i;

/** Ofcom drama range: 07700 900000–900999 (with or without spacing/+44). */
const DRAMA_NUMBER = /(?:\+44\s?7700|07700)\s?900\s?\d{3}\b/;

/** The fields the rule reads — enquiry-shaped, structurally typed. */
export type TestArtifactSignals = Pick<Enquiry, "name" | "contact">;

export function isTestEnquiry(enquiry: TestArtifactSignals): boolean {
  const name = enquiry.name.trim();
  const contact = enquiry.contact.trim();
  if (NAME_MARKERS.test(name)) return true;
  if (RESERVED_DOMAIN.test(contact)) return true;
  if (DRAMA_NUMBER.test(contact.replace(/[()-]/g, ""))) return true;
  return false;
}
