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
