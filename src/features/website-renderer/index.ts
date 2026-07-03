/**
 * Website Renderer — public API (ADR-022).
 *
 * The React realisation of the Website Blueprint: hand-crafted premium
 * primitives composed 1:1 from registry ids — never free-generated layout
 * (ADR-021). This is the ONLY surface other layers may import from.
 */

export { WebsitePreviewPage } from "./components/website-preview-page";
export {
  resolvePublishedSite,
  publishedSiteMetadata,
  publishedSiteNotFound,
  PublishedSitePage,
} from "./components/published-site";
export type { ResolvedPublication } from "./components/published-site";
export { submitEnquiry } from "./api/submit-enquiry";
export type { SubmitEnquiryInput, SubmitEnquiryResult } from "./api/submit-enquiry";
export { renderPage } from "./model/render-page";
export {
  PRIMITIVE_COMPONENT_MAP,
  resolvePrimitiveComponent,
} from "./model/primitive-map";
export type {
  PrimitiveSectionProps,
  PrimitiveComponent,
  PrimitiveComponentMap,
  RenderPageOptions,
  UnmappedPrimitiveBehaviour,
} from "./model/types";
