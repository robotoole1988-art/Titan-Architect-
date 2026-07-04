import Link from "next/link";
import { ArrowLeft, Check, Images, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  resolveBusinessSpine,
  type MediaRecord,
  type MediaReviewStatus,
} from "@/core/business";
import { deriveMediaPlan, resolveMediaProvider } from "@/core/media";
import type { WebsiteBlueprint } from "@/core/website-blueprint";
import {
  generateBusinessMedia,
  setMediaStatus,
} from "../api/actions";

/**
 * The media department (ADR-033): the founder's per-asset review gate.
 * Generated assets are born here in review; ONLY approved assets appear on
 * the published site. Cost telemetry shown per asset and in total.
 */

const STATUS_STYLES: Record<MediaReviewStatus, string> = {
  review: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  approved: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  rejected: "border-border/60 bg-muted/20 text-muted-foreground",
};

function MediaCard({ record }: { record: MediaRecord }) {
  return (
    <figure
      className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/40"
      data-media-status={record.status}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- review thumbnails */}
      <img
        src={record.url}
        alt={record.brief}
        loading="lazy"
        className="aspect-[4/3] w-full object-cover"
      />
      <figcaption className="flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[record.status]}`}
          >
            {record.status}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            ${record.provenance.costUsd.toFixed(2)} · {record.provenance.model.split("/").pop()}
          </span>
        </div>
        <p className="truncate font-mono text-[11px] text-muted-foreground" title={record.slotRef}>
          {record.slotRef}
        </p>
        <div className="flex items-center gap-1.5">
          {record.status !== "approved" && (
            <form
              action={async () => {
                "use server";
                await setMediaStatus(record.id, "approved");
              }}
            >
              <Button size="sm" type="submit" className="gap-1" data-approve-media>
                <Check className="size-3.5" />
                Approve
              </Button>
            </form>
          )}
          {record.status !== "rejected" && (
            <form
              action={async () => {
                "use server";
                await setMediaStatus(record.id, "rejected");
              }}
            >
              <Button size="sm" variant="outline" type="submit" className="gap-1">
                <X className="size-3.5" />
                Reject
              </Button>
            </form>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

export async function MediaPage({ businessId }: { businessId: string }) {
  const spine = await resolveBusinessSpine();
  const [business, blueprint, records] = await Promise.all([
    spine.businesses.get(businessId),
    spine.artifacts.latest<WebsiteBlueprint>(businessId, "blueprint"),
    spine.media.listForBusiness(businessId),
  ]);
  if (!business) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/40 p-10 text-center text-sm text-muted-foreground">
        Unknown business.
      </div>
    );
  }
  const plan = blueprint ? deriveMediaPlan(blueprint.payload) : [];
  // A slot whose only records are rejected counts as missing — rejecting
  // in the gate is how the founder asks for another attempt (ADR-033).
  const covered = new Set(
    records
      .filter((record) => record.status !== "rejected")
      .map((record) => record.slotRef),
  );
  const missing = plan.filter((item) => !covered.has(item.slotRef));
  const totalCost = records.reduce(
    (sum, record) => sum + record.provenance.costUsd,
    0,
  );
  const providerReady = resolveMediaProvider() !== null;
  const estimatedCost = missing.length * 0.04;

  return (
    <div className="flex flex-col gap-6" data-media-page>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Media Department · Review Gate
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{business.name}</h1>
          <p className="text-sm text-muted-foreground">
            {records.length} assets · {records.filter((r) => r.status === "approved").length} approved ·{" "}
            {missing.length} slots still empty · ${totalCost.toFixed(2)} spent
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {missing.length > 0 &&
            (providerReady ? (
              <form
                action={async () => {
                  "use server";
                  await generateBusinessMedia(businessId);
                }}
              >
                <Button type="submit" className="gap-2" data-generate-media>
                  <Sparkles className="size-4" />
                  Generate {missing.length} missing (~${estimatedCost.toFixed(2)})
                </Button>
              </form>
            ) : (
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-300">
                Set REPLICATE_API_TOKEN in .env.local to generate
              </span>
            ))}
          <Button variant="outline" render={<Link href={`/crm/${businessId}`} />} className="gap-2">
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>
      </header>

      {records.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
          <Images className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No media yet. {plan.length} slots are planned from the blueprint&apos;s
            briefs — every asset lands HERE for review before it can appear on
            the live site.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {records.map((record) => (
            <MediaCard key={record.id} record={record} />
          ))}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        Prompts enforce UK authenticity (housing stock, weather-true light) and
        forbid faces, text and logos (ADR-033). Approved assets appear on the
        preview and the published site; everything else keeps its honest frame.
      </p>
    </div>
  );
}
