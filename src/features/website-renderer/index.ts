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
export { recordSiteMetric } from "./api/record-site-metric";
export type { RecordSiteMetricResult } from "./api/record-site-metric";
export type { SubmitEnquiryInput, SubmitEnquiryResult } from "./api/submit-enquiry";
export {
  streamMedia,
  toStreamUrl,
  isProxyableMediaUrl,
} from "./api/media-stream";
export { renderPage } from "./model/render-page";
export { resolveSignatureMoment } from "./moments/registry";
export {
  PRIMITIVE_COMPONENT_MAP,
  resolvePrimitiveComponent,
} from "./model/primitive-map";
export type {
  ResolvedMediaAsset,
  ResolvedReview,
  PrimitiveSectionProps,
  PrimitiveComponent,
  PrimitiveComponentMap,
  RenderPageOptions,
  UnmappedPrimitiveBehaviour,
} from "./model/types";

// WebGL 3D foundation — retained after the real-time particle morph was
// retired (ADR-041 supersedes ADR-035/ADR-038; hero WOW = premium AI film).
// These are the reusable, renderer-agnostic pieces the morph left behind:
// device-capability tiering and the trade-keyed PBR material registry. Pure
// config/detection — no three.js pulled through this index. The compute
// renderer, the storm/vortex choreography, and the Morph Lab route are gone.
export {
  classifyGpuTier,
  detectDeviceTier,
  detectWebGpu,
  preferWebGpu,
} from "./webgl/device-tier";
export type { DeviceCapabilities, DeviceTier } from "./webgl/device-tier";
export {
  PARTICLE_MATERIALS,
  resolveParticleMaterial,
} from "./morph-lab/particle-materials";
export type {
  ParticleMaterialKey,
  ParticleMaterialSpec,
} from "./morph-lab/particle-materials";
