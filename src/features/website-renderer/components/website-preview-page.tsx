import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import { resolveBusinessSpine } from "@/core/business";
import {
  generateExperienceStrategy,
  type ExperienceStrategyRequest,
} from "@/core/experience-strategy";
import {
  createWebsiteBlueprintEngine,
  type WebsiteBlueprint,
} from "@/core/website-blueprint";
import { rendererFontClass } from "../theme/fonts";
import type { ResolvedMediaAsset } from "../model/types";

// Lazily hydrated: the HTML is server-rendered in full; the client bundle
// (Framer Motion + interactive primitives) loads after first paint.
const RenderedSite = dynamic(() => import("./rendered-site"));

/**
 * Website Preview — the full spine in one page: business context (via the
 * ADR-019 URL boundary) → strategy → blueprint → rendered homepage, framed by
 * a thin TITAN chrome bar. Falls back gracefully to the sample business.
 */
interface WebsitePreviewPageProps {
  /** Stored Business record id (ADR-023) — renders the SAVED blueprint. */
  businessId?: string;
  businessName?: string;
  trade?: string;
  location?: string;
  /** Page of the collection to preview (ADR-028); defaults to the homepage. */
  page?: string;
}

// "Drainage" keeps the sample in the emergency archetype (ADR-020 keywords) —
// the archetype v1's primitives are crafted for.
const SAMPLE_REQUEST: ExperienceStrategyRequest = {
  businessName: "Summit Roofing Rescue",
  trade: "Emergency Roofing & Drainage",
  location: "Leeds",
};

export async function WebsitePreviewPage({
  businessId,
  businessName,
  trade,
  location,
  page,
}: WebsitePreviewPageProps = {}) {
  // Stored path (ADR-023): render the SAVED blueprint artifact, exactly as
  // reviewed in the viewer. Falls through gracefully when the id is unknown
  // or nothing is stored yet.
  let storedBlueprint: WebsiteBlueprint | null = null;
  let storedVersion: number | null = null;
  const media: Record<string, ResolvedMediaAsset> = {};
  if (businessId) {
    const spine = await resolveBusinessSpine();
    const artifact = await spine.artifacts.latest<WebsiteBlueprint>(
      businessId,
      "blueprint",
    );
    if (artifact) {
      storedBlueprint = artifact.payload;
      storedVersion = artifact.version;
    }
    // Approved media previews exactly as it will publish (ADR-033).
    for (const record of await spine.media.listApprovedForBusiness(businessId)) {
      media[record.slotRef] = {
        url: record.url,
        modality: record.modality,
        ...(record.width !== undefined ? { width: record.width } : {}),
        ...(record.height !== undefined ? { height: record.height } : {}),
      };
    }
  }

  const name = businessName?.trim();
  const tradeValue = trade?.trim();
  const locationValue = location?.trim();
  const fromIntake = Boolean(name && tradeValue && locationValue);
  const request: ExperienceStrategyRequest =
    name && tradeValue && locationValue
      ? { businessName: name, trade: tradeValue, location: locationValue }
      : SAMPLE_REQUEST;

  const blueprint =
    storedBlueprint ??
    (await createWebsiteBlueprintEngine().build({
      strategy: generateExperienceStrategy(request),
    }));
  const archetype =
    typeof blueprint.extensions?.archetype === "string"
      ? blueprint.extensions.archetype
      : undefined;

  const baseQuery = storedBlueprint
    ? `businessId=${businessId}`
    : fromIntake
      ? `businessName=${encodeURIComponent(request.businessName)}&trade=${encodeURIComponent(request.trade)}&location=${encodeURIComponent(request.location)}`
      : "";
  const query = baseQuery ? `?${baseQuery}` : "";

  const pages = blueprint.pages.pages;
  const activePage =
    (page && pages.find((candidate) => candidate.id === page)) || pages[0];
  const pageQuery = (pageId: string) =>
    `${baseQuery ? `?${baseQuery}&` : "?"}page=${encodeURIComponent(pageId)}`;

  return (
    <div className="flex flex-1 flex-col">
      {/* thin TITAN chrome bar — one row, fixed height, no late wrapping */}
      <div className="flex h-11 items-center justify-between gap-3 overflow-hidden border-b border-border/60 bg-card/40 px-4">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span className="truncate font-semibold">
            {blueprint.identity.businessName}
          </span>
          {archetype && (
            <span className="hidden shrink-0 items-center rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[11px] capitalize text-amber-200/90 sm:inline-flex">
              {archetype} archetype
            </span>
          )}
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground md:inline-flex">
            <Layers className="size-3" />
            {storedVersion !== null
              ? `rendered from blueprint v${storedVersion}`
              : "rendered from blueprint"}
          </span>
          {pages.length > 1 && (
            <span className="flex min-w-0 items-center gap-1 overflow-x-auto">
              {pages.map((candidate) => (
                <Link
                  key={candidate.id}
                  href={`/experience-studio/preview${pageQuery(candidate.id)}`}
                  data-page-switch={candidate.id}
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
                    candidate.id === activePage.id
                      ? "border-amber-400/40 bg-amber-400/15 text-amber-200"
                      : "border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {candidate.type === "home" ? "Home" : candidate.name}
                </Link>
              ))}
            </span>
          )}
        </div>
        <Link
          href={`/experience-studio/blueprint${query}`}
          className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Blueprint Viewer
        </Link>
      </div>

      {/* the rendered website — full bleed */}
      <div className={rendererFontClass}>
        <RenderedSite
          blueprint={blueprint}
          pageId={activePage.id}
          previewQuery={baseQuery}
          media={media}
        />
      </div>
    </div>
  );
}
