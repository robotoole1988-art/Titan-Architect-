"use client";

/**
 * The rendered site as ONE client boundary. The preview page loads it via
 * next/dynamic so its JavaScript (the interactive primitives) arrives AFTER
 * the server-rendered HTML has painted — motion is CSS (ADR-022 v2, the JS
 * diet) and needs none of it to look alive.
 */

import type { WebsiteBlueprint } from "@/core/website-blueprint";
import { renderPage } from "../model/render-page";
import type { ResolvedMediaAsset } from "../model/types";

export function RenderedSite({
  blueprint,
  pageId,
  previewQuery,
  media,
}: {
  blueprint: WebsiteBlueprint;
  /** Approved media by slotRef (ADR-033). */
  media?: Readonly<Record<string, ResolvedMediaAsset>>;
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
    media,
    ...(previewQuery !== undefined
      ? {
          pageHref: (targetPageId: string) =>
            `${previewQuery ? `?${previewQuery}&` : "?"}page=${encodeURIComponent(targetPageId)}`,
        }
      : {}),
  });
}

export default RenderedSite;
