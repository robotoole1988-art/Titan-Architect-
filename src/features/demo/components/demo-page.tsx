import Image from "next/image";
import { notFound } from "next/navigation";
import { Globe, MapPin, Phone, Sparkles } from "lucide-react";
import { renderPage, rendererFontClass } from "@/features/website-renderer";
import { archetypeLabel } from "../model/labels";
import { loadDemoData, type BeforeCapture } from "../api/demo-data";
import { prepareDemoAction, saveVariantAction } from "../api/actions";
import { DemoStage } from "./demo-stage";

/**
 * The Reveal — sales demo (ADR-055). Founder-gated, chrome-free, phone
 * first. Before (their honest current presence) → one tap → their TITAN
 * build. Variant pills flip archetype directions as preview-only renders.
 */

function BeforeCaptureCard({
  before,
  businessName,
}: {
  before: BeforeCapture;
  businessName: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-6" data-demo-before="website">
      <p className="text-center text-[11px] uppercase tracking-[0.3em] text-white/40">
        {before.presence === "website-unreachable"
          ? "their site — unreachable at prep time"
          : "how customers find them today"}
      </p>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl">
        {before.image && (
          <div className="relative aspect-[1200/630] w-full">
            <Image
              src={before.image.url}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 32rem"
              className="object-cover"
              {...(before.image.lqip
                ? { placeholder: "blur" as const, blurDataURL: before.image.lqip }
                : {})}
            />
          </div>
        )}
        <div className="flex flex-col gap-1.5 p-5">
          <span className="flex items-center gap-1.5 text-[11px] text-white/40">
            <Globe className="size-3" />
            {before.url?.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </span>
          <span className="text-lg font-semibold text-white/90">
            {before.title ?? businessName}
          </span>
          {before.description && (
            <span className="text-sm leading-relaxed text-white/50">
              {before.description}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PresenceCard({
  name,
  trade,
  location,
  phone,
}: {
  name: string;
  trade: string;
  location: string;
  phone?: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 px-6" data-demo-before="presence">
      <p className="text-center text-[11px] uppercase tracking-[0.3em] text-white/40">
        how customers find them today
      </p>
      {/* The no-presence rung (CUSTOMER-JOURNEY Beat 2): their trading
          reality — a name, a trade, a phone number. Honest, never mocked. */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl">
        <span className="text-xl font-semibold text-white/90">{name}</span>
        <span className="text-sm text-white/60">{trade}</span>
        <span className="flex items-center gap-2 text-sm text-white/50">
          <MapPin className="size-3.5" />
          {location}
        </span>
        {phone && (
          <span className="flex items-center gap-2 text-sm text-white/50">
            <Phone className="size-3.5" />
            {phone}
          </span>
        )}
        <span className="mt-1 border-t border-white/10 pt-3 text-xs leading-relaxed text-white/35">
          Word of mouth, a number passed around, no way to be found by anyone
          new. That&apos;s the before.
        </span>
      </div>
    </div>
  );
}

export async function DemoPage({
  businessId,
  variant,
}: {
  businessId: string;
  variant?: string;
}) {
  const data = await loadDemoData(businessId, variant);
  if (!data) notFound();
  const { business, before, blueprint } = data;

  // Honest-empty: nothing staged until prep has run and a blueprint exists.
  if (!before || !blueprint) {
    return (
      <main className="grid min-h-svh place-items-center bg-[#0a0c10] px-6 text-white">
        <div className="flex w-full max-w-sm flex-col gap-4 text-center" data-demo-unprepared>
          <Sparkles className="mx-auto size-6 text-white/40" />
          <h1 className="text-lg font-semibold">{business.name}</h1>
          {!blueprint ? (
            <p className="text-sm leading-relaxed text-white/50">
              No blueprint exists yet — generate one in the Experience Studio
              first. The demo never improvises.
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-white/50">
              The Before hasn&apos;t been prepared. Prep captures their current
              presence now so the pitch never waits.
            </p>
          )}
          {blueprint && (
            <form
              action={async () => {
                "use server";
                await prepareDemoAction(businessId);
              }}
            >
              <button
                type="submit"
                data-demo-prepare
                className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-black"
              >
                Prepare demo
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  const beforeNode =
    before.presence === "none" ? (
      <PresenceCard
        name={business.name}
        trade={business.trade}
        location={business.location}
        phone={business.contact?.phone}
      />
    ) : (
      <BeforeCaptureCard before={before} businessName={business.name} />
    );

  const controls = (
    <>
      {[data.primaryArchetype, ...data.alternates].map((candidate) => {
        const active = candidate === data.activeArchetype;
        const href =
          candidate === data.primaryArchetype
            ? `/demo/${businessId}`
            : `/demo/${businessId}?variant=${candidate}`;
        return (
          <a
            key={candidate}
            href={href}
            data-demo-variant={candidate}
            aria-current={active ? "true" : undefined}
            className={`rounded-full px-4 py-2 text-xs font-medium backdrop-blur transition-colors ${
              active
                ? "bg-white text-black"
                : "border border-white/25 bg-black/50 text-white"
            }`}
          >
            {archetypeLabel(candidate)}
          </a>
        );
      })}
      {!data.showingPrimary && (
        <form
          action={async () => {
            "use server";
            await saveVariantAction(businessId, data.activeArchetype);
          }}
        >
          <button
            type="submit"
            data-demo-save
            className="rounded-full border border-emerald-300/40 bg-emerald-400/20 px-4 py-2 text-xs font-semibold text-emerald-100 backdrop-blur"
          >
            Save this direction
          </button>
        </form>
      )}
    </>
  );

  return (
    <main data-demo-page>
      <DemoStage
        before={beforeNode}
        controls={controls}
        after={
          <div className={rendererFontClass}>
            {renderPage(blueprint, {
              mode: "public",
              onUnmapped: "skip",
              media: data.media,
              reviews: data.reviews,
            })}
          </div>
        }
      />
    </main>
  );
}
