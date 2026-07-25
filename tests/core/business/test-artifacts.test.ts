import { describe, expect, it } from "vitest";
import { isTestEnquiry } from "@/core/business";

/**
 * ADR-056 (Cockpit Law §7): the enquiry-level exclusion rule. Conservative
 * by design — real customers NEVER trip it; the platform's own test rows
 * ALWAYS do.
 */

const enquiry = (name: string, contact: string) => ({ name, contact });

describe("isTestEnquiry", () => {
  it("catches the platform's own live verification rows", () => {
    // The two real rows submitted during production verification.
    expect(isTestEnquiry(enquiry("Go-Live Verification", "golive-test@example.com"))).toBe(true);
    expect(isTestEnquiry(enquiry("Audit F2 Verification", "07700900123"))).toBe(true);
  });

  it("catches explicit convention markers (the ADR-049 mirror)", () => {
    expect(isTestEnquiry(enquiry("Dana (test)", "dana@realmail.co.uk"))).toBe(true);
    expect(isTestEnquiry(enquiry("Morph Lab (internal)", "07712 345678"))).toBe(true);
  });

  it("catches fiction-reserved identifiers regardless of name", () => {
    expect(isTestEnquiry(enquiry("Jane Ordinary", "jane@example.com"))).toBe(true);
    expect(isTestEnquiry(enquiry("Jane Ordinary", "jane@sub.example.org"))).toBe(true);
    expect(isTestEnquiry(enquiry("Jane Ordinary", "jane@service.test"))).toBe(true);
    expect(isTestEnquiry(enquiry("Jane Ordinary", "07700 900456"))).toBe(true);
    expect(isTestEnquiry(enquiry("Jane Ordinary", "+44 7700 900001"))).toBe(true);
  });

  it("NEVER trips on real customers", () => {
    for (const real of [
      enquiry("Dana Homeowner", "dana@gmail.com"),
      enquiry("Sam Sorted", "07712 900456"), // real mobile, not the drama range
      enquiry("Maria Testa", "maria.testa@yahoo.co.uk"), // 'Testa' ≠ test
      enquiry("Steve Protester", "steve@btinternet.com"), // substring, not word
      enquiry("Vera Kation", "vera@examplebakery.co.uk"), // domain merely contains 'example'
      enquiry("John Smith", "07700 800123"), // 07700 8xxxxx is a REAL range
      // The review-workflow finding: real UK place names contain the bare
      // word "test" — they must NEVER be erased (bare \btest\b is banned
      // from the rule for exactly this reason).
      enquiry("Test Valley Roofing", "office@tvroofing.co.uk"),
      enquiry("Test Valley Borough Council", "07911 123456"),
    ]) {
      expect(isTestEnquiry(real), real.name).toBe(false);
    }
  });
});
