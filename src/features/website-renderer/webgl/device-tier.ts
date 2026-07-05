/**
 * Device-capability tiering (ADR-035) — built for the Morph Lab, designed
 * for later PUBLIC use. The performance law holds via tiering: full 3D on
 * capable devices, the SAME choreography rendered flat on constrained
 * ones, and the designed still whenever motion is unwelcome or WebGL2 is
 * absent. Reduced motion always wins.
 */

export type DeviceTier = "full-3d" | "fallback-2d" | "still";

export interface DeviceCapabilities {
  webgl2: boolean;
  /** navigator.deviceMemory (GB); undefined on Safari/Firefox. */
  deviceMemoryGb?: number;
  cores?: number;
  isMobile: boolean;
  reducedMotion: boolean;
}

export function classifyGpuTier(capabilities: DeviceCapabilities): DeviceTier {
  if (capabilities.reducedMotion) return "still";
  if (!capabilities.webgl2) return "still";
  const memory = capabilities.deviceMemoryGb ?? (capabilities.isMobile ? 4 : 8);
  const cores = capabilities.cores ?? 4;
  if (memory < 4 || cores < 4) return "fallback-2d";
  if (capabilities.isMobile && (memory < 6 || cores < 6)) return "fallback-2d";
  return "full-3d";
}

/**
 * The WebGPU compute path (ADR-038) is a strict UPGRADE of the full-3D
 * tier: only capable devices already bound for full 3D take it, and only
 * when a WebGPU adapter is actually present. Everything else — constrained
 * tiers, still tier, no adapter — falls back to the WebGL scene. Pure so
 * the decision is testable without a GPU.
 */
export function preferWebGpu(tier: DeviceTier, adapterAvailable: boolean): boolean {
  return tier === "full-3d" && adapterAvailable;
}

/** Probe for a real WebGPU adapter (async). Server/no-API → false. */
export async function detectWebGpu(): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  // @webgpu/types isn't in the lib; probe structurally.
  const gpu = (navigator as Navigator & {
    gpu?: { requestAdapter(): Promise<unknown> };
  }).gpu;
  if (!gpu) return false;
  try {
    return (await gpu.requestAdapter()) !== null;
  } catch {
    return false;
  }
}

/** Browser wrapper — probe once, classify. Server-side → "still". */
export function detectDeviceTier(): DeviceTier {
  if (typeof window === "undefined") return "still";
  let webgl2 = false;
  try {
    const canvas = document.createElement("canvas");
    webgl2 = canvas.getContext("webgl2") !== null;
  } catch {
    webgl2 = false;
  }
  const nav = navigator as Navigator & { deviceMemory?: number };
  return classifyGpuTier({
    webgl2,
    deviceMemoryGb: nav.deviceMemory,
    cores: navigator.hardwareConcurrency,
    isMobile: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent),
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  });
}
