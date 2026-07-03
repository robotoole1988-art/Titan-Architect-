"use client";

/**
 * The rendered site as ONE client boundary. The preview page loads it via
 * next/dynamic so its JavaScript (Framer Motion + interactive primitives)
 * arrives AFTER the server-rendered HTML has painted — the storm hero is pure
 * CSS and needs none of it to look alive (ADR-022 performance posture).
 */

import type { WebsiteBlueprint } from "@/core/website-blueprint";
import { renderPage } from "../model/render-page";

export function RenderedSite({
  blueprint,
  pageId,
  previewQuery,
}: {
  blueprint: WebsiteBlueprint;
  /** Which page of the collection to render (ADR-028). */
  pageId?: string;
  /**
   * Present in PREVIEWS: the preview route's own query string (without
   * `page`). Nav links stay inside the preview by switching `?page=`.
   */
  previewQuery?: string;
}) {
  return renderPage(blueprint, {
    pageId,
    ...(previewQuery !== undefined
      ? {
          pageHref: (targetPageId: string) =>
            `${previewQuery ? `?${previewQuery}&` : "?"}page=${encodeURIComponent(targetPageId)}`,
        }
      : {}),
  });
}

export default RenderedSite;
