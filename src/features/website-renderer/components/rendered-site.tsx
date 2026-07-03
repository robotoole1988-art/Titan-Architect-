"use client";

/**
 * The rendered site as ONE client boundary. The preview page loads it via
 * next/dynamic so its JavaScript (Framer Motion + interactive primitives)
 * arrives AFTER the server-rendered HTML has painted — the storm hero is pure
 * CSS and needs none of it to look alive (ADR-022 performance posture).
 */

import type { WebsiteBlueprint } from "@/core/website-blueprint";
import { renderPage } from "../model/render-page";

export function RenderedSite({ blueprint }: { blueprint: WebsiteBlueprint }) {
  return renderPage(blueprint);
}

export default RenderedSite;
