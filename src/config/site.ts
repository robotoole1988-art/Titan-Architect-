/**
 * Single source of truth for global, non-secret platform metadata.
 * Anything that describes "what this app is" lives here so it never gets
 * hardcoded across the codebase.
 */
export const siteConfig = {
  name: "TITAN Architect",
  shortName: "TITAN",
  description:
    "The internal operating system for designing, managing and evolving the TITAN ecosystem.",
  version: "0.1.0",
} as const;

export type SiteConfig = typeof siteConfig;
