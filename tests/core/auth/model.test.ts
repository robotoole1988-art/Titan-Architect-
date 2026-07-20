import { describe, expect, it } from "vitest";
import { isFounderEmail, isProtectedAppPath } from "@/core/auth";

/**
 * ADR-054: the founder gate's pure rules. Deny-by-default everywhere —
 * no allowlist configured means nobody passes, and every internal path is
 * protected unless it is explicitly the door, the sites, or the API.
 */

describe("isFounderEmail", () => {
  it("matches the founder case-insensitively with whitespace tolerance", () => {
    expect(isFounderEmail("robert@example.com", "robert@example.com")).toBe(true);
    expect(isFounderEmail("  Robert@Example.COM ", "robert@example.com")).toBe(true);
  });

  it("rejects everyone else", () => {
    expect(isFounderEmail("intruder@example.com", "robert@example.com")).toBe(false);
    expect(isFounderEmail("robert@example.com.evil.com", "robert@example.com")).toBe(false);
  });

  it("DENY-BY-DEFAULT: no allowlist, no email, no entry", () => {
    expect(isFounderEmail("robert@example.com", undefined)).toBe(false);
    expect(isFounderEmail("robert@example.com", "")).toBe(false);
    expect(isFounderEmail(null, "robert@example.com")).toBe(false);
    expect(isFounderEmail(undefined, "robert@example.com")).toBe(false);
    expect(isFounderEmail("", "")).toBe(false);
  });
});

describe("isProtectedAppPath", () => {
  it("protects every internal surface", () => {
    for (const path of [
      "/",
      "/dashboard",
      "/brain",
      "/crm",
      "/crm/abc-123",
      "/crm/abc-123/media",
      "/business-intake",
      "/experience-studio",
      "/experience-studio/preview",
      "/codex",
      "/directives/new",
      "/settings",
      "/market",
    ]) {
      expect(isProtectedAppPath(path), path).toBe(true);
    }
  });

  it("leaves the door, the published sites, and the API public", () => {
    for (const path of [
      "/login",
      "/auth/callback",
      "/sites/summit-roofing-rescue",
      "/sites/summit-roofing-rescue/headingley",
      "/sites/-host/customer-domain.example",
      "/api/enquiries",
      "/api/metrics",
      "/api/media",
      "/api/keepalive",
      "/_next/static/x.js",
      "/favicon.ico",
      // Static assets the SITES render (audit F1: gating these broke the
      // renderer's poster fallbacks with a 307-to-login broken image).
      "/renderer/golden-poster.png",
      "/renderer/storm-poster.png",
      "/generated-media/some-business/hero.webp",
    ]) {
      expect(isProtectedAppPath(path), path).toBe(false);
    }
  });

  it("does not let look-alike paths escape the gate", () => {
    expect(isProtectedAppPath("/sitesX")).toBe(true);
    expect(isProtectedAppPath("/loginX")).toBe(true);
    expect(isProtectedAppPath("/authX")).toBe(true);
  });
});
