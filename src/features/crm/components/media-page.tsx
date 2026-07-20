import Link from "next/link";
import { ArrowLeft, Check, Film, Images, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  resolveBusinessSpine,
  type MediaRecord,
  type MediaReviewStatus,
} from "@/core/business";
import {
  VIDEO_MODELS,
  availableVideoModels,
  deriveMediaPlan,
  estimateGenerationCostUsd,
  resolveMediaProvider,
  type VideoModelKey,
} from "@/core/media";
import { toStreamUrl } from "@/features/website-renderer";
import type { WebsiteBlueprint } from "@/core/website-blueprint";
import {
  commissionHeroFilm,
  commissionMorphFilm,
  generateBusinessMedia,
  setMediaStatus,
  uploadCustomerImage,
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
  const isVideo = record.modality === "video";
  return (
    <figure
      className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/40"
      data-media-status={record.status}
      data-media-modality={record.modality}
    >
      {isVideo ? (
        <div className="relative">
          <video
            src={toStreamUrl(record.url)}
            poster={record.posterUrl}
            controls
            muted
            loop
            playsInline
            preload="metadata"
            className="aspect-[16/9] w-full bg-black object-cover"
          />
          <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">
            ▶ film{record.durationSeconds ? ` · ${record.durationSeconds}s` : ""}
          </span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- review thumbnails
        <img
          src={record.url}
          alt={record.brief}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
      )}
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
  const estimatedCost = missing.reduce(
    (sum, item) => sum + estimateGenerationCostUsd(item.modality),
    0,
  );
  // Which film tiers can be commissioned right now (ADR-039).
  const videoModels = availableVideoModels();
  const heroModels = videoModels.filter(
    (key) => VIDEO_MODELS[key].kind === "text-to-video",
  );
  const canMorph = videoModels.includes("morph");

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

      {heroModels.length > 0 && (
        <form
          action={async (formData: FormData) => {
            "use server";
            const brief = String(formData.get("brief") ?? "");
            const videoModel = String(formData.get("videoModel") ?? "standard") as VideoModelKey;
            const durationSeconds = Number(formData.get("duration") ?? 5) || 5;
            const model = VIDEO_MODELS[videoModel] ? videoModel : "standard";
            if (brief.trim()) await commissionHeroFilm(businessId, brief, model, durationSeconds);
          }}
          className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/30 p-4"
          data-commission-hero
        >
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            <Film className="size-3.5" /> Commission a hero film (ADR-036 / 4K ADR-039)
          </span>
          <textarea
            name="brief"
            rows={2}
            placeholder="e.g. a slow aerial drift over rain-soaked UK rooftops under a brooding storm sky, cinematic and moody"
            className="w-full resize-none rounded-xl border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-foreground/40"
          />
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
              Quality
              <select
                name="videoModel"
                defaultValue={heroModels.includes("hero-4k") ? "hero-4k" : "standard"}
                className="rounded-lg border border-border/60 bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none"
                data-video-model
              >
                {heroModels.map((key) => (
                  <option key={key} value={key} className="bg-background">
                    {VIDEO_MODELS[key].label} · {VIDEO_MODELS[key].resolution}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
              Seconds
              <input
                name="duration"
                type="number"
                min={3}
                max={15}
                defaultValue={5}
                className="w-20 rounded-lg border border-border/60 bg-transparent px-2.5 py-1.5 text-sm outline-none"
              />
            </label>
            <Button type="submit" variant="outline" className="gap-2">
              <Film className="size-4" />
              Commission
            </Button>
            <span className="text-[11px] text-muted-foreground">
              4K bills by the second (${VIDEO_MODELS["hero-4k"].costPerSecondUsd?.toFixed(2)}/s);
              standard is a flat ${VIDEO_MODELS.standard.flatCostUsd?.toFixed(2)}.
            </span>
          </div>
        </form>
      )}

      {canMorph && (
        <form
          action={async (formData: FormData) => {
            "use server";
            const brief = String(formData.get("brief") ?? "");
            const startImageUrl = String(formData.get("startImageUrl") ?? "");
            const endImageUrl = String(formData.get("endImageUrl") ?? "");
            const durationSeconds = Number(formData.get("duration") ?? 5) || 5;
            if (brief.trim() && startImageUrl.trim()) {
              await commissionMorphFilm(businessId, {
                brief,
                startImageUrl,
                ...(endImageUrl.trim() ? { endImageUrl } : {}),
                durationSeconds,
              });
            }
          }}
          className="flex flex-col gap-3 rounded-2xl border border-sky-400/30 bg-sky-400/[0.04] p-4"
          data-commission-morph
        >
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-sky-300/80">
            <Sparkles className="size-3.5" /> Commission a MORPH film — Kling O1 keyframes (ADR-039)
          </span>
          <textarea
            name="brief"
            rows={2}
            placeholder="e.g. a brooding storm of loose slate resolves into a pristine, seated slate roof over a UK home — one continuous cinematic move"
            className="w-full resize-none rounded-xl border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-foreground/40"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
              Start frame URL (raw storm / loose slate)
              <input
                name="startImageUrl"
                type="url"
                required
                placeholder="https://… .webp"
                className="rounded-lg border border-border/60 bg-transparent px-2.5 py-1.5 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
              End frame URL (finished seated roof)
              <input
                name="endImageUrl"
                type="url"
                placeholder="https://… .webp (optional)"
                className="rounded-lg border border-border/60 bg-transparent px-2.5 py-1.5 text-sm outline-none"
              />
            </label>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
              Seconds
              <input
                name="duration"
                type="number"
                min={3}
                max={10}
                defaultValue={5}
                className="w-20 rounded-lg border border-border/60 bg-transparent px-2.5 py-1.5 text-sm outline-none"
              />
            </label>
            <Button type="submit" variant="outline" className="gap-2">
              <Sparkles className="size-4" />
              Commission morph
            </Button>
            <span className="text-[11px] text-muted-foreground">
              O1 bills ${VIDEO_MODELS.morph.costPerSecondUsd?.toFixed(3)}/s (~${estimateGenerationCostUsd("video", { videoModel: "morph", durationSeconds: 5 }).toFixed(2)} for 5s).
            </span>
          </div>
        </form>
      )}

      {providerReady && heroModels.length === 0 && !canMorph && (
        <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
          Set FAL_KEY (native-4K + O1 morph) or REPLICATE_API_TOKEN (standard film) in .env.local to commission film.
        </p>
      )}

      {/* Customer imagery (ADR-053): the business's OWN photos, same gate. */}
      {plan.length > 0 && (
        <form
          action={async (formData: FormData) => {
            "use server";
            await uploadCustomerImage(businessId, formData);
          }}
          className="flex flex-col gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.04] p-4"
          data-upload-customer-photo
        >
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-300/80">
            <Images className="size-3.5" /> Upload the business&apos;s own photo (ADR-053)
          </span>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
              Photo (webp / jpeg / png, ≤8MB)
              <input
                name="photo"
                type="file"
                required
                accept="image/webp,image/jpeg,image/png"
                className="rounded-lg border border-border/60 bg-transparent px-2.5 py-1.5 text-sm outline-none file:mr-2 file:rounded file:border-0 file:bg-muted/40 file:px-2 file:py-1 file:text-xs"
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
              Slot the photo dresses
              <select
                name="slotRef"
                required
                className="rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-sm outline-none"
              >
                {plan
                  .filter((item) => item.modality === "image")
                  .map((item) => (
                    <option key={item.slotRef} value={item.slotRef}>
                      {item.slotRef}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <input
            name="note"
            placeholder="What the photo shows (optional — stored as the brief)"
            className="rounded-lg border border-border/60 bg-transparent px-2.5 py-1.5 text-sm outline-none"
          />
          <div className="flex items-center gap-3">
            <Button type="submit" variant="outline" className="gap-2">
              <Images className="size-4" />
              Upload to the review gate
            </Button>
            <span className="text-[11px] text-muted-foreground">
              Real photos beat generated ones: once approved, a customer photo
              serves ahead of the AI asset in the same slot.
            </span>
          </div>
        </form>
      )}

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
