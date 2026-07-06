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
  PrimitiveSectionProps,
  PrimitiveComponent,
  PrimitiveComponentMap,
  RenderPageOptions,
  UnmappedPrimitiveBehaviour,
} from "./model/types";

// Morph Lab (ADR-035): the Tier-3 choreography core + device tiering.
// Pure maths — the heavy three.js scene loads ONLY via the lab's dynamic
// import, never through this index.
export {
  BEAT_ORDER,
  beatAt,
  buildStormField,
  buildStormVortex,
  particleState,
  stormLightAt,
  vortexParams,
} from "./morph-lab/choreography";
export type {
  MorphBeat,
  ParticleState,
  StormField,
  StormLight,
  VortexIntensity,
  VortexParams,
  VortexParticle,
} from "./morph-lab/choreography";
export {
  classifyGpuTier,
  detectDeviceTier,
  detectWebGpu,
  preferWebGpu,
} from "./webgl/device-tier";
export {
  PARTICLE_MATERIALS,
  resolveParticleMaterial,
} from "./morph-lab/particle-materials";
export {
  buildRenovation,
  buildRenovationField,
  renovationLight,
  renovationParams,
  renovationState,
} from "./morph-lab/renovation";
export type {
  RenovationField,
  RenovationLight,
  RenovationParams,
  RenovationParticle,
  RenovationRegion,
} from "./morph-lab/renovation";
export type {
  ParticleMaterialKey,
  ParticleMaterialSpec,
} from "./morph-lab/particle-materials";
export type { DeviceCapabilities, DeviceTier } from "./webgl/device-tier";
export { MorphLabPage } from "./morph-lab/lab-page";
export {
  DOME_SPECS,
  ensureLabBusiness,
  mapDomeRecords,
  resolveLabEnvironment,
  resolveMorphLab,
} from "./morph-lab/environment";
export type {
  DomeSpec,
  DomeTimeOfDay,
  LabDome,
  LabEnvironment,
} from "./morph-lab/environment";
