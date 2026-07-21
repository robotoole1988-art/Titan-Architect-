/**
 * The Reveal — sales demo mode (ADR-055) — public API.
 */

export { DemoPage } from "./components/demo-page";
export { loadDemoData } from "./api/demo-data";
export type { BeforeCapture, DemoData } from "./api/demo-data";
export { prepareDemoAction, saveVariantAction } from "./api/actions";
export {
  DEMO_CAPTURE_KIND,
  extractSiteSignals,
  isFetchableSiteUrl,
  prepareDemo,
  type PageFetcher,
  type PrepareDemoResult,
} from "./api/prepare";
